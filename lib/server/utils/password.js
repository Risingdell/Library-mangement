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
