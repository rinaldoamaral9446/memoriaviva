const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const trackUsage = async (organizationId, tokens, model = 'gemini-pro', cost = 0) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Upsert usage for today
    // Note: Prisma sqlite doesn't support upsert with composite unique constraint easily in some versions, 
    // but we defined @@unique([organizationId, date, model]) so it should work.

    try {
        const usage = await prisma.aiUsage.findUnique({
            where: {
                organizationId_date_model: {
                    organizationId,
                    date: today,
                    model
                }
            }
        });

        if (usage) {
            await prisma.aiUsage.update({
                where: { id: usage.id },
                data: {
                    tokensUsed: { increment: tokens },
                    cost: { increment: cost }
                }
            });
        } else {
            await prisma.aiUsage.create({
                data: {
                    organizationId,
                    date: today,
                    model,
                    tokensUsed: tokens,
                    cost
                }
            });
        }
    } catch (error) {
        console.error('Error tracking AI usage:', error);
    }
};

const getUsageReport = async (startDate, endDate) => {
    const usage = await prisma.aiUsage.groupBy({
        by: ['organizationId', 'model'],
        where: {
            date: {
                gte: startDate,
                lte: endDate
            }
        },
        _sum: {
            tokensUsed: true,
            cost: true
        }
    });

    // Enrich with org names
    const enrichedUsage = await Promise.all(usage.map(async (u) => {
        const org = await prisma.organization.findUnique({
            where: { id: u.organizationId },
            select: { name: true }
        });
        return {
            ...u,
            organizationName: org?.name || 'Unknown'
        };
    }));

    return enrichedUsage;
};

module.exports = {
    trackUsage,
    getUsageReport
};
