const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

// Validar se o usuário é Admin ou possui permissão de 'analytics:read'
// Por enquanto, checamos apenas a autenticação. A permissão fina pode ser adicionada depois.
// Por enquanto, checamos apenas a autenticação. A permissão fina pode ser adicionada depois.
router.get('/summary', authMiddleware, analyticsController.getAnalyticsSummary);
router.get('/schools', authMiddleware, analyticsController.getEngagementRanking);
router.get('/overview', authMiddleware, analyticsController.getOverview);
router.get('/memories', authMiddleware, analyticsController.getMemoriesStats);
router.get('/users', authMiddleware, analyticsController.getUserActivity);
router.get('/locations', authMiddleware, analyticsController.getLocationStats);
router.get('/insights', authMiddleware, analyticsController.getInsights);

// [NEW] PDF Report
router.get('/report', authMiddleware, analyticsController.generateReport);

module.exports = router;
