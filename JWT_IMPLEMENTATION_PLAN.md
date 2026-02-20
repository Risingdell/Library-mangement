# JWT Authentication System Implementation Plan
## Library Management System - Complete Backend Conversion

**Status**: Comprehensive planning document for production-grade JWT migration
**Date**: February 19, 2025
**Priority**: CRITICAL - Solves all session/cookie issues

---

## EXECUTIVE SUMMARY

This document outlines the complete conversion from **session-based authentication** to **JWT (JSON Web Tokens)** with **bcrypt password hashing**. This approach:

✅ Eliminates all cross-origin cookie issues
✅ Works perfectly with Vercel (frontend) + Render (backend)
✅ Implements industry-standard security practices
✅ Reduces server session storage requirements
✅ Enables horizontal scaling across multiple instances
✅ Maintains user approval workflow

**Estimated Implementation Time**: 2-3 days
**Effort**: 40-60 hours of development

---

## PHASE 1: DEPENDENCIES & SETUP

### 1.1 Install Required Packages

```bash
cd lib/server
npm install bcryptjs jsonwebtoken dotenv-cli
npm install --save-dev cross-env
```

**Packages Purpose**:
- `bcryptjs`: Password hashing (10 rounds = secure & performant)
- `jsonwebtoken`: JWT creation & verification
- `dotenv-cli`: Better environment variable management

### 1.2 Update Environment Variables

**Create/Update `.env` file**:
```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-12345678901234567890
JWT_EXPIRY=24h
JWT_ADMIN_EXPIRY=24h

# Refresh Token (Optional - for enhanced security)
JWT_REFRESH_SECRET=your-refresh-secret-token-key-12345678901234567890
JWT_REFRESH_EXPIRY=7d

# Password Hashing
BCRYPT_ROUNDS=10

# Server Configuration
NODE_ENV=production
DB_HOST=biuezvkp1ir5odbq6wju-mysql.services.clever-cloud.com
DB_USER=u9vwnxvk2ljksy3a
DB_PASSWORD=your_password
DB_NAME=biuezvkp1ir5odbq6wju
PORT=5000
FRONTEND_URL=https://ad-lib-14.vercel.app
```

**Generate Secure JWT Secret**:
```bash
# Run this once to generate a secure key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 1.3 Create JWT Utility Module

**File**: `lib/server/utils/jwt.js`

```javascript
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
    expiresIn: JWT_ADMIN_EXPIRY || JWT_EXPIRY,
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
```

### 1.4 Create Password Hashing Utility

**File**: `lib/server/utils/password.js`

```javascript
const bcrypt = require('bcryptjs');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;

/**
 * Hash a plain-text password
 */
async function hashPassword(plainPassword) {
  try {
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    return await bcrypt.hash(plainPassword, salt);
  } catch (err) {
    console.error('Error hashing password:', err);
    throw new Error('Password hashing failed');
  }
}

/**
 * Compare plain-text password with hash
 */
async function comparePassword(plainPassword, hashedPassword) {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (err) {
    console.error('Error comparing passwords:', err);
    return false;
  }
}

/**
 * Validate password strength
 */
function validatePasswordStrength(password) {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letters');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain numbers');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain special characters (!@#$%^&*...)');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength
};
```

### 1.5 Create JWT Middleware

**File**: `lib/server/middleware/jwtAuthMiddleware.js`

```javascript
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
```

---

## PHASE 2: DATABASE MIGRATION

### 2.1 Create Migration Script

**File**: `lib/server/migrations/006_migrate_to_jwt_auth.sql`

```sql
-- Migration: Convert session-based auth to JWT with password hashing
-- Date: February 2025
-- Status: Initial password hash column creation

USE biuezvkp1ir5odbq6wju;

-- Step 1: Add password_hash column to users table
ALTER TABLE users
ADD COLUMN password_hash VARCHAR(255) NULL COMMENT 'bcrypt hashed password (new system)';

-- Step 2: Add password_hash column to admins table
ALTER TABLE admins
ADD COLUMN password_hash VARCHAR(255) NULL COMMENT 'bcrypt hashed password (new system)';

