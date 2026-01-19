const express = require('express');
const router = express.Router();
const socialController = require('../controllers/socialController');
const verifyToken = require('../middleware/authMiddleware');
const { requirePermission } = require('../services/rbacService');

router.use(verifyToken);

router.post('/generate', requirePermission('memories', 'read'), socialController.generatePost);

module.exports = router;
