const express = require('express');
const { getPublicSettings, updateSettings } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');
const { logoUpload } = require('../middleware/upload');

const router = express.Router();

// Public - GET settings
router.get('/', getPublicSettings);

// Admin only - PUT update settings
router.put('/', protect, authorize('admin', 'superadmin'), logoUpload.single('logo'), updateSettings);

module.exports = router;