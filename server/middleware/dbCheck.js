const { isDatabaseConnected } = require('../config/db');

// Middleware to ensure database is available before executing DB operations
const requireDB = (req, res, next) => {
  if (!isDatabaseConnected()) {
    return res.status(503).json({
      success: false,
      code: 'DATABASE_UNAVAILABLE',
      message:
        'MongoDB Atlas connection is currently unavailable. Please configure your Atlas credentials in server/.env and ensure Network Access (IP whitelist) is open.',
    });
  }
  next();
};

module.exports = { requireDB };
