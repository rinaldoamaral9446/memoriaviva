const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all organizations (admin only)
const getAllOrganizations = async (req, res) => {
    try {
        const organizations = await prisma.organization.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                domain: true,
                logo: true,
                primaryColor: true,
                secondaryColor: true,
                isActive: true,
                createdAt: true,
                _count: {
                    select: {
                        users: true,
                        memories: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ organizations });
    } catch (error) {
        console.error('Error fetching organizations:', error);
        res.status(500).json({ error: 'Failed to fetch organizations' });
    }
};

// Get public organizations (minimal data for registration)
const getPublicOrganizations = async (req, res) => {
    try {
        const organizations = await prisma.organization.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                primaryColor: true,
                secondaryColor: true
            },
            orderBy: { name: 'asc' }
        });

        res.json({ organizations });
    } catch (error) {
        console.error('Error fetching public organizations:', error);
        res.status(500).json({ error: 'Failed to fetch organizations' });
    }
};

// Get single organization
const getOrganization = async (req, res) => {
    try {
        const { id } = req.params;

        const organization = await prisma.organization.findUnique({
            where: { id: parseInt(id) },
            include: {
                _count: {
                    select: {
                        users: true,
                        memories: true
                    }
                }
            }
        });

        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        // Parse config JSON if exists
        if (organization.config) {
            organization.config = JSON.parse(organization.config);
        }

        res.json({ organization });
    } catch (error) {
        console.error('Error fetching organization:', error);
        res.status(500).json({ error: 'Failed to fetch organization' });
    }
};

// Get organization by slug
const getOrganizationBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const organization = await prisma.organization.findUnique({
            where: { slug },
            select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                primaryColor: true,
                secondaryColor: true,
                config: true,
                isActive: true
            }
        });

        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        // Parse config JSON if exists
        if (organization.config) {
            organization.config = JSON.parse(organization.config);
        }

        res.json({ organization });
    } catch (error) {
        console.error('Error fetching organization by slug:', error);
        res.status(500).json({ error: 'Failed to fetch organization' });
    }
};

const bcrypt = require('bcryptjs'); // Ensure bcrypt is required at the top if not already

// Create organization (admin only)
const createOrganization = async (req, res) => {
    try {
        const { name, slug, domain, logo, primaryColor, secondaryColor, config } = req.body;

        // Validate required fields
        if (!name || !slug) {
            return res.status(400).json({ error: 'Name and slug are required' });
        }

        // Check if slug already exists
        const exists = await prisma.organization.findUnique({
            where: { slug }
        });

        if (exists) {
            return res.status(400).json({ error: 'Organization with this slug already exists' });
        }

        // Use transaction to ensure Org + Admin User are created together
        const result = await prisma.$transaction(async (prisma) => {
            const organization = await prisma.organization.create({
                data: {
                    name,
                    slug,
                    domain,
                    logo,
                    primaryColor: primaryColor || '#4B0082',
                    secondaryColor: secondaryColor || '#D4AF37',
                    config: config ? JSON.stringify(config) : null
                }
            });

            // Create default admin user
            const hashedPassword = await bcrypt.hash('senha123', 10);
            const defaultEmail = `admin@${slug}.memoriaviva.com.br`;

            await prisma.user.create({
                data: {
                    name: 'Administrador Local',
                    email: defaultEmail,
                    password: hashedPassword,
                    role: 'admin',
                    organizationId: organization.id
                }
            });

            return organization;
        });

        res.status(201).json({ organization: result, message: 'Organization created successfully' });
    } catch (error) {
        console.error('Error creating organization:', error);
        res.status(500).json({ error: 'Failed to create organization' });
    }
};

// Update organization
const updateOrganization = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, domain, logo, primaryColor, secondaryColor, config, isActive } = req.body;

        const organization = await prisma.organization.update({
            where: { id: parseInt(id) },
            data: {
                ...(name && { name }),
                ...(slug && { slug }),
                ...(domain !== undefined && { domain }),
                ...(logo !== undefined && { logo }),
                ...(primaryColor && { primaryColor }),
                ...(secondaryColor && { secondaryColor }),
                ...(config && { config: JSON.stringify(config) }),
                ...(isActive !== undefined && { isActive })
            }
        });

        res.json({ organization, message: 'Organization updated successfully' });
    } catch (error) {
        console.error('Error updating organization:', error);
        res.status(500).json({ error: 'Failed to update organization' });
    }
};

// Delete organization (admin only, with caution!)
const deleteOrganization = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if trying to delete Demo org
        if (parseInt(id) === 1) {
            return res.status(403).json({ error: 'Cannot delete Demo organization' });
        }

        await prisma.organization.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Organization deleted successfully' });
    } catch (error) {
        console.error('Error deleting organization:', error);
        res.status(500).json({ error: 'Failed to delete organization' });
    }
};

// Update Only Config (Specialized for Super Admin Prompts)
const updateOrganizationConfig = async (req, res) => {
    try {
        const { id } = req.params;
        const configData = req.body; // Expects JSON object directly

        const organization = await prisma.organization.update({
            where: { id: parseInt(id) },
            data: {
                config: JSON.stringify(configData)
            }
        });

        res.json({ organization, message: 'Configuration updated successfully' });
    } catch (error) {
        console.error('Error updating organization config:', error);
        res.status(500).json({ error: 'Failed to update configuration' });
    }
};

module.exports = {
    getAllOrganizations,
    getPublicOrganizations,
    getOrganization,
    getOrganizationBySlug,
    createOrganization,
    updateOrganization,
    updateOrganizationConfig,
    deleteOrganization
};
