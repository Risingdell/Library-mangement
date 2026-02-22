const express = require('express');
const router = express.Router();
const db = require('../db'); // adjust if needed
const { sendRegistrationApprovalEmail, sendRegistrationRejectionEmail } = require('../utils/emailService');
const { comparePassword } = require('../utils/password');
const { generateAdminToken, generateRefreshToken } = require('../utils/jwt');
const { authenticateAdmin } = require('../middleware/jwtAuthMiddleware');

// ==========================================
// ADMIN AUTHENTICATION ENDPOINTS
// ==========================================

// Admin login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const sql = 'SELECT id, username, name, password_hash FROM admins WHERE username = ?';

    db.query(sql, [username], async (err, results) => {
      if (err) {
        console.error('Database error during admin login:', err);
        return res.status(500).json({ message: 'Login failed' });
      }

      if (results.length === 0) {
        console.warn(`⚠️ Admin login failed: Invalid credentials for user ${username}`);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const admin = results[0];

      try {
        // Support both password_hash (new) and password (legacy) columns
        const passwordHash = admin.password_hash || admin.password;
        const passwordMatch = await comparePassword(password, passwordHash);

        if (!passwordMatch) {
          console.warn(`⚠️ Admin login failed: Wrong password for user ${username}`);
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate tokens
        const token = generateAdminToken({
          id: admin.id,
          username: admin.username,
          name: admin.name
        });

        const refreshToken = generateRefreshToken(admin.id, 'admin');

        console.log(`✅ Admin ${username} authenticated. JWT token generated.`);

        res.json({
          success: true,
          message: 'Login successful',
          data: {
            token: token,
            refreshToken: refreshToken,
            admin: {
              id: admin.id,
              username: admin.username,
              name: admin.name
            }
          }
        });

      } catch (err) {
        console.error('Password comparison error:', err);
        return res.status(500).json({ message: 'Login failed' });
      }
    });

  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ message: 'Login failed' });
  }
});

// Get logged-in admin (JWT authenticated)
router.get('/me', authenticateAdmin, (req, res) => {
  // authenticateAdmin middleware already verified JWT and populated req.admin
  // Fetch fresh admin data from database
  const sql = 'SELECT id, username, name FROM admins WHERE id = ?';
  db.query(sql, [req.admin.id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ message: 'Admin not found' });
    }
    res.json(results[0]);
  });
});

// Admin logout (JWT authenticated)
router.post('/logout', authenticateAdmin, (req, res) => {
  // With JWT, logout is handled on the frontend by clearing localStorage
  // Backend just confirms logout
  res.json({ success: true, message: 'Logged out successfully' });
});

// ==========================================
// ADMIN BOOK MANAGEMENT ENDPOINTS
// ==========================================

router.get('/borrowed-books', authenticateAdmin, (req, res) => {
  // JWT authenticated by middleware

  const sql = `
    SELECT
      bb.id AS borrow_id,
      b.title AS book_title,
      b.author AS author,
      CONCAT(u.firstName, ' ', u.lastName) AS borrower_name,
      u.username AS username,
      bb.borrow_date,
      bb.expiry_date,
      bb.return_status AS status
    FROM borrowed_books bb
    JOIN books b ON bb.book_id = b.id
    JOIN users u ON bb.user_id = u.id
    WHERE bb.return_status = 'active'
    ORDER BY bb.expiry_date ASC;
  `;

  // ✅ DO NOT destructure the result
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching borrowed books:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    res.json(results); // ✅ Send full array of results
  });
});

router.get('/expired-books', authenticateAdmin, (req, res) => {
  // JWT authenticated by middleware

  const sql = `
  SELECT
  b.title AS book_title,
  b.author AS book_author,
  u.username AS borrower_username,
  bb.expiry_date
FROM borrowed_books bb
JOIN books b ON bb.book_id = b.id
JOIN users u ON bb.user_id = u.id
WHERE bb.returned_at IS NULL
  AND bb.expiry_date < NOW()
ORDER BY bb.expiry_date ASC;

`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching expired books:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.json(results);
  });
});

