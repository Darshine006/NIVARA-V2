const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    healthcareWorkerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    healthcareCenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HealthcareCenter',
      required: true,
      index: true,
    },
    service: {
      type: String,
      required: [true, 'Please select a healthcare service'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Please select appointment date'],
      index: true,
    },
    time: {
      type: String,
      required: [true, 'Please select appointment time'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
