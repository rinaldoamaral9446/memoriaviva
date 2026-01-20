const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const orgAdminMiddleware = async (req, res, next) => {
    try {
        // 1. Super Admin Bypass
        if (req.user && req.user.role === 'super_admin') {
            return next();
        }

        // 2. Org Admin Check
        // Ensure user has 'admin' role (or is capable of editing settings)
        // Adjust this if you have a 'manager' role that can also edit.
        if (req.user && req.user.role === 'admin') {
            const targetOrgId = parseInt(req.params.id);
            const userOrgId = req.user.organizationId;

            // Check if user belongs to the target organization
            if (targetOrgId === userOrgId) {
                return next();
            }
        }

        // 3. Robust DB Check (if token is stale) - optional but recommended
        // Re-fetching user if critical. For now, rely on token for speed, assuming Login refreshes token.
        // If we want to be super safe:
        /*
        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
        if (user.role === 'super_admin') return next();
        if (user.role === 'admin' && user.organizationId === parseInt(req.params.id)) return next();
        */

        return res.status(403).json({ message: 'Access denied. You can only manage your own organization.' });
    } catch (error) {
        console.error('OrgAdminMiddleware Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = orgAdminMiddleware;
