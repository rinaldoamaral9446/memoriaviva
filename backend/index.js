require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const memoryRoutes = require('./routes/memoryRoutes');
const aiRoutes = require('./routes/aiRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const roleRoutes = require('./routes/roleRoutes');
const adminRoutes = require('./routes/adminRoutes');
const eventRoutes = require('./routes/eventRoutes');
const auditRoutes = require('./routes/auditRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

// Middleware
const corsOptions = {
  origin: [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174'].filter(Boolean),
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Serve uploaded files as static
// Serve uploaded files as static
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes); // Registered event routes
app.use('/api/expenses', require('./routes/expenseRoutes')); // Registered expense routes
app.use('/api/social', require('./routes/socialRoutes')); // Registered social routes
app.use('/api/audit', auditRoutes); // Registered audit routes
app.use('/api/settings', settingsRoutes); // Registered settings routes
app.use('/api/agents', require('./routes/agentRoutes')); // New Agent Management Routes
app.use('/api/pedagogical', require('./routes/pedagogicalRoutes')); // [NEW] Pedagogical Routes (BNCC/PDF)
app.use('/api/system', require('./routes/systemRoutes')); // [NEW] System Config & Audit
app.use('/api/units', require('./routes/unitRoutes')); // [NEW] School Units Management

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Global Error Handler (Must be the last middleware)
app.use((err, req, res, next) => {
  console.error('🔥 Global unhandled error:', err);

  // Prevent double response
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    message: 'Ocorreu um erro interno no servidor.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});


if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
