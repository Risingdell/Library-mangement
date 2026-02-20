-- Migration: Convert session-based auth to JWT with password hashing
-- Date: February 2025
-- Status: Initial password hash column creation
-- Note: This version is compatible with Node.js mysql2 (DELIMITER statements removed)

USE biuezvkp1ir5odbq6wju;

-- Step 1: Add password_hash column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL COMMENT 'bcrypt hashed password (new system)';

-- Step 2: Add password_hash column to admins table
ALTER TABLE admins
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL COMMENT 'bcrypt hashed password (new system)';

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

-- Notes:
-- 1. password column will be kept for backward compatibility during transition
-- 2. password_hash column will be used by new JWT system
-- 3. Once all passwords migrated, password column can be dropped
-- 4. Migration status tracked in auth_audit_log
-- 5. Stored procedures and events require separate execution via Node.js
