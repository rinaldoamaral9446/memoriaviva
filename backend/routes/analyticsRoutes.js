const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');
const verifyToken = require('../middleware/authMiddleware');

// All analytics routes require authentication
router.use(verifyToken);

/**
 * GET /api/analytics/overview
 * Get overall organization statistics
 */
router.get('/overview', async (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        const overview = await analyticsService.getOverview(organizationId);
        res.json(overview);
    } catch (error) {
        console.error('Analytics overview error:', error);
        res.status(500).json({ message: 'Failed to fetch analytics' });
    }
});

/**
 * GET /api/analytics/memories
 * Get memory statistics over time
 */
router.get('/memories', async (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        const months = parseInt(req.query.months) || 6;
        const stats = await analyticsService.getMemoryStats(organizationId, months);
        res.json(stats);
    } catch (error) {
        console.error('Memory stats error:', error);
        res.status(500).json({ message: 'Failed to fetch memory stats' });
    }
});

/**
 * GET /api/analytics/users
 * Get user activity metrics
 */
router.get('/users', async (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        const activity = await analyticsService.getUserActivity(organizationId);
        res.json(activity);
    } catch (error) {
        console.error('User activity error:', error);
        res.status(500).json({ message: 'Failed to fetch user activity' });
    }
});

/**
 * GET /api/analytics/locations
 * Get location distribution
 */
router.get('/locations', async (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        const locations = await analyticsService.getLocationStats(organizationId);
        res.json(locations);
    } catch (error) {
        console.error('Location stats error:', error);
        res.status(500).json({ message: 'Failed to fetch location stats' });
    }
});

/**
 * GET /api/analytics/insights
 * Get AI-generated insights
 */
router.get('/insights', async (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        const insights = await analyticsService.getAIInsights(organizationId);
        res.json(insights);
    } catch (error) {
        console.error('Insights error:', error);
        res.status(500).json({ message: 'Failed to fetch insights' });
    }
});

module.exports = router;