router.post('/add-book', authenticateAdmin, (req, res) => {
  const { acc_no, author, date, donated_by, sl_no, status, title } = req.body;
  const sql = `
    INSERT INTO books (acc_no, author, date, donated_by, sl_no, status, title)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [acc_no, author, date || null, donated_by || null, sl_no, status || null, title], (err, result) => {
    if (err) {
      console.error('Error inserting book:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ message: 'Book added successfully' });
  });
});

// ==========================================
// USER APPROVAL ENDPOINTS
// ==========================================

// Get all pending user registrations
router.get('/pending-users', authenticateAdmin, (req, res) => {
  // JWT authenticated by middleware

  const sql = `
    SELECT
      id,
      username,
      usn,
      firstName,
      lastName,
      email,
      approval_status,
      registered_at
    FROM users
    WHERE approval_status = 'pending'
    ORDER BY registered_at ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching pending users:', err);
      return res.status(500).json({ message: 'Failed to fetch pending users' });
    }
    res.json(results);
  });
});

// Approve a user registration
router.post('/approve-user', authenticateAdmin, (req, res) => {
  const { user_id } = req.body;


  if (!user_id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const admin_id = req.admin.id;

  // Check if user exists and is pending - get email and name for notification
  const checkSql = 'SELECT id, username, email, firstName, lastName FROM users WHERE id = ? AND approval_status = "pending"';

  db.query(checkSql, [user_id], (err, result) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Pending user not found' });
    }

    const user = result[0];

    // Update user to approved status
    const updateSql = `
      UPDATE users
      SET approval_status = 'approved',
          approved_by = ?,
          approved_at = NOW()
      WHERE id = ?
    `;

    db.query(updateSql, [admin_id, user_id], (err) => {
      if (err) {
        console.error('Error approving user:', err);
        return res.status(500).json({ message: 'Failed to approve user' });
      }

      // Send approval notification email (non-blocking - don't fail approval if email fails)
      if (user.email) {
        sendRegistrationApprovalEmail(user.email, {
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username
        }).catch(emailError => {
          // Log email error but don't fail the approval
          console.error('Email notification failed for user:', user.username, emailError);
        });
      }

      res.json({ message: `User "${user.username}" approved successfully. They can now login.` });
    });
  });
});

// Reject a user registration
router.post('/reject-user', authenticateAdmin, (req, res) => {
  const { user_id, reason } = req.body;


  if (!user_id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  if (!reason || reason.trim() === '') {
    return res.status(400).json({ message: 'Rejection reason is required' });
  }

  const admin_id = req.admin.id;

  // Check if user exists and is pending - get email and name for notification
  const checkSql = 'SELECT id, username, email, firstName, lastName FROM users WHERE id = ? AND approval_status = "pending"';

  db.query(checkSql, [user_id], (err, result) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Pending user not found' });
    }

    const user = result[0];

    // Update user to rejected status
    const updateSql = `
      UPDATE users
      SET approval_status = 'rejected',
          approved_by = ?,
          approved_at = NOW(),
          rejection_reason = ?
      WHERE id = ?
    `;

    db.query(updateSql, [admin_id, reason, user_id], (err) => {
      if (err) {
        console.error('Error rejecting user:', err);
        return res.status(500).json({ message: 'Failed to reject user' });
      }

      // Send rejection notification email (non-blocking - don't fail rejection if email fails)
      if (user.email) {
        sendRegistrationRejectionEmail(user.email, {
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          rejectionReason: reason
        }).catch(emailError => {
          // Log email error but don't fail the rejection
          console.error('Email notification failed for user:', user.username, emailError);
        });
      }

      res.json({ message: `User "${user.username}" registration rejected. Notification email sent.` });
    });
  });
});

// Get all members (approved users)
router.get('/members', authenticateAdmin, (req, res) => {

  const sql = `
    SELECT
      id,
      username,
      usn,
      firstName,
      lastName,
      email,
      approval_status,
      registered_at,
      approved_at,
      approved_by
    FROM users
    WHERE approval_status = 'approved'
    ORDER BY registered_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching members:', err);
      return res.status(500).json({ message: 'Failed to fetch members' });
    }
    res.json(results);
  });
});

// ==========================================
// BORROWING HISTORY ENDPOINT
// ==========================================

// Get complete borrowing history (all records)
router.get('/borrowing-history', authenticateAdmin, (req, res) => {
  // Check if admin is logged in

  const sql = `
    SELECT
      bb.id AS borrow_id,
      b.title AS book_title,
      b.author AS author,
      b.acc_no,
      CONCAT(u.firstName, ' ', u.lastName) AS borrower_name,
      u.username AS username,
      bb.borrow_date,
      bb.expiry_date,
      bb.returned_at,
      bb.return_status,
      bb.approved_at,
      CASE
        WHEN bb.return_status = 'approved' THEN 'Returned'
        WHEN bb.return_status = 'rejected' THEN 'Return Rejected'
        WHEN bb.return_status = 'pending_return' THEN 'Pending Return'
        WHEN bb.return_status = 'active' THEN 'Borrowed'
        ELSE bb.return_status
      END AS status_display
    FROM borrowed_books bb
    JOIN books b ON bb.book_id = b.id
    JOIN users u ON bb.user_id = u.id
    ORDER BY bb.borrow_date DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching borrowing history:', err);
      return res.status(500).json({ message: 'Failed to fetch borrowing history' });
    }
    res.json(results);
  });
});

