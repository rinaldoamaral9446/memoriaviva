const prisma = require('../prisma/client');

const getSettings = async (req, res) => {
    try {
        // Mock settings for now or fetch from DB if model exists
        res.json({ theme: 'light', notifications: true });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching settings' });
    }
};

const updateSettings = async (req, res) => {
    try {
        res.json({ message: 'Settings updated' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating settings' });
    }
};

module.exports = { getSettings, updateSettings };
