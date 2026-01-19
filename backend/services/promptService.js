exports.buildMemoryPrompt = (textInput, orgInstructions, guardrails, culturalContext) => {
    let prompt = `
        Analise o seguinte conteúdo (texto e/ou mídia) de uma memória cultural e extraia informações estruturadas em formato JSON.
        ${textInput ? `Contexto adicional do usuário: "${textInput}"` : ''}
        
        ${culturalContext ? `\nCONTEXTO CULTURAL E REGIONAL (MUITO IMPORTANTE):\n${culturalContext}\nUtilize este contexto para enriquecer a descrição e identificar gírias, locais ou costumes específicos da região.` : ''}

        ${orgInstructions ? `\nINSTRUÇÕES ESPECIAIS DA ORGANIZAÇÃO:\n${orgInstructions}` : ''}
        
        ${guardrails ? `\nGUARDRAILS (REGRAS DE SEGURANÇA E BLOQUEIO - IMPORTANTE):\n${guardrails}\nSe o conteúdo violar estas regras, retorne um JSON com title: "Conteúdo Bloqueado" e description: "Este conteúdo viola as diretrizes de segurança da organização."` : ''}

        Se houver uma imagem, descreva detalhadamente os elementos visuais, roupas, cenário e emoções.
        Use essas informações visuais para gerar tags precisas.

        Retorne APENAS um objeto JSON válido.
        DIRETRIZ DE PRIORIDADE (HIERARQUIA DE VERDADE):
        1. [FATOS PRIMÁRIOS] Título do Vídeo e Descrição Oficial: A história DEVE ser sobre o que está escrito aqui (ex: se diz "Portugal", fale de Portugal).
        2. [TOM E ESTILO] Contexto Cultural/Pedagógico: Use para dar a "voz" da organização, mas NÃO substitua os fatos primários.
        3. [SÍNTESE] Se houver conflito (ex: Título diz "Gelo" e Contexto diz "Tropical"), o Título ganha.

        Campos do JSON:
        - title: Um título curto e descritivo em Português (Fiel ao input).
        - description: Uma descrição detalhada e narrativa em Português (Fiel aos fatos, com tom pedagógico).
        - date: A data mencionada ou estimada (YYYY-MM-DD).
        - location: O local mencionado ou identificado.
        - tags: Uma lista de 5 a 8 tags relevantes.
        - reasoning: Explique sua lógica: "Priorizei o título do vídeo para os fatos (X, Y) e o contexto da organização para o tom pedagógico."
    `;
    return prompt;
};

exports.optimizeInstructionPrompt = (currentInstruction) => {
    return `
        Você é um especialista em Engenharia de Prompt para LLMs (Large Language Models).
        
        Sua tarefa é melhorar a seguinte instrução de sistema criada por um administrador de uma plataforma de memória cultural:
        "${currentInstruction}"

        Objetivo: Tornar a instrução mais clara, eficiente e capaz de gerar resultados de alta qualidade na IA.
        Mantenha a intenção original, mas use termos técnicos adequados (ex: "persona", "tom de voz", "formato de saída") se necessário.
        
        Retorne APENAS o texto da instrução melhorada, sem explicações adicionais.
    `;
};
