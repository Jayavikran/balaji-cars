const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * Protects a route: requires a valid JWT (from httpOnly cookie or
 * Authorization: Bearer header) tied to an active user.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check for multiple possible cookie names for flexibility
  if (req.cookies) {
    // Prioritize 'adminToken', but also check for 'token' or 'jwt' commonly set by frontends
    token = req.cookies.adminToken || req.cookies.token || req.cookies.jwt;
  }

  // 2. Fallback to Authorization header
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // DEBUG LOG: Uncomment the line below to see what the server receives in Render logs
  // console.log(`[Auth Debug] Token found: ${token ? 'Yes' : 'No'}, Cookie keys: ${Object.keys(req.cookies || {})}`);

  if (!token) {
    res.status(401);
    throw new Error('Not authorized. Please log in as admin.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password'); // don't send password back

    if (!user) {
      res.status(401);
      throw new Error('User not found. Please log in again.');
    }
    
    if (!user.isActive) {
      res.status(401);
      throw new Error('Account is deactivated. Please contact support.');
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(`[Auth Error] ${err.message}`);
    res.status(401);
    throw new Error('Session expired or invalid token. Please log in again.');
  }
});

/**
 * Role gate - use after `protect`. Example: authorize('superadmin')
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    throw new Error('You do not have permission to perform this action.');
  }
  next();
};

module.exports = { protect, authorize };