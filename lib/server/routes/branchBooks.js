const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateUser } = require('../middleware/jwtAuthMiddleware');

// ==========================================
// STUDENT BRANCH BOOK REQUEST ROUTES
// ==========================================

/**
 * Request a branch library book
 * POST /api/branch-books/request
 */
router.post('/request', authenticateUser, (req, res) => {
  const { bookId } = req.body;

  const studentId = req.user.id;

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

    // Check if student already has ANY active pending/approved branch book request
    // Exclude requests where the book was already handed over AND returned
    const checkAnyPendingRequestSql = `
      SELECT br.id, br.book_id, br.status, b.title
      FROM branch_book_requests br
      JOIN books b ON br.book_id = b.id
      WHERE br.student_id = ?
        AND br.status IN ('pending', 'approved')
        AND NOT (
          br.confirmed_handed_over = 1
          AND EXISTS (
            SELECT 1 FROM borrowed_books bb
            WHERE bb.user_id = br.student_id
              AND bb.book_id = br.book_id
              AND bb.return_status = 'approved'
          )
        )
    `;

    db.query(checkAnyPendingRequestSql, [studentId], (err, existingRequests) => {
      if (err) {
        console.error('Error checking existing request:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      // Check if it's for this same book
      const existingForThisBook = existingRequests.find(req => req.book_id == bookId);
      if (existingForThisBook) {
        return res.status(400).json({
          success: false,
          message: 'You already have a pending or approved request for this book'
        });
      }

      if (existingRequests.length >= 2) {
        return res.status(400).json({
          success: false,
          message: 'You have reached the request limit of 2 books. Please wait for admin confirmation or cancel an existing request first.'
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
router.get('/my-requests', authenticateUser, (req, res) => {
  const studentId = req.user.id;

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
      return res.status(500).json([]);
    }

    res.json(results || []);
  });
});

/**
 * Cancel a pending branch book request
 * DELETE /api/branch-books/request/:requestId
 */
router.delete('/request/:requestId', authenticateUser, (req, res) => {
  const { requestId } = req.params;
  const studentId = req.user.id;

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