// ==========================================
// BOOK RETURN APPROVAL ENDPOINTS
// ==========================================

// Get all pending return requests
router.get('/pending-returns', authenticateAdmin, (req, res) => {
  const sql = `
    SELECT
      bb.id AS borrow_id,
      bb.book_id,
      bb.user_id,
      b.title AS book_title,
      b.author AS book_author,
      b.acc_no,
      u.username AS borrower_username,
      CONCAT(u.firstName, ' ', u.lastName) AS borrower_name,
      bb.borrow_date,
      bb.expiry_date,
      bb.returned_at,
      bb.return_status
    FROM borrowed_books bb
    JOIN books b ON bb.book_id = b.id
    JOIN users u ON bb.user_id = u.id
    WHERE bb.return_status = 'pending_return'
    ORDER BY bb.returned_at ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching pending returns:', err);
      return res.status(500).json({ message: 'Failed to fetch pending returns' });
    }
    res.json(results);
  });
});

// Approve a book return
router.post('/approve-return', authenticateAdmin, (req, res) => {
  const { borrow_id } = req.body;


  const admin_id = req.admin.id;

  // First, get the book_id from borrowed_books
  const getBookSql = 'SELECT book_id FROM borrowed_books WHERE id = ? AND return_status = "pending_return"';

  db.query(getBookSql, [borrow_id], (err, result) => {
    if (err) {
      console.error('Error fetching borrow record:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Pending return request not found' });
    }

    const book_id = result[0].book_id;

    // Update borrowed_books to approved status
    const updateBorrowSql = `
      UPDATE borrowed_books
      SET return_status = 'approved',
          approved_by = ?,
          approved_at = NOW()
      WHERE id = ?
    `;

    // Update books table to make book available again
    const updateBookSql = `
      UPDATE books
      SET status = 'available'
      WHERE id = ?
    `;

    db.query(updateBorrowSql, [admin_id, borrow_id], (err) => {
      if (err) {
        console.error('Error approving return:', err);
        return res.status(500).json({ message: 'Failed to approve return' });
      }

      db.query(updateBookSql, [book_id], (err) => {
        if (err) {
          console.error('Error updating book status:', err);
          return res.status(500).json({ message: 'Approved but book status update failed' });
        }

        res.json({ message: 'Book return approved successfully. Book is now available.' });
      });
    });
  });
});

// Reject a book return
router.post('/reject-return', authenticateAdmin, (req, res) => {
  const { borrow_id, reason } = req.body;


  const admin_id = req.admin.id;

  if (!reason || reason.trim() === '') {
    return res.status(400).json({ message: 'Rejection reason is required' });
  }

  // First, get the book_id
  const getBookSql = 'SELECT book_id FROM borrowed_books WHERE id = ? AND return_status = "pending_return"';

  db.query(getBookSql, [borrow_id], (err, result) => {
    if (err) {
      console.error('Error fetching borrow record:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Pending return request not found' });
    }

    const book_id = result[0].book_id;

    // Update borrowed_books to rejected status
    const updateBorrowSql = `
      UPDATE borrowed_books
      SET return_status = 'rejected',
          approved_by = ?,
          approved_at = NOW(),
          rejection_reason = ?,
          returned_at = NULL
      WHERE id = ?
    `;

    // Update books table back to borrowed status
    const updateBookSql = `
      UPDATE books
      SET status = 'borrowed'
      WHERE id = ?
    `;

    db.query(updateBorrowSql, [admin_id, reason, borrow_id], (err) => {
      if (err) {
        console.error('Error rejecting return:', err);
        return res.status(500).json({ message: 'Failed to reject return' });
      }

      db.query(updateBookSql, [book_id], (err) => {
        if (err) {
          console.error('Error updating book status:', err);
          return res.status(500).json({ message: 'Rejected but book status update failed' });
        }

        res.json({ message: 'Book return rejected. User has been notified.' });
      });
    });
  });
});


// ==========================================
// MARKETPLACE PURCHASE MANAGEMENT
// ==========================================

// Get all pending LIBRARY/BRANCH book borrow requests (requires admin handover confirmation)
router.get('/purchase-requests', authenticateAdmin, (req, res) => {

  // This endpoint returns library book requests (branch_book_requests) that need admin approval
  // Admin can approve, reject, or confirm handover for students requesting library books
  const sql = `
    SELECT
      br.id AS request_id,
      br.book_id,
      br.student_id,
      br.requested_at,
      br.status,
      br.approved_at,
      br.confirmed_handed_over,
      br.confirmed_at,
      br.rejection_reason,
      b.title,
      b.author,
      b.acc_no,
      b.book_format,
      student.username AS student_username,
      student.firstName AS student_first_name,
      student.lastName AS student_last_name,
      student.email AS student_email,
      student.usn AS student_usn
    FROM branch_book_requests br
    JOIN books b ON br.book_id = b.id
    JOIN users student ON br.student_id = student.id
    WHERE br.status IN ('pending', 'approved')
    ORDER BY br.status ASC, br.requested_at ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching purchase requests:', err);
      return res.status(500).json([]);
    }

    res.json(results || []);
  });
});

