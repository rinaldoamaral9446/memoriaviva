const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Dummy model to get client
        // Actually, the SDK doesn't have a direct listModels method on the client instance easily accessible in all versions.
        // But let's try to just run a simple generation with a very basic model name "gemini-1.0-pro" or just print the error which might list models.
        // Better yet, let's try to use the API directly via curl to list models if the SDK is tricky.
        console.log("Listing models via SDK might be version dependent.");
    } catch (error) {
        console.error(error);
    }
}

// listModels();
