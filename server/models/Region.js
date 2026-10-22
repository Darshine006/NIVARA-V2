const mongoose = require('mongoose');

const regionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide region name'],
      unique: true,
      trim: true,
      index: true,
    },
    defaultLanguage: {
      type: String,
      required: true,
      default: 'en',
    },
    supportedLanguages: {
      type: [String],
      required: true,
      default: ['en', 'ta', 'hi'],
    },
    services: {
      type: [String],
      required: true,
      default: [
        'General Consultation',
        'Maternal & Child Health',
        'Vaccination',
        'Telemedicine',
        'Basic Diagnostics',
        'Pharmacy & Medications',
      ],
    },
    districts: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: '',
    },
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

module.exports = mongoose.model('Region', regionSchema);
