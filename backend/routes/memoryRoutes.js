const express = require('express');
const router = express.Router();
const memoryController = require('../controllers/memoryController');
const authMiddleware = require('../middleware/authMiddleware');

const checkRole = require('../middleware/roleMiddleware');

router.post('/', authMiddleware, memoryController.createMemory);
router.get('/', memoryController.getAllMemories); // Public list
router.get('/my', authMiddleware, memoryController.getMyMemories);
router.get('/search', authMiddleware, memoryController.searchMemories);
router.put('/:id', authMiddleware, memoryController.updateMemory);
router.get('/pending', authMiddleware, checkRole(['admin', 'editor']), memoryController.getPendingMemories);
router.patch('/:id/status', authMiddleware, checkRole(['admin', 'editor']), memoryController.updateMemoryStatus);
router.delete('/:id', authMiddleware, memoryController.deleteMemory);

module.exports = router;
