const Appointment = require('../models/Appointment');
const PatientProfile = require('../models/PatientProfile');
const User = require('../models/User');

// @desc    Get appointments based on role and filters
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res, next) => {
  try {
    const { date, status, limit = 100 } = req.query;
    let query = {};

    if (req.user.role === 'patient') {
      // Patients strictly see ONLY their own appointments
      query.patientId = req.user._id;
    } else if (req.user.role === 'healthcare_worker') {
      if (req.query.assignedOnly === 'true') {
        query.healthcareWorkerId = req.user._id;
      }
    }

    if (date) {
      query.date = date;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name phone email')
      .populate('healthcareWorkerId', 'name phone')
      .populate('healthcareCenterId', 'name village district workingHours contact')
      .sort({ date: 1, time: 1 })
      .limit(Number(limit));

    // Attach patient profile data (age, village, gender) for clinical context
    const patientUserIds = appointments
      .map((a) => a.patientId?._id)
      .filter(Boolean);
    const profiles = await PatientProfile.find({ userId: { $in: patientUserIds } });
    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.userId.toString()] = p;
    });

    const enriched = appointments.map((a) => {
      const pDoc = a.patientId ? profileMap[a.patientId._id.toString()] : null;
      return {
        _id: a._id,
        patient: a.patientId
          ? {
              _id: a.patientId._id,
              name: a.patientId.name,
              phone: a.patientId.phone,
              email: a.patientId.email,
              age: pDoc?.age || 'N/A',
              gender: pDoc?.gender || 'N/A',
              village: pDoc?.village || 'Local Village',
              emergencyContact: pDoc?.emergencyContact || '',
            }
          : { name: 'Unknown Patient' },
        healthcareWorker: a.healthcareWorkerId
          ? {
              _id: a.healthcareWorkerId._id,
              name: a.healthcareWorkerId.name,
              phone: a.healthcareWorkerId.phone,
            }
          : null,
        center: a.healthcareCenterId,
        service: a.service,
        date: a.date,
        time: a.time,
        status: a.status,
        notes: a.notes,
        createdAt: a.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Book appointment
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = async (req, res, next) => {
  try {
    const {
      healthcareCenterId,
      service,
      healthcareWorkerId,
      date,
      time,
      notes = '',
      patientId: overridePatientId,
    } = req.body;

    if (!healthcareCenterId || !service || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Please provide healthcare center, service, appointment date, and time',
      });
    }

    // Role check: Only workers or admins can book on behalf of another patient
    let targetPatientId = req.user._id;
    if (
      (req.user.role === 'healthcare_worker' || req.user.role === 'admin') &&
      overridePatientId
    ) {
      targetPatientId = overridePatientId;
    }

    const appointment = await Appointment.create({
      patientId: targetPatientId,
      healthcareCenterId,
      healthcareWorkerId: healthcareWorkerId || null,
      service,
      date,
      time,
      status: 'Confirmed',
      notes,
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('patientId', 'name phone')
      .populate('healthcareWorkerId', 'name')
      .populate('healthcareCenterId', 'name village district contact');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status / details
// @route   PUT /api/appointments/:id
// @access  Private (Patient, Healthcare Worker, Admin)
exports.updateAppointment = async (req, res, next) => {
  try {
    const { status, notes, healthcareWorkerId } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Role-specific authorization
    if (req.user.role === 'patient') {
      // Patients can only cancel their own appointments
      if (appointment.patientId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You cannot modify appointments of other patients.',
        });
      }

      if (status && status !== 'Cancelled') {
        return res.status(403).json({
          success: false,
          message: 'Patients may only cancel their appointment.',
        });
      }
    }

    if (status) appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;
    if (healthcareWorkerId) appointment.healthcareWorkerId = healthcareWorkerId;

    await appointment.save();

    const populated = await Appointment.findById(appointment._id)
      .populate('patientId', 'name phone')
      .populate('healthcareWorkerId', 'name')
      .populate('healthcareCenterId', 'name village district');

    res.status(200).json({
      success: true,
      message: `Appointment updated to '${appointment.status}'`,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private
exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (
      req.user.role === 'patient' &&
      appointment.patientId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You cannot cancel another patient’s appointment.',
      });
    }

    appointment.status = 'Cancelled';
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully.',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};
