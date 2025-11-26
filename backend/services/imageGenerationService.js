const { GoogleGenerativeAI } = require('@google/generative-ai');
const cloudinary = require('../config/cloudinary');
const axios = require('axios');

// Initialize Google AI client (same as used for Gemini)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock-key');

/**
 * Generate an image based on memory context using Google Imagen 3
 * @param {Object} memoryData - Structured memory data (title, description, location, date, sentiment)
 * @returns {Promise<string>} - Cloudinary URL of generated image
 */
async function generateMemoryImage(memoryData) {
    try {
        // Build artistic prompt
        const prompt = buildImagePrompt(memoryData);

        console.log('🎨 Generating image with Google Imagen 3:', prompt);

        // Check if API key is configured
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            console.log('⚠️  Gemini API key not configured, skipping image generation');
            return null;
        }

        // Use Imagen 3 via Vertex AI REST API
        const projectId = process.env.GCP_PROJECT_ID || 'memoriaviva';
        const location = 'us-central1';
        const apiEndpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-generate-001:predict`;

        // Make request to Imagen
        const response = await axios.post(
            apiEndpoint,
            {
                instances: [
                    {
                        prompt: prompt
                    }
                ],
                parameters: {
                    sampleCount: 1,
                    aspectRatio: "1:1",
                    safetyFilterLevel: "block_some",
                    personGeneration: "allow_adult"
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Extract base64 image from response
        const base64Image = response.data.predictions[0].bytesBase64Encoded;
        console.log('✅ Image generated with Imagen 3');

        // Upload to Cloudinary
        const cloudinaryResult = await uploadBase64ToCloudinary(base64Image);
        console.log('☁️  Uploaded to Cloudinary:', cloudinaryResult.secure_url);

        return cloudinaryResult.secure_url;

    } catch (error) {
        console.error('❌ Image generation error:', error.response?.data || error.message);
        return null; // Gracefully fail, memory can still be created
    }
}

/**
 * Build an artistic prompt for Imagen based on memory context
 */
function buildImagePrompt(memoryData) {
    const { title, description, location, date } = memoryData;

    // Extract decade/era from date
    let era = '';
    if (date) {
        const year = new Date(date).getFullYear();
        if (year < 1960) era = 'vintage 1950s aesthetic';
        else if (year < 1980) era = '1960s nostalgic style';
        else if (year < 2000) era = '1980s retro vibe';
        else if (year < 2010) era = 'early 2000s feel';
        else era = 'modern contemporary style';
    }

    // Build prompt
    const parts = [
        'A nostalgic watercolor illustration',
        title ? `of ${title.toLowerCase()}` : '',
        location ? `at ${location}` : '',
        description ? `, capturing ${description.toLowerCase().substring(0, 100)}` : '',
        era ? `, ${era}` : '',
        ', warm tones, cultural memory aesthetic, soft lighting, emotional depth'
    ];

    return parts.filter(Boolean).join(' ');
}

/**
 * Upload a base64 image to Cloudinary
 */
async function uploadBase64ToCloudinary(base64Image) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            `data:image/png;base64,${base64Image}`,
            {
                folder: 'memoria-viva/ai-generated',
                resource_type: 'image'
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
    });
}

module.exports = {
    generateMemoryImage,
    buildImagePrompt
};
