const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock-key');

exports.processMemoryInput = async (req, res) => {
    try {
        const { textInput } = req.body;
        const file = req.file;

        // Check if key is missing or is the placeholder
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            // Mock response
            console.log('Using mock AI response (No API Key)');
            return res.json({
                title: 'Título Sugerido pela IA (Mock)',
                description: textInput || 'Descrição baseada na mídia enviada.',
                date: new Date().toISOString().split('T')[0],
                location: 'Localização Detectada',
                tags: ['IA', 'Multimodal', 'Mock']
            });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        // Get organization-specific AI instructions
        let organizationInstructions = '';
        if (req.user && req.user.organizationId) {
            const organization = await prisma.organization.findUnique({
                where: { id: req.user.organizationId },
                select: { config: true }
            });

            if (organization && organization.config) {
                try {
                    const config = JSON.parse(organization.config);
                    if (config.aiInstructions) {
                        organizationInstructions = `\n\nINSTRUÇÕES ESPECIAIS DA ORGANIZAÇÃO: ${config.aiInstructions}`;
                    }
                } catch (e) {
                    console.log('Failed to parse organization config');
                }
            }
        }

        let promptParts = [];

        // Add text prompt with organization-specific instructions
        promptParts.push(`
            Analise o seguinte conteúdo (texto e/ou mídia) de uma memória cultural e extraia informações estruturadas em formato JSON.
            ${textInput ? `Contexto adicional do usuário: "${textInput}"` : ''}
            ${organizationInstructions}
            
            Retorne APENAS um objeto JSON com os seguintes campos:
            - title: Um título curto e descritivo.
            - description: Uma descrição detalhada do que é visto na imagem ou ouvido no áudio, combinada com o contexto do usuário.
            - date: A data mencionada ou estimada (YYYY-MM-DD). Use a data de hoje se não for possível estimar.
            - location: O local mencionado ou identificado visualmente (ou null).
            - tags: Uma lista de 3 a 5 tags relevantes.
        `);

        // Add media if present
        if (file) {
            promptParts.push({
                inlineData: {
                    data: file.buffer.toString('base64'),
                    mimeType: file.mimetype
                }
            });
        }

        const result = await model.generateContent(promptParts);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const structuredData = JSON.parse(jsonStr);

        res.json(structuredData);
    } catch (error) {
        console.error('AI Processing Error:', error);
        res.status(500).json({ message: 'Error processing content', error: error.message });
    }
};
