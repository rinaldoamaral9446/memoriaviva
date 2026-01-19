const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auditService = require('./auditService');

// Organization Management
const updateOrgStatus = async (orgId, isActive, adminUserId) => {
    const org = await prisma.organization.update({
        where: { id: parseInt(orgId) },
        data: { isActive }
    });

    await auditService.logAction(
        adminUserId,
        orgId,
        isActive ? 'ACTIVATE_ORG' : 'SUSPEND_ORG',
        `Organization ${org.name} status changed to ${isActive}`
    );

    return org;
};

const updateOrgLimits = async (orgId, limits, adminUserId) => {
    const { storageLimit, userLimit, aiTokenLimit } = limits;

    const org = await prisma.organization.update({
        where: { id: parseInt(orgId) },
        data: {
            ...(storageLimit !== undefined && { storageLimit }),
            ...(userLimit !== undefined && { userLimit }),
            ...(aiTokenLimit !== undefined && { aiTokenLimit })
        }
    });

    await auditService.logAction(
        adminUserId,
        orgId,
        'UPDATE_LIMITS',
        JSON.stringify(limits)
    );

    return org;
};

// System Settings
const getSystemSettings = async () => {
    const settings = await prisma.systemSettings.findMany();
    return settings.reduce((acc, curr) => {
        acc[curr.key] = JSON.parse(curr.value);
        return acc;
    }, {});
};

const updateSystemSetting = async (key, value, description, adminUserId) => {
    const setting = await prisma.systemSettings.upsert({
        where: { key },
        update: {
            value: JSON.stringify(value),
            ...(description && { description })
        },
        create: {
            key,
            value: JSON.stringify(value),
            description
        }
    });

    await auditService.logAction(
        adminUserId,
        null,
        'UPDATE_SYSTEM_SETTING',
        `Updated ${key}`
    );

    return setting;
};

// Dashboard Stats
const getGlobalStats = async () => {
    const [totalOrgs, activeOrgs, totalUsers, totalMemories] = await Promise.all([
        prisma.organization.count(),
        prisma.organization.count({ where: { isActive: true } }),
        prisma.user.count(),
        prisma.memory.count()
    ]);

    return {
        totalOrgs,
        activeOrgs,
        totalUsers,
        totalMemories
    };
};

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const impersonateOrg = async (orgId, adminUserId) => {
    // Find an admin user in the target org
    const targetUser = await prisma.user.findFirst({
        where: {
            organizationId: parseInt(orgId),
            role: 'admin'
        }
    });

    // If no admin, try finding any user
    const userToImpersonate = targetUser || await prisma.user.findFirst({
        where: { organizationId: parseInt(orgId) }
    });

    if (!userToImpersonate) {
        throw new Error('No users found in this organization to impersonate.');
    }

    // Generate token
    const token = jwt.sign({
        userId: userToImpersonate.id,
        organizationId: userToImpersonate.organizationId,
        role: userToImpersonate.role
    }, JWT_SECRET, { expiresIn: '1h' }); // Short expiration for safety

    await auditService.logAction(
        adminUserId,
        orgId,
        'IMPERSONATE_ORG',
        `Impersonated user ${userToImpersonate.email}`
    );

    return { token, user: userToImpersonate };
};

module.exports = {
    updateOrgStatus,
    updateOrgLimits,
    getSystemSettings,
    updateSystemSetting,
    getGlobalStats,
    impersonateOrg
};
