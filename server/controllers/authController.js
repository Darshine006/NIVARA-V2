const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const { isDatabaseConnected } = require('../config/db');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'nivara_default_secret_key_2026',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new patient
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      preferredLanguage = 'en',
      region = 'Tamil Nadu',
      age,
      gender,
      village,
      district,
      state,
      emergencyContact,
      bloodGroup,
    } = req.body;

    // Strict Security Rule: Public registration must never allow assigning healthcare_worker or admin role
    if (role && role !== 'patient') {
      return res.status(403).json({
        success: false,
        message:
          'Security restriction: Public registration is strictly reserved for patients. Healthcare workers and administrators must be provisioned by an administrator or the secure CLI provisioning tool.',
      });
    }

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, password, and phone number.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    if (!isDatabaseConnected()) {
      return res.status(503).json({
        success: false,
        code: 'DATABASE_UNAVAILABLE',
        message:
          'MongoDB Atlas connection is currently unavailable. Please configure your Atlas credentials in server/.env and ensure Network Access (IP whitelist) is open.',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in.',
      });
    }

    // Always create as patient through public registration
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'patient',
      preferredLanguage,
      region,
    });

    const profile = await PatientProfile.create({
      userId: user._id,
      age: age || 25,
      gender: gender || 'Female',
      village: village || 'Local Village',
      district: district || 'Community District',
      state: state || region || 'Tamil Nadu',
      emergencyContact: emergencyContact || phone,
      bloodGroup: bloodGroup || 'Unknown',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        region: user.region,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email address and password.',
      });
    }

    if (!isDatabaseConnected()) {
      return res.status(503).json({
        success: false,
        code: 'DATABASE_UNAVAILABLE',
        message:
          'MongoDB Atlas connection is currently unavailable. Please configure your Atlas credentials in server/.env and ensure Network Access (IP whitelist) is open.',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email and password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact an administrator.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email and password.',
      });
    }

    const token = generateToken(user._id);

    let profile = null;
    if (user.role === 'patient') {
      profile = await PatientProfile.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        region: user.region,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;
    if (user.role === 'patient') {
      profile = await PatientProfile.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User logged out successfully.',
  });
};
