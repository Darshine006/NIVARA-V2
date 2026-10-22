const mongoose = require('mongoose');

const healthcareCenterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide center name'],
      trim: true,
    },
    village: {
      type: String,
      required: [true, 'Please provide village or locality'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'Please provide district'],
      trim: true,
      index: true,
    },
    state: {
      type: String,
      required: [true, 'Please provide state'],
      trim: true,
      index: true,
    },
    services: {
      type: [String],
      required: [true, 'Please provide list of available services'],
      default: [
        'General Consultation',
        'Maternal & Child Health',
        'Vaccination',
        'Basic Diagnostics',
        'Emergency First Aid',
      ],
      index: true,
    },
    contact: {
      type: String,
      required: [true, 'Please provide contact phone number'],
      trim: true,
    },
    workingHours: {
      type: String,
      required: [true, 'Please provide working hours'],
      default: '08:00 AM - 04:00 PM (Mon-Sat)',
    },
    healthcareWorkers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('HealthcareCenter', healthcareCenterSchema);
