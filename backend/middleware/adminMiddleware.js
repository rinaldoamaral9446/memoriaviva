const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const adminMiddleware = async (req, res, next) => {
    // 1. Check Token (Fast)
    if (req.user && req.user.role === 'super_admin') {
        return next();
    }

    // 2. Check DB (Robust against stale tokens)
    if (req.user && req.user.userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: req.user.userId }
            });

            if (user && user.role === 'super_admin') {
                return next();
            }
        } catch (error) {
            console.error('AdminMiddleware DB Check Error:', error);
        }
    }

    res.status(403).json({ message: 'Access denied. Super Admin privileges required.' });
};

module.exports = adminMiddleware;
