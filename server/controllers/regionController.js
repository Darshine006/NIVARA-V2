const Region = require('../models/Region');

// @desc    Get all regional configurations
// @route   GET /api/regions
// @access  Public
exports.getRegions = async (req, res, next) => {
  try {
    const regions = await Region.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: regions.length,
      data: regions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single region
// @route   GET /api/regions/:id
// @access  Public
exports.getRegionById = async (req, res, next) => {
  try {
    const region = await Region.findById(req.params.id);
    if (!region) {
      return res.status(404).json({ success: false, message: 'Region configuration not found' });
    }
    res.status(200).json({
      success: true,
      data: region,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new regional deployment configuration
// @route   POST /api/regions
// @access  Private (admin)
exports.createRegion = async (req, res, next) => {
  try {
    const { name, defaultLanguage, supportedLanguages, services, districts, description } =
      req.body;

    if (!name || !defaultLanguage || !supportedLanguages || !services) {
      return res.status(400).json({
        success: false,
        message: 'Please provide region name, default language, supported languages, and services',
      });
    }

    const region = await Region.create({
      name,
      defaultLanguage,
      supportedLanguages,
      services,
      districts: districts || [],
      description: description || '',
    });

    res.status(201).json({
      success: true,
      message: 'Region configuration created successfully',
      data: region,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update regional configuration
// @route   PUT /api/regions/:id
// @access  Private (admin)
exports.updateRegion = async (req, res, next) => {
  try {
    const region = await Region.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!region) {
      return res.status(404).json({ success: false, message: 'Region not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Region updated successfully',
      data: region,
    });
  } catch (error) {
    next(error);
  }
};
