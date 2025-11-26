exports.buildMemoryPrompt = (textInput, orgInstructions, guardrails) => {
    let prompt = `
        Analise o seguinte conteúdo (texto e/ou mídia) de uma memória cultural e extraia informações estruturadas em formato JSON.
        ${textInput ? `Contexto adicional do usuário: "${textInput}"` : ''}
        
        ${orgInstructions ? `\nINSTRUÇÕES ESPECIAIS DA ORGANIZAÇÃO:\n${orgInstructions}` : ''}
        
        ${guardrails ? `\nGUARDRAILS (REGRAS DE SEGURANÇA E BLOQUEIO - IMPORTANTE):\n${guardrails}\nSe o conteúdo violar estas regras, retorne um JSON com title: "Conteúdo Bloqueado" e description: "Este conteúdo viola as diretrizes de segurança da organização."` : ''}

        Se houver uma imagem, descreva detalhadamente os elementos visuais, roupas, cenário e emoções.
        Use essas informações visuais para gerar tags precisas.

        Retorne APENAS um objeto JSON com os seguintes campos:
        - title: Um título curto e descritivo.
        - description: Uma descrição detalhada e narrativa do que é visto na imagem ou ouvido no áudio, combinada com o contexto do usuário.
        - date: A data mencionada ou estimada (YYYY-MM-DD). Use a data de hoje se não for possível estimar.
        - location: O local mencionado ou identificado visualmente (ou null).
        - tags: Uma lista de 5 a 8 tags relevantes (incluindo elementos visuais detectados).
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
