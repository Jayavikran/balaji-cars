const asyncHandler = require('express-async-handler');
const validator = require('validator');
const Enquiry = require('../models/Enquiry');
const Car = require('../models/Car');

// POST /api/enquiries  (public: customer submits enquiry from a car page)
const createEnquiry = asyncHandler(async (req, res) => {
  const { customerName, phone, whatsapp, email, carId, message } = req.body;

  if (!customerName || !phone) {
    res.status(400);
    throw new Error('Name and phone number are required.');
  }

  // Same 10-digit rule already enforced on the Contact page form —
  // applied consistently here so both entry points (Contact page and
  // per-car EnquiryForm) can't save malformed phone numbers.
  if (!/^[0-9]{10}$/.test(String(phone).trim())) {
    res.status(400);
    throw new Error('Please enter a valid 10-digit phone number.');
  }

  if (email && !validator.isEmail(String(email).trim())) {
    res.status(400);
    throw new Error('Please enter a valid email address.');
  }

  let carSnapshot;
  if (carId) {
    const car = await Car.findById(carId).select('brand model variant price').lean();
    if (car) carSnapshot = { brand: car.brand, model: car.model, variant: car.variant, price: car.price };
  }

  const enquiry = await Enquiry.create({
    customerName,
    phone,
    whatsapp,
    email,
    car: carId || undefined,
    carSnapshot,
    message,
  });

  res.status(201).json({ success: true, enquiry });
});

// GET /api/admin/enquiries  (admin only)
const getEnquiries = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const pageSize = Math.min(parseInt(req.query.pageSize, 10) || 20, 100);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [enquiries, total] = await Promise.all([
    Enquiry.find(filter)
      .populate('car', 'brand model variant price images')
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Enquiry.countDocuments(filter),
  ]);

  res.json({
    success: true,
    enquiries,
    pagination: { page, pageSize, total, totalPages: Math.max(Math.ceil(total / pageSize), 1) },
  });
});

// PATCH /api/admin/enquiries/:id/status
const updateEnquiryStatus = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  if (!enquiry) {
    res.status(404);
    throw new Error('Enquiry not found.');
  }
  res.json({ success: true, enquiry });
});

// DELETE /api/admin/enquiries/:id
const deleteEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
  if (!enquiry) {
    res.status(404);
    throw new Error('Enquiry not found.');
  }
  res.json({ success: true, message: 'Enquiry deleted.' });
});

module.exports = { createEnquiry, getEnquiries, updateEnquiryStatus, deleteEnquiry };
