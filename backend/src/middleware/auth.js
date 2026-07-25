const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * Protects a route: requires a valid JWT (from httpOnly cookie or
 * Authorization: Bearer header) tied to an active user.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.adminToken) {
    token = req.cookies.adminToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized. Please log in as admin.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      res.status(401);
      throw new Error('Session invalid. Please log in again.');
    }

    req.user = user;
    next();
  } catch (err) {
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
