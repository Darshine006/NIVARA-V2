
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, isDatabaseConnected, closeDB, sanitizeUri } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Attempt connection to MongoDB Atlas
connectDB();

const app = express();

// Configure CORS
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly permissive CORS
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health and System Diagnostics Check
app.get('/api/health', (req, res) => {
  const dbStatus = isDatabaseConnected() ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'online',
    app: 'NIVARA - Modular Rural Healthcare Platform',
    version: '2.0.0',
    database: {
      status: dbStatus,
      targetCluster: 'mywebsitecluster.61me3dd.mongodb.net',
      targetDatabase: process.env.MONGODB_DB_NAME || 'nivara',
      configuredUri: sanitizeUri(process.env.MONGODB_URI),
    },
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/centers', require('./routes/centerRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/records', require('./routes/recordRoutes'));
app.use('/api/articles', require('./routes/articleRoutes'));
app.use('/api/regions', require('./routes/regionRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api', require('./routes/syncRoutes'));

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server;
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`[NIVARA V2 Server] Running at http://localhost:${PORT}`);
    console.log(`[NIVARA V2 Server] Health endpoint: http://localhost:${PORT}/api/health`);
  });

  // Graceful shutdown handling
  const gracefulShutdown = async (signal) => {
    console.log(`\n[NIVARA V2 Server] Received ${signal}. Initiating graceful shutdown...`);
    server.close(async () => {
      console.log('[NIVARA V2 Server] HTTP server closed.');
      await closeDB();
      console.log('[NIVARA V2 Server] Shutdown complete.');
      process.exit(0);
    });

    // Force close if graceful shutdown hangs
    setTimeout(() => {
      console.error('[NIVARA V2 Server] Shutdown timed out. Forcing process termination.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  process.on('unhandledRejection', (err) => {
    console.error('[NIVARA V2 Server] Unhandled Promise Rejection:', err.message);
  });
}

module.exports = app;
