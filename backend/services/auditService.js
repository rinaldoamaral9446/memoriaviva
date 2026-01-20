const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Log an audit action
 * @param {Object} params
 * @param {number} params.organizationId
 * @param {number} [params.userId]
 * @param {string} params.action - e.g. "UPDATE_DNA", "CREATE_UNIT"
 * @param {string|Object} [params.details] - JSON string or object
 */
exports.logAction = async ({ organizationId, userId, action, details }) => {
    try {
        const detailsString = typeof details === 'object' ? JSON.stringify(details) : details;

        await prisma.auditLog.create({
            data: {
                organizationId,
                userId,
                action,
                details: detailsString
            }
        });
    } catch (error) {
        console.error('Failed to write audit log:', error);
        // We do not throw here to prevent breaking the main flow
    }
};

/**
 * Get logs for an organization
 * @param {number} organizationId
 * @param {number} [limit=20]
 */
exports.getLogs = async (organizationId, limit = 20) => {
    return prisma.auditLog.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
            // Ideally we get user name, but 'user' relation is optional in schema
            // If schema allows relation:
            // user: { select: { name: true, email: true } }
        }
    });
};
