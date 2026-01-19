# PRD - Interface de Gestão de Agentes Dinâmicos

## 1. Visão Geral

Transformar o "Agent Marketplace" de uma vitrine estática para uma interface de gestão dinâmica, onde administradores da organização podem criar, editar e excluir seus próprios agentes de IA.

## 2. Análise da Situação Atual

### Frontend (`AgentMarketplace.jsx`)

- **Estado Atual:** Renderiza lista estática (`const agents = [...]`).
- **Dados Hardcoded:**
  - `icon`: Componente Lucide (não serializável diretamente).
  - `color`/`bg`: Classes Tailwind para estilo.
  - `price`/`rating`: Elementos de "Marketplace".
- **Interação:** Clique chama componente `VoiceAgent` (modal de chat).

### Backend (`schema.prisma` - Tabela `Agent`)

- **Campos Existentes:** `name`, `role`, `description`, `avatarUrl`, `systemPrompt`, `organizationId`.
- **Gaps Identificados:**
  - Não há campos para `color`, `icon` ou `config` visual.
  - Não há persistência de preços ou avaliações (talvez irrelevante para agentes customizados).

## 3. Estratégia de Integração

### 3.1. Frontend Refactor

- **Mudança de Paradigma:** De "Comprar Agente" para "Meus Agentes".
- **Nova Funcionalidade:** Botão "+ Criar Novo Agente".
- **Mapeamento Visual:**
  - **Ícones:** Criar um mapa de ícones permitidos (ex: `briefcase` -> `<Briefcase />`). O usuário seleciona o nome do ícone num dropdown.
  - **Cores:** Gerar cores deterministicamente baseadas no ID ou permitir seleção de "Tema" (Blue, Pink, Amber).

### 3.2. Novo `agentController.js`

Necessário criar controlador RESTful completo:

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `POST` | `/api/agents` | Cria novo agente (valida `organizationId`). |
| `GET` | `/api/agents` | Lista agentes da organização do usuário. |
| `GET` | `/api/agents/:id` | Detalhes para edição. |
| `PUT` | `/api/agents/:id` | Atualiza prompt, nome, etc. |
| `DELETE` | `/api/agents/:id` | Remove agente (soft delete via `isActive = false` recomendado). |

### 3.3. Integração com IA (`aiController.js`)

- Alterar `chatWithAgent` para buscar o `Agent` no banco pelo ID.
- Injetar o `agent.systemPrompt` no contexto do Gemini.

## 4. Plano de Implementação (Fase 2)

1. **Backend:**
    - Criar `agentController.js`.
    - Definir rotas em `agentRoutes.js`.
    - Atualizar `aiController.js` para usar agentes dinâmicos.
2. **Frontend:**
    - Criar `hooks/useAgents.js` (fetch, create, update, delete).
    - Refatorar `AgentMarketplace.jsx`:
        - Carregar lista da API.
        - Tratamento para quando lista estiver vazia (Empty State).
    - Criar Modal/Drawer `AgentForm.jsx`:
        - Inputs: Nome, Cargo, Descrição.
        - **Área Crítica:** Editor de Prompt (TextArea grande).
        - Seletor de Ícone/Avatar.

## 5. Questões em Aberto

- **Marketplace vs Custom:** Manteremos os agentes "Padrão" (Roberto, Lia) como globais para todos?
  - *Sugestão:* Inserir via Seed no banco para cada organização nova ou ter uma flag `isGlobal` no modelo (necessitaria migration).
  - *Abordagem Simplificada:* Criar eles como registros iniciais no banco do usuário ao criar a organização.

---
Autor: Antigravity Agent
Data: 2026-01-18
