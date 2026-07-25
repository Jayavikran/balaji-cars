const asyncHandler = require('express-async-handler');
const Settings = require('../models/Settings');

// GET /api/settings  (public: header/footer/contact info)
const getPublicSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  res.json({ success: true, settings });
});

// PUT /api/admin/settings  (admin only)
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();

  Object.assign(settings, req.body);
  if (req.file) settings.companyLogo = req.file.path;

  await settings.save();
  res.json({ success: true, settings });
});

module.exports = { getPublicSettings, updateSettings };
