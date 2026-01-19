const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// List agents: My Org Agents + Global Agents
exports.getAgents = async (req, res) => {
    try {
        const organizationId = req.user.organizationId;

        const agents = await prisma.agent.findMany({
            where: {
                isActive: true,
                OR: [
                    { organizationId: organizationId },
                    { isGlobal: true }
                ]
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json(agents);
    } catch (error) {
        console.error('Error fetching agents:', error);
        res.status(500).json({ message: 'Error fetching agents', error: error.message });
    }
};

// Create new agent (always assigned to user's org)
exports.createAgent = async (req, res) => {
    try {
        const { name, role, description, systemPrompt, icon, color } = req.body;
        const organizationId = req.user.organizationId;

        // Validation
        if (!name || !role || !systemPrompt) {
            return res.status(400).json({ message: 'Nome, Cargo e Prompt do Sistema são obrigatórios.' });
        }

        if (systemPrompt.length < 50) {
            return res.status(400).json({ message: 'O Prompt do Sistema deve ter pelo menos 50 caracteres para garantir a qualidade do agente.' });
        }

        const newAgent = await prisma.agent.create({
            data: {
                name,
                role,
                description: description || '',
                systemPrompt,
                icon: icon || 'Bot',
                color: color || 'blue-600',
                organizationId: organizationId,
                isGlobal: false, // Default user-created agents are not global
                isActive: true
            }
        });

        res.status(201).json(newAgent);
    } catch (error) {
        console.error('Error creating agent:', error);
        res.status(500).json({ message: 'Error creating agent', error: error.message });
    }
};

// Update agent (Ownership check required)
exports.updateAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role, description, systemPrompt, icon, color } = req.body;
        const organizationId = req.user.organizationId;

        // Verify ownership
        const existingAgent = await prisma.agent.findFirst({
            where: {
                id: parseInt(id),
                isActive: true,
                organizationId: organizationId // STRICT: Only owner org can edit
            }
        });

        if (!existingAgent) {
            return res.status(403).json({ message: 'Agent not found or you do not have permission to edit it.' });
        }

        const updatedAgent = await prisma.agent.update({
            where: { id: parseInt(id) },
            data: {
                name,
                role,
                description,
                systemPrompt,
                icon,
                color
            }
        });

        res.json(updatedAgent);
    } catch (error) {
        console.error('Error updating agent:', error);
        res.status(500).json({ message: 'Error updating agent', error: error.message });
    }
};

// Soft Delete (Ownership check required)
exports.deleteAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const organizationId = req.user.organizationId;

        // Verify ownership
        const existingAgent = await prisma.agent.findFirst({
            where: {
                id: parseInt(id),
                isActive: true,
                organizationId: organizationId // STRICT: Only owner org can delete
            }
        });

        if (!existingAgent) {
            return res.status(403).json({ message: 'Agent not found or you do not have permission to delete it.' });
        }

        // Soft delete
        await prisma.agent.update({
            where: { id: parseInt(id) },
            data: { isActive: false }
        });

        res.json({ message: 'Agent deleted successfully' });
    } catch (error) {
        console.error('Error deleting agent:', error);
        res.status(500).json({ message: 'Error deleting agent', error: error.message });
    }
};
