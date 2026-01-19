# Spec - Feature: Agentes Dinâmicos e Interface de Gestão

## 1. Banco de Dados (Prisma Schema)

Atualmente, o modelo `Agent` suporta apenas dados básicos. Precisamos expandi-lo para suportar a customização visual (ícones, cores) e a flag de universalidade (agentes globais).

### Alterações no Modelo `Agent`

```prisma
model Agent {
  id             Int          @id @default(autoincrement())

  // Multi-tenancy
  // Alteração: organizationId torna-se Opcional (Int?) ou mantemos Obrigatório?
  // DECISÃO: Manter Obrigatório. Agentes Globais pertencerão à Organização ID 1 (System/Admin).
  organizationId Int
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  // Descobertas e Metadados Visuais
  name           String       // "Roberto"
  role           String       // "Consultor"
  description    String       // Texto curto para o card
  avatarUrl      String?      // URL de imagem (opcional)

  // [NEW] Customização de UI
  icon           String       @default("Bot") // Nome do ícone Lucide: "Bot", "Briefcase", "GraduationCap"
  color          String       @default("blue-600") // Classe de cor do Tailwind: "blue-600", "pink-600"

  // [NEW] Visibilidade
  isGlobal       Boolean      @default(false) // Se true, aparece para TODAS as organizações
  isActive       Boolean      @default(true)  // Soft delete

  // O Cérebro
  systemPrompt   String       @default("") // Prompt do sistema

  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@index([organizationId])
}
```

> **Migração:** Executar `npx prisma migrate dev --name add_agent_ui_fields`.

## 2. Backend Logic

### 2.1. `controllers/agentController.js`

#### Regras de Negócio

1. **Listagem (`getAgents`):**
    * Deve retornar agentes onde: `organizationId == user.organizationId` **OU** `isGlobal == true`.
    * Use: `where: { OR: [...], isActive: true }`.
2. **Criação (`createAgent`):**
    * Sempre atribui `organizationId = req.user.organizationId` automaticamente.
    * Campo `isGlobal` deve ser ignorado (default false) ou restrito a Super Admins (futuro).
3. **Edição (`updateAgent`):**
    * Verificar se o agente existe.
    * **Segurança:** Verificar se `agent.organizationId === req.user.organizationId`.
    * Se o usuário tentar editar um Agente Global (que ele não é dono), retornar `403 Forbidden`.
4. **Exclusão (`deleteAgent`):**
    * Mesma verificação de segurança da edição.
    * Realizar *Soft Delete* (`isActive = false`).

### 2.2. `controllers/aiController.js`

#### Alteração no `chatWithAgent`

Atualmente, o prompt pode estar hardcoded ou fixo.

* **Nova Lógica:**
    1. Receber `agentId` no corpo da requisição.
    2. Buscar o Agente no banco:

        ```javascript
        const agent = await prisma.agent.findFirst({
            where: {
                id: agentId,
                isActive: true,
                OR: [
                    { organizationId: user.organizationId },
                    { isGlobal: true }
                ]
            }
        });
        ```

    3. Se não encontrar: `404 Not Found`.
    4. No setup do chat do Gemini, usar `agent.systemPrompt` como a instrução inicial.

## 3. Frontend Specifications

### 3.1. Hook: `useAgents.js`

Centraliza a lógica de estado e API.

**Interfaces/Métodos:**

* `agents`: Array de objetos Agent (estado local).
* `loading`: Boolean.
* `error`: String | null.
* `fetchAgents()`: GET /api/agents.
* `saveAgent(agentData)`: Decide entre POST (se sem ID) ou PUT (se com ID). Atualiza lista local otimisticamente ou após sucesso.
* `deleteAgent(id)`: DELETE /api/agents/:id. Remove da lista local.

### 3.2. Componente: `AgentForm.jsx`

Modal ou Drawer para criar/editar agentes.

**Campos do Formulário:**

1. **Dados Básicos:**
    * `Name` (Input Text) - ex: "Mestre Câmara"
    * `Role` (Input Text) - ex: "Curador Cultural"
    * `Description` (Textarea curto) - ex: "Especialista em..."
2. **Personalidade (O Cérebro):**
    * `System Prompt` (Textarea Grande - monospaced font). Dica: "Instrua como o agente deve se comportar..."
3. **Aparência (UI):**
    * **Icon Selector:** Um Dropdown ou Grid selecionável com mapeamento de ícones Lucide pré-aprovados.
        * *Opções:* `Bot`, `Brain`, `Briefcase`, `GraduationCap`, `Heart`, `Shield`, `Sparkles`, `Zap`.
    * **Color Selector:** Paleta de cores (bolinhas coloridas).
        * *Opções:* `blue-600`, `purple-600`, `green-600`, `amber-600`, `pink-600`, `red-600`.
        * Ao selecionar, atualizar preview.

## 4. Segurança e Validação

* **Middleware:** Todas as rotas `/api/agents` protegidas por `authMiddleware`.
* **Validation Layer (Joi ou Zod - Opcional, ou manual no Controller):**
  * `name`: Obrigatório, min 3 chars.
  * `systemPrompt`: Obrigatório, min 50 chars (para garantir qualidade).
* **Isolamento de Tenant:**
  * Garantir que no `update` e `delete`, a cláusula `where` inclua explicitamente `{ id: id, organizationId: user.organizationId }`. Se o Prisma retornar erro ou zero registros, tratar como não autorizado/não encontrado.

---
**Status:** Pronto para implementação.
