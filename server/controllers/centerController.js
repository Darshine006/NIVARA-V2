const HealthcareCenter = require('../models/HealthcareCenter');
const User = require('../models/User');

// @desc    Get all healthcare centers with filters
// @route   GET /api/centers
// @access  Public
exports.getCenters = async (req, res, next) => {
  try {
    const { state, district, service, search } = req.query;

    const query = { isActive: true };

    if (state && state !== 'All') {
      query.state = { $regex: state, $options: 'i' };
    }

    if (district && district !== 'All') {
      query.district = { $regex: district, $options: 'i' };
    }

    if (service && service !== 'All') {
      query.services = { $in: [new RegExp(service, 'i')] };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } },
      ];
    }

    const centers = await HealthcareCenter.find(query)
      .populate('healthcareWorkers', 'name phone email role')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: centers.length,
      data: centers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get center by ID
// @route   GET /api/centers/:id
// @access  Public
exports.getCenterById = async (req, res, next) => {
  try {
    const center = await HealthcareCenter.findById(req.params.id).populate(
      'healthcareWorkers',
      'name phone email role'
    );

    if (!center) {
      return res.status(404).json({ success: false, message: 'Healthcare center not found' });
    }

    res.status(200).json({
      success: true,
      data: center,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new healthcare center
// @route   POST /api/centers
// @access  Private (admin)
exports.createCenter = async (req, res, next) => {
  try {
    const { name, village, district, state, services, contact, workingHours, healthcareWorkers } =
      req.body;

    if (!name || !village || !district || !state || !contact) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, village, district, state, and contact number',
      });
    }

    const center = await HealthcareCenter.create({
      name,
      village,
      district,
      state,
      services: services || [
        'General Consultation',
        'Maternal & Child Health',
        'Vaccination',
        'Basic Diagnostics',
      ],
      contact,
      workingHours: workingHours || '08:00 AM - 04:00 PM (Mon-Sat)',
      healthcareWorkers: healthcareWorkers || [],
    });

    res.status(201).json({
      success: true,
      message: 'Healthcare center created successfully',
      data: center,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update healthcare center
// @route   PUT /api/centers/:id
// @access  Private (admin)
exports.updateCenter = async (req, res, next) => {
  try {
    const center = await HealthcareCenter.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!center) {
      return res.status(404).json({ success: false, message: 'Healthcare center not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Healthcare center updated successfully',
      data: center,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete healthcare center (soft delete)
// @route   DELETE /api/centers/:id
// @access  Private (admin)
exports.deleteCenter = async (req, res, next) => {
  try {
    const center = await HealthcareCenter.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!center) {
      return res.status(404).json({ success: false, message: 'Healthcare center not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Healthcare center deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};
