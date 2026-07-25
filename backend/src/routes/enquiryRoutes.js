const express = require('express');
const { createEnquiry } = require('../controllers/enquiryController');

const router = express.Router();

// Public - customer submits an enquiry from a car detail page.
router.post('/', createEnquiry);

module.exports = router;
