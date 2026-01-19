const prisma = require('../prisma/client');
const { generateSchedule } = require('../services/aiEventService');

const getEvents = async (req, res) => {
    try {
        const events = await prisma.memory.findMany({
            where: {
                organizationId: req.user.organizationId,
                isEvent: true
            },
            orderBy: { eventDate: 'asc' }
        });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching events' });
    }
};

const createEvent = async (req, res) => {
    try {
        const { title, description, eventDate, location, ticketPrice, capacity, imageUrl } = req.body;

        const event = await prisma.memory.create({
            data: {
                title,
                description,
                eventDate: new Date(eventDate),
                location,
                ticketPrice: parseFloat(ticketPrice),
                capacity: parseInt(capacity),
                imageUrl,
                isEvent: true,
                type: 'event',
                date: new Date(eventDate), // Sync with main date field
                organizationId: req.user.organizationId,
                userId: req.user.userId
            }
        });

        res.status(201).json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating event' });
    }
};

const generateAiSchedule = async (req, res) => {
    try {
        const { prompt } = req.body;
        const schedule = await generateSchedule(prompt);
        res.json({ schedule });
    } catch (error) {
        res.status(500).json({ error: 'Error generating schedule' });
    }
};

module.exports = { getEvents, createEvent, generateAiSchedule };
