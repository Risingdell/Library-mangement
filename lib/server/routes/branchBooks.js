const express = require('express');
const router = express.Router();
const db = require('../db');

// ==========================================
// STUDENT BRANCH BOOK REQUEST ROUTES
// ==========================================

/**
 * Request a branch library book
 * POST /api/branch-books/request
 */
router.post('/request', (req, res) => {
  const { bookId } = req.body;

  // Check if user is logged in
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Please login first.'
    });
  }

  const studentId = req.session.user.id;

  // Validate input
  if (!bookId) {
    return res.status(400).json({
      success: false,
      message: 'Book ID is required'
    });
  }

  // Check if book exists and is available
  const checkBookSql = `
    SELECT id, title, status
    FROM books
    WHERE id = ?
  `;

  db.query(checkBookSql, [bookId], (err, books) => {
    if (err) {
      console.error('Error checking book:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (books.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const book = books[0];

    if (book.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: `Book is currently ${book.status}`
      });
    }

    // Check if student already has a pending/approved request for this book
    const checkExistingRequestSql = `
      SELECT id, status
      FROM branch_book_requests
      WHERE book_id = ? AND student_id = ? AND status IN ('pending', 'approved')
    `;

    db.query(checkExistingRequestSql, [bookId, studentId], (err, existingRequests) => {
      if (err) {
        console.error('Error checking existing request:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (existingRequests.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'You already have a pending or approved request for this book'
        });
      }

      // Create the request
      const insertSql = `
        INSERT INTO branch_book_requests (book_id, student_id, status)
        VALUES (?, ?, 'pending')
      `;

      db.query(insertSql, [bookId, studentId], (err, result) => {
        if (err) {
          console.error('Error creating request:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to create request'
          });
        }

        res.json({
          success: true,
          message: 'Book request submitted successfully. Waiting for admin approval.',
          data: {
            requestId: result.insertId,
            bookId: bookId,
            status: 'pending'
          }
        });
      });
    });
  });
});

/**
 * Get all branch book requests for the logged-in student
 * GET /api/branch-books/my-requests
 */
router.get('/my-requests', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }

  const studentId = req.session.user.id;

  const sql = `
    SELECT
      br.id AS request_id,
      br.book_id,
      br.requested_at,
      br.status,
      br.approved_at,
      br.confirmed_handed_over,
      br.confirmed_at,
      br.rejection_reason,
      b.title,
      b.author,
      b.acc_no,
      b.book_format
    FROM branch_book_requests br
    JOIN books b ON br.book_id = b.id
    WHERE br.student_id = ?
    ORDER BY br.requested_at DESC
  `;

  db.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error('Error fetching requests:', err);
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
 * Cancel a pending branch book request
 * DELETE /api/branch-books/request/:requestId
 */
router.delete('/request/:requestId', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }

  const { requestId } = req.params;
  const studentId = req.session.user.id;

  // Check if request exists and belongs to the student
  const checkSql = `
    SELECT id, status
    FROM branch_book_requests
    WHERE id = ? AND student_id = ?
  `;

  db.query(checkSql, [requestId, studentId], (err, requests) => {
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
        message: `Cannot cancel request with status: ${request.status}`
      });
    }

    // Delete the request
    const deleteSql = 'DELETE FROM branch_book_requests WHERE id = ?';

    db.query(deleteSql, [requestId], (err) => {
      if (err) {
        console.error('Error deleting request:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to cancel request'
        });
      }

      res.json({
        success: true,
        message: 'Request cancelled successfully'
      });
    });
  });
});

module.exports = router;
