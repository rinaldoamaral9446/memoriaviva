const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MemoryService {
    async createMemory(data, user) {
        const { title, description, date, location, imageUrl, documentUrl, category, tags, isPublic, eventId, status, metadata, thumbnailUrl } = data;

        return await prisma.memory.create({
            data: {
                title,
                description,
                content: description, // Use description as content
                eventDate: date ? new Date(date) : null,
                location,
                category,
                tags: tags ? JSON.stringify(tags) : null,
                mediaUrl: imageUrl || null,
                documentUrl: documentUrl || null,
                userId: user.userId,
                organizationId: user.organizationId,
                aiGenerated: true,
                isPublic: isPublic || false,
                eventId: eventId ? parseInt(eventId) : null,
                status: status || "PENDING",
                metadata: metadata ? JSON.stringify(metadata) : null,
                thumbnailUrl: thumbnailUrl || null
            },
        });
    }

    async getAllMemories() {
        return await prisma.memory.findMany({
            where: {
                isPublic: true,
                status: 'APPROVED'
            },
            include: {
                user: { select: { name: true } },
                organization: { select: { name: true, logo: true, slug: true } }
            },
            orderBy: { eventDate: 'desc' },
        });
    }

    async getMyMemories(user) {
        return await prisma.memory.findMany({
            where: {
                userId: user.userId,
                organizationId: user.organizationId
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateMemory(id, data, user) {
        // Ownership check
        const memory = await prisma.memory.findUnique({ where: { id: parseInt(id) } });

        if (!memory) throw new Error('Memory not found');
        if (memory.userId !== user.userId || memory.organizationId !== user.organizationId) {
            throw new Error('Not authorized to edit this memory');
        }

        const { title, description, date, location, category, tags, eventId } = data;

        return await prisma.memory.update({
            where: { id: parseInt(id) },
            data: {
                title,
                description,
                content: description,
                eventDate: date ? new Date(date) : null,
                location,
                category,
                tags: tags ? JSON.stringify(tags) : null,
                eventId: eventId ? parseInt(eventId) : undefined
            }
        });
    }

    async deleteMemory(id, user) {
        const memory = await prisma.memory.findUnique({ where: { id: parseInt(id) } });

        if (!memory) throw new Error('Memory not found');
        if (memory.userId !== user.userId || memory.organizationId !== user.organizationId) {
            throw new Error('Not authorized to delete this memory');
        }

        return await prisma.memory.delete({ where: { id: parseInt(id) } });
    }

    async searchMemories(query, user) {
        const { q, category, startDate, endDate } = query;

        const where = {
            organizationId: user.organizationId,
            // Filter by Unit if user has one and is NOT admin (or has view_all permission)
            ...(user.schoolUnitId && user.role !== 'admin' && {
                user: { schoolUnitId: user.schoolUnitId }
            }),
            ...(q && {
                OR: [
                    { title: { contains: q } },
                    { description: { contains: q } },
                    { location: { contains: q } }
                ]
            }),
            ...(category && { category }),
            ...(startDate && endDate && {
                eventDate: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            })
        };

        return await prisma.memory.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
    }

    async togglePublicStatus(id, isPublic, user) {
        const memory = await prisma.memory.findUnique({ where: { id: parseInt(id) } });

        if (!memory) throw new Error('Memory not found');
        if (memory.organizationId !== user.organizationId) {
            throw new Error('Not authorized');
        }

        return await prisma.memory.update({
            where: { id: parseInt(id) },
            data: { isPublic }
        });
    }

    async updateMemoryStatus(id, status, user) {
        const allowedStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
        if (!allowedStatuses.includes(status)) {
            throw new Error('Invalid status');
        }

        const memory = await prisma.memory.findUnique({ where: { id: parseInt(id) } });

        if (!memory) throw new Error('Memory not found');
        if (memory.organizationId !== user.organizationId) {
            throw new Error('Not authorized');
        }

        return await prisma.memory.update({
            where: { id: parseInt(id) },
            data: { status }
        });
    }

    async getPendingMemories(user) {
        return await prisma.memory.findMany({
            where: {
                organizationId: user.organizationId,
                status: 'PENDING'
            },
            include: {
                user: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}

module.exports = new MemoryService();
