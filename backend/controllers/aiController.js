const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const PromptService = require('../services/promptService');
const CuratorService = require('../services/curatorService');
const fs = require('fs');
const path = require('path');
const { YoutubeTranscript } = require('youtube-transcript');
const axios = require('axios');

const { google } = require('googleapis');
const ytdl = require('@distube/ytdl-core');
const youtube = google.youtube('v3');
const { GoogleAIFileManager } = require('@google/generative-ai/server'); // [NEW] For Multimodal
const browserService = require('../services/browserService'); // [NEW] Visual Agent
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock-key');

// Helper to download YouTube video for multimodal analysis
// Helper to download YouTube audio (Fallback)
// Helper to download YouTube audio (Fallback)
async function downloadYouTubeAudio(url) {
    return new Promise((resolve, reject) => {
        const videoId = ytdl.getVideoID(url);
        const tempPath = path.join(__dirname, `../uploads/yt_audio_${videoId}.mp3`);
        let writeStream;

        // Timeout Protection (45s)
        const timeout = setTimeout(() => {
            if (writeStream) {
                try { writeStream.destroy(); } catch (e) { }
            }
            reject(new Error('Audio download timed out (45s)'));
        }, 45000);

        // Ensure uploads dir exists
        if (!fs.existsSync(path.join(__dirname, '../uploads'))) {
            fs.mkdirSync(path.join(__dirname, '../uploads'));
        }

        console.log(`⬇️ Starting AUDIO download for: ${url}`);
        const stream = ytdl(url, {
            quality: 'lowestaudio',
            filter: 'audioonly'
        });
        writeStream = fs.createWriteStream(tempPath);

        stream.pipe(writeStream);

        writeStream.on('finish', () => {
            clearTimeout(timeout);
            console.log(`✅ Audio Download completed: ${tempPath}`);
            resolve(tempPath);
        });
        writeStream.on('error', (err) => {
            clearTimeout(timeout);
            console.error('❌ Audio Stream write error:', err);
            reject(err);
        });
        stream.on('error', (err) => {
            clearTimeout(timeout);
            console.error('❌ YTDL Audio stream error:', err.message);
            reject(err);
        });
    });
}

// Helper to download YouTube video for multimodal analysis
async function downloadYouTubeVideo(url) {
    return new Promise((resolve, reject) => {
        const videoId = ytdl.getVideoID(url);
        const tempPath = path.join(__dirname, `../uploads/yt_${videoId}.mp4`);
        let writeStream;

        // Timeout Protection (45s)
        const timeout = setTimeout(() => {
            if (writeStream) {
                try { writeStream.destroy(); } catch (e) { }
            }
            reject(new Error('Video download timed out (45s)'));
        }, 45000);

        // Ensure uploads dir exists
        if (!fs.existsSync(path.join(__dirname, '../uploads'))) {
            fs.mkdirSync(path.join(__dirname, '../uploads'));
        }

        console.log(`⬇️ Starting download for: ${url}`);
        // Try to use a more robust agent/client configuration if possible, 
        // but for now relying on standard call with error handling.
        const stream = ytdl(url, {
            quality: 'lowest',
            filter: 'audioandvideo'
        });
        writeStream = fs.createWriteStream(tempPath);

        stream.pipe(writeStream);

        writeStream.on('finish', () => {
            console.log(`✅ Download completed: ${tempPath}`);
            resolve(tempPath);
        });
        writeStream.on('error', (err) => {
            console.error('❌ Stream write error:', err);
            reject(err);
        });
        stream.on('error', (err) => {
            console.error('❌ YTDL stream error:', err.message);
            reject(err);
        });
    });
}

// Helper to wait for Gemini file to be ACTIVE (processed)
async function waitForFileActive(fileManager, uploadFileResult) {
    const name = uploadFileResult.file.name;
    let file = await fileManager.getFile(name);
    let attempts = 0;
    const maxAttempts = 75; // 75 * 4s = 300s (5 minutes)

    while (file.state === 'PROCESSING') {
        attempts++;
        if (attempts > maxAttempts) {
            throw new Error(`Timeout: Video processing took too long (> 5 minutes). State: ${file.state}`);
        }
        await new Promise(resolve => setTimeout(resolve, 4000));
        file = await fileManager.getFile(name);
    }

    if (file.state === 'FAILED') {
        throw new Error('Video processing failed by Gemini.');
    }
    return file;
}

