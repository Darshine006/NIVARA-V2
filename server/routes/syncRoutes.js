const express = require('express');
const router = express.Router();
const { syncOfflineData, getStats } = require('../controllers/syncController');
const { protect, authorize } = require('../middleware/auth');
const { requireDB } = require('../middleware/dbCheck');

// Synchronize offline patients and records
router.post('/sync', requireDB, protect, authorize('healthcare_worker', 'admin'), syncOfflineData);

// System overview stats for Admin Dashboard
router.get('/stats', requireDB, protect, authorize('admin'), getStats);

module.exports = router;
