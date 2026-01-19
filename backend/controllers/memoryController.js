const MemoryService = require('../services/memoryService');

exports.createMemory = async (req, res) => {
    try {
        const { title, description } = req.body;

        // Validate required fields
        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        const memory = await MemoryService.createMemory(req.body, req.user);
        res.status(201).json(memory);
    } catch (error) {
        console.error('Create memory error:', error);
        res.status(500).json({ message: 'Error creating memory', error: error.message });
    }
};

exports.getAllMemories = async (req, res) => {
    try {
        const memories = await MemoryService.getAllMemories();
        res.json(memories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching memories', error: error.message });
    }
};

exports.getMyMemories = async (req, res) => {
    try {
        const memories = await MemoryService.getMyMemories(req.user);
        res.json(memories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching your memories', error: error.message });
    }
};

exports.updateMemory = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        const updated = await MemoryService.updateMemory(id, req.body, req.user);
        res.json(updated);
    } catch (error) {
        if (error.message === 'Memory not found') return res.status(404).json({ message: error.message });
        if (error.message.includes('Not authorized')) return res.status(403).json({ message: error.message });

        console.error('Update memory error:', error);
        res.status(500).json({ message: 'Error updating memory', error: error.message });
    }
};

exports.deleteMemory = async (req, res) => {
    try {
        const { id } = req.params;
        await MemoryService.deleteMemory(id, req.user);
        res.json({ message: 'Memory deleted successfully' });
    } catch (error) {
        if (error.message === 'Memory not found') return res.status(404).json({ message: error.message });
        if (error.message.includes('Not authorized')) return res.status(403).json({ message: error.message });

        console.error('Delete memory error:', error);
        res.status(500).json({ message: 'Error deleting memory', error: error.message });
    }
};

exports.searchMemories = async (req, res) => {
    try {
        const memories = await MemoryService.searchMemories(req.query, req.user);
        res.json(memories);
    } catch (error) {
        console.error('Search memories error:', error);
        res.status(500).json({ message: 'Error searching memories', error: error.message });
    }
};

exports.togglePublicStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isPublic } = req.body;

        const updated = await MemoryService.togglePublicStatus(id, isPublic, req.user);
        res.json(updated);
    } catch (error) {
        if (error.message === 'Memory not found') return res.status(404).json({ message: error.message });
        if (error.message.includes('Not authorized')) return res.status(403).json({ message: error.message });

        res.status(500).json({ message: 'Error updating status', error: error.message });
    }
};