-- Step 3: Add JWT token blacklist table (for token revocation)
CREATE TABLE IF NOT EXISTS jwt_blacklist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL COMMENT 'NULL if admin logout',
  token_jti VARCHAR(255) UNIQUE COMMENT 'JWT ID (jti claim)',
  token_hash VARCHAR(255) COMMENT 'Hash of token for verification',
  blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP COMMENT 'When token expires (from exp claim)',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Blacklisted JWT tokens for revocation';

-- Step 4: Add login audit table
CREATE TABLE IF NOT EXISTS auth_audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  username VARCHAR(255) COMMENT 'Username attempted',
  auth_type ENUM('user', 'admin') COMMENT 'User or admin login',
  action ENUM('login_success', 'login_failed', 'logout', 'token_refresh') COMMENT 'Action performed',
  ip_address VARCHAR(45) COMMENT 'IPv4 or IPv6',
  user_agent VARCHAR(500) COMMENT 'Browser user agent',
  failure_reason VARCHAR(255) COMMENT 'Why login failed',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_username (username),
  INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Audit log for all authentication attempts';

-- Step 5: Create stored procedure to cleanup expired tokens
DELIMITER $$

CREATE PROCEDURE cleanup_expired_tokens()
BEGIN
  DELETE FROM jwt_blacklist
  WHERE expires_at < NOW();
END$$

DELIMITER ;

-- Step 6: Add event to run cleanup daily (optional)
CREATE EVENT IF NOT EXISTS cleanup_tokens_daily
ON SCHEDULE EVERY 1 DAY
DO CALL cleanup_expired_tokens();

-- Notes:
-- 1. password column will be kept for backward compatibility during transition
-- 2. password_hash column will be used by new JWT system
-- 3. Once all passwords migrated, password column can be dropped
-- 4. Migration status tracked in auth_audit_log
```

### 2.2 Execute Migration

```bash
cd lib/server
mysql -u u9vwnxvk2ljksy3a -p -h biuezvkp1ir5odbq6wju-mysql.services.clever-cloud.com < migrations/006_migrate_to_jwt_auth.sql
```

---

## PHASE 3: BACKEND IMPLEMENTATION

### 3.1 Update Registration Endpoint

**File**: `lib/server/index.js` (Lines 693-760)

```javascript
const { hashPassword, validatePasswordStrength } = require('./utils/password');
const { generateUserToken } = require('./utils/jwt');

