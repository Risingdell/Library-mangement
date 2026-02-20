const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Bcrypt hash for password "Admin@123"
const ADMIN_PASSWORD_HASH = '$2b$10$ecZ7m8N4doob2tehE1xojupSuFR74.2xphZxP9/egC5TvBdK9iyQ.';

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

console.log('🔄 Connecting to database...\n');

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }

  console.log('✅ Connected to database\n');
  console.log('⏳ Inserting test admin...\n');

  const sql = `
    INSERT INTO admins (id, username, name, password, password_hash)
    VALUES (1, 'admin', 'Administrator', 'Admin@123', ?)
    ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);
  `;

  connection.query(sql, [ADMIN_PASSWORD_HASH], (err) => {
    if (err) {
      console.error('❌ Insert failed:', err.message);
      connection.end();
      process.exit(1);
    }

    console.log('✅ Test admin inserted/updated successfully!\n');
    console.log('📋 Admin Credentials:');
    console.log('   Username: admin');
    console.log('   Password: Admin@123');
    console.log('   Email: N/A (system admin)\n');
    console.log('🔐 Password Hash: $2b$10$ecZ7m8N4doob2tehE1xojupSuFR74.2xphZxP9/egC5TvBdK9iyQ.\n');
    console.log('✨ You can now login to the admin panel with these credentials!\n');

    connection.end();
    process.exit(0);
  });
});
