const User = require('../models/User');
const HealthcareCenter = require('../models/HealthcareCenter');
const MedicalRecord = require('../models/MedicalRecord');

// @desc    Get users for Admin Management
// @route   GET /api/admin/users
// @access  Private (admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 50 } = req.query;
    let query = {};

    if (role && role !== 'All') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new Healthcare Worker (Admin Only)
// @route   POST /api/admin/workers
// @access  Private (admin)
exports.createHealthcareWorker = async (req, res, next) => {
  try {
    const { name, email, password, phone, region = 'Tamil Nadu', centerId } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, temporary password, and phone number',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const worker = await User.create({
      name,
      email,
      password,
      phone,
      role: 'healthcare_worker',
      region,
    });

    // Optionally associate with center
    if (centerId) {
      await HealthcareCenter.findByIdAndUpdate(centerId, {
        $addToSet: { healthcareWorkers: worker._id },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Healthcare worker account created successfully',
      data: {
        id: worker._id,
        name: worker.name,
        email: worker.email,
        phone: worker.phone,
        role: worker.role,
        region: worker.region,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status (Active / Deactive)
// @route   PUT /api/admin/users/:id/status
// @access  Private (admin)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Protect super admin from self-deactivation
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own active administrator account.',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User status changed to ${user.isActive ? 'Active' : 'Inactive'}`,
      data: { id: user._id, isActive: user.isActive },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed sync activity
// @route   GET /api/admin/sync-status
// @access  Private (admin)
exports.getSyncStatus = async (req, res, next) => {
  try {
    const offlineRecords = await MedicalRecord.find({ isOfflineCreated: true })
      .populate('patientId', 'name phone')
      .populate('healthcareWorkerId', 'name')
      .sort({ syncedAt: -1 })
      .limit(20);

    const totalOfflineRecords = await MedicalRecord.countDocuments({ isOfflineCreated: true });

    res.status(200).json({
      success: true,
      totalOfflineRecords,
      recentSyncs: offlineRecords,
    });
  } catch (error) {
    next(error);
  }
};
