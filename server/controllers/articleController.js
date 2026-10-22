const HealthArticle = require('../models/HealthArticle');

// @desc    Get all health articles with filters
// @route   GET /api/articles
// @access  Public
exports.getArticles = async (req, res, next) => {
  try {
    const { category, language, region, search } = req.query;

    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (language && language !== 'All') {
      query.language = language;
    }

    if (region && region !== 'All') {
      query.$or = [{ region: region }, { region: 'All' }];
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { symptoms: { $regex: search, $options: 'i' } },
        { prevention: { $regex: search, $options: 'i' } },
      ];
    }

    const articles = await HealthArticle.find(query).sort({ category: 1, title: 1 });

    res.status(200).json({
      success: true,
      count: articles.length,
      disclaimer:
        'This information is for educational purposes and does not replace professional medical advice.',
      data: articles,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single article
// @route   GET /api/articles/:id
// @access  Public
exports.getArticleById = async (req, res, next) => {
  try {
    const article = await HealthArticle.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Health article not found' });
    }

    res.status(200).json({
      success: true,
      disclaimer:
        'This information is for educational purposes and does not replace professional medical advice.',
      data: article,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new health article
// @route   POST /api/articles
// @access  Private (admin)
exports.createArticle = async (req, res, next) => {
  try {
    const { title, category, content, symptoms, prevention, whenToSeekHelp, language, region } =
      req.body;

    if (!title || !category || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, category, and educational content',
      });
    }

    const article = await HealthArticle.create({
      title,
      category,
      content,
      symptoms: symptoms || '',
      prevention: prevention || '',
      whenToSeekHelp: whenToSeekHelp || '',
      language: language || 'en',
      region: region || 'All',
    });

    res.status(201).json({
      success: true,
      message: 'Health article created successfully',
      data: article,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update health article
// @route   PUT /api/articles/:id
// @access  Private (admin)
exports.updateArticle = async (req, res, next) => {
  try {
    const article = await HealthArticle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Article updated successfully',
      data: article,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete health article
// @route   DELETE /api/articles/:id
// @access  Private (admin)
exports.deleteArticle = async (req, res, next) => {
  try {
    const article = await HealthArticle.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Article removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
