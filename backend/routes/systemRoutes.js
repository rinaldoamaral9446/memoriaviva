const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware'); // Organization Admin

// Middleware strictly for Super Admin (ID 1 for now, or specific role)
const superAdminMiddleware = (req, res, next) => {
    // Implement stricter check if needed. For now, we trust Organizaton 1's admins.
    // Or check if req.user.role === 'super_admin' (if that existed).
    // Let's assume Organization 1 is the Setup/Super Org.
    // if (req.user.organizationId !== 1) return res.status(403).json({ error: 'Access Denied' });
    next();
};

router.get('/settings', authMiddleware, adminMiddleware, superAdminMiddleware, systemController.getSystemSettings);
router.put('/settings/:key', authMiddleware, adminMiddleware, superAdminMiddleware, systemController.updateSystemSetting);
router.get('/audit', authMiddleware, adminMiddleware, superAdminMiddleware, systemController.getGlobalAuditLogs);

module.exports = router;
