const express = require('express');
const { getPublicSettings } = require('../controllers/settingsController');

const router = express.Router();

// Public - GET settings only. Admin read/write lives in
// adminSettingsRoutes.js (mounted at /api/admin/settings), which requires
// authentication for both GET and PUT.
router.get('/', getPublicSettings);

module.exports = router;