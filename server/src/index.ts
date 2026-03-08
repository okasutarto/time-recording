import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { initializeDatabase, closeDatabase } from './db/database';
import userRoutes from './routes/users';
import clockRoutes from './routes/clock';
import recordRoutes from './routes/records';
import reportRoutes from './routes/reports';
import configRoutes from './routes/config';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10kb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
}));

// Request logging
app.use((req, _res, next) => {
  console.log(`[Server] ${new Date().toISOString()} ${req.method} ${req.path} Origin: ${req.headers.origin || 'none'}`);
  next();
});

// Root route
app.get('/', (_req, res) => {
  res.json({
    message: 'Time Recording System API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      clock: '/api/clock',
      records: '/api/records',
      reports: '/api/reports',
      config: '/api/config',
      health: '/api/health'
    }
  });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/clock', clockRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/config', configRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Create data directory and initialize database
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Start server
async function start() {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`Time Recording System running on http://localhost:${PORT}`);
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down...');
  closeDatabase();
  process.exit(0);
});

start().catch(console.error);
