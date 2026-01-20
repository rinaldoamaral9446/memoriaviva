const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
    getAllOrganizations,
    getPublicOrganizations,
    getOrganization,
    getOrganizationBySlug,
    createOrganization,
    updateOrganization,
    updateOrganizationConfig,
    deleteOrganization
} = require('../controllers/organizationController');

const orgAdminMiddleware = require('../middleware/orgAdminMiddleware');

// Public routes
router.get('/public', getPublicOrganizations);
router.get('/slug/:slug', getOrganizationBySlug);

// Protected routes
router.get('/', authMiddleware, adminMiddleware, getAllOrganizations);
router.get('/:id', authMiddleware, getOrganization);
router.post('/', authMiddleware, adminMiddleware, createOrganization);
router.put('/:id', authMiddleware, orgAdminMiddleware, updateOrganization);
router.put('/:id/config', authMiddleware, orgAdminMiddleware, updateOrganizationConfig);
router.delete('/:id', authMiddleware, adminMiddleware, deleteOrganization);

module.exports = router;
