const mongoose = require('mongoose');

const patientProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    age: {
      type: Number,
      required: [true, 'Please provide age'],
      min: [0, 'Age cannot be negative'],
      max: [130, 'Please enter a valid age'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Please specify gender'],
    },
    village: {
      type: String,
      required: [true, 'Please provide village or town'],
      trim: true,
      index: true,
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
    emergencyContact: {
      type: String,
      required: [true, 'Please provide emergency contact number'],
      trim: true,
    },
    bloodGroup: {
      type: String,
      trim: true,
      default: 'Unknown',
    },
    allergies: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PatientProfile', patientProfileSchema);
