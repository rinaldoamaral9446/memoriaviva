const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateSchedule = async (prompt) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const systemPrompt = `
        You are an expert Event Planner for a Cultural Center.
        Your task is to generate a schedule of events based on the user's request.
        
        Return ONLY a JSON array of objects. Do not include markdown formatting or backticks.
        Each object should have:
        - title: String (Creative title)
        - description: String (Short engaging description)
        - eventDate: ISO 8601 DateTime String (Assume next weekend if not specified, distribute events logically)
        - location: String (e.g., "Main Hall", "Garden", "Auditorium")
        - ticketPrice: Number (0 for free)
        - capacity: Number (Estimate based on location)
        
        User Request: "${prompt}"
        `;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown if present
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonString);
    } catch (error) {
        console.error("AI Schedule Generation Error:", error);
        throw new Error("Failed to generate schedule");
    }
};

module.exports = { generateSchedule };
