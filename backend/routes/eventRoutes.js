const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const verifyToken = require('../middleware/authMiddleware');
const { requirePermission } = require('../services/rbacService');

router.use(verifyToken);

router.get('/', eventController.getEvents);
router.post('/', eventController.createEvent);
router.post('/generate', eventController.generateAiSchedule);

module.exports = router;
