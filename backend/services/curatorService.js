const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock');

class CuratorService {
    /**
     * Calculate curation score for a memory
     * Score based on: content length, image presence, tags, and sentiment (simulated)
     */
    calculateScore(memory) {
        let score = 0;

        // Content length (up to 30 points)
        if (memory.description && memory.description.length > 500) score += 30;
        else if (memory.description && memory.description.length > 200) score += 20;
        else if (memory.description && memory.description.length > 50) score += 10;

        // Media presence (40 points)
        if (memory.imageUrl || memory.audioUrl || memory.thumbnailUrl) score += 40;

        // Metadata (20 points)
        if (memory.tags && memory.tags.length > 5) score += 10;
        if (memory.location) score += 10;

        // Date precision (10 points)
        if (memory.date) score += 10;

        return score;
    }

    /**
     * Get curation suggestions for an organization (Legacy)
     */
    async getSuggestions(organizationId) {
        const memories = await prisma.memory.findMany({
            where: {
                organizationId,
                isPublic: false // Only suggest non-public memories
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        const scoredMemories = memories.map(memory => ({
            ...memory,
            score: this.calculateScore(memory)
        }));

        // Return top 10 high-scoring memories
        return scoredMemories
            .filter(m => m.score >= 60) // Minimum score threshold
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
    }

    /**
     * Generate AI-curated collections from a list of memories
     */
    async generateCuratedCollections(memories, config) {
        try {
            // Filter valid memories
            const validMemories = memories.filter(m => m.description || m.title);
            if (validMemories.length === 0) return [];

            const memoriesContext = validMemories.map(m =>
                `- ID: ${m.id}\n  Título: ${m.title}\n  Data: ${m.date}\n  Resumo: ${m.description}\n  Tags: ${m.tags ? m.tags.join(', ') : ''}`
            ).join('\n\n');

            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

            const prompt = `
                Atue como um Curador de Museu Digital.
                Analise as seguintes memórias e agrupe-as em 3 coleções temáticas sugeridas.
                
                MEMÓRIAS:
                ${memoriesContext}

                ${config.aiInstructions ? `CONTEXTO DA ORGANIZAÇÃO: ${config.aiInstructions}` : ''}

                Retorne APENAS um JSON com o seguinte formato:
                [
                    {
                        "title": "Nome da Coleção (ex: Festas Populares)",
                        "description": "Breve descrição do tema",
                        "memoryIds": [1, 5, 8],
                        "reason": "Por que essas memórias se conectam"
                    }
                ]
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);

        } catch (error) {
            console.error('Error generating curated collections:', error);
            // Fallback: return score-based suggestions if AI fails
            return [];
        }
    }
}

module.exports = new CuratorService();
