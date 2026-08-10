const jwt = require('jsonwebtoken');

/**
 * Signs a JWT for a given user id.
 * @param {string} userId
 * @param {boolean} rememberMe - if true, uses the longer-lived expiry
 */
const generateToken = (userId, rememberMe = false) => {
  const expiresIn = rememberMe
    ? process.env.JWT_REMEMBER_EXPIRES_IN || '30d'
    : process.env.JWT_EXPIRES_IN || '7d';

  const secret = process.env.JWT_SECRET || 'replace_with_a_long_random_secret';
  return jwt.sign({ id: userId }, secret, { expiresIn });
};

module.exports = generateToken;
