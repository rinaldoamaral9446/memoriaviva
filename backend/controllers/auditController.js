const prisma = require('../prisma/client');

const getLogs = async (req, res) => {
    try {
        const logs = await prisma.auditLog.findMany({
            where: { organizationId: req.user.organizationId },
            orderBy: { createdAt: 'desc' },
            take: 100,
            include: { user: { select: { name: true, email: true } } }
        });
        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching audit logs' });
    }
};

module.exports = { getLogs };