// Confirm student received the book (final step)
router.post('/confirm-book-received', authenticateAdmin, (req, res) => {

  const adminId = req.admin.id;
  const { request_id } = req.body;

  if (!request_id) {
    return res.status(400).json({ message: 'Request ID is required' });
  }

  // Get request details
  const getRequestSql = `
    SELECT
      br.*,
      m.title,
      m.author,
      m.type,
      m.description,
      m.seller_id
    FROM book_requests br
    JOIN used_books_marketplace m ON br.marketplace_book_id = m.id
    WHERE br.id = ? AND br.status = 'active'
  `;

  db.query(getRequestSql, [request_id], (err, results) => {
    if (err) {
      console.error('Error fetching request:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Request not found or already processed' });
    }

    const request = results[0];

    // Start transaction
    db.beginTransaction((err) => {
      if (err) {
        console.error('Transaction error:', err);
        return res.status(500).json({ message: 'Transaction error' });
      }

      // Step 1: Update book_requests to completed
      const updateRequestSql = `
        UPDATE book_requests
        SET status = 'completed',
            completed_at = NOW()
        WHERE id = ?
      `;

      db.query(updateRequestSql, [request_id], (err) => {
        if (err) {
          return db.rollback(() => {
            console.error('Error updating request:', err);
            res.status(500).json({ message: 'Failed to update request' });
          });
        }

        // Step 2: Update marketplace book to completed
        const updateMarketplaceSql = `
          UPDATE used_books_marketplace
          SET status = 'completed',
              completed_at = NOW(),
              buyer_id = ?
          WHERE id = ?
        `;

        db.query(updateMarketplaceSql, [request.requester_id, request.marketplace_book_id], (err) => {
          if (err) {
            return db.rollback(() => {
              console.error('Error updating marketplace:', err);
              res.status(500).json({ message: 'Failed to update marketplace' });
            });
          }

          // Step 3: Cancel all other pending requests for this book
          const cancelOthersSql = `
            UPDATE book_requests
            SET status = 'cancelled',
                cancelled_at = NOW()
            WHERE marketplace_book_id = ?
              AND id != ?
              AND status = 'active'
          `;

          db.query(cancelOthersSql, [request.marketplace_book_id, request_id], (err) => {
            if (err) {
              return db.rollback(() => {
                console.error('Error cancelling other requests:', err);
                res.status(500).json({ message: 'Failed to cancel other requests' });
              });
            }

            // Commit transaction
            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  console.error('Commit error:', err);
                  res.status(500).json({ message: 'Failed to complete transaction' });
                });
              }

              res.json({
                message: 'Book handover confirmed successfully. Book assigned to student.',
                studentId: request.requester_id
              });
            });
          });
        });
      });
    });
  });
});

