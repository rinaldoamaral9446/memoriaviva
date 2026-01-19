const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const adminService = require('../services/adminService');
const aiMonitorService = require('../services/aiMonitorService');

// All routes require super_admin role
router.use(authMiddleware, adminMiddleware);

// Dashboard Stats
router.get('/stats', async (req, res) => {
    try {
        const stats = await adminService.getGlobalStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Organization Management
router.put('/organizations/:id/status', async (req, res) => {
    try {
        const { isActive } = req.body;
        const org = await adminService.updateOrgStatus(req.params.id, isActive, req.user.userId);
        res.json(org);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/organizations/:id/limits', async (req, res) => {
    try {
        const limits = req.body;
        const org = await adminService.updateOrgLimits(req.params.id, limits, req.user.userId);
        res.json(org);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/organizations/:id/impersonate', async (req, res) => {
    try {
        const result = await adminService.impersonateOrg(req.params.id, req.user.userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// System Settings
router.get('/settings', async (req, res) => {
    try {
        const settings = await adminService.getSystemSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/settings', async (req, res) => {
    try {
        const { key, value, description } = req.body;
        const setting = await adminService.updateSystemSetting(key, value, description, req.user.userId);
        res.json(setting);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// AI Monitoring
router.get('/ai/usage', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const report = await aiMonitorService.getUsageReport(new Date(startDate), new Date(endDate));
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
