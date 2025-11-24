const express = require('express');
const router = express.Router();
// const { verifyToken } = require('../middleware/authMiddleware');
const {
    getAllOrganizations,
    getOrganization,
    getOrganizationBySlug,
    createOrganization,
    updateOrganization,
    deleteOrganization
} = require('../controllers/organizationController');

// Public routes
router.get('/slug/:slug', getOrganizationBySlug);

// Temporarily without auth
router.get('/', getAllOrganizations);
router.get('/:id', getOrganization);
router.post('/', createOrganization);
router.put('/:id', updateOrganization);
router.delete('/:id', deleteOrganization);

module.exports = router;
