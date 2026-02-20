const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true
});

console.log('🔄 Connecting to database...');
console.log(`📍 Host: ${process.env.DB_HOST}`);
console.log(`👤 User: ${process.env.DB_USER}`);
console.log(`📦 Database: ${process.env.DB_NAME}\n`);

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }

  console.log('✅ Connected to database\n');
  console.log('⏳ Running migration...\n');

  // Run migrations one by one to handle errors gracefully
  const migrations = [
    {
      name: 'Add password_hash to users',
      sql: `ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL COMMENT 'bcrypt hashed password (new system)'`
    },
    {
      name: 'Add password_hash to admins',
      sql: `ALTER TABLE admins ADD COLUMN password_hash VARCHAR(255) NULL COMMENT 'bcrypt hashed password (new system)'`
    },
    {
      name: 'Create jwt_blacklist table',
      sql: `CREATE TABLE IF NOT EXISTS jwt_blacklist (
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
      COMMENT='Blacklisted JWT tokens for revocation'`
    },
    {
      name: 'Create auth_audit_log table',
      sql: `CREATE TABLE IF NOT EXISTS auth_audit_log (
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
      COMMENT='Audit log for all authentication attempts'`
    }
  ];

  let completed = 0;

  function runNextMigration() {
    if (completed >= migrations.length) {
      console.log('\n✅ Migration completed successfully!\n');
      console.log('📊 Created/Modified:');
      migrations.forEach(m => console.log(`   ✓ ${m.name}`));
      console.log();
      connection.end();
      process.exit(0);
      return;
    }

    const migration = migrations[completed];
    console.log(`⏳ ${migration.name}...`);

    connection.query(migration.sql, (err) => {
      if (err) {
        // Ignore "column already exists" errors
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`   ℹ️  Column already exists (skipping)`);
        } else {
          console.error(`   ❌ Error: ${err.message}`);
          connection.end();
          process.exit(1);
        }
      } else {
        console.log(`   ✅ Done`);
      }

      completed++;
      runNextMigration();
    });
  }

  runNextMigration();
});
