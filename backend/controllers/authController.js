const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

exports.register = async (req, res) => {
    try {
        const { email, password, name, organizationId } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let orgId = organizationId;

        // If organizationName is provided, create a new organization
        if (!orgId && req.body.organizationName) {
            const orgName = req.body.organizationName;
            const slug = orgName.toLowerCase()
                .replace(/[^\w\s-]/g, '') // Remove special chars
                .replace(/\s+/g, '-')     // Replace spaces with -
                .replace(/^-+|-+$/g, '')  // Remove leading/trailing -
                + '-' + Math.random().toString(36).substring(2, 7); // Add random suffix to ensure uniqueness

            const newOrg = await prisma.organization.create({
                data: {
                    name: orgName,
                    slug: slug,
                    primaryColor: '#4B0082', // Default brand purple
                    secondaryColor: '#D4AF37', // Default brand gold
                    domain: email.split('@')[1] // Helper for auto-approval content if needed
                }
            });
            orgId = newOrg.id;
        }

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                organizationId: orgId || 1, // Default to Demo org if nothing selected
            },
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        primaryColor: true,
                        secondaryColor: true,
                        logo: true
                    }
                }
            }
        });

        const token = jwt.sign({
            userId: user.id,
            organizationId: user.organizationId,
            role: user.role,
            schoolUnitId: user.schoolUnitId
        }, JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                schoolUnitId: user.schoolUnitId,
                organization: user.organization
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                userRole: true,
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
            }
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({
            userId: user.id,
            organizationId: user.organizationId,
            role: user.role,
            schoolUnitId: user.schoolUnitId // [NEW] Added for Unit Hierarchy filtering
        }, JWT_SECRET, { expiresIn: '24h' });

        // Parse organization config if exists
        if (user.organization.config) {
            try {
                user.organization.config = JSON.parse(user.organization.config);
            } catch (e) {
                user.organization.config = null;
            }
        }

        // Parse role permissions if exists
        let permissions = {};
        if (user.userRole && user.userRole.permissions) {
            try {
                permissions = JSON.parse(user.userRole.permissions);
            } catch (e) {
                console.error('Error parsing permissions:', e);
            }
        }

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role, // Keep for backward compatibility
                schoolUnitId: user.schoolUnitId, // [NEW]
                roleId: user.roleId,
                permissions: permissions, // New dynamic permissions
                roleName: user.userRole ? user.userRole.name : null,
                organization: user.organization
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: {
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
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Parse organization config if exists
        if (user.organization.config) {
            try {
                user.organization.config = JSON.parse(user.organization.config);
            } catch (e) {
                user.organization.config = null;
            }
        }

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            schoolUnitId: user.schoolUnitId,
            organization: user.organization
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
};
