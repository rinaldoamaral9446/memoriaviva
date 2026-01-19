const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const verifyToken = require('../middleware/authMiddleware');
const { requirePermission } = require('../services/rbacService');

router.use(verifyToken);

// Using 'settings' permission as a proxy for financial access for now
router.get('/', requirePermission('settings', 'read'), expenseController.getExpenses);
router.post('/', requirePermission('settings', 'update'), expenseController.createExpense);
router.delete('/:id', requirePermission('settings', 'update'), expenseController.deleteExpense);
router.post('/report', requirePermission('settings', 'read'), expenseController.generateReport);

module.exports = router;
