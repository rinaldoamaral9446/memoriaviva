const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock-key');

class AiRoleService {
    /**
     * Generates a JSON permission object based on a natural language description.
     * @param {string} description - The user's description of the role.
     * @returns {Promise<Object>} - The permissions object.
     */
    async generatePermissions(description) {
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

            const prompt = `
            You are an expert system administrator. Your task is to translate a natural language description of a user role into a strict JSON permission object.

            **Available Resources:**
            - 'memories': Managing cultural memories.
            - 'users': Managing other users in the organization.
            - 'settings': Managing organization settings.
            - 'analytics': Viewing dashboards and reports.

            **Available Actions:**
            - 'create': Create new items.
            - 'read': View items.
            - 'update': Edit existing items.
            - 'delete': Remove items.
            - 'publish': Make memories public (specific to 'memories' resource).
            - 'create_draft': Create memories but not publish (specific to 'memories').

            **User Description:**
            "${description}"

            **Instructions:**
            1. Analyze the description to determine which resources and actions are implied.
            2. Be conservative. Only grant permissions explicitly requested or logically necessary.
            3. Return ONLY a valid JSON object. Do not include markdown formatting or explanations.
            4. The JSON structure must be: { "resourceName": ["action1", "action2"] }.
            5. If a resource is not mentioned, do not include it in the JSON (or include it with an empty array).

            **Example Output:**
            {
                "memories": ["read", "create_draft"],
                "users": [],
                "settings": [],
                "analytics": ["read"]
            }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up markdown if present
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

            return JSON.parse(jsonStr);

        } catch (error) {
            console.error('AI Role Generation Error:', error);
            // Fallback to empty permissions or throw
            throw new Error('Failed to generate permissions from description.');
        }
    }
}

module.exports = new AiRoleService();
