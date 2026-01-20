const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auditService = require('../services/auditService');

// List all units for the authenticated user's organization
const listUnits = async (req, res) => {
    try {
        const organizationId = req.user.organizationId;

        const units = await prisma.schoolUnit.findMany({
            where: { organizationId },
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { users: true }
                }
            }
        });

        res.json(units);
    } catch (error) {
        console.error('Error listing units:', error);
        res.status(500).json({ error: 'Erro ao listar unidades' });
    }
};

// Create a new unit
const createUnit = async (req, res) => {
    try {
        const { name, inepCode, address } = req.body;
        const organizationId = req.user.organizationId;

        // Basic validation
        if (!name) {
            return res.status(400).json({ error: 'Nome da unidade é obrigatório' });
        }

        const unit = await prisma.schoolUnit.create({
            data: {
                name,
                inepCode,
                address,
                organizationId
            }
        });

        // Audit Log
        if (auditService && auditService.logAction) {
            await auditService.logAction({
                organizationId,
                userId: req.user.userId,
                action: 'CREATE_UNIT',
                details: `Created unit "${unit.name}"`
            });
        }

        res.status(201).json(unit);
    } catch (error) {
        console.error('Error creating unit:', error);
        res.status(500).json({ error: 'Erro ao criar unidade' });
    }
};

// Update unit details
const updateUnit = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, inepCode, address } = req.body;
        const organizationId = req.user.organizationId;

        // Ensure unit belongs to user's organization
        const existingUnit = await prisma.schoolUnit.findFirst({
            where: { id: parseInt(id), organizationId }
        });

        if (!existingUnit) {
            return res.status(404).json({ error: 'Unidade não encontrada' });
        }

        const updatedUnit = await prisma.schoolUnit.update({
            where: { id: parseInt(id) },
            data: {
                name,
                inepCode,
                address
            }
        });

        // Audit Log
        if (auditService && auditService.logAction) {
            await auditService.logAction({
                organizationId,
                userId: req.user.userId,
                action: 'UPDATE_UNIT',
                details: `Updated unit "${updatedUnit.name}"`
            });
        }

        res.json(updatedUnit);
    } catch (error) {
        console.error('Error updating unit:', error);
        res.status(500).json({ error: 'Erro ao atualizar unidade' });
    }
};

// Delete a unit
const deleteUnit = async (req, res) => {
    try {
        const { id } = req.params;
        const organizationId = req.user.organizationId;

        // Ensure unit belongs to user's organization
        const existingUnit = await prisma.schoolUnit.findFirst({
            where: { id: parseInt(id), organizationId }
        });

        if (!existingUnit) {
            return res.status(404).json({ error: 'Unidade não encontrada' });
        }

        await prisma.schoolUnit.delete({
            where: { id: parseInt(id) }
        });

        // Audit Log
        if (auditService && auditService.logAction) {
            await auditService.logAction({
                organizationId,
                userId: req.user.userId,
                action: 'DELETE_UNIT',
                details: `Deleted unit "${existingUnit.name}"`
            });
        }

        res.json({ message: 'Unidade removida com sucesso' });
    } catch (error) {
        console.error('Error deleting unit:', error);
        res.status(500).json({ error: 'Erro ao remover unidade' });
    }
};

module.exports = {
    listUnits,
    createUnit,
    updateUnit,
    deleteUnit
};
