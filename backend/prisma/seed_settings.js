const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const defaultPrompt = `
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

    const setting = await prisma.systemSettings.upsert({
        where: { key: 'ai_meta_prompt_city_dna' },
        update: {},
        create: {
            key: 'ai_meta_prompt_city_dna',
            value: JSON.stringify({ prompt: defaultPrompt }),
            description: 'Meta-prompt utilizado pelo Copilot para sugerir configurações regionais via IA.'
        }
    });

    console.log('System Setting seeded:', setting);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
