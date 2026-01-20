const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get Systems Settings
exports.getSystemSettings = async (req, res) => {
    try {
        const settings = await prisma.systemSettings.findMany();
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

// Update System Setting
exports.updateSystemSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const { value, description } = req.body; // value should be a JSON object (we store stringified)
        const userId = req.user.userId;

        const updatedSetting = await prisma.systemSettings.upsert({
            where: { key },
            update: {
                value: JSON.stringify(value),
                description
            },
            create: {
                key,
                value: JSON.stringify(value),
                description
            }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                userId: parseInt(userId),
                action: 'UPDATE_SYSTEM_SETTING',
                details: JSON.stringify({ key, newValue: value }),
                organizationId: null // System Level
            }
        });

        res.json({ success: true, setting: updatedSetting });
    } catch (error) {
        console.error('Error updating setting:', error);
        res.status(500).json({ error: 'Failed to update setting' });
    }
};

// Get Audit Logs (Global)
exports.getGlobalAuditLogs = async (req, res) => {
    try {
        const logs = await prisma.auditLog.findMany({
            where: { organizationId: null }, // System Level logs
            include: { organization: true }, // Should be null
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json(logs);
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
};
