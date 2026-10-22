const express = require('express');
const router = express.Router();
const {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
} = require('../controllers/articleController');
const { protect, authorize } = require('../middleware/auth');
const { requireDB } = require('../middleware/dbCheck');

router.get('/', requireDB, getArticles);
router.get('/:id', requireDB, getArticleById);
router.post('/', requireDB, protect, authorize('admin'), createArticle);
router.put('/:id', requireDB, protect, authorize('admin'), updateArticle);
router.delete('/:id', requireDB, protect, authorize('admin'), deleteArticle);

module.exports = router;
