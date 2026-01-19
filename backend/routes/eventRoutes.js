const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const verifyToken = require('../middleware/authMiddleware');
const { requirePermission } = require('../services/rbacService');

router.use(verifyToken);

router.get('/', requirePermission('memories', 'read'), eventController.getEvents);
router.post('/', requirePermission('memories', 'create'), eventController.createEvent);
router.post('/generate', requirePermission('memories', 'create'), eventController.generateAiSchedule);

module.exports = router;
