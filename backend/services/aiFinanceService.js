const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeCosts = async (expenses, timeframe) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const expensesSummary = expenses.map(e =>
            `- ${e.date.toISOString().split('T')[0]}: ${e.description} (R$ ${e.amount}) - Category: ${e.category}`
        ).join('\n');

        const systemPrompt = `
        You are a Financial Auditor for a Public Cultural Organization.
        Your task is to analyze the following expenses for the period: ${timeframe}.
        
        Expenses:
        ${expensesSummary}
        
        Please provide a JSON object with the following structure (no markdown):
        {
            "summary": "A formal paragraph summarizing the total spending and main cost drivers.",
            "insights": ["List of 3-5 bullet points highlighting efficiency or areas for concern."],
            "anomalies": ["List of any unusually high or suspicious expenses."],
            "recommendations": "A paragraph suggesting how to optimize budget for future events."
        }
        
        Tone: Formal, objective, and suitable for a public transparency report.
        Language: Portuguese (Brazil).
        `;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown if present
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonString);
    } catch (error) {
        console.error("AI Finance Analysis Error:", error);
        throw new Error("Failed to analyze costs");
    }
};

module.exports = { analyzeCosts };
