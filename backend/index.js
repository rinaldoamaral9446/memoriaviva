require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.json({
    message: 'Backend Memória Viva is running!',
    status: 'online',
    failedRoutes: typeof failedRoutes !== 'undefined' ? failedRoutes : []
  });
});

// Lazy Load Routes to prevent startup crash on Vercel 500
// const authRoutes = require('./routes/authRoutes'); // Moved inline
// const userRoutes = require('./routes/userRoutes'); // Moved inline
// ... other routes moved inline

// Middleware
const corsOptions = {
  origin: [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174'].filter(Boolean),
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Serve uploaded files as static
// Serve uploaded files as static
// app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

// Routes
// Safe Route Loading Helper
const failedRoutes = [];

// Safe Route Loading Helper
const safeUse = (path, routePath) => {
  try {
    app.use(path, require(routePath));
  } catch (error) {
    console.error(`⚠️ Failed to load route: ${path}`, error.message);
    failedRoutes.push({ path, error: error.message });
  }
};

// Routes
safeUse('/api/auth', './routes/authRoutes');
safeUse('/api/users', './routes/userRoutes');
safeUse('/api/memories', './routes/memoryRoutes');
safeUse('/api/ai', './routes/aiRoutes');
safeUse('/api/organizations', './routes/organizationRoutes');
safeUse('/api/upload', './routes/uploadRoutes');
safeUse('/api/analytics', './routes/analyticsRoutes');
safeUse('/api/roles', './routes/roleRoutes');
safeUse('/api/admin', './routes/adminRoutes');
safeUse('/api/events', './routes/eventRoutes');
safeUse('/api/expenses', './routes/expenseRoutes');
safeUse('/api/social', './routes/socialRoutes');
safeUse('/api/audit', './routes/auditRoutes');
safeUse('/api/settings', './routes/settingsRoutes');
safeUse('/api/agents', './routes/agentRoutes');
safeUse('/api/pedagogical', './routes/pedagogicalRoutes');
safeUse('/api/system', './routes/systemRoutes');
safeUse('/api/units', './routes/unitRoutes');

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
