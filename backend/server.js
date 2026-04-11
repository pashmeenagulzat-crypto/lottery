require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const { testConnection } = require('./config/database');
const { apiLimiter } = require('./middlewares/rateLimiter');
const { startCronJobs } = require('./utils/cronJobs');

const authRoutes = require('./routes/auth');
const lotteryRoutes = require('./routes/lottery');
const ticketRoutes = require('./routes/ticket');
const walletRoutes = require('./routes/wallet');
const drawRoutes = require('./routes/draw');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);

// Allowed development origins for local development only
const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
];

const getAllowedOrigins = () => {
  const raw = process.env.CORS_ORIGIN;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!raw) {
    if (isProduction) {
      console.warn('⚠️  CORS_ORIGIN is not set in production. Cross-origin requests will be blocked. Set CORS_ORIGIN to your frontend URL(s).');
      return false; // Block all cross-origin requests
    }
    // Development: only allow known local dev servers
    return DEV_ORIGINS;
  }

  // Never allow wildcard '*' in production
  if (raw === '*') {
    if (isProduction) {
      console.error('❌  CORS_ORIGIN=* is not allowed in production. Set it to your frontend URL(s).');
      return false;
    }
    // Wildcard only accepted in explicit development mode
    return DEV_ORIGINS;
  }

  // Support comma-separated list of explicit origins
  const origins = raw.split(',').map((o) => o.trim()).filter(Boolean);
  return origins.length === 1 ? origins[0] : origins;
};

const allowedOrigins = getAllowedOrigins();

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

// Middlewares
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api/', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Lottery API is running', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lotteries', lotteryRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/draw', drawRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

const PORT = parseInt(process.env.PORT) || 5000;

server.listen(PORT, async () => {
  console.log(`🚀 Lottery API server running on port ${PORT}`);
  await testConnection();
  startCronJobs(io);
});

module.exports = { app, server };
