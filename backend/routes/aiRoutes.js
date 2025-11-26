const express = require('express');
const router = express.Router();
const { uploadMemory } = require('../config/multer');
const aiController = require('../controllers/aiController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/process', verifyToken, uploadMemory.single('media'), aiController.processMemoryInput);
router.post('/chat', aiController.chatWithAgent);
router.post('/optimize-instructions', verifyToken, aiController.optimizeInstructions);
router.post('/curate', verifyToken, aiController.curateMemories);
router.post('/pedagogical/plan', verifyToken, aiController.generateLessonPlan);

module.exports = router;
