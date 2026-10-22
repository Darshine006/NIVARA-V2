const express = require('express');
const router = express.Router();
const {
  getPatients,
  getPatientById,
  registerPatientByWorker,
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');
const { requireDB } = require('../middleware/dbCheck');

router.get('/', requireDB, protect, authorize('healthcare_worker', 'admin'), getPatients);
router.get('/:id', requireDB, protect, getPatientById);
router.post('/', requireDB, protect, authorize('healthcare_worker', 'admin'), registerPatientByWorker);

module.exports = router;
