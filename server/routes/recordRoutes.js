const express = require('express');
const router = express.Router();
const {
  getPatientRecords,
  createRecord,
} = require('../controllers/recordController');
const { protect, authorize } = require('../middleware/auth');
const { requireDB } = require('../middleware/dbCheck');

router.get('/:patientId', requireDB, protect, getPatientRecords);
router.post('/', requireDB, protect, authorize('healthcare_worker', 'admin'), createRecord);

module.exports = router;
