const auditService = require('../services/auditService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getLogs = async (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        const logs = await auditService.getLogs(organizationId);

        // Enrich logs with user info manually if relation is tricky, 
        // but let's assume we can fetch users if needed.
        // For now, service returns standard logs.

        // Let's resolve user names if userId exists
        const userIds = [...new Set(logs.map(l => l.userId).filter(id => id))];
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true } // maybe avatar later
        });

        const userMap = {};
        users.forEach(u => userMap[u.id] = u);

        const enrichedLogs = logs.map(log => ({
            ...log,
            user: log.userId ? userMap[log.userId] : { name: 'Sistema' }
        }));

        res.json(enrichedLogs);
    } catch (error) {
        console.error('Audit Log Error:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
};
