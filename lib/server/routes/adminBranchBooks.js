const express = require('express');
const router = express.Router();
const db = require('../db');

// ==========================================
// ADMIN BRANCH BOOK REQUEST MANAGEMENT ROUTES
// ==========================================

/**
 * Get all pending branch book requests
 * GET /api/admin/branch-books/pending-requests
 */
router.get('/pending-requests', (req, res) => {
  // Check if admin is logged in
  if (!req.session.admin) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Admin access required.'
    });
  }

  const sql = `
    SELECT * FROM admin_pending_branch_requests
    WHERE status = 'pending'
    ORDER BY requested_at ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching pending requests:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch pending requests'
      });
    }

    res.json({
      success: true,
      data: results
    });
  });
});

/**
 * Get all approved requests awaiting handover
 * GET /api/admin/branch-books/approved-requests
 */
router.get('/approved-requests', (req, res) => {
  if (!req.session.admin) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Admin access required.'
    });
  }

  const sql = `
    SELECT * FROM admin_pending_branch_requests
    WHERE status = 'approved' AND confirmed_handed_over = FALSE
    ORDER BY approved_at ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching approved requests:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch approved requests'
      });
    }

    res.json({
      success: true,
      data: results
    });
  });
});

/**
 * Get all branch book requests (with filters)
 * GET /api/admin/branch-books/all-requests?status=pending
 */
router.get('/all-requests', (req, res) => {
  if (!req.session.admin) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Admin access required.'
    });
  }

  const { status } = req.query;

  let sql = `
    SELECT
      br.id AS request_id,
      br.book_id,
      br.student_id,
      br.requested_at,
      br.status,
      br.approved_by_admin,
      br.approved_at,
      br.confirmed_handed_over,
      br.confirmed_by_admin,
      br.confirmed_at,
      br.rejection_reason,
      b.title,
      b.author,
      b.acc_no,
      b.book_format,
      b.type,
      b.status AS book_status,
      u.username AS student_username,
      u.firstName AS student_first_name,
      u.lastName AS student_last_name,
      u.email AS student_email,
      u.usn AS student_usn
    FROM branch_book_requests br
    JOIN books b ON br.book_id = b.id
    JOIN users u ON br.student_id = u.id
  `;

  const params = [];

  if (status) {
    sql += ' WHERE br.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY br.requested_at DESC';

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching all requests:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch requests'
      });
    }

    res.json({
      success: true,
      data: results
    });
  });
});

/**
 * Approve a branch book request
 * POST /api/admin/branch-books/approve
 */
router.post('/approve', (req, res) => {
  if (!req.session.admin) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Admin access required.'
    });
  }

  const { requestId } = req.body;
  const adminId = req.session.admin.id;

  if (!requestId) {
    return res.status(400).json({
      success: false,
      message: 'Request ID is required'
    });
  }

  // Check if request exists and is pending
  const checkSql = `
    SELECT id, status
    FROM branch_book_requests
    WHERE id = ?
  `;

  db.query(checkSql, [requestId], (err, requests) => {
    if (err) {
      console.error('Error checking request:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const request = requests[0];

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve request with status: ${request.status}`
      });
    }

    // Approve the request
    const approveSql = `
      UPDATE branch_book_requests
      SET status = 'approved',
          approved_by_admin = ?,
          approved_at = NOW()
      WHERE id = ?
    `;

    db.query(approveSql, [adminId, requestId], (err) => {
      if (err) {
        console.error('Error approving request:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to approve request'
        });
      }

      res.json({
        success: true,
        message: 'Request approved successfully'
      });
    });
  });
});

/**
 * Reject a branch book request
 * POST /api/admin/branch-books/reject
 */
router.post('/reject', (req, res) => {
  if (!req.session.admin) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Admin access required.'
    });
  }

  const { requestId, rejectionReason } = req.body;
  const adminId = req.session.admin.id;

  if (!requestId) {
    return res.status(400).json({
      success: false,
      message: 'Request ID is required'
    });
  }

  // Check if request exists and is pending
  const checkSql = `
    SELECT id, status
    FROM branch_book_requests
    WHERE id = ?
  `;

  db.query(checkSql, [requestId], (err, requests) => {
    if (err) {
      console.error('Error checking request:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const request = requests[0];

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject request with status: ${request.status}`
      });
    }

    // Reject the request
    const rejectSql = `
      UPDATE branch_book_requests
      SET status = 'rejected',
          approved_by_admin = ?,
          approved_at = NOW(),
          rejection_reason = ?
      WHERE id = ?
    `;

    db.query(rejectSql, [adminId, rejectionReason || null, requestId], (err) => {
      if (err) {
        console.error('Error rejecting request:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to reject request'
        });
      }

      res.json({
        success: true,
        message: 'Request rejected successfully'
      });
    });
  });
});

/**
 * Confirm book handover to student
 * This replaces the trigger functionality
 * POST /api/admin/branch-books/confirm-handover
 */
router.post('/confirm-handover', async (req, res) => {
  if (!req.session.admin) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Admin access required.'
    });
  }

  const { requestId } = req.body;
  const adminId = req.session.admin.id;

  if (!requestId) {
    return res.status(400).json({
      success: false,
      message: 'Request ID is required'
    });
  }

  // Use promise-based queries for transaction support
  const connection = await db.promise().getConnection();

  try {
    // Start transaction
    await connection.beginTransaction();

    // 1. Get the request details
    const [requests] = await connection.query(
      `SELECT id, book_id, student_id, status, confirmed_handed_over
       FROM branch_book_requests
       WHERE id = ?`,
      [requestId]
    );

    if (requests.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const request = requests[0];

    // Check if already confirmed
    if (request.confirmed_handed_over) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Book handover already confirmed'
      });
    }

    // Check if request is approved
    if (request.status !== 'approved') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Request must be approved before confirming handover'
      });
    }

    // 2. Update branch_book_requests - confirm handover
    await connection.query(
      `UPDATE branch_book_requests
       SET confirmed_handed_over = TRUE,
           confirmed_by_admin = ?,
           confirmed_at = NOW(),
           status = 'completed'
       WHERE id = ?`,
      [adminId, requestId]
    );

    // 3. Update books table - mark as borrowed
    await connection.query(
      `UPDATE books
       SET status = 'borrowed'
       WHERE id = ?`,
      [request.book_id]
    );

    // 4. Create borrowed_books entry
    await connection.query(
      `INSERT INTO borrowed_books (
        book_id,
        user_id,
        borrow_date,
        expiry_date,
        return_status,
        status
      ) VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY), 'active', 'borrowed')`,
      [request.book_id, request.student_id]
    );

    // Commit transaction
    await connection.commit();

    res.json({
      success: true,
      message: 'Book handover confirmed successfully. Book has been assigned to student.',
      data: {
        requestId,
        bookId: request.book_id,
        studentId: request.student_id
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error confirming handover:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm handover',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

/**
 * Get request statistics
 * GET /api/admin/branch-books/stats
 */
router.get('/stats', (req, res) => {
  if (!req.session.admin) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Admin access required.'
    });
  }

  const sql = `
    SELECT
      COUNT(*) as total_requests,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
      SUM(CASE WHEN status = 'approved' AND confirmed_handed_over = FALSE THEN 1 ELSE 0 END) as awaiting_handover_count
    FROM branch_book_requests
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching stats:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics'
      });
    }

    res.json({
      success: true,
      data: results[0]
    });
  });
});

module.exports = router;
