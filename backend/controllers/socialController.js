const prisma = require('../prisma/client');
const { generateSocialContent } = require('../services/aiSocialService');

const generatePost = async (req, res) => {
    try {
        const { memoryId, platform } = req.body;

        const memory = await prisma.memory.findUnique({
            where: { id: parseInt(memoryId), organizationId: req.user.organizationId }
        });

        if (!memory) {
            return res.status(404).json({ error: 'Memory not found' });
        }

        const content = await generateSocialContent(memory, platform);

        res.json(content);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error generating post' });
    }
};

module.exports = { generatePost };
