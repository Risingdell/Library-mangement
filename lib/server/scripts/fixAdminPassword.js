const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const CORRECT_PASSWORD = 'admin@123';  // The actual password
const BCRYPT_ROUNDS = 10;

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function fixAdminPassword() {
  try {
    console.log('🔄 Connecting to database...\n');

    await new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) {
          console.error('❌ Connection failed:', err.message);
          reject(err);
        } else {
          console.log('✅ Connected to database\n');
          resolve();
        }
      });
    });

    // Step 1: Generate correct hash for admin@123
    console.log('🔐 Generating bcrypt hash for password: admin@123\n');
    const correctHash = await bcrypt.hash(CORRECT_PASSWORD, BCRYPT_ROUNDS);
    console.log('✅ Generated hash:', correctHash);
    console.log();

    // Step 2: Delete duplicate admin records (keep only one)
    console.log('🗑️  Removing duplicate admin records...');
    await new Promise((resolve, reject) => {
      connection.query(
        'DELETE FROM admins WHERE username = ? AND id > 1',
        ['admin'],
        (err, results) => {
          if (err) reject(err);
          else {
            console.log(`✅ Deleted ${results.affectedRows} duplicate record(s)\n`);
            resolve();
          }
        }
      );
    });

    // Step 3: Update the correct admin record
    console.log('📝 Updating admin record with correct hash...');
    await new Promise((resolve, reject) => {
      connection.query(
        'UPDATE admins SET password = ?, password_hash = ? WHERE username = ? AND id = 1',
        [CORRECT_PASSWORD, correctHash, 'admin'],
        (err, results) => {
          if (err) reject(err);
          else {
            console.log(`✅ Updated ${results.affectedRows} record(s)\n`);
            resolve();
          }
        }
      );
    });

    // Step 4: Verify the update
    console.log('✅ Verifying update...');
    await new Promise((resolve, reject) => {
      connection.query(
        'SELECT id, username, password, password_hash FROM admins WHERE username = ?',
        ['admin'],
        (err, results) => {
          if (err) reject(err);
          else {
            console.log('Admin record(s) in database:');
            results.forEach(admin => {
              console.log(`  ID: ${admin.id}`);
              console.log(`  Username: ${admin.username}`);
              console.log(`  Password (plain): ${admin.password}`);
              console.log(`  Password Hash: ${admin.password_hash}`);
              console.log();
            });
            resolve();
          }
        }
      );
    });

    // Step 5: Test password verification
    console.log('🧪 Testing password verification...');
    const isMatch = await bcrypt.compare(CORRECT_PASSWORD, correctHash);
    if (isMatch) {
      console.log('✅ Password verification WORKS! ✅\n');
    } else {
      console.log('❌ Password verification FAILED!\n');
    }

    console.log('='.repeat(60));
    console.log('✅ ADMIN PASSWORD FIX COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📋 Admin Login Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin@123\n');
    console.log('🔐 Password Hash (bcrypt):');
    console.log('   ' + correctHash + '\n');
    console.log('✅ Database is now ready for login!\n');

    connection.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    connection.end();
    process.exit(1);
  }
}

fixAdminPassword();
