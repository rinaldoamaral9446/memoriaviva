const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/analytics/summary
exports.getAnalyticsSummary = async (req, res) => {
    try {
        const organizationId = req.user.organizationId; // Enforced by middleware

        const totalMemories = await prisma.memory.count({
            where: { organizationId }
        });

        const totalLessonPlans = await prisma.lessonPlan.count({
            where: { organizationId }
        });

        const activeSchools = await prisma.schoolUnit.count({
            where: {
                organizationId,
                users: { some: {} } // Schools with at least one user assigned
            }
        });

        res.json({
            totalMemories,
            totalLessonPlans,
            activeSchools
        });

    } catch (error) {
        console.error('Analytics Summary Error:', error);
        res.status(500).json({ message: 'Error fetching analytics summary', error: error.message });
    }
};

// GET /api/analytics/schools
exports.getEngagementRanking = async (req, res) => {
    try {
        const organizationId = req.user.organizationId;

        const schools = await prisma.schoolUnit.findMany({
            where: { organizationId },
            include: {
                _count: {
                    select: { users: true }
                },
                users: {
                    select: {
                        _count: {
                            select: { memories: true }
                        }
                    }
                }
            }
        });

        // Post-process to sum up memories per school
        const ranking = schools.map(school => {
            const totalMemories = school.users.reduce((acc, user) => acc + user._count.memories, 0);
            return {
                id: school.id,
                name: school.name,
                usersCount: school._count.users,
                totalMemories
            };
        });

        // Sort by Total Memories (Desc)
        ranking.sort((a, b) => b.totalMemories - a.totalMemories);

        res.json(ranking);

    } catch (error) {
        console.error('School Ranking Error:', error);
        res.status(500).json({ message: 'Error fetching school ranking', error: error.message });
    }
};
