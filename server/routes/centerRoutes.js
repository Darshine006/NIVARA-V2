const express = require('express');
const router = express.Router();
const {
  getCenters,
  getCenterById,
  createCenter,
  updateCenter,
  deleteCenter,
} = require('../controllers/centerController');
const { protect, authorize } = require('../middleware/auth');
const { requireDB } = require('../middleware/dbCheck');

router.get('/', requireDB, getCenters);
router.get('/:id', requireDB, getCenterById);
router.post('/', requireDB, protect, authorize('admin'), createCenter);
router.put('/:id', requireDB, protect, authorize('admin'), updateCenter);
router.delete('/:id', requireDB, protect, authorize('admin'), deleteCenter);

module.exports = router;
