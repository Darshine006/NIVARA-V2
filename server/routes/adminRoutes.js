const express = require('express');
const router = express.Router();
const {
  getUsers,
  createHealthcareWorker,
  toggleUserStatus,
  getSyncStatus,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { requireDB } = require('../middleware/dbCheck');

// Protected admin-only management routes
router.use(protect, authorize('admin'));

router.get('/users', requireDB, getUsers);
router.post('/workers', requireDB, createHealthcareWorker);
router.put('/users/:id/status', requireDB, toggleUserStatus);
router.get('/sync-status', requireDB, getSyncStatus);

module.exports = router;
