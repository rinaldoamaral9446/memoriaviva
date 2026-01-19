const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateSocialContent = async (memory, platform) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const systemPrompt = `
        You are a Social Media Manager for a Cultural Organization.
        Your task is to create a viral post for ${platform} based on the following memory/event.
        
        Memory Title: ${memory.title}
        Description: ${memory.description || 'No description'}
        Content Preview: ${memory.content.substring(0, 200)}...
        
        Return ONLY a JSON object with the following structure (no markdown):
        {
            "caption": "The post caption text, including emojis.",
            "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
            "visualSuggestion": "A brief description of how to edit the video/image for maximum impact."
        }
        
        Tone: ${platform === 'linkedin' ? 'Professional and inspiring' : 'Fun, engaging, and viral'}.
        Language: Portuguese (Brazil).
        `;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown if present
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonString);
    } catch (error) {
        console.error("AI Social Generation Error:", error);
        throw new Error("Failed to generate social content");
    }
};

module.exports = { generateSocialContent };
