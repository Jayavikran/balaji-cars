const express = require('express');
const { getPublicSettings, updateSettings } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');
const { logoUpload } = require('../middleware/upload');

const router = express.Router();

// Every route in this router requires an authenticated admin — unlike
// settingsRoutes.js (mounted at /api/settings), which is intentionally
// public read-only. Previously both /api/settings and /api/admin/settings
// were mounted to the same public router, so GET /api/admin/settings had
// no auth check despite the "admin" URL implying one.
router.use(protect, authorize('admin', 'superadmin'));

router.get('/', getPublicSettings);
router.put('/', logoUpload.single('logo'), updateSettings);

module.exports = router;
