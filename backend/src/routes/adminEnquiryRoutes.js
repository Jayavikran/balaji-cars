const express = require('express');
const {
  getEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
} = require('../controllers/enquiryController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin', 'superadmin'));

router.get('/', getEnquiries);
router.patch('/:id/status', updateEnquiryStatus);
router.delete('/:id', deleteEnquiry);

module.exports = router;
