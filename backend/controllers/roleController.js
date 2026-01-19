const { PrismaClient } = require('@prisma/client');
const aiRoleService = require('../services/aiRoleService');
const prisma = new PrismaClient();

exports.getRoles = async (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        const roles = await prisma.role.findMany({
            where: { organizationId },
            include: { _count: { select: { users: true } } }
        });
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching roles', error: error.message });
    }
};

exports.createRole = async (req, res) => {
    try {
        const { name, description, permissions } = req.body;
        const organizationId = req.user.organizationId;

        // Generate a slug from name
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const role = await prisma.role.create({
            data: {
                name,
                description,
                slug,
                permissions: typeof permissions === 'string' ? permissions : JSON.stringify(permissions),
                organizationId
            }
        });

        res.status(201).json(role);
    } catch (error) {
        res.status(500).json({ message: 'Error creating role', error: error.message });
    }
};

exports.updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, permissions } = req.body;
        const organizationId = req.user.organizationId;

        // Ensure role belongs to user's org
        const existingRole = await prisma.role.findFirst({
            where: { id: parseInt(id), organizationId }
        });

        if (!existingRole) {
            return res.status(404).json({ message: 'Role not found' });
        }

        if (existingRole.isSystem) {
            // Allow updating description but maybe warn about permissions?
            // For now, allow updating everything except slug/isSystem
        }

        const role = await prisma.role.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description,
                permissions: typeof permissions === 'string' ? permissions : JSON.stringify(permissions)
            }
        });

        res.json(role);
    } catch (error) {
        res.status(500).json({ message: 'Error updating role', error: error.message });
    }
};

exports.deleteRole = async (req, res) => {
    try {
        const { id } = req.params;
        const organizationId = req.user.organizationId;

        const role = await prisma.role.findFirst({
            where: { id: parseInt(id), organizationId }
        });

        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        if (role.isSystem) {
            return res.status(400).json({ message: 'Cannot delete system roles' });
        }

        await prisma.role.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Role deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting role', error: error.message });
    }
};

exports.generatePermissions = async (req, res) => {
    try {
        const { description } = req.body;
        if (!description) {
            return res.status(400).json({ message: 'Description is required' });
        }

        const permissions = await aiRoleService.generatePermissions(description);
        res.json({ permissions });
    } catch (error) {
        res.status(500).json({ message: 'Error generating permissions', error: error.message });
    }
};
