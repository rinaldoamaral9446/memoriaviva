const prisma = require('../config/database');

// Middleware to attach organization to request
const attachOrganization = async (req, res, next) => {
    try {
        // If user is authenticated, get their organization
        if (req.user && req.user.organizationId) {
            const organization = await prisma.organization.findUnique({
                where: { id: req.user.organizationId },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    primaryColor: true,
                    secondaryColor: true,
                    logo: true,
                    config: true,
                    isActive: true
                }
            });

            if (!organization) {
                return res.status(403).json({ error: 'Organization not found' });
            }

            if (!organization.isActive) {
                return res.status(403).json({ error: 'Organization is inactive' });
            }

            // Parse config if exists
            if (organization.config) {
                try {
                    organization.config = JSON.parse(organization.config);
                } catch (e) {
                    organization.config = null;
                }
            }

            req.organization = organization;
        }

        next();
    } catch (error) {
        console.error('Error in attachOrganization middleware:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Middleware to filter queries by organization
const organizationFilter = (req, res, next) => {
    // Add organizationId to query filters
    if (req.user && req.user.organizationId) {
        // Store the organizationId for easy access in controllers
        req.organizationId = req.user.organizationId;
    }
    next();
};

module.exports = {
    attachOrganization,
    organizationFilter
};
