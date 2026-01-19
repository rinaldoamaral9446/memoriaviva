const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const verifyToken = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);

module.exports = router;
