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
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin matches allowed credentials or ends with .vercel.app
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
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

// Helper to log errors (but Require must be static)
const logFailure = (path, error) => {
  console.error(`⚠️ Failed to load route: ${path}`, error.message);
  failedRoutes.push({ path, error: error.message });
};

// Routes (Explicit Try-Catch for Bundler Detection)
try { app.use('/api/auth', require('./routes/authRoutes')); } catch (e) { logFailure('/api/auth', e); }
try { app.use('/api/users', require('./routes/userRoutes')); } catch (e) { logFailure('/api/users', e); }
try { app.use('/api/memories', require('./routes/memoryRoutes')); } catch (e) { logFailure('/api/memories', e); }
try { app.use('/api/ai', require('./routes/aiRoutes')); } catch (e) { logFailure('/api/ai', e); }
try { app.use('/api/organizations', require('./routes/organizationRoutes')); } catch (e) { logFailure('/api/organizations', e); }
try { app.use('/api/upload', require('./routes/uploadRoutes')); } catch (e) { logFailure('/api/upload', e); }
try { app.use('/api/analytics', require('./routes/analyticsRoutes')); } catch (e) { logFailure('/api/analytics', e); }
try { app.use('/api/roles', require('./routes/roleRoutes')); } catch (e) { logFailure('/api/roles', e); }
try { app.use('/api/admin', require('./routes/adminRoutes')); } catch (e) { logFailure('/api/admin', e); }
try { app.use('/api/events', require('./routes/eventRoutes')); } catch (e) { logFailure('/api/events', e); }
try { app.use('/api/expenses', require('./routes/expenseRoutes')); } catch (e) { logFailure('/api/expenses', e); }
try { app.use('/api/social', require('./routes/socialRoutes')); } catch (e) { logFailure('/api/social', e); }
try { app.use('/api/audit', require('./routes/auditRoutes')); } catch (e) { logFailure('/api/audit', e); }
try { app.use('/api/settings', require('./routes/settingsRoutes')); } catch (e) { logFailure('/api/settings', e); }
try { app.use('/api/agents', require('./routes/agentRoutes')); } catch (e) { logFailure('/api/agents', e); }
try { app.use('/api/pedagogical', require('./routes/pedagogicalRoutes')); } catch (e) { logFailure('/api/pedagogical', e); }
try { app.use('/api/system', require('./routes/systemRoutes')); } catch (e) { logFailure('/api/system', e); }
try { app.use('/api/units', require('./routes/unitRoutes')); } catch (e) { logFailure('/api/units', e); }

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
