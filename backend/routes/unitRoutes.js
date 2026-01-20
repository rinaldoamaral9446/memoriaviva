const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');
const authMiddleware = require('../middleware/authMiddleware');

// Base path: /api/units (To be configured in index.js)

// List all units
router.get('/', authMiddleware, unitController.listUnits);

// Create a new unit
router.post('/', authMiddleware, unitController.createUnit);

// Update a unit
router.put('/:id', authMiddleware, unitController.updateUnit);

// Delete a unit
router.delete('/:id', authMiddleware, unitController.deleteUnit);

module.exports = router;
