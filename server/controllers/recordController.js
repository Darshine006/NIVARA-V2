const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @desc    Get medical records for a specific patient
// @route   GET /api/records/:patientId
// @access  Private (Patient themselves, Healthcare Worker, Admin)
exports.getPatientRecords = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    // Strict Authorization check: Patients can ONLY view their own records
    if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are only authorized to view your own medical records.',
      });
    }

    const records = await MedicalRecord.find({ patientId })
      .populate('healthcareWorkerId', 'name phone email role')
      .populate('patientId', 'name phone email')
      .sort({ consultationDate: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new medical record / consultation
// @route   POST /api/records
// @access  Private (healthcare_worker, admin)
exports.createRecord = async (req, res, next) => {
  try {
    const {
      patientId,
      symptoms,
      diagnosis,
      prescription,
      notes = '',
      followUpDate = null,
      appointmentId = null,
      clientTempId = null,
    } = req.body;

    if (!patientId || !symptoms || !diagnosis || !prescription) {
      return res.status(400).json({
        success: false,
        message: 'Please provide patient ID, symptoms, diagnosis, and prescription',
      });
    }

    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const record = await MedicalRecord.create({
      patientId,
      healthcareWorkerId: req.user._id,
      consultationDate: new Date(),
      symptoms,
      diagnosis,
      prescription,
      notes,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      clientTempId: clientTempId || null,
      isOfflineCreated: false,
      syncedAt: new Date(),
    });

    // If an appointment was linked, mark it completed!
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, { status: 'Completed' });
    }

    const populated = await MedicalRecord.findById(record._id)
      .populate('patientId', 'name phone email')
      .populate('healthcareWorkerId', 'name phone');

    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};