exports.processMemoryInput = async (req, res) => {
    try {
        const { textInput } = req.body;
        const file = req.file;
        let imageUrl = null;
        let audioUrl = null;

        // Log received file info
        if (file) {
            // console.log(`📁 Received file: ${file.originalname} (${file.mimetype}, ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        }

        // Save file to Cloudinary if present (only images/docs, skip audio)
        if (file) {
            const cloudinary = require('../config/cloudinary');

            // Determine if it's an audio file
            const isAudio = file.mimetype.startsWith('audio/');

            // Upload images and documents to Cloudinary, skip audio (Gemini can process directly)
            if (!isAudio) {
                try {
                    // Upload from path
                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: "memoria-viva",
                        resource_type: 'auto'
                    });

                    // Check if it's an image or document
                    if (result.resource_type === 'image') {
                        imageUrl = result.secure_url;
                    } else {
                        req.documentUrl = result.secure_url;
                    }
                } catch (error) {
                    console.error('Cloudinary Upload Error:', error);
                    // Continue without image if upload fails
                }
            } else {
                // console.log('🎵 Audio file detected, will process with Gemini (no Cloudinary upload)');
            }
        }

        // Check if key is missing or is the placeholder
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            // Mock response
            console.log('Using mock AI response (No API Key)');
            return res.json({
                title: 'Título Sugerido pela IA (Mock)',
                description: textInput || 'Descrição baseada na mídia enviada.',
                date: new Date().toISOString().split('T')[0],
                location: 'Localização Detectada',
                tags: ['IA', 'Multimodal', 'Mock'],
                imageUrl: imageUrl,
                audioUrl: audioUrl
            });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        // Get organization-specific AI instructions
        let organizationInstructions = '';
        let organizationGuardrails = '';
        let culturalContext = '';

        if (req.user && req.user.organizationId) {
            const organization = await prisma.organization.findUnique({
                where: { id: req.user.organizationId },
                select: { config: true }
            });

            if (organization && organization.config) {
                try {
                    const config = JSON.parse(organization.config);
                    organizationInstructions = config.aiInstructions || '';
                    organizationGuardrails = config.aiGuardrails || '';
                    culturalContext = config.culturalContext || '';
                } catch (e) {
                    console.log('Failed to parse organization config');
                }
            }
        }

        let promptParts = [];

        // Build prompt using service
        // Build prompt using service
        const systemPrompt = PromptService.buildMemoryPrompt(textInput, organizationInstructions, organizationGuardrails, culturalContext);
        promptParts.push(systemPrompt);

        // Add media if present (image, audio, or document)
        if (file) {
            const fileSizeMB = file.size / 1024 / 1024;
            const isAudio = file.mimetype.startsWith('audio/');
            const isVideo = file.mimetype.startsWith('video/');
            const isPDF = file.mimetype === 'application/pdf';
            const isText = file.mimetype === 'text/plain';
            const isWord = file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

            // For audio > 5MB, ALL videos, or PDFs, use Files API
            if ((isAudio && fileSizeMB > 5) || isVideo || isPDF) {
                // console.log(`📄 Large file or PDF (${fileSizeMB.toFixed(2)}MB), using Files API...`);

                try {
                    const { GoogleAIFileManager } = require('@google/generative-ai/server');
                    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

                    // Upload to Gemini Files API from existing temp file
                    const uploadResult = await fileManager.uploadFile(file.path, {
                        mimeType: file.mimetype,
                        displayName: file.originalname
                    });

                    // console.log(`✅ Uploaded to Files API: ${uploadResult.file.uri}`);

                    // [FIX] Wait for video to be ACTIVE before generating content
                    if (isVideo) {
                        // console.log('⏳ Waiting for video to be processed by Gemini...');
                        await waitForFileActive(fileManager, uploadResult);
                        // console.log('✅ Video is ACTIVE and ready for analysis.');
                        // Audio usually processes fast, but safety check doesn't hurt
                        // console.log('⏳ Waiting for large audio processing...');
                        await waitForFileActive(fileManager, uploadResult);
                    }

                    // [NEW] Generate Thumbnail for Video
                    if (isVideo) {
                        try {
                            const MediaService = require('../services/mediaService');
                            // Generate thumbnail and get URL
                            const thumbUrl = await MediaService.generateThumbnail(file.path, file.originalname);
                            // console.log('✅ Thumbnail generated:', thumbUrl);

                            req.thumbnailUrl = thumbUrl;
                            req.fileMetadata = {
                                duration: 0, // Todo: Get from ffmpeg if possible
                                size: file.size,
                                originalName: file.originalname,
                                mimeType: file.mimetype
                            };
                        } catch (thumbError) {
                            console.error('⚠️ Thumbnail generation failed:', thumbError);
                            // Quality Filter: Don't fail the request, just log it.
                        }
                    }

                    // Add file reference to prompt
                    promptParts.push({
                        fileData: {
                            fileUri: uploadResult.file.uri,
                            mimeType: file.mimetype
                        }
                    });

                } catch (error) {
                    console.error('❌ Files API upload failed, falling back to inline/text:', error.message);
                }
            } else if (isWord) {
                // Extract text from Word document
                try {
                    const mammoth = require('mammoth');
                    // Read from path
                    const result = await mammoth.extractRawText({ path: file.path });
                    const text = result.value;
                    // console.log(`📝 Extracted ${text.length} chars from Word doc`);

                    promptParts.push({
                        text: `\n\n[DOCUMENT CONTENT START]\n${text}\n[DOCUMENT CONTENT END]\n\n`
                    });
                } catch (error) {
                    console.error('❌ Word extraction failed:', error);
                }
            } else if (isText) {
                // Read text file directly
                const text = fs.readFileSync(file.path, 'utf-8');
                // console.log(`📝 Read ${text.length} chars from Text file`);
                promptParts.push({
                    text: `\n\n[DOCUMENT CONTENT START]\n${text}\n[DOCUMENT CONTENT END]\n\n`
                });
            } else {
                // Use inline for small files or images
                // Read file from disk to buffer for inline data
                const fileBuffer = fs.readFileSync(file.path);
                promptParts.push({
                    inlineData: {
                        data: fileBuffer.toString('base64'),
                        mimeType: file.mimetype
                    }
                });
            }
        }

        // Debug log: Check prompt structure before sending
        // console.log('🚀 Sending to Gemini:', {
        //     model: 'gemini-2.0-flash',
        //     promptPartsCount: promptParts.length,
        //     hasInlineData: !!promptParts.find(p => p.inlineData),
        //     hasFileData: !!promptParts.find(p => p.fileData),
        //     inlineMimeType: promptParts.find(p => p.inlineData)?.inlineData?.mimeType,
        //     fileMimeType: promptParts.find(p => p.fileData)?.fileData?.mimeType
        // });

        let result;
        try {
            result = await model.generateContent(promptParts);
        } catch (geminiError) {
            console.error('❌ Gemini API Error Details:', JSON.stringify(geminiError, null, 2));
            console.error('❌ Gemini Error Message:', geminiError.message);
            throw geminiError; // Re-throw to be caught by outer block
        }
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const structuredData = JSON.parse(jsonStr);

        // Add the media URLs to the response
        if (imageUrl) {
            structuredData.imageUrl = imageUrl;
        }
        if (audioUrl) {
            structuredData.audioUrl = audioUrl;
        }
        if (req.documentUrl) {
            structuredData.documentUrl = req.documentUrl;
        }
        if (req.thumbnailUrl) {
            structuredData.thumbnailUrl = req.thumbnailUrl;
        }
        if (req.fileMetadata) {
            structuredData.metadata = req.fileMetadata;
        }

        // 🎨 Auto-generate cover image if no image provided (audio-only memory)
        if (!imageUrl && (audioUrl || file?.mimetype.startsWith('audio/'))) {
            // console.log('🎨 No image provided, generating AI cover image...');
            const ImageGenerationService = require('../services/imageGenerationService');
            const generatedImageUrl = await ImageGenerationService.generateMemoryImage(structuredData);

            if (generatedImageUrl) {
                structuredData.imageUrl = generatedImageUrl;
                // console.log('✅ AI-generated cover image added');
            }
        }

        // Cleanup temp file
        if (req.file && req.file.path) {
            try {
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                    // console.log(`🧹 Cleaned up temp file: ${req.file.path}`);
                }
            } catch (cleanupError) {
                console.error('Error cleaning up temp file:', cleanupError);
            }
        }

        res.json(structuredData);
    } catch (error) {
        // Cleanup temp file on error too
        if (req.file && req.file.path) {
            try {
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
            } catch (cleanupError) { }
        }

        console.error('AI Processing Error:', error);
        res.status(500).json({ message: 'Error processing content', error: error.message });
    }
};

