const prisma = require('../config/database');
const { startOfMonth, endOfMonth, subMonths, format } = require('date-fns');

class AnalyticsService {
    /**
     * Get overall statistics for organization
     */
    async getOverview(organizationId) {
        const [
            totalMemories,
            totalUsers,
            memoriesThisMonth,
            categoryCounts
        ] = await Promise.all([
            // Total memories
            prisma.memory.count({
                where: { organizationId }
            }),

            // Total users
            prisma.user.count({
                where: { organizationId }
            }),

            // Memories this month
            prisma.memory.count({
                where: {
                    organizationId,
                    createdAt: {
                        gte: startOfMonth(new Date())
                    }
                }
            }),

            // Memories by category
            prisma.memory.groupBy({
                by: ['category'],
                where: { organizationId },
                _count: true
            })
        ]);

        return {
            totalMemories,
            totalUsers,
            memoriesThisMonth,
            categories: categoryCounts.map(c => ({
                category: c.category || 'Sem categoria',
                count: c._count
            }))
        };
    }

    /**
     * Get memory statistics over time
     */
    async getMemoryStats(organizationId, months = 6) {
        const monthsData = [];

        for (let i = months - 1; i >= 0; i--) {
            const date = subMonths(new Date(), i);
            const start = startOfMonth(date);
            const end = endOfMonth(date);

            const count = await prisma.memory.count({
                where: {
                    organizationId,
                    createdAt: {
                        gte: start,
                        lte: end
                    }
                }
            });

            monthsData.push({
                month: format(date, 'MMM yyyy'),
                count
            });
        }

        return monthsData;
    }

    /**
     * Get user activity metrics
     */
    async getUserActivity(organizationId) {
        const users = await prisma.user.findMany({
            where: { organizationId },
            include: {
                _count: {
                    select: { memories: true }
                }
            },
            orderBy: {
                memories: {
                    _count: 'desc'
                }
            },
            take: 10
        });

        return users.map(u => ({
            name: u.name,
            email: u.email,
            memoriesCount: u._count.memories
        }));
    }

    /**
     * Get location distribution
     */
    async getLocationStats(organizationId) {
        const memories = await prisma.memory.findMany({
            where: {
                organizationId,
                location: { not: null }
            },
            select: { location: true }
        });

        const locationCounts = memories.reduce((acc, m) => {
            const loc = m.location;
            acc[loc] = (acc[loc] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(locationCounts)
            .map(([location, count]) => ({ location, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }

    /**
     * Get AI-generated insights
     */
    async getAIInsights(organizationId) {
        const overview = await this.getOverview(organizationId);
        const memoryStats = await this.getMemoryStats(organizationId, 3);

        // Calculate growth
        const lastMonth = memoryStats[memoryStats.length - 1]?.count || 0;
        const previousMonth = memoryStats[memoryStats.length - 2]?.count || 0;
        const growth = previousMonth > 0
            ? ((lastMonth - previousMonth) / previousMonth * 100).toFixed(1)
            : 0;

        const insights = [];

        // Growth insight
        if (parseFloat(growth) > 10) {
            insights.push({
                type: 'positive',
                message: `Crescimento de ${growth}% em memórias este mês! 🎉`
            });
        } else if (parseFloat(growth) < -10) {
            insights.push({
                type: 'warning',
                message: `Queda de ${Math.abs(growth)}% em memórias este mês. Considere engajar mais usuários.`
            });
        }

        // Category insight
        const topCategory = overview.categories.sort((a, b) => b.count - a.count)[0];
        if (topCategory) {
            insights.push({
                type: 'info',
                message: `Categoria mais popular: ${topCategory.category} com ${topCategory.count} memórias`
            });
        }

        return insights;
    }
}

module.exports = new AnalyticsService();
