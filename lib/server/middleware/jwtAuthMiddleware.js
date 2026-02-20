const { verifyToken, extractToken } = require('../utils/jwt');

/**
 * Middleware to verify user JWT
 */
function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization header required.'
      });
    }

    const decoded = verifyToken(token);

    if (!decoded || decoded.type !== 'user') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Attach decoded token to request
    req.user = decoded;
    next();

  } catch (err) {
    console.error('JWT verification error:', err.message);
    return res.status(401).json({
      success: false,
      message: 'Token verification failed'
    });
  }
}

/**
 * Middleware to verify admin JWT
 */
function authenticateAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization header required.'
      });
    }

    const decoded = verifyToken(token);

    if (!decoded || decoded.type !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Admin token required'
      });
    }

    req.admin = decoded;
    next();

  } catch (err) {
    console.error('JWT verification error:', err.message);
    return res.status(401).json({
      success: false,
      message: 'Token verification failed'
    });
  }
}

/**
 * Optional middleware - allows both authenticated and unauthenticated
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = extractToken(authHeader);

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
}

module.exports = {
  authenticateUser,
  authenticateAdmin,
  optionalAuth
};
