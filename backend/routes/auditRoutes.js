const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const verifyToken = require('../middleware/authMiddleware');
const { requirePermission } = require('../services/rbacService');

router.use(verifyToken);

router.get('/', requirePermission('audit', 'read'), auditController.getLogs);

module.exports = router;
