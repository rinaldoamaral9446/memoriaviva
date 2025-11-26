const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock-key');

/**
 * Generate a BNCC-aligned lesson plan based on memories
 * @param {Array} memories - List of selected memories
 * @param {string} gradeLevel - e.g., "Ensino Fundamental I - 3º Ano"
 * @param {string} subject - e.g., "Artes", "História"
 * @param {string} topic - Specific topic (optional)
 * @returns {Promise<Object>} - Structured lesson plan
 */
async function generateLessonPlan(memories, gradeLevel, subject, topic) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        // Prepare memory context
        const memoryContext = memories.map(m => `
            - Title: ${m.title}
            - Date: ${m.eventDate || m.date}
            - Location: ${m.location}
            - Description: ${m.description}
            - Tags: ${m.tags}
        `).join('\n');

        const prompt = `
        You are an Expert Educator specialized in the Brazilian National Common Curricular Base (BNCC).
        Your task is to create a detailed Lesson Plan using the provided Cultural Memories as the core teaching material.

        Context:
        - Grade Level: ${gradeLevel}
        - Subject: ${subject}
        - Topic: ${topic || 'Cultural Heritage and Memory'}
        
        Cultural Memories to use:
        ${memoryContext}

        Instructions:
        1. Identify specific BNCC Competencies and Skills (codes like EF15AR01) relevant to the Grade/Subject and the memory content.
        2. Design a creative, engaging activity where students interact with these memories.
        3. Structure the output as a JSON object.
        4. IMPORTANT: ALL CONTENT MUST BE IN PORTUGUESE (PT-BR).

        Output Format (JSON):
        {
            "title": "Título do Plano de Aula",
            "bnccCodes": ["EF15AR01", "EF15AR24"],
            "objectives": ["Objetivo 1", "Objetivo 2"],
            "duration": "2 aulas (50 min cada)",
            "materials": ["Material 1", "Material 2"],
            "methodology": [
                { "step": "Introdução", "description": "..." },
                { "step": "Desenvolvimento", "description": "..." },
                { "step": "Conclusão", "description": "..." }
            ],
            "assessment": "Como avaliar o aprendizado"
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonStr);

    } catch (error) {
        console.error('Pedagogical Service Error:', error);
        throw new Error('Failed to generate lesson plan');
    }
}

module.exports = {
    generateLessonPlan
};
