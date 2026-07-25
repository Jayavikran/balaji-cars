const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const cookieOptions = (rememberMe) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000,
});

// POST /api/admin/auth/login
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required.');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !user.isActive) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken(user._id, Boolean(rememberMe));
  res.cookie('adminToken', token, cookieOptions(Boolean(rememberMe)));

  res.json({
    success: true,
    token, // also returned for clients using Authorization header (e.g. mobile)
    user: user.toSafeObject(),
  });
});

// POST /api/admin/auth/logout
const logoutAdmin = asyncHandler(async (req, res) => {
  res.clearCookie('adminToken');
  res.json({ success: true, message: 'Logged out.' });
});

// GET /api/admin/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});

// POST /api/admin/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });

  // Always respond the same way to avoid leaking which emails exist.
  if (!user) {
    return res.json({
      success: true,
      message: 'If that email exists, a reset link has been sent.',
    });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  // In production: email this link via a transactional email provider.
  // For local/dev, it's returned so you can test the flow end-to-end.
  const resetUrl = `${process.env.CLIENT_URL}/admin/reset-password/${resetToken}`;

  res.json({
    success: true,
    message: 'If that email exists, a reset link has been sent.',
    devResetUrl: process.env.NODE_ENV !== 'production' ? resetUrl : undefined,
  });
});

// POST /api/admin/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+password +passwordResetToken +passwordResetExpires');

  if (!user) {
    res.status(400);
    throw new Error('Reset link is invalid or has expired.');
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Password updated. You can now log in.' });
});

module.exports = { loginAdmin, logoutAdmin, getMe, forgotPassword, resetPassword };