// Reject a purchase request
router.post('/reject-purchase-request', authenticateAdmin, (req, res) => {

  const adminId = req.admin.id;
  const { request_id, rejection_reason } = req.body;

  if (!request_id) {
    return res.status(400).json({ message: 'Request ID is required' });
  }

  const updateSql = `
    UPDATE book_requests
    SET status = 'cancelled',
        cancelled_at = NOW()
    WHERE id = ? AND status = 'active'
  `;

  db.query(updateSql, [request_id], (err, result) => {
    if (err) {
      console.error('Error rejecting request:', err);
      return res.status(500).json({ message: 'Failed to reject request' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Request not found or already processed' });
    }

    res.json({ message: 'Purchase request rejected successfully' });
  });
});

// ==========================================
// LIBRARY BRANCH BOOK REQUEST MANAGEMENT
// ==========================================

// Get all pending branch book requests (requires approval)
router.get('/branch-books/pending-requests', authenticateAdmin, (req, res) => {
  const sql = `
    SELECT
      br.id AS request_id,
      br.book_id,
      br.student_id,
      br.requested_at,
      br.status,
      b.title,
      b.author,
      b.acc_no,
      b.book_format,
      student.username AS student_username,
      student.firstName AS student_first_name,
      student.lastName AS student_last_name,
      student.email AS student_email,
      student.usn AS student_usn
    FROM branch_book_requests br
    JOIN books b ON br.book_id = b.id
    JOIN users student ON br.student_id = student.id
    WHERE br.status = 'pending'
    ORDER BY br.requested_at ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching pending branch book requests:', err);
      return res.status(500).json([]);
    }
    res.json(results || []);
  });
});

// Get all approved branch book requests (awaiting handover confirmation)
router.get('/branch-books/approved-requests', authenticateAdmin, (req, res) => {
  const sql = `
    SELECT
      br.id AS request_id,
      br.book_id,
      br.student_id,
      br.requested_at,
      br.approved_at,
      br.approved_by_admin,
      br.status,
      br.confirmed_handed_over,
      br.confirmed_at,
      b.title,
      b.author,
      b.acc_no,
      b.book_format,
      student.username AS student_username,
      student.firstName AS student_first_name,
      student.lastName AS student_last_name,
      student.email AS student_email,
      student.usn AS student_usn
    FROM branch_book_requests br
    JOIN books b ON br.book_id = b.id
    JOIN users student ON br.student_id = student.id
    WHERE br.status = 'approved' AND br.confirmed_handed_over = false
    ORDER BY br.approved_at ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching approved branch book requests:', err);
      return res.status(500).json([]);
    }
    res.json(results || []);
  });
});

// Approve a library book request
router.post('/branch-books/approve', authenticateAdmin, (req, res) => {
  const { request_id } = req.body;
  const adminId = req.admin.id;

  if (!request_id) {
    return res.status(400).json({
      success: false,
      message: 'Request ID is required'
    });
  }

  const updateSql = `
    UPDATE branch_book_requests
    SET status = 'approved',
        approved_at = NOW()
    WHERE id = ? AND status = 'pending'
  `;

  db.query(updateSql, [request_id], (err, result) => {
    if (err) {
      console.error('Error approving branch book request:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to approve request'
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found or not in pending status'
      });
    }

    res.json({
      success: true,
      message: 'Library book request approved successfully'
    });
  });
});

// Reject a library book request
router.post('/branch-books/reject', authenticateAdmin, (req, res) => {
  const { request_id, rejection_reason } = req.body;
  const adminId = req.admin.id;

  if (!request_id) {
    return res.status(400).json({
      success: false,
      message: 'Request ID is required'
    });
  }

  if (!rejection_reason || rejection_reason.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Rejection reason is required'
    });
  }

  const updateSql = `
    UPDATE branch_book_requests
    SET status = 'rejected',
        rejection_reason = ?,
        approved_at = NOW()
    WHERE id = ? AND status = 'pending'
  `;

  db.query(updateSql, [rejection_reason, request_id], (err, result) => {
    if (err) {
      console.error('Error rejecting branch book request:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to reject request'
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found or not in pending status'
      });
    }

    res.json({
      success: true,
      message: 'Library book request rejected successfully'
    });
  });
});

// Confirm library book handover
router.post('/branch-books/confirm-handover', authenticateAdmin, (req, res) => {
  const { request_id } = req.body;
  const adminId = req.admin.id;

  if (!request_id) {
    return res.status(400).json({
      success: false,
      message: 'Request ID is required'
    });
  }

  const updateSql = `
    UPDATE branch_book_requests
    SET confirmed_handed_over = true,
        confirmed_at = NOW()
    WHERE id = ? AND status = 'approved'
  `;

  db.query(updateSql, [request_id], (err, result) => {
    if (err) {
      console.error('Error confirming branch book handover:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to confirm handover'
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found or not in approved status'
      });
    }

    res.json({
      success: true,
      message: 'Book handover confirmed successfully'
    });
  });
});

module.exports = router;