exports.processLink = async (req, res) => {
    let tempVideoPath = null;
    try {
        const { youtubeUrl, textInput } = req.body;
        console.log('🚀 [AI] Processing Link START:', youtubeUrl);

        if (!youtubeUrl) {
            return res.status(400).json({ message: 'URL do YouTube é obrigatória.' });
        }

        // 1. Extract Metadata (Pro: Data API v3 or Fallback: oEmbed)
        let videoTitle = 'Memória de Vídeo';
        let thumbnailUrl = null;
        let authorName = '';
        let description = '';

        if (process.env.YOUTUBE_API_KEY) {
            try {
                // Extract ID
                const videoId = ytdl.getVideoID(youtubeUrl);
                const response = await youtube.videos.list({
                    key: process.env.YOUTUBE_API_KEY,
                    part: 'snippet',
                    id: videoId
                });

                if (response.data.items.length > 0) {
                    const snippet = response.data.items[0].snippet;
                    videoTitle = snippet.title;
                    description = snippet.description;
                    authorName = snippet.channelTitle;
                    // Get best thumbnail
                    thumbnailUrl = snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url;
                }
            } catch (apiError) {
                console.warn('⚠️ YouTube Data API failed, falling back to oEmbed:', apiError.message);
            }
        }

        // Fallback or if API failed
        if (!process.env.YOUTUBE_API_KEY || !thumbnailUrl) {
            try {
                const oEmbedUrl = `https://www.youtube.com/oEmbed?url=${encodeURIComponent(youtubeUrl)}&format=json`;
                const metadata = await axios.get(oEmbedUrl);
                videoTitle = metadata.data.title || videoTitle;
                thumbnailUrl = metadata.data.thumbnail_url || thumbnailUrl;
                authorName = metadata.data.author_name || authorName;
            } catch (e) {
                console.warn('⚠️ Failed to fetch oEmbed metadata:', e.message);
            }
        }

        // 2. Fetch Transcript
        console.log('📦 [AI] Metadata extracted:', videoTitle);
        let transcriptText = '';
        try {
            const transcript = await YoutubeTranscript.fetchTranscript(youtubeUrl);
            transcriptText = transcript.map(t => t.text).join(' ');
        } catch (e) {
            console.warn('⚠️ Failed to fetch transcript:', e.message);
        }
        console.log('📜 [AI] Transcript length:', transcriptText ? transcriptText.length : 0);

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        let promptParts = [];
        let systemPrompt = '';

        // Prepare context
        let organizationInstructions = '';
        let organizationGuardrails = '';
        let culturalContext = '';

        if (req.user && req.user.organizationId) {
            const organization = await prisma.organization.findUnique({
                where: { id: req.user.organizationId },
                select: { config: true }
            });
            if (organization?.config) {
                try {
                    const config = JSON.parse(organization.config);
                    organizationInstructions = config.aiInstructions || '';
                    organizationGuardrails = config.aiGuardrails || '';
                    culturalContext = config.culturalContext || '';
                } catch (e) { }
            }
        }

        // 3. Strategy Decision: Text vs Multimodal
        if (transcriptText) {
            // STRATEGY A: Text-based (Cheaper/Faster)
            const promptInput = textInput || '';
            const transcriptContext = `\n\n[TRANSCRICAO DO VÍDEO START]\n${transcriptText}\n[TRANSCRICAO DO VÍDEO END]\n\n`;
            const metadataContext = `\nTítulo do Vídeo: ${videoTitle}\nCanal: ${authorName}\nURL: ${youtubeUrl}\nDescrição: ${description}`;

            systemPrompt = PromptService.buildMemoryPrompt(
                promptInput + metadataContext + transcriptContext + "\n[IMPORTANTE] Gere também uma lista de 'chapters' (array de objetos com 'time' em segundos e 'label' string) baseada nos tópicos do vídeo.",
                organizationInstructions,
                organizationGuardrails,
                culturalContext
            );
            promptParts.push(systemPrompt);

        } else {
            // STRATEGY C: Visual Navigation Agent (Proprietary "Vision" Mode)
            console.log('🕵️‍♂️ No transcript found. Activating Visual Navigation Agent...');

            try {
                // 1. Capture Data via Headless Browser (Hybrid: Visual + Innertube Transcript)
                const visualData = await browserService.capturePageData(youtubeUrl);

                // STRATEGY C.1: Innertube Transcript (Best Case)
                if (visualData.transcript) {
                    console.log('📜 [BrowserAgent] Innertube Transcript found! Using Text Strategy.');
                    const transcriptContext = `\n\n[TRANSCRICAO DO VÍDEO (VIA BROWSER)]\n${visualData.transcript}\n[FIM TRANSCRICAO]\n\n`;
                    const enrichedMetadata = `\nTítulo (Visual): ${visualData.title}\nURL: ${youtubeUrl}\nDescrição Expandida: ${visualData.description}`;

                    systemPrompt = PromptService.buildMemoryPrompt(
                        (textInput || '') + enrichedMetadata + transcriptContext,
                        organizationInstructions,
                        organizationGuardrails,
                        culturalContext
                    );
                    promptParts.push(systemPrompt);

                    // Cleanup Screenshot (Unused)
                    try { fs.unlinkSync(visualData.screenshotPath); } catch (e) { }

                } else {
                    // STRATEGY C.2: Visual Backup (Screenshot)
                    console.log('📸 [BrowserAgent] No transcript. Using Visual Backup.');

                    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
                    console.log('📤 Uploading Screenshot to Gemini...');
                    const uploadResult = await fileManager.uploadFile(visualData.screenshotPath, {
                        mimeType: 'image/png',
                        displayName: `yt_screen_${Date.now()}`
                    });

                    await waitForFileActive(fileManager, uploadResult);

                    const visualInstruction = `
                        [VISUAL AGENT ACTIVATED]
                        Este vídeo não possui legendas (nem geradas automaticamente).
                        Analise a IMAGEM (screenshot do vídeo) e a DESCRIÇÃO EXPANDIDA abaixo.
                        
                        1. Identifique o tema visual e texto na tela.
                        2. Cruze com a Descrição Expandida.
                        3. Determine o contexto pedagógico.
                        
                        Descrição Expandida: ${visualData.description}
                        Nota do Usuário: ${textInput || 'Nenhuma.'}
                    `;
                    const enrichedMetadata = `\nTítulo (Visual): ${visualData.title}\nURL: ${youtubeUrl}\n`;

                    systemPrompt = PromptService.buildMemoryPrompt(
                        visualInstruction + enrichedMetadata,
                        organizationInstructions,
                        organizationGuardrails,
                        culturalContext
                    );

                    promptParts.push(systemPrompt);
                    promptParts.push({
                        fileData: {
                            fileUri: uploadResult.file.uri,
                            mimeType: 'image/png'
                        }
                    });
                }

                // Cleanup Screenshot
                // fs.unlinkSync(visualData.screenshotPath); // Optional: Keep for debugging or delete

            } catch (agentError) {
                console.error('⚠️ Visual Agent Failed:', agentError.message);

                // FALLBACK D: Pure Metadata (Last Resort)
                console.log('📝 Falling back to Pure Metadata...');
                const metadataContext = `
                [AVISO: FALHA NO AGENTE VISUAL]
                Use apenas os metadados básicos.
                Título: ${videoTitle}
                Descrição: ${description}
                Nota: ${textInput}
                
                [INSTRUÇÃO NOVA]
                Além da análise padrão, gere uma lista de CAPÍTULOS baseada no conteúdo inferido ou duração.
                Formato JSON esperado no output final: 
                {
                  ...,
                  "chapters": [
                    {"time": 0, "label": "Início"},
                    {"time": 60, "label": "Meio"}
                  ]
                }
                `;

                systemPrompt = PromptService.buildMemoryPrompt(
                    metadataContext,
                    organizationInstructions,
                    organizationGuardrails,
                    culturalContext
                );
                promptParts.push(systemPrompt);
            }
        }

        // 4. Generate Content
        const result = await model.generateContent(promptParts);
        const response = await result.response;
        const text = response.text();

        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const structuredData = JSON.parse(jsonStr);

        // 5. Populate Metadata
        if (thumbnailUrl) {
            structuredData.thumbnailUrl = thumbnailUrl;
        }
        structuredData.metadata = {
            source: 'YouTube',
            originalUrl: youtubeUrl,
            originalTitle: videoTitle,
            duration: 0,
            analysisType: transcriptText ? 'transcript' : 'multimodal_visual'
        };

        // [NEW] Populate Smart Player Fields
        if (transcriptText) structuredData.transcription = transcriptText;
        if (structuredData.chapters) structuredData.chapters = JSON.stringify(structuredData.chapters);

        // Cleanup
        if (tempVideoPath && fs.existsSync(tempVideoPath)) {
            fs.unlinkSync(tempVideoPath);
        }

        res.json(structuredData);

    } catch (error) {
        // Cleanup on error
        if (tempVideoPath && fs.existsSync(tempVideoPath)) {
            try { fs.unlinkSync(tempVideoPath); } catch (e) { }
        }

        // [REQUESTED FIX] Log the exact error
        console.log('ERRO REAL DO BACKEND:', error);

        // [REQUESTED FIX] Return friendly JSON instead of 500
        return res.status(200).json({
            success: false,
            message: 'Vídeo sem legendas e falha no processamento visual. Por favor, descreva manualmente.',
            errorDetails: error.message
        });
    }
};

