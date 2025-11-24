const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createMemory = async (req, res) => {
    try {
        const { title, description, date, location, imageUrl, category, tags } = req.body;

        // Validate required fields
        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        const memory = await prisma.memory.create({
            data: {
                title,
                description,
                content: description, // Use description as content
                eventDate: date ? new Date(date) : null,
                location,
                category,
                tags: tags ? JSON.stringify(tags) : null,
                mediaUrl: imageUrl || null,
                userId: req.user.userId,
                organizationId: req.user.organizationId, // From JWT token
                aiGenerated: true // Since it comes from AI
            },
        });
        res.status(201).json(memory);
    } catch (error) {
        console.error('Create memory error:', error);
        res.status(500).json({ message: 'Error creating memory', error: error.message });
    }
};

exports.getAllMemories = async (req, res) => {
    try {
        const memories = await prisma.memory.findMany({
            include: { user: { select: { name: true } } },
            orderBy: { date: 'desc' },
        });
        res.json(memories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching memories', error: error.message });
    }
};

exports.getMyMemories = async (req, res) => {
    try {
        const memories = await prisma.memory.findMany({
            where: {
                userId: req.user.userId,
                organizationId: req.user.organizationId // Filter by organization
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(memories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching your memories', error: error.message });
    }
};

exports.updateMemory = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, date, location, category, tags } = req.body;

        // Validate required fields
        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        // Find memory and verify ownership + organization
        const memory = await prisma.memory.findUnique({
            where: { id: parseInt(id) }
        });

        if (!memory) {
            return res.status(404).json({ message: 'Memory not found' });
        }

        if (memory.userId !== req.user.userId || memory.organizationId !== req.user.organizationId) {
            return res.status(403).json({ message: 'Not authorized to edit this memory' });
        }

        // Update
        const updated = await prisma.memory.update({
            where: { id: parseInt(id) },
            data: {
                title,
                description,
                content: description,
                eventDate: date ? new Date(date) : null,
                location,
                category,
                tags: tags ? JSON.stringify(tags) : null
            }
        });

        res.json(updated);
    } catch (error) {
        console.error('Update memory error:', error);
        res.status(500).json({ message: 'Error updating memory', error: error.message });
    }
};

exports.deleteMemory = async (req, res) => {
    try {
        const { id } = req.params;
        const memory = await prisma.memory.findUnique({ where: { id: parseInt(id) } });

        if (!memory) {
            return res.status(404).json({ message: 'Memory not found' });
        }

        // Check both user and organization
        if (memory.userId !== req.user.userId || memory.organizationId !== req.user.organizationId) {
            return res.status(403).json({ message: 'Not authorized to delete this memory' });
        }

        await prisma.memory.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Memory deleted successfully' });
    } catch (error) {
        console.error('Delete memory error:', error);
        res.status(500).json({ message: 'Error deleting memory', error: error.message });
    }
};

exports.searchMemories = async (req, res) => {
    try {
        const { q, category, startDate, endDate } = req.query;

        const where = {
            userId: req.user.userId,
            organizationId: req.user.organizationId,
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

        const memories = await prisma.memory.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        res.json(memories);
    } catch (error) {
        console.error('Search memories error:', error);
        res.status(500).json({ message: 'Error searching memories', error: error.message });
    }
};
