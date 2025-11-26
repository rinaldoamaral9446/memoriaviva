const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require('@prisma/client');
const PromptService = require('../services/promptService');

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock-key');

exports.processMemoryInput = async (req, res) => {
    try {
        const { textInput } = req.body;
        const file = req.file;
        let imageUrl = null;
        let audioUrl = null;

        // Log received file info
        if (file) {
            console.log(`📁 Received file: ${file.originalname} (${file.mimetype}, ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        }

        // Save file to Cloudinary if present (only images, skip audio)
        if (file) {
            const cloudinary = require('../config/cloudinary');
            const streamifier = require('streamifier');

            // Determine if it's an audio file
            const isAudio = file.mimetype.startsWith('audio/');

            // Upload images and documents to Cloudinary, skip audio (Gemini can process directly)
            if (!isAudio) {
                // Upload from buffer
                const uploadFromBuffer = (buffer) => {
                    return new Promise((resolve, reject) => {
                        const cld_upload_stream = cloudinary.uploader.upload_stream(
                            {
                                folder: "memoria-viva",
                                resource_type: 'auto' // Auto-detect (image/raw)
                            },
                            (error, result) => {
                                if (result) {
                                    resolve(result);
                                } else {
                                    reject(error);
                                }
                            }
                        );
                        streamifier.createReadStream(buffer).pipe(cld_upload_stream);
                    });
                };

                try {
                    const result = await uploadFromBuffer(file.buffer);
                    // Check if it's an image or document
                    if (result.resource_type === 'image') {
                        imageUrl = result.secure_url;
                    } else {
                        // For PDFs/Docs, Cloudinary might return 'raw' or 'image' (for PDFs sometimes)
                        // We'll treat anything not strictly an image as a document URL if needed, 
                        // but for now let's store it in a generic way or separate variable
                        // Ideally we want separate fields, but let's see how we handle it.
                        // We'll assign to a new variable documentUrl
                        req.documentUrl = result.secure_url;
                    }
                } catch (error) {
                    console.error('Cloudinary Upload Error:', error);
                    // Continue without image if upload fails
                }
            } else {
                console.log('🎵 Audio file detected, will process with Gemini (no Cloudinary upload)');
            }
            // If it's audio, we'll just process it with Gemini, no URL to save
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
                } catch (e) {
                    console.log('Failed to parse organization config');
                }
            }
        }

        let promptParts = [];

        // Build prompt using service
        const systemPrompt = PromptService.buildMemoryPrompt(textInput, organizationInstructions, organizationGuardrails);
        promptParts.push(systemPrompt);

        // Add media if present (image or audio)
        // Add media if present (image, audio, or document)
        if (file) {
            const fileSizeMB = file.size / 1024 / 1024;
            const isAudio = file.mimetype.startsWith('audio/');
            const isPDF = file.mimetype === 'application/pdf';
            const isText = file.mimetype === 'text/plain';
            const isWord = file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

            // For audio files > 5MB or PDFs, use Files API
            if ((isAudio && fileSizeMB > 5) || isPDF) {
                console.log(`📄 Large file or PDF (${fileSizeMB.toFixed(2)}MB), using Files API...`);

                try {
                    const { GoogleAIFileManager } = require('@google/generative-ai/server');
                    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

                    // Write buffer to temp file
                    const fs = require('fs');
                    const path = require('path');
                    const tempPath = path.join(__dirname, '..', 'temp', `upload_${Date.now()}.${file.originalname.split('.').pop()}`);

                    // Ensure temp directory exists
                    const tempDir = path.dirname(tempPath);
                    if (!fs.existsSync(tempDir)) {
                        fs.mkdirSync(tempDir, { recursive: true });
                    }

                    fs.writeFileSync(tempPath, file.buffer);

                    // Upload to Gemini Files API
                    const uploadResult = await fileManager.uploadFile(tempPath, {
                        mimeType: file.mimetype,
                        displayName: file.originalname
                    });

                    console.log(`✅ Uploaded to Files API: ${uploadResult.file.uri}`);

                    // Add file reference to prompt
                    promptParts.push({
                        fileData: {
                            fileUri: uploadResult.file.uri,
                            mimeType: file.mimetype
                        }
                    });

                    // Clean up temp file
                    fs.unlinkSync(tempPath);

                } catch (error) {
                    console.error('❌ Files API upload failed, falling back to inline/text:', error.message);
                    // Fallback logic could go here, but for PDF/Audio > 20MB inline isn't an option usually
                }
            } else if (isWord) {
                // Extract text from Word document
                try {
                    const mammoth = require('mammoth');
                    const result = await mammoth.extractRawText({ buffer: file.buffer });
                    const text = result.value;
                    console.log(`📝 Extracted ${text.length} chars from Word doc`);

                    promptParts.push({
                        text: `\n\n[DOCUMENT CONTENT START]\n${text}\n[DOCUMENT CONTENT END]\n\n`
                    });
                } catch (error) {
                    console.error('❌ Word extraction failed:', error);
                }
            } else if (isText) {
                // Read text file directly
                const text = file.buffer.toString('utf-8');
                console.log(`📝 Read ${text.length} chars from Text file`);
                promptParts.push({
                    text: `\n\n[DOCUMENT CONTENT START]\n${text}\n[DOCUMENT CONTENT END]\n\n`
                });
            } else {
                // Use inline for small files or images
                promptParts.push({
                    inlineData: {
                        data: file.buffer.toString('base64'),
                        mimeType: file.mimetype
                    }
                });
            }
        }

        // Debug log: Check prompt structure before sending
        console.log('🚀 Sending to Gemini:', {
            model: 'gemini-2.0-flash',
            promptPartsCount: promptParts.length,
            hasInlineData: !!promptParts.find(p => p.inlineData),
            hasFileData: !!promptParts.find(p => p.fileData),
            inlineMimeType: promptParts.find(p => p.inlineData)?.inlineData?.mimeType,
            fileMimeType: promptParts.find(p => p.fileData)?.fileData?.mimeType
        });

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

        // 🎨 Auto-generate cover image if no image provided (audio-only memory)
        if (!imageUrl && (audioUrl || file?.mimetype.startsWith('audio/'))) {
            console.log('🎨 No image provided, generating AI cover image...');
            const ImageGenerationService = require('../services/imageGenerationService');
            const generatedImageUrl = await ImageGenerationService.generateMemoryImage(structuredData);

            if (generatedImageUrl) {
                structuredData.imageUrl = generatedImageUrl;
                console.log('✅ AI-generated cover image added');
            }
        }

        res.json(structuredData);
    } catch (error) {
        console.error('AI Processing Error:', error);
        res.status(500).json({ message: 'Error processing content', error: error.message });
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

        // Call Curator Service
        const CuratorService = require('../services/curatorService');
        const suggestions = await CuratorService.generateCuratedCollections(memories, config);

        res.json({ suggestions });

    } catch (error) {
        console.error('Curation Error:', error);
        res.status(500).json({ message: 'Error generating suggestions', error: error.message });
    }
};

exports.chatWithAgent = async (req, res) => {
    try {
        const { message, agentId } = req.body;

        // Check if key is missing or is the placeholder
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            return res.json({
                response: "Olá! Sou o Roberto. Parece que estou sem minha chave de API hoje, mas adoraria te vender um plano Enterprise assim que eu estiver online!",
                audioUrl: null // Future: Generate audio file
            });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "System Prompt: Você é o Roberto, um vendedor sênior da plataforma Memória Cultural Viva. Seu objetivo é vender o plano Enterprise para prefeituras e escolas. Você é carismático, persuasivo e usa gírias corporativas leves. Fale de forma curta e direta, como numa chamada telefônica. Nunca saia do personagem." }],
                },
                {
                    role: "model",
                    parts: [{ text: "Alô? Aqui é o Roberto da Memória Viva! Tudo bom? Vi que você tá explorando nossa plataforma. Já pensou em levar essa tecnologia pra todas as escolas da sua rede?" }],
                },
            ],
        });

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
        const lessonPlan = await PedagogicalService.generateLessonPlan(memories, gradeLevel, subject, topic);

        res.json(lessonPlan);

    } catch (error) {
        console.error('Lesson Plan Error:', error);
        res.status(500).json({ message: 'Error generating lesson plan', error: error.message });
    }
};
