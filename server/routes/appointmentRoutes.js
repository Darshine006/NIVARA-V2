const express = require('express');
const router = express.Router();
const {
  getAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');
const { requireDB } = require('../middleware/dbCheck');

router.get('/', requireDB, protect, getAppointments);
router.post('/', requireDB, protect, createAppointment);
router.put('/:id', requireDB, protect, updateAppointment);
router.delete('/:id', requireDB, protect, cancelAppointment);

module.exports = router;
