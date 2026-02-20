const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Bcrypt hash for password "admin@123" (lowercase)
const NEW_PASSWORD_HASH = '$2b$10$b/oPvixjlWzt/yqYI.vA3.BupIjzGfTIFgd24HWaixJ/la/0ENUJK';

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
  console.log('⏳ Updating admin password...\n');

  const sql = `UPDATE admins SET password_hash = ? WHERE username = 'admin'`;

  connection.query(sql, [NEW_PASSWORD_HASH], (err) => {
    if (err) {
      console.error('❌ Update failed:', err.message);
      connection.end();
      process.exit(1);
    }

    console.log('✅ Admin password updated successfully!\n');
    console.log('📋 Admin Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin@123\n');
    console.log('🔐 New Password Hash: $2b$10$b/oPvixjlWzt/yqYI.vA3.BupIjzGfTIFgd24HWaixJ/la/0ENUJK\n');

    connection.end();
    process.exit(0);
  });
});