app.post("/register", async (req, res) => {
  const { username, password, usn, firstName, lastName, email } = req.body;

  // Validate required fields
  if (!username || !password || !usn || !firstName || !lastName || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Validate USN format
  const usnPattern = /^[1-4]SN\d{2}AD\d{3}$/;
  if (!usnPattern.test(usn)) {
    return res.status(400).json({
      message: "Invalid USN format. Example: 1SN23AD001",
      invalidField: "usn"
    });
  }

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({
      message: "Password does not meet requirements",
      errors: passwordValidation.errors,
      invalidField: "password"
    });
  }

  try {
    // Hash password using bcrypt
    const hashedPassword = await hashPassword(password);

    const sql = `
      INSERT INTO users (username, password_hash, usn, firstName, lastName, email, approval_status, registered_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
    `;

    db.query(sql, [username, hashedPassword, usn, firstName, lastName, email], async (err, result) => {
      if (err) {
        console.error("Error registering user:", err);

        if (err.code === 'ER_DUP_ENTRY') {
          if (err.message.includes('username')) {
            return res.status(409).json({
              message: "Username already taken",
              invalidField: "username"
            });
          }
          if (err.message.includes('email')) {
            return res.status(409).json({
              message: "Email already registered",
              invalidField: "email"
            });
          }
          if (err.message.includes('usn')) {
            return res.status(409).json({
              message: "USN already registered",
              invalidField: "usn"
            });
          }
        }

        return res.status(500).json({ message: "Registration failed" });
      }

      // Send confirmation email (non-blocking)
      if (process.env.NODE_ENV === 'production') {
        sendRegistrationConfirmationEmail(email, firstName).catch(err => {
          console.error('Email send error:', err);
        });
      }

      // Log registration
      const auditSql = `
        INSERT INTO auth_audit_log (username, auth_type, action, ip_address, user_agent)
        VALUES (?, 'user', 'login_success', ?, ?)
      `;
      db.query(auditSql, [username, req.ip, req.headers['user-agent']], () => {});

      res.status(201).json({
        success: true,
        message: "Registration successful. Waiting for admin approval.",
        data: {
          username: username,
          email: email,
          status: "pending"
        }
      });
    });

  } catch (err) {
    console.error("Password hashing error:", err);
    return res.status(500).json({ message: "Registration failed" });
  }
});
```

### 3.2 Update User Login Endpoint

**File**: `lib/server/index.js` (Lines 762-829)

```javascript
const { comparePassword } = require('./utils/password');
const { generateUserToken, generateRefreshToken } = require('./utils/jwt');

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required",
      code: "MISSING_CREDENTIALS"
    });
  }

  try {
    const sql = `
      SELECT id, username, firstName, lastName, email, usn, password_hash, approval_status, rejection_reason
      FROM users
      WHERE username = ?
    `;

    db.query(sql, [username], async (err, results) => {
      if (err) {
        console.error("Database error during login:", err);
        return res.status(500).json({ message: "Login failed" });
      }

      // Log login attempt
      const auditSql = `
        INSERT INTO auth_audit_log (username, auth_type, action, ip_address, user_agent, failure_reason)
        VALUES (?, 'user', ?, ?, ?, ?)
      `;

      // User not found
      if (results.length === 0) {
        db.query(auditSql, [username, 'login_failed', req.ip, req.headers['user-agent'], 'User not found'], () => {});
        return res.status(401).json({
          message: "Invalid credentials",
          code: "INVALID_CREDENTIALS"
        });
      }

      const user = results[0];

      // Check approval status BEFORE validating password
      if (user.approval_status === 'pending') {
        db.query(auditSql, [username, 'login_failed', req.ip, req.headers['user-agent'], 'Pending approval'], () => {});
        return res.status(403).json({
          message: "Your registration is pending admin approval. Please wait or contact support.",
          code: "PENDING_APPROVAL",
          status: "pending"
        });
      }

      if (user.approval_status === 'rejected') {
        db.query(auditSql, [username, 'login_failed', req.ip, req.headers['user-agent'], 'Rejected'], () => {});
        return res.status(403).json({
          message: `Your registration was rejected. Reason: ${user.rejection_reason || 'No reason provided'}`,
          code: "REGISTRATION_REJECTED",
          status: "rejected"
        });
      }

      // Validate password using bcrypt
      try {
        const passwordMatch = await comparePassword(password, user.password_hash);

        if (!passwordMatch) {
          db.query(auditSql, [username, 'login_failed', req.ip, req.headers['user-agent'], 'Wrong password'], () => {});
          return res.status(401).json({
            message: "Invalid credentials",
            code: "INVALID_CREDENTIALS"
          });
        }

        // Password correct - generate tokens
        const token = generateUserToken({
          id: user.id,
          username: user.username,
          email: user.email
        });

        const refreshToken = generateRefreshToken(user.id, 'user');

        // Log successful login
        db.query(auditSql, [username, 'login_success', req.ip, req.headers['user-agent'], null], () => {});

        // Return response with tokens
        res.json({
          success: true,
          message: "Login successful",
          data: {
            token: token,
            refreshToken: refreshToken,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              usn: user.usn
            }
          }
        });

      } catch (err) {
        console.error("Password comparison error:", err);
        db.query(auditSql, [username, 'login_failed', req.ip, req.headers['user-agent'], 'Server error'], () => {});
        return res.status(500).json({ message: "Login failed" });
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
});
```

### 3.3 Update Admin Login Endpoint

**File**: `lib/server/routes/admin.js` (Lines 11-46)

```javascript
const { comparePassword } = require('../utils/password');
const { generateAdminToken, generateRefreshToken } = require('../utils/jwt');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const sql = 'SELECT id, username, name, password_hash FROM admins WHERE username = ?';

    db.query(sql, [username], async (err, results) => {
      if (err) {
        console.error('Database error during admin login:', err);
        return res.status(500).json({ message: 'Login failed' });
      }

      // Log admin login attempt
      const auditSql = `
        INSERT INTO auth_audit_log (username, auth_type, action, ip_address, user_agent, failure_reason)
        VALUES (?, 'admin', ?, ?, ?, ?)
      `;

      if (results.length === 0) {
        db.query(auditSql, [username, 'login_failed', req.ip, req.headers['user-agent'], 'Admin not found'], () => {});
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const admin = results[0];

      try {
        const passwordMatch = await comparePassword(password, admin.password_hash);

        if (!passwordMatch) {
          db.query(auditSql, [username, 'login_failed', req.ip, req.headers['user-agent'], 'Wrong password'], () => {});
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate tokens
        const token = generateAdminToken({
          id: admin.id,
          username: admin.username,
          name: admin.name
        });

        const refreshToken = generateRefreshToken(admin.id, 'admin');

        // Log successful login
        db.query(auditSql, [username, 'login_success', req.ip, req.headers['user-agent'], null], () => {});

        res.json({
          success: true,
          message: 'Login successful',
          data: {
            token: token,
            refreshToken: refreshToken,
            admin: {
              id: admin.id,
              username: admin.username,
              name: admin.name
            }
          }
        });

      } catch (err) {
        console.error('Password comparison error:', err);
        db.query(auditSql, [username, 'login_failed', req.ip, req.headers['user-agent'], 'Server error'], () => {});
        return res.status(500).json({ message: 'Login failed' });
      }
    });

  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ message: 'Login failed' });
  }
});
```

### 3.4 Update All Protected Endpoints

**Pattern**: Replace `req.session.user` and `req.session.admin` checks with JWT middleware

**Example - Borrow Endpoint**:

```javascript
// OLD: Session-based
app.post('/borrow', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user_id = req.session.user.id;
  // ... rest of code
});

