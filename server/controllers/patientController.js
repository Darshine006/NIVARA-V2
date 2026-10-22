const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');

// @desc    Get all patients (Worker / Admin)
// @route   GET /api/patients
// @access  Private (healthcare_worker, admin)
exports.getPatients = async (req, res, next) => {
  try {
    const { search, village, limit = 50, page = 1 } = req.query;

    let query = { role: 'patient' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    // Fetch corresponding profiles
    const userIds = users.map((u) => u._id);
    const profiles = await PatientProfile.find({ userId: { $in: userIds } });
    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.userId.toString()] = p;
    });

    let combined = users.map((u) => {
      const prof = profileMap[u._id.toString()] || {};
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        region: u.region,
        age: prof.age || 0,
        gender: prof.gender || 'Not specified',
        village: prof.village || 'N/A',
        district: prof.district || 'N/A',
        state: prof.state || 'N/A',
        emergencyContact: prof.emergencyContact || 'N/A',
        bloodGroup: prof.bloodGroup || 'Unknown',
        createdAt: u.createdAt,
      };
    });

    if (village) {
      combined = combined.filter((c) =>
        c.village.toLowerCase().includes(village.toLowerCase())
      );
    }

    res.status(200).json({
      success: true,
      count: combined.length,
      total,
      data: combined,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single patient details by ID
// @route   GET /api/patients/:id
// @access  Private
exports.getPatientById = async (req, res, next) => {
  try {
    const patientId = req.params.id;

    // Strict Authorization Check: Patients can ONLY access their own data
    if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view another patient profile.',
      });
    }

    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const profile = await PatientProfile.findOne({ userId: patient._id });
    const appointments = await Appointment.find({ patientId: patient._id })
      .populate('healthcareCenterId', 'name village district contact')
      .populate('healthcareWorkerId', 'name phone')
      .sort({ date: -1 });

    const records = await MedicalRecord.find({ patientId: patient._id })
      .populate('healthcareWorkerId', 'name phone')
      .sort({ consultationDate: -1 });

    res.status(200).json({
      success: true,
      data: {
        user: patient,
        profile,
        appointments,
        records,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new patient by Healthcare Worker / Admin
// @route   POST /api/patients
// @access  Private (healthcare_worker, admin)
exports.registerPatientByWorker = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      email,
      age,
      gender,
      village,
      district,
      state,
      emergencyContact,
      bloodGroup = 'Unknown',
      preferredLanguage = 'en',
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least patient name and phone number',
      });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const patientEmail =
      email && email.trim() !== ''
        ? email.trim().toLowerCase()
        : `pat_${cleanPhone}_${Date.now().toString().slice(-4)}@nivara.in`;

    let user = await User.findOne({ email: patientEmail });
    if (user) {
      return res.status(400).json({
        success: false,
        message: `An account with email ${patientEmail} already exists.`,
      });
    }

    // Default password for clinic-registered patient
    const defaultPassword = `Nivara@${cleanPhone.slice(-4) || '1234'}`;

    user = await User.create({
      name,
      email: patientEmail,
      password: defaultPassword,
      phone,
      role: 'patient',
      preferredLanguage,
      region: state || req.user.region || 'Tamil Nadu',
    });

    const profile = await PatientProfile.create({
      userId: user._id,
      age: Number(age) || 30,
      gender: gender || 'Female',
      village: village || 'Local Village',
      district: district || 'Taluk Center',
      state: state || req.user.region || 'Tamil Nadu',
      emergencyContact: emergencyContact || phone,
      bloodGroup,
    });

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully by healthcare worker',
      data: {
        user,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};
