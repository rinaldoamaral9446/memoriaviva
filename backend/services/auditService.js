const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const logAction = async (userId, organizationId, action, details, req) => {
    try {
        const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : null;

        await prisma.auditLog.create({
            data: {
                userId,
                organizationId,
                action,
                details: typeof details === 'string' ? details : JSON.stringify(details),
                ipAddress
            }
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // Don't throw, we don't want to block the main action if logging fails
    }
};

module.exports = {
    logAction
};
