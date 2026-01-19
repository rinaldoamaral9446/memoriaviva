const express = require('express');
const router = express.Router();
const pedagogicalController = require('../controllers/pedagogicalController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/plan', authenticateToken, pedagogicalController.createLessonPlan);
router.get('/plan/:id/pdf', authenticateToken, pedagogicalController.downloadLessonPlanPDF);

module.exports = router;
