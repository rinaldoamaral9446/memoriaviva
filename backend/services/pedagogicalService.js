const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
        4. SUMMARY: Include a 'summary' field (max 500 chars) summarizing the memory/transcription, improving clarity for the teacher. Focus on cultural and educational value.
        5. IMPORTANT: ALL CONTENT MUST BE IN PORTUGUESE (PT-BR).

        Output Format (JSON):
        {
            "title": "Título do Plano de Aula",
            "summary": "Resumo calmo e educativo sobre a memória transcrita...",
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
 * Helper: Build Dynamic Prompt from Configuration
 */
function getExampleInfo(educationalBrand) {
    if (!educationalBrand || educationalBrand === 'Kit de Materiais Didáticos') {
        return 'Sugira atividades práticas usando materiais escolares comuns.';
    }
    return `Todo plano deve incluir o uso de "${educationalBrand}". Sugira atividades práticas com este material.`;
}

function getDynamicPrompt(memoryContext, gradeLevel, topic, educationalBrand, orgName, customInstructions, regionalContext) {
    // Default Fallbacks
    const brand = educationalBrand || 'Materiais Didáticos Padrão';
    const instructions = customInstructions || 'Adapte para a cultura local, valorizando a identidade da comunidade.';
    const regionContext = regionalContext || '';

    return `
        Você é um Especialista em Educação Infantil da Rede Municipal de ${orgName || 'Ensino'}.
        Sua base curricular é a BNCC (Campos de Experiência).

        CONTEXTO DO PLANO:
        - Faixa Etária/Turma: ${gradeLevel} (Foco: 4 a 5 anos e 11 meses).
        - Tema Central: ${topic || 'Patrimônio Cultural e Memória'}
        - Foco Pedagógico: Ludicidade, Interação, Oralidade e Cultura Local.

        MEMÓRIAS CULTURAIS (MATERIAL BASE):
        ${memoryContext}

        DIRETRIZES REGIONAIS E CULTURAIS:
        ${instructions}
        ${regionContext}

        2. RECURSOS DIDÁTICOS (${brand.toUpperCase()}):
           - ${getExampleInfo(brand)}

        3. RESUMO (SUMMARY):
           - Crie um campo 'summary' (max 500 chars) resumindo a vivência cultural relatada, destacando os elementos locais. Use tom pedagógico.

        4. ESTRUTURA BNCC:
           - Não use "Matérias". Use "Campos de Experiência".
           - Mapeie Códigos BNCC reais (Ex: EI03EO01, EI03TS02).

        FORMATO DE SAÍDA (JSON):
        {
            "title": "Título Lúdico do Plano",
            "summary": "Nesta vivência, o narrador descreve...",
            "gradeLevel": "${gradeLevel}",
            "fieldsOfExperience": [
                "O eu, o outro e o nós",
                "Corpo, gestos e movimentos",
                "Traços, sons, cores e formas",
                "Escuta, fala, pensamento e imaginação",
                "Espaços, tempos, quantidades, relações e transformações"
            ],
            "bnccCodes": ["EI03..."],
            "gigantinhosKit": "Descrição de como usar o ${brand} na atividade.",
            "objectives": ["Objetivo de Aprendizagem 1", "Objetivo 2"],
            "duration": "Tempo estimado (ex: 4 horas / 1 turno)",
            "materials": ["Lista de materiais incluindo ${brand}"],
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
async function generateLessonPlan(memories, gradeLevel, subject, topic, userId, organizationId) {
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

        // Fetch Organization for Regional Context
        let organization = null;
        let config = {};

        if (organizationId) {
            organization = await prisma.organization.findUnique({
                where: { id: parseInt(organizationId) }
            });
            if (organization && organization.config) {
                try {
                    config = JSON.parse(organization.config);
                } catch (e) {
                    console.error('Error parsing org config:', e);
                }
            }
        }

        const orgName = organization ? organization.name : 'Ensino';

        // Extract customized values from config or use defaults
        const educationalBrand = config.educational_brand || 'Kit de Materiais Didáticos';
        const pedagogicalPrompt = config.pedagogical_prompt || ''; // e.g. "Cite a Usina..."
        const regionalContext = config.regional_context || '';     // e.g. "Contexto histórico de Rio Largo..."

        // 2. Prompt Selection (Now fully dynamic)
        const prompt = getDynamicPrompt(
            memoryContext,
            gradeLevel,
            topic,
            educationalBrand,
            orgName,
            pedagogicalPrompt,
            regionalContext
        );

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log('RESPOSTA BRUTA DA IA:', text);

        // Clean up markdown
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const json = JSON.parse(jsonStr);

        // [PERSISTENCE] Save Lesson Plan to Database
        if (userId && organizationId) {
            try {
                const savedPlan = await prisma.lessonPlan.create({
                    data: {
                        title: json.title || 'Plano de Aula Sem Título',
                        gradeLevel: gradeLevel || 'N/A',
                        subject: subject || null,
                        topic: topic || null,
                        content: JSON.stringify(json),
                        userId: parseInt(userId),
                        organizationId: parseInt(organizationId)
                    }
                });
                return { ...json, id: savedPlan.id };
            } catch (dbError) {
                console.error('Failed to save lesson plan to DB:', dbError);
                // Return generated plan even if save fails, but log error
                return json;
            }
        }

        return json;

    } catch (error) {
        console.error('Pedagogical Service Error:', error);
        throw new Error('Failed to generate lesson plan');
    }
}

/**
 * Copilot: Suggest Regional Configuration based on City Name
 */
/**
 * Copilot: Suggest Regional Configuration based on City Name
 */
async function suggestCityDNA(cityName) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        // Fetch Meta-Prompt from System Settings
        const setting = await prisma.systemSettings.findUnique({
            where: { key: 'ai_meta_prompt_city_dna' }
        });

        let promptTemplate = setting ? JSON.parse(setting.value).prompt : null;

        if (!promptTemplate) {
            // Fallback Default
            promptTemplate = `
                Atue como um Especialista em Cultura e Educação Pública Brasileira.
                Sua missão é configurar a "personalidade" de uma IA Pedagógica para a cidade de: \${cityName}.
                
                Gere um JSON com 3 campos:
                1. "educational_brand": Um nome criativo para o Kit de Material Didático da cidade (Ex: "Kit Gigantinhos" para Maceió, "Caminhos do Saber" para cidade genérica).
                2. "pedagogical_prompt": Uma instrução curta para a IA focar na identidade local (Ex: "Valorize a cultura da Zona da Mata e o folclore local.").
                3. "regional_context": Um parágrafo destacando pontos históricos, geográficos e culturais importantes dessa cidade para serem usados em aulas.
                
                SAÍDA APENAS JSON:
                {
                    "educational_brand": "...",
                    "pedagogical_prompt": "...",
                    "regional_context": "..."
                }
            `;
        }

        // Inject Variable
        const prompt = promptTemplate.replace('${cityName}', cityName);

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Error suggesting City DNA:', error);
        throw new Error('Failed to generate suggestions');
    }
}

module.exports = {
    generateLessonPlan,
    suggestCityDNA
};
