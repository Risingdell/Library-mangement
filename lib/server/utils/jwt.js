const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'library-jwt-secret-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'library-refresh-secret';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

/**
 * Generate JWT for user
 */
function generateUserToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    type: 'user',
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
    algorithm: 'HS256'
  });
}

/**
 * Generate JWT for admin
 */
function generateAdminToken(admin) {
  const payload = {
    id: admin.id,
    username: admin.username,
    name: admin.name,
    type: 'admin',
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_ADMIN_EXPIRY || JWT_EXPIRY,
    algorithm: 'HS256'
  });
}

/**
 * Generate Refresh Token (optional - for enhanced security)
 */
function generateRefreshToken(userId, type = 'user') {
  const payload = {
    id: userId,
    type: type,
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRY,
    algorithm: 'HS256'
  });
}

/**
 * Verify JWT Token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256']
    });
  } catch (err) {
    return null;
  }
}

/**
 * Verify Refresh Token
 */
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      algorithms: ['HS256']
    });
  } catch (err) {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
function extractToken(authHeader) {
  if (!authHeader) return null;

  // Format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1];
  }

  return null;
}

/**
 * Decode token without verification (for debugging)
 */
function decodeToken(token) {
  return jwt.decode(token);
}

module.exports = {
  generateUserToken,
  generateAdminToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  extractToken,
  decodeToken
};
