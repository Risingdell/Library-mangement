const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const CORRECT_PASSWORD = '123';  // User's password
const BCRYPT_ROUNDS = 10;

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function createTestUser() {
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

    // Step 1: Generate bcrypt hash for password "123"
    console.log('🔐 Generating bcrypt hash for password: 123\n');
    const passwordHash = await bcrypt.hash(CORRECT_PASSWORD, BCRYPT_ROUNDS);
    console.log('✅ Generated hash:', passwordHash);
    console.log();

    // Step 2: Check if user already exists
    console.log('🔍 Checking if user "dan" already exists...');
    const existingUser = await new Promise((resolve, reject) => {
      connection.query(
        'SELECT id, username FROM users WHERE username = ?',
        ['dan'],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });

    if (existingUser.length > 0) {
      console.log(`ℹ️ User "dan" already exists (ID: ${existingUser[0].id})`);
      console.log('📝 Updating password...\n');

      // Update existing user
      await new Promise((resolve, reject) => {
        connection.query(
          'UPDATE users SET password = ? WHERE username = ?',
          [passwordHash, 'dan'],
          (err, results) => {
            if (err) reject(err);
            else {
              console.log(`✅ Updated ${results.affectedRows} user(s)\n`);
              resolve();
            }
          }
        );
      });
    } else {
      console.log('✅ User "dan" does not exist - creating new user\n');

      // Create new user
      await new Promise((resolve, reject) => {
        connection.query(
          'INSERT INTO users (username, email, password, first_name, last_name, usn, branch) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            'dan',
            'dan@example.com',
            passwordHash,
            'Dan',
            'User',
            'USN123',
            'default'
          ],
          (err, results) => {
            if (err) reject(err);
            else {
              console.log(`✅ Created new user with ID: ${results.insertId}\n`);
              resolve();
            }
          }
        );
      });
    }

    // Step 3: Verify the user
    console.log('✅ Verifying user...');
    const user = await new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM users WHERE username = ?',
        ['dan'],
        (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        }
      );
    });

    console.log('User record in database:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Username: ${user.username}`);
    console.log(`  Email: ${user.email}`);
    if (user.first_name) console.log(`  First Name: ${user.first_name}`);
    if (user.last_name) console.log(`  Last Name: ${user.last_name}`);
    if (user.usn) console.log(`  USN: ${user.usn}`);
    console.log();

    // Step 4: Test password verification
    console.log('🧪 Testing password verification...');
    const isMatch = await bcrypt.compare(CORRECT_PASSWORD, passwordHash);
    if (isMatch) {
      console.log('✅ Password verification WORKS! ✅\n');
    } else {
      console.log('❌ Password verification FAILED!\n');
    }

    console.log('='.repeat(60));
    console.log('✅ USER CREATION COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📋 User Login Credentials:');
    console.log('   Username: dan');
    console.log('   Password: 123\n');
    console.log('🔐 Password Hash (bcrypt):');
    console.log('   ' + passwordHash + '\n');
    console.log('✅ Database is ready for login!\n');

    connection.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    connection.end();
    process.exit(1);
  }
}

createTestUser();
