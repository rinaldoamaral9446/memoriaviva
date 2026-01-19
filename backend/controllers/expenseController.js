const prisma = require('../prisma/client');
const { analyzeCosts } = require('../services/aiFinanceService');

const getExpenses = async (req, res) => {
    try {
        const expenses = await prisma.expense.findMany({
            where: { organizationId: req.user.organizationId },
            orderBy: { date: 'desc' },
            include: { memory: { select: { title: true } } }
        });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching expenses' });
    }
};

const createExpense = async (req, res) => {
    try {
        const { description, amount, date, category, memoryId } = req.body;

        const expense = await prisma.expense.create({
            data: {
                description,
                amount: parseFloat(amount),
                date: new Date(date),
                category,
                memoryId: memoryId || null,
                organizationId: req.user.organizationId
            }
        });

        res.status(201).json(expense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating expense' });
    }
};

const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.expense.delete({
            where: { id, organizationId: req.user.organizationId }
        });
        res.json({ message: 'Expense deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting expense' });
    }
};

const generateReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        const expenses = await prisma.expense.findMany({
            where: {
                organizationId: req.user.organizationId,
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            }
        });

        if (expenses.length === 0) {
            return res.status(400).json({ error: 'No expenses found for this period' });
        }

        const timeframe = `${startDate} to ${endDate}`;
        const analysis = await analyzeCosts(expenses, timeframe);

        res.json({ analysis, total: expenses.reduce((sum, e) => sum + e.amount, 0) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error generating report' });
    }
};

module.exports = { getExpenses, createExpense, deleteExpense, generateReport };
