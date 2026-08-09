const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const config = require('./src/config/config');

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

// ─── Request Parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging ─────────────────────────────────────────────────────────────────
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// ─── File Uploads Directory ───────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/citizens', require('./src/routes/citizens'));
app.use('/api/doctors', require('./src/routes/doctors'));
app.use('/api/hospitals', require('./src/routes/hospitals'));
app.use('/api/records', require('./src/routes/records'));
app.use('/api/qr', require('./src/routes/qr'));
app.use('/api/emergency', require('./src/routes/emergency'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/ai', require('./src/routes/ai'));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'MedTrace AI – Government Unified Health Passport',
    version: '1.0.0',
    environment: config.nodeEnv,
    database: config.mongodb.useMock ? 'mock (in-memory)' : 'MongoDB Atlas',
    ai: config.groq.useMock ? 'mock' : 'Groq + Llama 3',
    auth: config.clerk.useMock ? 'mock (demo mode)' : 'Clerk',
    timestamp: new Date().toISOString(),
  });
});

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
  }
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

const connectDB = require('./src/config/db');

const startServer = async () => {
  // Connect to Database
  await connectDB();

  app.listen(config.port, () => {
    console.log('\n🏥 MedTrace AI – Government Unified Health Passport');
    console.log('━'.repeat(50));
    console.log(`  ✅ Server running at: http://localhost:${config.port}`);
    console.log(`  🌐 Health check:      http://localhost:${config.port}/api/health`);
    console.log(`  📊 Environment:       ${config.nodeEnv}`);
    console.log('━'.repeat(50));
    console.log('\n  Demo Login Accounts:');
    console.log('  ┌─────────────────────────────────────────────┐');
    console.log('  │ Citizen:    citizen@demo.com  / demo123     │');
    console.log('  │ Doctor:     doctor@demo.com   / demo123     │');
    console.log('  │ Diagnostic: diagnostic@demo.com / demo123   │');
    console.log('  │ Admin:      admin@demo.com    / demo123     │');
    console.log('  └─────────────────────────────────────────────┘\n');
  });
};

startServer().catch(console.error);

module.exports = app;

// ─── Vercel Serverless Adapter ────────────────────────────────────────────────
const serverless = require('serverless-http');
const connectDB = require('./src/config/db');

// Cache the database connection globally to prevent reconnecting on every request
let dbConnectionPromise = null;

// Vercel serverless handler
exports.handler = async (event, context) => {
  // Ensure database connects only once across cold starts
  if (!dbConnectionPromise) {
    dbConnectionPromise = connectDB();
  }
  await dbConnectionPromise;

  // Run the Express app through the serverless adapter
  const handler = serverless(app);
  return handler(event, context);
};