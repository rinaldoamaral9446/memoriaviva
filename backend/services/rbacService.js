const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Checks if a user has a specific permission.
 * @param {number} userId - The ID of the user.
 * @param {string} resource - The resource to check (e.g., 'memories', 'users').
 * @param {string} action - The action to check (e.g., 'create', 'read').
 * @returns {Promise<boolean>} - True if the user has permission, false otherwise.
 */
const hasPermission = async (userId, resource, action) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { userRole: true }
        });

        if (!user) return false;

        // Super Admin bypass
        if (user.role === 'super_admin') {
            // console.log(`RBAC: User ${userId} is super_admin. Access granted.`);
            return true;
        }

        // If no role assigned (shouldn't happen with new system), deny
        if (!user.userRole) {
            console.log(`RBAC: User ${userId} has no role assigned. Denied.`);
            return false;
        }

        const permissions = JSON.parse(user.userRole.permissions);

        // Check if resource exists in permissions
        if (!permissions[resource]) {
            console.log(`RBAC: Resource '${resource}' not found in permissions for user ${userId}.`);
            return false;
        }

        // Check if action is allowed
        const allowed = permissions[resource].includes(action);
        if (!allowed) console.log(`RBAC: Action '${action}' on '${resource}' denied for user ${userId}.`);
        return allowed;
    } catch (error) {
        console.error('RBAC Error:', error);
        return false;
    }
};

/**
 * Middleware factory to protect routes based on permissions.
 * @param {string} resource 
 * @param {string} action 
 */
const requirePermission = (resource, action) => {
    return async (req, res, next) => {
        // Assuming authMiddleware has already populated req.user
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Optimization: If the role permissions are already in the token, use them.
        // For now, we fetch from DB to ensure real-time validity.
        const allowed = await hasPermission(req.user.userId, resource, action);

        if (allowed) {
            next();
        } else {
            res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }
    };
};

module.exports = {
    hasPermission,
    requirePermission
};