// NEW: JWT-based
const { authenticateUser } = require('./middleware/jwtAuthMiddleware');

app.post('/borrow', authenticateUser, (req, res) => {
  const user_id = req.user.id;  // From JWT middleware
  // ... rest of code
});
```

### 3.5 Apply Middleware to All Routes

**File**: `lib/server/index.js` (Route registration section)

```javascript
const { authenticateUser, authenticateAdmin } = require('./middleware/jwtAuthMiddleware');

// USER ROUTES
app.use('/api/user/', authenticateUser);
app.use('/api/branch-books/', authenticateUser);
app.use('/sell-books', authenticateUser);

// ADMIN ROUTES
app.use('/api/admin/', authenticateAdmin);
```

---

## PHASE 4: FRONTEND IMPLEMENTATION

### 4.1 Create JWT Service

**File**: `lib/src/services/jwtService.js`

```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class JWTService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refreshToken');
    this.setupAxiosInterceptor();
  }

  /**
   * Store tokens in localStorage
   */
  setTokens(token, refreshToken) {
    this.token = token;
    this.refreshToken = refreshToken;
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
  }

  /**
   * Clear tokens from localStorage
   */
  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  /**
   * Get current token
   */
  getToken() {
    return this.token || localStorage.getItem('token');
  }

  /**
   * Get refresh token
   */
  getRefreshToken() {
    return this.refreshToken || localStorage.getItem('refreshToken');
  }

  /**
   * Setup axios interceptor to add token to all requests
   */
  setupAxiosInterceptor() {
    axios.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle 401 responses
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh token
            const newToken = await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // Refresh failed - logout user
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken() {
    try {
      const refreshToken = this.getRefreshToken();
      const response = await axios.post(`${API_URL}/api/auth/refresh`, {
        refreshToken: refreshToken
      });

      const { token } = response.data.data;
      this.token = token;
      localStorage.setItem('token', token);
      return token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      throw error;
    }
  }

  /**
   * Decode token (without verification)
   */
  decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token) {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    return decoded.exp * 1000 < Date.now();
  }
}

