const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock-key');

/**
 * Analyze memories and suggest thematic collections
 * @param {Array} memories - List of user memories
 * @param {Object} organizationConfig - Organization settings for AI tone
 * @returns {Promise<Array>} - List of suggested collections
 */
async function generateCuratedCollections(memories, organizationConfig = {}) {
    try {
        if (!memories || memories.length === 0) {
            return [];
        }

        // Prepare memories for analysis (reduce token count)
        const memoryList = memories.map(m => ({
            id: m.id,
            title: m.title,
            date: m.eventDate || m.date,
            location: m.location,
            tags: m.tags ? JSON.parse(m.tags) : [],
            description: m.description ? m.description.substring(0, 200) + '...' : ''
        }));

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `
        You are an expert Cultural Curator and Archivist.
        Analyze the following list of memories and identify 3 distinct thematic collections.
        
        Memories:
        ${JSON.stringify(memoryList)}

        Instructions:
        1. Look for patterns in location, time period, people, or themes (e.g., "Summer Vacations", "Family Celebrations", "Life in Rio").
        2. Create 3 collections.
        3. For each collection, provide:
           - "title": A catchy, poetic title.
           - "description": A brief, inspiring description of why these memories belong together.
           - "memoryIds": An array of IDs of the memories that fit this theme.
           - "coverImageId": The ID of the most representative memory to use as cover (optional).

        Output strictly valid JSON in this format:
        [
            {
                "title": "Collection Title",
                "description": "Collection description...",
                "memoryIds": [1, 5, 8],
                "coverImageId": 5
            }
        ]
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonStr);

    } catch (error) {
        console.error('Curator Service Error:', error);
        return []; // Return empty suggestions on error
    }
}

module.exports = {
    generateCuratedCollections
};
