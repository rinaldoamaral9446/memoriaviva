const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require('@prisma/client');
const PromptService = require('../services/promptService');
const fs = require('fs');
const path = require('path');

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

        // Add media if present (image, audio, or document)
        if (file) {
            const fileSizeMB = file.size / 1024 / 1024;
            const isAudio = file.mimetype.startsWith('audio/');
            const isPDF = file.mimetype === 'application/pdf';
            const isText = file.mimetype === 'text/plain';
            const isWord = file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

            // For audio files > 5MB or PDFs, use Files API
            if ((isAudio && fileSizeMB > 5) || isPDF) {
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
        const lessonPlan = await PedagogicalService.generateLessonPlan(memories, gradeLevel, subject, topic);

        res.json(lessonPlan);

    } catch (error) {
        console.error('Lesson Plan Error:', error);
        res.status(500).json({ message: 'Error generating lesson plan', error: error.message });
    }
};
