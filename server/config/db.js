const mongoose = require('mongoose');

let isConnected = false;

// Utility to sanitize URI for safe logging (removes password)
const sanitizeUri = (uri) => {
  if (!uri) return 'None';
  try {
    return uri.replace(/:([^@]+)@/, ':****@');
  } catch {
    return 'Masked URI';
  }
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    console.warn('\n============================================================');
    console.warn('[MongoDB Atlas Diagnostic]: No active Atlas credentials configured.');
    console.warn(`[Configured URI]: ${sanitizeUri(uri)}`);
    console.warn('[Action Required]: Please configure server/.env with your MongoDB Atlas credentials:');
    console.warn('  MONGODB_URI=mongodb+srv://<username>:<password>@mywebsitecluster.61me3dd.mongodb.net/nivara?retryWrites=true&w=majority');
    console.warn('  Ensure your IP is whitelisted in Atlas Network Access (e.g. 0.0.0.0/0 for development).');
    console.warn('[Startup Notice]: Server will run in connection-pending mode without crashing.');
    console.warn('============================================================\n');
    isConnected = false;
    return false;
  }

  try {
    console.log(`[MongoDB Atlas] Attempting connection to ${sanitizeUri(uri)}...`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      dbName: process.env.MONGODB_DB_NAME || 'nivara',
    });

    isConnected = true;
    console.log(`[MongoDB Atlas] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.error('\n============================================================');
    console.error('[MongoDB Atlas Connection Error]:');
    console.error(`  Reason: ${error.message}`);
    console.error('[Troubleshooting Diagnostics]:');
    console.error('  1. Verify the MongoDB Atlas user and password in server/.env.');
    console.error('  2. In MongoDB Atlas, verify "Network Access" includes your IP address or 0.0.0.0/0.');
    console.error('  3. In MongoDB Atlas, verify "Database Access" user has readWrite role on "nivara".');
    console.error('[Startup Notice]: Server remains active. Endpoints requiring DB will return 503 until connection is established.');
    console.error('============================================================\n');
    return false;
  }
};

// Monitor connection events
mongoose.connection.on('disconnected', () => {
  if (isConnected) {
    console.warn('[MongoDB Atlas] Disconnected from database cluster.');
    isConnected = false;
  }
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB Atlas] Reconnected to database cluster.');
  isConnected = true;
});

const isDatabaseConnected = () => {
  return isConnected && mongoose.connection.readyState === 1;
};

const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('[MongoDB Atlas] Connection closed cleanly.');
  }
};

module.exports = {
  connectDB,
  isDatabaseConnected,
  closeDB,
  sanitizeUri,
};
