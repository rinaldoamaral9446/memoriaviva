const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const checkRole = (allowedRoles) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // 1. Check legacy 'role' field in token (fast path)
        if (req.user.role && allowedRoles.includes(req.user.role)) {
            return next();
        }

        // 2. Check DB for granular RBAC Role (Role Model)
        try {
            const user = await prisma.user.findUnique({
                where: { id: req.user.userId },
                include: { userRole: true } // Fetch relational role
            });

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // Check legacy role in DB
            if (allowedRoles.includes(user.role)) {
                return next();
            }

            // Check new RBAC Role slug
            if (user.userRole && allowedRoles.includes(user.userRole.slug)) {
                return next();
            }

            return res.status(403).json({ message: 'Insufficient permissions. Required: ' + allowedRoles.join(', ') });

        } catch (error) {
            console.error('Role Middleware Error:', error);
            return res.status(500).json({ message: 'Internal Server Error during permission check' });
        }
    };
};

module.exports = checkRole;
