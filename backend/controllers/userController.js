const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                organization: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        primaryColor: true,
                        secondaryColor: true,
                        logo: true,
                        config: true
                    }
                }
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Parse organization config if exists
        if (user.organization?.config) {
            try {
                user.organization.config = JSON.parse(user.organization.config);
            } catch (e) {
                user.organization.config = null;
            }
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
};

// Get all users for the organization (Admin only)
exports.getOrganizationUsers = async (req, res) => {
    try {
        const { organizationId: queryOrgId } = req.query;
        let targetOrgId = req.user.organizationId;

        // Super Admin (Org ID 1) can query any organization
        if (req.user.organizationId === 1 && queryOrgId) {
            targetOrgId = parseInt(queryOrgId);
        }

        const users = await prisma.user.findMany({
            where: { organizationId: targetOrgId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                schoolUnit: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                _count: {
                    select: { memories: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

// Create a new user (Admin only)
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role, schoolUnitId, organizationId: targetOrgId } = req.body;
        let organizationId = req.user.organizationId;

        // Super Admin Override
        if (req.user.organizationId === 1 && targetOrgId) {
            organizationId = parseInt(targetOrgId);
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'user',
                schoolUnitId: schoolUnitId ? parseInt(schoolUnitId) : null,
                organizationId
            }
        });

        res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

// Update user role (Admin only)
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, schoolUnitId } = req.body;
        const organizationId = req.user.organizationId;
        const isSuperAdmin = organizationId === 1;

        // Verify user belongs to organization (OR allow if Super Admin)
        const whereClause = { id: parseInt(id) };
        if (!isSuperAdmin) {
            whereClause.organizationId = organizationId;
        }

        const user = await prisma.user.findFirst({
            where: whereClause
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updateData = {};
        if (role) updateData.role = role;
        if (schoolUnitId !== undefined) updateData.schoolUnitId = schoolUnitId ? parseInt(schoolUnitId) : null;

        await prisma.user.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const organizationId = req.user.organizationId;
        const isSuperAdmin = organizationId === 1;

        // Prevent self-deletion
        if (parseInt(id) === req.user.userId) {
            return res.status(400).json({ message: 'Cannot delete yourself' });
        }

        // Verify user belongs to organization (OR allow if Super Admin)
        const whereClause = { id: parseInt(id) };
        if (!isSuperAdmin) {
            whereClause.organizationId = organizationId;
        }

        const user = await prisma.user.findFirst({
            where: whereClause
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await prisma.user.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};
