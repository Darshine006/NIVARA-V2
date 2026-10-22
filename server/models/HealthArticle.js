const mongoose = require('mongoose');

const healthArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide article title'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        'Maternal Health',
        'Child Health',
        'Nutrition',
        'Hygiene',
        'Diabetes',
        'Blood Pressure',
        'Vaccination',
        'Common Diseases',
      ],
      required: [true, 'Please specify category'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Please provide article educational content'],
    },
    symptoms: {
      type: String,
      default: '',
    },
    prevention: {
      type: String,
      default: '',
    },
    whenToSeekHelp: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: 'en',
      index: true,
    },
    region: {
      type: String,
      default: 'All',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('HealthArticle', healthArticleSchema);
