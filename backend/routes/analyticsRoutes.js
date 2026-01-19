const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

// Validar se o usuário é Admin ou possui permissão de 'analytics:read'
// Por enquanto, checamos apenas a autenticação. A permissão fina pode ser adicionada depois.
router.get('/summary', authMiddleware, analyticsController.getAnalyticsSummary);
router.get('/schools', authMiddleware, analyticsController.getEngagementRanking);

module.exports = router;
