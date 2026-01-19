const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const verifyToken = require('../middleware/authMiddleware');
const { requirePermission } = require('../services/rbacService');

// All routes require authentication
router.use(verifyToken);

// List roles
router.get('/', roleController.getRoles);

// Create role (Requires 'users' 'create' permission or admin)
// We'll use a specific permission check later, for now ensure authenticated
router.post('/', roleController.createRole);

// Generate permissions with AI
router.post('/generate', roleController.generatePermissions);

// Update role
router.put('/:id', roleController.updateRole);

// Delete role
router.delete('/:id', roleController.deleteRole);

module.exports = router;
