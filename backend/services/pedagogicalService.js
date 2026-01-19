const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock-key');

/**
 * Helper: Detect if the grade level corresponds to Early Childhood Education
 * @param {string} gradeLevel 
 * @returns {boolean}
 */
function detectEarlyChildhood(gradeLevel) {
    if (!gradeLevel) return false;
    const lower = gradeLevel.toLowerCase();
    return lower.includes('infantil') ||
        lower.includes('creche') ||
        lower.includes('pré-escola') ||
        lower.includes('pre-escola') ||
        lower.includes('grupo') ||
        lower.includes('4 anos') ||
        lower.includes('5 anos');
}

/**
 * Helper: Build Prompt for Elementary/Middle School (Legacy/Standard)
 */
function getFundamentalPrompt(memoryContext, gradeLevel, subject, topic) {
    return `
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
}

/**
 * Helper: Build Prompt for Early Childhood Education (Maceió/Gigantinhos)
 */
function getEarlyChildhoodPrompt(memoryContext, gradeLevel, topic) {
    return `
        Você é um Especialista em Educação Infantil da Rede Municipal de Maceió (Projeto Gigantinhos).
        Sua base curricular é a BNCC (Campos de Experiência).

        CONTEXTO DO PLANO:
        - Faixa Etária/Turma: ${gradeLevel} (Foco: 4 a 5 anos e 11 meses).
        - Tema Central: ${topic || 'Patrimônio Cultural e Memória'}
        - Foco Pedagógico: Ludicidade, Interação, Oralidade e Cultura Local.

        MEMÓRIAS CULTURAIS (MATERIAL BASE):
        ${memoryContext}

        DIRETRIZES OBRIGATÓRIAS (MACEIÓ):
        1. VOCABULÁRIO LOCAL: Ao sugerir atividades, priorize estritamente manifestações culturais de Alagoas.
           - Não use "Dança Genérica", use: "Guerreiro", "Pastoril", "Coco de Roda", "Chegança".
           - Não use "Lenda Genérica", use: "Lenda da Sereia do Pontal", "Lenda do Negro D'Água".
           - Cite o "Sururu", o "Artesanato do Pontal", o "Bumba-meu-boi de Maceió".

        2. KIT DIDÁTICO 3D (GIGANTINHOS):
           - Todo plano deve incluir o uso de Miniaturas 3D do kit escolar.
           - Sugira: "Use a miniatura do Boi", "Use as formas geométricas para montar a fachada do Jaraguá", "Use os bonecos para representar o Reisado".

        3. ESTRUTURA BNCC:
           - Não use "Matérias". Use "Campos de Experiência".
           - Mapeie Códigos BNCC reais (Ex: EI03EO01, EI03TS02).

        FORMATO DE SAÍDA (JSON):
        {
            "title": "Título Lúdico do Plano",
            "gradeLevel": "${gradeLevel}",
            "fieldsOfExperience": [
                "O eu, o outro e o nós",
                "Corpo, gestos e movimentos",
                "Traços, sons, cores e formas",
                "Escuta, fala, pensamento e imaginação",
                "Espaços, tempos, quantidades, relações e transformações"
            ],
            "bnccCodes": ["EI03..."],
            "gigantinhosKit": "Descrição de como usar as miniaturas 3D na atividade.",
            "objectives": ["Objetivo de Aprendizagem 1", "Objetivo 2"],
            "duration": "Tempo estimado (ex: 4 horas / 1 turno)",
            "materials": ["Lista de materiais incluindo o Kit 3D"],
            "methodology": [
                { "step": "Acolhida (Roda de Conversa)", "description": "..." },
                { "step": "Desafio (Mão na Massa)", "description": "..." },
                { "step": "Sistematização", "description": "..." }
            ],
            "assessment": "Observação do engajamento e registro..."
        }
    `;
}

/**
 * Generate a BNCC-aligned lesson plan based on memories
 * Adapts automatically to Early Childhood or Fundamental Education
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

        // 1. Context Detection
        const isEarlyChildhood = detectEarlyChildhood(gradeLevel);

        // 2. Prompt Selection
        // console.log(`🎓 Generating Lesson Plan. Context: ${isEarlyChildhood ? 'Early Childhood (Maceió)' : 'Fundamental'}`);

        const prompt = isEarlyChildhood
            ? getEarlyChildhoodPrompt(memoryContext, gradeLevel, topic)
            : getFundamentalPrompt(memoryContext, gradeLevel, subject, topic);

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
