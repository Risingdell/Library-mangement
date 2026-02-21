const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function approveTestUser() {
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

    // Step 1: Check user's current status
    console.log('🔍 Checking user "dan" approval status...');
    const user = await new Promise((resolve, reject) => {
      connection.query(
        'SELECT id, username, email, approval_status FROM users WHERE username = ?',
        ['dan'],
        (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        }
      );
    });

    if (!user) {
      console.log('❌ User "dan" not found in database');
      connection.end();
      process.exit(1);
    }

    console.log('Current status:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Username: ${user.username}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Approval Status: ${user.approval_status}\n`);

    if (user.approval_status === 'approved') {
      console.log('✅ User is already approved!\n');
    } else {
      // Step 2: Update approval status to "approved"
      console.log('📝 Updating approval status to "approved"...\n');

      await new Promise((resolve, reject) => {
        connection.query(
          'UPDATE users SET approval_status = ? WHERE username = ?',
          ['approved', 'dan'],
          (err, results) => {
            if (err) reject(err);
            else {
              console.log(`✅ Updated ${results.affectedRows} user(s)\n`);
              resolve();
            }
          }
        );
      });
    }

    // Step 3: Verify approval
    console.log('✅ Verifying approval status...');
    const updatedUser = await new Promise((resolve, reject) => {
      connection.query(
        'SELECT id, username, email, approval_status FROM users WHERE username = ?',
        ['dan'],
        (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        }
      );
    });

    console.log('Updated status:');
    console.log(`  ID: ${updatedUser.id}`);
    console.log(`  Username: ${updatedUser.username}`);
    console.log(`  Email: ${updatedUser.email}`);
    console.log(`  Approval Status: ${updatedUser.approval_status}\n`);

    console.log('='.repeat(60));
    console.log('✅ USER APPROVAL COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📋 User Login Credentials:');
    console.log('   Username: dan');
    console.log('   Password: 123\n');
    console.log('✅ User "dan" is now approved and can login!\n');

    connection.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    connection.end();
    process.exit(1);
  }
}

approveTestUser();