export default new JWTService();
```

### 4.2 Update Login Component

**File**: `lib/src/Pages/Login.jsx`

```javascript
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../Context/SnackbarContext';
import jwtService from '../services/jwtService';
import './Login.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password
      });

      if (response.data.success) {
        const { token, refreshToken, user } = response.data.data;

        // Store tokens
        jwtService.setTokens(token, refreshToken);

        // Store user data in context/state
        localStorage.setItem('user', JSON.stringify(user));

        showSnackbar('success', 'Login successful!');
        navigate('/main');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      const errorCode = error.response?.data?.code;

      if (errorCode === 'PENDING_APPROVAL') {
        showSnackbar('warning', errorMessage);
      } else if (errorCode === 'REGISTRATION_REJECTED') {
        showSnackbar('error', errorMessage);
      } else {
        showSnackbar('error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
```

### 4.3 Update Registration Component

**File**: `lib/src/Pages/Register.jsx`

```javascript
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../Context/SnackbarContext';
import './Register.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /\d/,
  hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
};

const validatePassword = (password) => {
  const errors = [];

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`At least ${PASSWORD_REQUIREMENTS.minLength} characters`);
  }
  if (!PASSWORD_REQUIREMENTS.hasUppercase.test(password)) {
    errors.push('Uppercase letter (A-Z)');
  }
  if (!PASSWORD_REQUIREMENTS.hasLowercase.test(password)) {
    errors.push('Lowercase letter (a-z)');
  }
  if (!PASSWORD_REQUIREMENTS.hasNumber.test(password)) {
    errors.push('Number (0-9)');
  }
  if (!PASSWORD_REQUIREMENTS.hasSpecial.test(password)) {
    errors.push('Special character (!@#$%^&...)');
  }

  return errors;
};

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    usn: '',
    password: '',
    confirmPassword: ''
  });

  const [passwordErrors, setPasswordErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData({ ...formData, password });
    setPasswordErrors(validatePassword(password));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password requirements
    if (passwordErrors.length > 0) {
      showSnackbar('error', 'Password does not meet requirements');
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      showSnackbar('error', 'Passwords do not match');
      return;
    }

    // Validate USN format
    const usnPattern = /^[1-4]SN\d{2}AD\d{3}$/;
    if (!usnPattern.test(formData.usn)) {
      showSnackbar('error', 'Invalid USN format. Example: 1SN23AD001');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/register`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        usn: formData.usn,
        password: formData.password
      });

      if (response.data.success) {
        showSnackbar('success', response.data.message);
        setFormData({
          firstName: '',
          lastName: '',
          username: '',
          email: '',
          usn: '',
          password: '',
          confirmPassword: ''
        });
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      showSnackbar('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="First Name"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="USN (e.g., 1SN23AD001)"
          value={formData.usn}
          onChange={(e) => setFormData({ ...formData, usn: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handlePasswordChange}
          required
        />
        {passwordErrors.length > 0 && (
          <div className="password-errors">
            <p>Password must contain:</p>
            <ul>
              {passwordErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        <input
          type="password"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          required
        />
        <button type="submit" disabled={loading || passwordErrors.length > 0}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register;
```

### 4.4 Update Auth Context

**File**: `lib/src/Context/AuthProvider.jsx`

```javascript
import React, { createContext, useState, useEffect } from 'react';
import jwtService from '../services/jwtService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored tokens on app load
    const token = jwtService.getToken();
    if (token && !jwtService.isTokenExpired(token)) {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } else {
      jwtService.clearTokens();
    }
    setLoading(false);
  }, []);

  const login = (userData, token, refreshToken) => {
    jwtService.setTokens(token, refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const loginAdmin = (adminData, token, refreshToken) => {
    jwtService.setTokens(token, refreshToken);
    localStorage.setItem('admin', JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const logout = () => {
    jwtService.clearTokens();
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    setUser(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        login,
        loginAdmin,
        logout,
        loading,
        isAuthenticated: !!user,
        isAdminAuthenticated: !!admin
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
```

---

## PHASE 5: DEPLOYMENT & TESTING

### 5.1 Pre-Deployment Checklist

```
BACKEND:
- [ ] Install bcryptjs and jsonwebtoken packages
- [ ] Create JWT utility modules (jwt.js, password.js)
- [ ] Create JWT middleware (jwtAuthMiddleware.js)
- [ ] Create database migration script
- [ ] Apply database migration to production
- [ ] Update registration endpoint (password hashing)
- [ ] Update user login endpoint (JWT tokens)
- [ ] Update admin login endpoint (JWT tokens)
- [ ] Apply JWT middleware to all protected routes
- [ ] Create token refresh endpoint
- [ ] Create logout endpoint (token blacklist)
- [ ] Add audit logging
- [ ] Update environment variables
- [ ] Test all endpoints locally

FRONTEND:
- [ ] Create JWT service
- [ ] Update login component (get tokens)
- [ ] Update registration component (show password requirements)
- [ ] Update axios interceptors (add Authorization header)
- [ ] Update auth context (JWT management)
- [ ] Update all API calls (use new context)
- [ ] Remove session-based references
- [ ] Test locally against local backend

TESTING:
- [ ] Test user registration flow
- [ ] Test password hashing
- [ ] Test user login (get JWT token)
- [ ] Test admin login (get JWT token)
- [ ] Test protected endpoints (with JWT)
- [ ] Test token expiry handling
- [ ] Test 401 responses
- [ ] Test refresh token flow
- [ ] Test logout (blacklist token)
- [ ] Test cross-origin requests (Vercel → Render)
- [ ] Load testing (concurrent sessions)
```

### 5.2 Deployment Steps

```bash
# 1. Commit changes
git add .
git commit -m "Migrate from session-based auth to JWT with password hashing

- Implement bcryptjs password hashing
- Add JWT token generation and verification
- Add JWT middleware for protected routes
- Update all login endpoints to return tokens
- Add audit logging for authentication attempts
- Update database schema with password_hash columns
- Add frontend JWT service and interceptors
- Update React auth context to use JWT tokens
- Remove session-based authentication

This fixes cross-origin cookie issues and implements industry-standard security."

# 2. Push to repository
git push origin deploy-version

# 3. Render will auto-deploy

# 4. Run database migration
mysql -u username -p -h host < migrations/006_migrate_to_jwt_auth.sql

# 5. Migrate existing passwords (one-time script - see Phase 5.3)

# 6. Verify deployment
- Check Render logs
- Test login on Vercel frontend
- Verify tokens in Network tab
- Check stored tokens in localStorage
```

### 5.3 Password Migration Script

**File**: `lib/server/scripts/migratePasswords.js`

```javascript
const db = require('../db');
const { hashPassword } = require('../utils/password');

/**
 * One-time script to migrate existing passwords to hashed format
 * Run once after deploying JWT system
 */
async function migratePasswords() {
  console.log('🔄 Starting password migration...');

  try {
    // Get all users with plain-text passwords
    db.query('SELECT id, password FROM users WHERE password_hash IS NULL', async (err, users) => {
      if (err) {
        console.error('Error fetching users:', err);
        return;
      }

      console.log(`📊 Found ${users.length} users to migrate`);

      let migrated = 0;
      let failed = 0;

      for (const user of users) {
        try {
          const hashedPassword = await hashPassword(user.password);

          db.query(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [hashedPassword, user.id],
            (err) => {
              if (err) {
                console.error(`❌ Failed to migrate user ${user.id}:`, err);
                failed++;
              } else {
                migrated++;
                console.log(`✅ Migrated user ${user.id}`);
              }
            }
          );
        } catch (err) {
          console.error(`❌ Error hashing password for user ${user.id}:`, err);
          failed++;
        }
      }

      // Close DB connection after migration
      setTimeout(() => {
        console.log(`\n📈 Migration complete: ${migrated} successful, ${failed} failed`);
        process.exit(0);
      }, users.length * 100);
    });

    // Migrate admin passwords
    db.query('SELECT id, password FROM admins WHERE password_hash IS NULL', async (err, admins) => {
      if (err) {
        console.error('Error fetching admins:', err);
        return;
      }

      console.log(`📊 Found ${admins.length} admins to migrate`);

      for (const admin of admins) {
        try {
          const hashedPassword = await hashPassword(admin.password);

          db.query(
            'UPDATE admins SET password_hash = ? WHERE id = ?',
            [hashedPassword, admin.id],
            (err) => {
              if (err) {
                console.error(`❌ Failed to migrate admin ${admin.id}:`, err);
              } else {
                console.log(`✅ Migrated admin ${admin.id}`);
              }
            }
          );
        } catch (err) {
          console.error(`❌ Error hashing password for admin ${admin.id}:`, err);
        }
      }
    });

  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

// Run migration
migratePasswords();
```

**Run migration**:
```bash
cd lib/server
node scripts/migratePasswords.js
```

---

## PHASE 6: SECURITY HARDENING

### 6.1 Add Rate Limiting

**File**: `lib/server/index.js`

```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour
  message: 'Too many registration attempts, please try again later',
  skip: (req) => process.env.NODE_ENV !== 'production'
});

app.post('/login', loginLimiter, (req, res) => { /* ... */ });
app.post('/register', registerLimiter, (req, res) => { /* ... */ });
app.post('/api/admin/login', loginLimiter, (req, res) => { /* ... */ });
```

### 6.2 Add CSRF Protection

```bash
npm install csurf
```

**File**: `lib/server/index.js`

```javascript
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
const csrfProtection = csrf({ cookie: false }); // Use session instead of cookie

// Protect state-changing endpoints
app.post('/api/branch-books/request', csrfProtection, authenticateUser, (req, res) => { /* ... */ });
```

### 6.3 Add CORS Security Headers

```javascript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

---

## MIGRATION PATH & ROLLBACK PLAN

### Forward-Compatible Transition

During migration, the system supports BOTH:
1. Old session-based authentication
2. New JWT-based authentication

This allows gradual rollout and easy rollback.

```javascript
function authenticateAny(req, res, next) {
  // Try JWT first
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const decoded = verifyToken(extractToken(authHeader));
    if (decoded) {
      req.user = decoded;
      return next();
    }
  }

  // Fall back to session
  if (req.session.user) {
    req.user = req.session.user;
    return next();
  }

  return res.status(401).json({ message: 'Unauthorized' });
}
```

### Rollback Steps (if needed)

```bash
# 1. Revert code changes
git revert <commit-hash>

# 2. Stop using JWT middleware
app.use(authenticateAny); // Falls back to session

# 3. Clear any blacklisted tokens
TRUNCATE jwt_blacklist;

# 4. Notify users to clear browser storage
# Frontend code clears localStorage['token'] automatically
```

---

## TESTING STRATEGY

### 6.1 Unit Tests

```javascript
// Test password hashing
const { hashPassword, comparePassword } = require('../utils/password');

test('Password hashing and comparison', async () => {
  const plainPassword = 'Test@1234';
  const hash = await hashPassword(plainPassword);
  const matches = await comparePassword(plainPassword, hash);
  expect(matches).toBe(true);
});

// Test JWT generation
const { generateUserToken, verifyToken } = require('../utils/jwt');

test('JWT token generation and verification', () => {
  const user = { id: 1, username: 'test', email: 'test@test.com' };
  const token = generateUserToken(user);
  const decoded = verifyToken(token);
  expect(decoded.id).toBe(1);
  expect(decoded.username).toBe('test');
});
```

### 6.2 Integration Tests

```bash
# Test user registration
POST /register
{
  "username": "testuser",
  "password": "Test@1234",
  "usn": "1SN23AD001",
  "firstName": "Test",
  "lastName": "User",
  "email": "test@test.com"
}
# Expect: 201, password_hash stored

# Test user login
POST /login
{
  "username": "testuser",
  "password": "Test@1234"
}
# Expect: 200, { token, refreshToken, user }

# Test protected endpoint with JWT
GET /api/branch-books/my-requests
Headers: Authorization: Bearer <token>
# Expect: 200, requests list

# Test invalid token
GET /api/branch-books/my-requests
Headers: Authorization: Bearer invalid-token
# Expect: 401
```

### 6.3 Security Tests

```bash
# Test password validation
POST /register with "password": "weak"
# Expect: 400, password validation errors

# Test rate limiting
POST /login (5 times quickly)
# Expect: 429 on 6th attempt

# Test CORS
Preflight request from unauthorized origin
# Expect: 403 CORS error

# Test token expiry
Generate token with expired timestamp
GET protected endpoint with expired token
# Expect: 401, offer token refresh

# Test SQL injection
POST /login
{
  "username": "admin' OR '1'='1",
  "password": "anything"
}
# Expect: 401 (query parameterized, injection impossible)
```

---

## MONITORING & MAINTENANCE

### 7.1 Logging Setup

All auth events logged to `auth_audit_log`:
- Successful logins
- Failed login attempts
- Token refreshes
- Logouts
- Suspicious activities (multiple failures, etc.)

**Query to view login attempts**:
```sql
SELECT * FROM auth_audit_log
ORDER BY timestamp DESC
LIMIT 100;

-- Failed logins in last 24 hours
SELECT username, COUNT(*) as attempts
FROM auth_audit_log
WHERE action = 'login_failed' AND timestamp > DATE_SUB(NOW(), INTERVAL 1 DAY)
GROUP BY username ORDER BY attempts DESC;
```

### 7.2 Token Cleanup

Expired tokens automatically cleaned from blacklist daily (via MySQL event).

**Manual cleanup**:
```sql
DELETE FROM jwt_blacklist WHERE expires_at < NOW();
```

### 7.3 Monitoring

Monitor these metrics:
- Failed login attempts per user
- Token refresh frequency
- Average response times
- Database query performance
- JWT verification errors

---

## TIMELINE & DELIVERABLES

| Phase | Duration | Deliverable |
|-------|----------|------------|
| 1. Setup | Day 1 | Dependencies, env vars, JWT utilities |
| 2. Database | Day 1 | Migration script, blacklist table |
| 3. Backend | Day 1-2 | Updated endpoints, middleware, logging |
| 4. Frontend | Day 2 | JWT service, updated components |
| 5. Testing | Day 2-3 | Unit, integration, security tests |
| 6. Deployment | Day 3 | Production deployment, verification |

**Total**: 2-3 days for complete implementation

---

## EXPECTED OUTCOMES

### Before JWT Implementation
- ❌ 401 errors on all admin endpoints
- ❌ Session cookies not being sent across domains
- ❌ Plain-text passwords in database
- ❌ No audit trail for login attempts
- ❌ Sessions lost on server restart

### After JWT Implementation
- ✅ Stateless authentication (works with multiple servers)
- ✅ Tokens in Authorization header (no CORS cookie issues)
- ✅ Bcrypt hashed passwords (secure storage)
- ✅ Complete audit logging (compliance ready)
- ✅ Token refresh mechanism (seamless experience)
- ✅ Rate limiting (brute-force protection)
- ✅ Password strength requirements (security policy)
- ✅ Works perfectly: Vercel frontend ↔ Render backend

---

## SUCCESS CRITERIA

- [ ] Admin login returns JWT token
- [ ] Token is sent with every request in Authorization header
- [ ] Protected endpoints accept JWT and reject 401
- [ ] Cross-origin requests work (Vercel ↔ Render)
- [ ] Passwords are hashed in database
- [ ] Passwords meet complexity requirements
- [ ] Failed login attempts are logged
- [ ] Token expiry is enforced
- [ ] Token refresh works seamlessly
- [ ] All 25+ protected endpoints protected with JWT middleware
- [ ] No session-related errors in console
- [ ] Deployment to production succeeds

---

**This plan provides a complete, production-grade JWT implementation that solves all current authentication issues while following security best practices.**

