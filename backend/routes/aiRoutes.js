const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadMemory } = require('../config/multer');
const aiController = require('../controllers/aiController');
const verifyToken = require('../middleware/authMiddleware');

// Wrapper to catch Multer errors (File Size / Type) and return JSON
const uploadMiddleware = (req, res, next) => {
    const upload = uploadMemory.single('media');

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // Specific Multer Errors
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    message: 'O arquivo enviado é muito grande (Máx: 50MB).'
                });
            }
            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.status(400).json({
                    message: 'Campo de upload inválido ou arquivo não esperado.'
                });
            }
            return res.status(400).json({ message: `Erro no upload: ${err.message}` });
        } else if (err) {
            // Filter errors (e.g. Invalid file type)
            return res.status(400).json({ message: err.message });
        }
        // Success
        next();
    });
};

// Middleware to increase timeout for heavy AI operations (120s)
const timeoutMiddleware = (req, res, next) => {
    req.setTimeout(120000); // 2 minutes
    next();
};

router.post('/process', verifyToken, uploadMiddleware, aiController.processMemoryInput);
router.post('/process-link', verifyToken, timeoutMiddleware, aiController.processLink);
router.post('/chat', aiController.chatWithAgent);
router.post('/optimize-instructions', verifyToken, aiController.optimizeInstructions);
router.post('/curate', verifyToken, aiController.curateMemories);
router.post('/pedagogical/plan', verifyToken, aiController.generateLessonPlan);

module.exports = router;
