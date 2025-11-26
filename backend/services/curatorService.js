const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CuratorService {
    /**
     * Calculate curation score for a memory
     * Score based on: content length, image presence, tags, and sentiment (simulated)
     */
    calculateScore(memory) {
        let score = 0;

        // Content length (up to 30 points)
        if (memory.content.length > 500) score += 30;
        else if (memory.content.length > 200) score += 20;
        else if (memory.content.length > 50) score += 10;

        // Media presence (40 points)
        if (memory.mediaUrl) score += 40;

        // Metadata (20 points)
        if (memory.tags && memory.tags.length > 5) score += 10;
        if (memory.location) score += 10;

        // Date precision (10 points)
        if (memory.eventDate) score += 10;

        return score;
    }

    /**
     * Get curation suggestions for an organization
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
}

module.exports = new CuratorService();
