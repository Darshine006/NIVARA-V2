const express = require('express');
const router = express.Router();
const {
  getRegions,
  getRegionById,
  createRegion,
  updateRegion,
} = require('../controllers/regionController');
const { protect, authorize } = require('../middleware/auth');
const { requireDB } = require('../middleware/dbCheck');

router.get('/', requireDB, getRegions);
router.get('/:id', requireDB, getRegionById);
router.post('/', requireDB, protect, authorize('admin'), createRegion);
router.put('/:id', requireDB, protect, authorize('admin'), updateRegion);

module.exports = router;
