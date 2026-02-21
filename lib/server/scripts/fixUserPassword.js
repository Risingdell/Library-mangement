const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const USERNAME = 'dan';
const PASSWORD = '123';
const BCRYPT_ROUNDS = 10;

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function fixUserPassword() {
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

    // Step 1: Generate bcrypt hash for password
    console.log(`🔐 Generating bcrypt hash for password: ${PASSWORD}\n`);
    const passwordHash = await bcrypt.hash(PASSWORD, BCRYPT_ROUNDS);
    console.log('✅ Generated hash:', passwordHash);
    console.log();

    // Step 2: Find user
    console.log(`🔍 Finding user "${USERNAME}"...`);
    const user = await new Promise((resolve, reject) => {
      connection.query(
        'SELECT id, username, email, approval_status, password, password_hash FROM users WHERE username = ?',
        [USERNAME],
        (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        }
      );
    });

    if (!user) {
      console.log(`❌ User "${USERNAME}" not found in database`);
      connection.end();
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.username} (ID: ${user.id})`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Approval Status: ${user.approval_status}`);
    console.log(`   Current password column: ${user.password ? user.password.substring(0, 20) + '...' : 'NULL'}`);
    console.log(`   Current password_hash column: ${user.password_hash ? user.password_hash.substring(0, 20) + '...' : 'NULL'}`);
    console.log();

    // Step 3: Update BOTH password and password_hash columns
    console.log('📝 Updating BOTH password and password_hash columns...\n');

    await new Promise((resolve, reject) => {
      connection.query(
        'UPDATE users SET password = ?, password_hash = ? WHERE id = ?',
        [PASSWORD, passwordHash, user.id],
        (err, results) => {
          if (err) reject(err);
          else {
            console.log(`✅ Updated ${results.affectedRows} user(s)\n`);
            resolve();
          }
        }
      );
    });

    // Step 4: Verify update
    console.log('✅ Verifying update in database...');
    const updatedUser = await new Promise((resolve, reject) => {
      connection.query(
        'SELECT id, username, email, approval_status, password, password_hash FROM users WHERE id = ?',
        [user.id],
        (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        }
      );
    });

    console.log('Updated user record:');
    console.log(`  ID: ${updatedUser.id}`);
    console.log(`  Username: ${updatedUser.username}`);
    console.log(`  Email: ${updatedUser.email}`);
    console.log(`  Approval Status: ${updatedUser.approval_status}`);
    console.log(`  Password column: ${updatedUser.password}`);
    console.log(`  Password_hash column: ${updatedUser.password_hash.substring(0, 30)}...`);
    console.log();

    // Step 5: Test password verification
    console.log('🧪 Testing password verification...');
    const isMatch = await bcrypt.compare(PASSWORD, updatedUser.password_hash);
    if (isMatch) {
      console.log('✅ Password verification WORKS! ✅\n');
    } else {
      console.log('❌ Password verification FAILED!\n');
    }

    console.log('='.repeat(60));
    console.log('✅ USER PASSWORD FIX COMPLETE!');
    console.log('='.repeat(60));
    console.log(`\n📋 User Login Credentials:`);
    console.log(`   Username: ${USERNAME}`);
    console.log(`   Password: ${PASSWORD}\n`);
    console.log('🔐 Password Hash (bcrypt):');
    console.log(`   ${passwordHash}\n`);
    console.log('✅ User is ready for login!\n');

    connection.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    connection.end();
    process.exit(1);
  }
}

fixUserPassword();
