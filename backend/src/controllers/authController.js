const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// Cookie domain is configurable via env var so it can match whatever domain
// the API is actually served from in production (e.g. balajicars.in).
// Leaving COOKIE_DOMAIN unset means no explicit `domain` attribute is sent,
// so the cookie correctly defaults to the responding host.
// Cookie domain is configurable via env var or dynamically detected from request header
// so it matches whatever domain the API is actually served from in production (e.g. balajicars.in).
const cookieOptions = (req, rememberMe = false) => {
  const isProduction = process.env.NODE_ENV === 'production';

  let domain = undefined;
  if (isProduction) {
    if (process.env.COOKIE_DOMAIN) {
      domain = process.env.COOKIE_DOMAIN;
    } else if (req && req.headers && req.headers.host) {
      const host = req.headers.host.split(':')[0];
      if (host.endsWith('balajicars.in')) {
        domain = '.balajicars.in';
      }
    }
  }

  return {
    httpOnly: true,
    secure: isProduction, // Must be true for HTTPS in production (required for SameSite=None)
    sameSite: isProduction ? 'none' : 'lax', // Lax for local development, None for production cross-site domains
    maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000,
    path: '/',
    domain: domain
  };
};

// POST /api/admin/auth/login - SIMPLIFIED
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required.');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  if (!user.isActive) {
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
  const options = cookieOptions(req, Boolean(rememberMe));

  res.cookie('adminToken', token, options);

  res.json({
    success: true,
    token,
    user: user.toSafeObject(),
  });
});

// POST /api/admin/auth/logout
const logoutAdmin = asyncHandler(async (req, res) => {
  // clearCookie must be called with the same attributes (domain/path/etc.)
  // the cookie was originally set with, or the browser won't remove it.
  const { maxAge, ...clearOptions } = cookieOptions(req, false);

  res.clearCookie('adminToken', clearOptions);
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

  if (!user) {
    return res.json({
      success: true,
      message: 'If that email exists, a reset link has been sent.',
    });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
  await user.save();

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