exports.optimizeInstructions = async (req, res) => {
    try {
        const { instructions } = req.body;

        if (!instructions) {
            return res.status(400).json({ message: 'Instructions are required' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = PromptService.optimizeInstructionPrompt(instructions);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ optimizedInstructions: text.trim() });
    } catch (error) {
        console.error('Optimization Error:', error);
        res.status(500).json({ message: 'Error optimizing instructions', error: error.message });
    }
};

exports.curateMemories = async (req, res) => {
    try {
        const userId = req.user.userId;
        const organizationId = req.user.organizationId;

        // Fetch user's memories
        const memories = await prisma.memory.findMany({
            where: {
                userId: userId,
                organizationId: organizationId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (memories.length < 3) {
            return res.json({
                suggestions: [],
                message: "Not enough memories to curate (need at least 3)."
            });
        }

        // Get organization config
        const organization = await prisma.organization.findUnique({
            where: { id: organizationId },
            select: { config: true }
        });

        let config = {};
        if (organization?.config) {
            try { config = JSON.parse(organization.config); } catch (e) { }
        }

        // Call Curator Service (Import moved to top)
        const suggestions = await CuratorService.generateCuratedCollections(memories, config);

        res.json({ suggestions });

    } catch (error) {
        console.error('Curation Error:', error.stack || error);
        res.status(500).json({ message: 'Error generating suggestions', error: error.message });
    }
};

exports.chatWithAgent = async (req, res) => {
    try {
        const { message, agentId } = req.body;
        const organizationId = req.user.organizationId; // Auth middleware required

        // Check if key is missing or is the placeholder
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            return res.json({
                response: "Olá! Sou um Agente (Simulado). As chaves de API do Gemini não estão configuradas corretamente no servidor.",
                audioUrl: null
            });
        }

        // 1. Fetch Agent from DB
        const agent = await prisma.agent.findFirst({
            where: {
                id: parseInt(agentId),
                isActive: true,
                OR: [
                    { organizationId: organizationId },
                    { isGlobal: true }
                ]
            }
        });

        if (!agent) {
            return res.status(404).json({ message: 'Agent not found or not accessible.' });
        }

        // 2. Build History with Dynamic System Prompt
        const history = [
            {
                role: "user",
                parts: [{ text: `System Prompt: ${agent.systemPrompt}` }],
            },
            {
                role: "model",
                parts: [{ text: `Entendido. Atuarei como ${agent.name}.` }],
            }
        ];

        // Future: If we want to persist chat history per session -> fetch from DB here

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const chat = model.startChat({ history });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ response: text });

    } catch (error) {
        console.error('Agent Chat Error:', error);
        res.status(500).json({ message: 'Error chatting with agent', error: error.message });
    }
};

exports.generateLessonPlan = async (req, res) => {
    try {
        const { memoryIds, gradeLevel, subject, topic } = req.body;
        const organizationId = req.user.organizationId;

        if (!memoryIds || !Array.isArray(memoryIds) || memoryIds.length === 0) {
            return res.status(400).json({ message: 'Please select at least one memory.' });
        }

        // Fetch full memory details
        const memories = await prisma.memory.findMany({
            where: {
                id: { in: memoryIds.map(id => parseInt(id)) },
                organizationId: organizationId
            }
        });

        if (memories.length === 0) {
            return res.status(404).json({ message: 'Memories not found.' });
        }

        // Call Pedagogical Service
        const PedagogicalService = require('../services/pedagogicalService');
        const lessonPlan = await PedagogicalService.generateLessonPlan(memories, gradeLevel, subject, topic, req.user.userId, organizationId);

        res.json(lessonPlan);

    } catch (error) {
        console.error('Lesson Plan Error:', error);
        res.status(500).json({ message: 'Error generating lesson plan', error: error.message });
    }
};
