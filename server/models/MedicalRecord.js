const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
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
      required: true,
      index: true,
    },
    consultationDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    symptoms: {
      type: String,
      required: [true, 'Please provide observed symptoms'],
      trim: true,
    },
    diagnosis: {
      type: String,
      required: [true, 'Please provide clinical diagnosis or assessment'],
      trim: true,
    },
    prescription: {
      type: String,
      required: [true, 'Please provide prescription and treatment plan'],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    isOfflineCreated: {
      type: Boolean,
      default: false,
    },
    clientTempId: {
      type: String,
      default: null,
      index: true,
    },
    syncedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
