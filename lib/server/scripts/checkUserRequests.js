const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function checkRequests() {
  try {
    console.log('🔍 Checking all branch book requests for user "dan"...\n');

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

    // Check user dan
    const userSql = 'SELECT id, username, email FROM users WHERE username = ?';
    const user = await new Promise((resolve, reject) => {
      connection.query(userSql, ['dan'], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });

    if (!user) {
      console.log('❌ User "dan" not found');
      connection.end();
      process.exit(1);
    }

    console.log(`📋 User: ${user.username} (ID: ${user.id})`);
    console.log(`📧 Email: ${user.email}\n`);

    // Check all requests for this user
    const requestsSql = `
      SELECT
        br.id,
        br.book_id,
        b.title,
        b.author,
        br.status,
        br.requested_at
      FROM branch_book_requests br
      JOIN books b ON br.book_id = b.id
      WHERE br.student_id = ?
      ORDER BY br.requested_at DESC
    `;

    const requests = await new Promise((resolve, reject) => {
      connection.query(requestsSql, [user.id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (requests.length === 0) {
      console.log('✅ No requests found for this user\n');
    } else {
      console.log(`📚 Found ${requests.length} request(s):\n`);
      requests.forEach((req, idx) => {
        console.log(`${idx + 1}. Book: "${req.title}" by ${req.author}`);
        console.log(`   Book ID: ${req.book_id}`);
        console.log(`   Request ID: ${req.id}`);
        console.log(`   Status: ${req.status}`);
        console.log(`   Requested: ${new Date(req.requested_at).toLocaleString()}\n`);
      });
    }

    // Show how to cancel a request
    if (requests.length > 0) {
      console.log('='.repeat(60));
      console.log('💡 To cancel a request, you can use this endpoint:');
      console.log('   DELETE /api/branch-books/request/{requestId}');
      console.log('   Where requestId is the "Request ID" shown above');
      console.log('='.repeat(60));
    }

    connection.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    connection.end();
    process.exit(1);
  }
}

checkRequests();
