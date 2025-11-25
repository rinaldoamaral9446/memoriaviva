const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/process', authMiddleware, upload.single('media'), aiController.processMemoryInput);
router.post('/agent/chat', authMiddleware, aiController.chatWithAgent);

module.exports = router;
