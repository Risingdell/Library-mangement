const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for book file uploads (PDF, DOCX, etc.)
const bookStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'book-files');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const userId = req.session?.user?.id || 'unknown';
    cb(null, 'book-' + userId + '-' + uniqueSuffix + ext);
  }
});

const bookFileFilter = (req, file, cb) => {
  // Allow PDF, DOCX, DOC, EPUB, TXT, etc.
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/epub+zip',
    'text/plain'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOCX, DOC, EPUB, and TXT files are allowed!'), false);
  }
};

const bookUpload = multer({
  storage: bookStorage,
  fileFilter: bookFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for book files
});

// ✅ GET all listings (for seller or buyer) with request queue info
router.get('/sell-books', (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const sql = `
    SELECT
      m.*,
      u.username AS active_buyer_name,
      (SELECT COUNT(*) FROM book_requests br
       WHERE br.marketplace_book_id = m.id AND br.status = 'active') AS request_count,
      (SELECT GROUP_CONCAT(
        CONCAT(u2.username, '|', u2.id, '|', br2.requested_at, '|', br2.is_priority_buyer)
        ORDER BY br2.requested_at ASC
        SEPARATOR ';;'
       )
       FROM book_requests br2
       JOIN users u2 ON br2.requester_id = u2.id
       WHERE br2.marketplace_book_id = m.id AND br2.status = 'active'
      ) AS requesters_list
    FROM used_books_marketplace m
    LEFT JOIN users u ON m.active_requester_id = u.id
    WHERE m.seller_id = ?
      OR m.status IN ('available', 'requested', 'sold', 'completed')
      OR m.active_requester_id = ?
      OR EXISTS (
        SELECT 1 FROM book_requests br3
        WHERE br3.marketplace_book_id = m.id
        AND br3.requester_id = ?
        AND br3.status = 'active'
      )
    ORDER BY m.id DESC
  `;

  db.query(sql, [userId, userId, userId], (err, result) => {
    if (err) {
      console.error('Fetch failed:', err);
      return res.status(500).json({ message: 'Fetch failed' });
    }

    // Parse the requesters_list into an array
    const parsedResult = result.map(item => ({
      ...item,
      requesters: item.requesters_list ? item.requesters_list.split(';;').map(r => {
        const [username, id, requested_at, is_priority] = r.split('|');
        return {
          username,
          id: parseInt(id),
          requested_at,
          is_priority_buyer: is_priority === '1'
        };
      }) : []
    }));

    res.json(parsedResult);
  });
});


// ✅ Request to buy a listed book (supports multiple requesters in queue)
router.post('/sell-books/request', (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  const buyerId = req.session.user.id;
  const { id } = req.body;

  // Check if book exists and is available or already requested
  const fetchSql = `
    SELECT * FROM used_books_marketplace
    WHERE id = ?
    AND status IN ('available', 'requested')
  `;

  db.query(fetchSql, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(400).json({ message: 'Book not available for request' });

    const book = results[0];
    if (book.seller_id === buyerId) {
      return res.status(403).json({ message: 'You cannot request your own listing' });
    }

    // Check if user already requested this book
    const checkExistingSql = `
      SELECT * FROM book_requests
      WHERE marketplace_book_id = ? AND requester_id = ? AND status = 'active'
    `;

    db.query(checkExistingSql, [id, buyerId], (err, existingRequests) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (existingRequests.length > 0) {
        return res.status(400).json({ message: 'You have already requested this book' });
      }

      // Determine if this is the first requester
      const countRequestsSql = `
        SELECT COUNT(*) as count FROM book_requests
        WHERE marketplace_book_id = ? AND status = 'active'
      `;

      db.query(countRequestsSql, [id], (err, countResults) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        const isFirstRequester = countResults[0].count === 0;

        // Insert into book_requests
        const insertRequestSql = `
          INSERT INTO book_requests (marketplace_book_id, requester_id, is_priority_buyer, status)
          VALUES (?, ?, ?, 'active')
        `;

        db.query(insertRequestSql, [id, buyerId, isFirstRequester], (err) => {
          if (err) {
            console.error('Failed to create request:', err);
            return res.status(500).json({ message: 'Failed to create request' });
          }

          // If this is the first requester, update marketplace table
          if (isFirstRequester) {
            const updateMarketplaceSql = `
              UPDATE used_books_marketplace
              SET status = 'requested',
                  active_requester_id = ?,
                  buyer_id = ?,
                  requested_at = NOW()
              WHERE id = ?
            `;

            db.query(updateMarketplaceSql, [buyerId, buyerId, id], (err) => {
              if (err) {
                console.error('Failed to update marketplace:', err);
                return res.status(500).json({ message: 'Failed to update book status' });
              }

              return res.json({
                message: 'Book successfully requested! You are first in line.',
                position: 1
              });
            });
          } else {
            // Not first, just added to queue
            return res.json({
              message: `Request added to queue. Position: ${countResults[0].count + 1}`,
              position: countResults[0].count + 1
            });
          }
        });
      });
    });
  });
});

// ✅ Seller marks book as "Sold" to active requester
router.post('/sell-books/mark-sold', (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  const sellerId = req.session.user.id;
  const { id } = req.body;

  // Verify seller owns this book and it's in requested status
  const verifySql = `
    SELECT * FROM used_books_marketplace
    WHERE id = ? AND seller_id = ? AND status = 'requested'
  `;

  db.query(verifySql, [id, sellerId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) {
      return res.status(403).json({ message: 'Not authorized or book not in requested status' });
    }

    // Mark as sold
    const updateSql = `
      UPDATE used_books_marketplace
      SET status = 'sold', sold_at = NOW()
      WHERE id = ?
    `;

    db.query(updateSql, [id], (err) => {
      if (err) {
        console.error('Failed to mark as sold:', err);
        return res.status(500).json({ message: 'Failed to mark as sold' });
      }

      res.json({ message: 'Book marked as sold! Waiting for buyer to confirm receipt.' });
    });
  });
});

// ✅ Buyer confirms book was received (completes transaction)
router.post('/sell-books/confirm-receive', (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  const buyerId = req.session.user.id;
  const { id } = req.body;

  // Verify this is the active requester and book is marked as sold
  const verifySql = `
    SELECT * FROM used_books_marketplace
    WHERE id = ? AND active_requester_id = ? AND status = 'sold'
  `;

  db.query(verifySql, [id, buyerId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) {
      return res.status(403).json({ message: 'Not authorized or seller has not marked as sold yet' });
    }

    // Mark transaction as completed
    const updateMarketplaceSql = `
      UPDATE used_books_marketplace
      SET status = 'completed', completed_at = NOW()
      WHERE id = ?
    `;

    db.query(updateMarketplaceSql, [id], (err) => {
      if (err) {
        console.error('Failed to complete transaction:', err);
        return res.status(500).json({ message: 'Failed to complete transaction' });
      }

      // Mark the request as completed
      const updateRequestSql = `
        UPDATE book_requests
        SET status = 'completed', completed_at = NOW()
        WHERE marketplace_book_id = ? AND requester_id = ? AND status = 'active'
      `;

      db.query(updateRequestSql, [id, buyerId], (err) => {
        if (err) {
          console.error('Failed to update request status:', err);
        }

        // Cancel all other pending requests for this book
        const cancelOthersSql = `
          UPDATE book_requests
          SET status = 'cancelled', cancelled_at = NOW()
          WHERE marketplace_book_id = ? AND status = 'active' AND requester_id != ?
        `;

        db.query(cancelOthersSql, [id, buyerId], (err) => {
          if (err) {
            console.error('Failed to cancel other requests:', err);
          }

          res.json({
            message: 'Transaction completed! The book has been removed from the marketplace.',
            transactionComplete: true
          });
        });
      });
    });
  });
});

// ✅ Cancel a request (with automatic queue promotion)
router.post('/sell-books/cancel-request', (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  const buyerId = req.session.user.id;
  const { id } = req.body;

  // Check if this user has an active request
  const checkRequestSql = `
    SELECT * FROM book_requests
    WHERE marketplace_book_id = ? AND requester_id = ? AND status = 'active'
  `;

  db.query(checkRequestSql, [id, buyerId], (err, requests) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (requests.length === 0) {
      return res.status(404).json({ message: 'No active request found' });
    }

    const wasPriorityBuyer = requests[0].is_priority_buyer;

    // Mark request as cancelled
    const cancelRequestSql = `
      UPDATE book_requests
      SET status = 'cancelled', cancelled_at = NOW()
      WHERE marketplace_book_id = ? AND requester_id = ? AND status = 'active'
    `;

    db.query(cancelRequestSql, [id, buyerId], (err) => {
      if (err) return res.status(500).json({ message: 'Failed to cancel request' });

      // If this was the priority buyer, promote the next in queue
      if (wasPriorityBuyer) {
        db.query('CALL promote_next_buyer(?)', [id], (err) => {
          if (err) {
            console.error('Failed to promote next buyer:', err);
            return res.status(500).json({ message: 'Request cancelled but failed to update queue' });
          }

          res.json({
            message: 'Request cancelled successfully. Next buyer in queue has been notified.',
            wasPriorityBuyer: true
          });
        });
      } else {
        // Not priority buyer, just cancelled
        res.json({
          message: 'Request cancelled successfully',
          wasPriorityBuyer: false
        });
      }
    });
  });
});

// ✅ Delete a listing by seller
router.delete('/sell-books/:id', (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  const sellerId = req.session.user.id;
  const { id } = req.params;

  const sql = `
    DELETE FROM used_books_marketplace
    WHERE id = ? AND seller_id = ? AND status = 'available'
  `;

  db.query(sql, [id, sellerId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Delete failed' });
    if (result.affectedRows === 0)
      return res.status(403).json({ message: 'Not authorized or already requested' });

    res.json({ message: 'Listing deleted successfully' });
  });
});


// ✅ New: fetch books from borrowed_books (e.g., eligible for buy/resell)
router.get('/sell-books/from-borrowed', (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  const userId = req.session.user.id;
  const sql = `
    SELECT b.id AS book_id, b.title, b.author, b.acc_no
    FROM borrowed_books bb
    JOIN books b ON bb.book_id = b.id
    WHERE bb.user_id = ? AND bb.returned_at IS NULL
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch borrowed books' });
    res.json(result);
  });
});


// ✅ New: create listing for borrowed book (Buy from borrowed tab)
router.post('/sell-books/buy-from-borrowed', (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  const buyerId = req.session.user.id;
  const { book_id, title, author, acc_no, description, contact, type } = req.body;

  const insertSql = `
    INSERT INTO used_books_marketplace
    (title, author, acc_no, description, contact, type, seller_id, buyer_id, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'requested')
  `;

  db.query(
    insertSql,
    [title, author, acc_no, description, contact, type, buyerId, buyerId],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Failed to list book from borrowed' });
      res.json({ message: 'Listed successfully from borrowed' });
    }
  );
});

// ✅ Get user's requested selling books (for sidebar display)
router.get('/sell-books/my-requests', (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  const userId = req.session.user.id;

  const sql = `
    SELECT
      m.*,
      br.requested_at,
      br.is_priority_buyer,
      br.status as request_status,
      u.username as seller_name,
      (SELECT COUNT(*) FROM book_requests br2
       WHERE br2.marketplace_book_id = m.id
       AND br2.status = 'active'
       AND br2.requested_at < br.requested_at) + 1 as queue_position
    FROM book_requests br
    JOIN used_books_marketplace m ON br.marketplace_book_id = m.id
    LEFT JOIN users u ON m.seller_id = u.id
    WHERE br.requester_id = ?
    AND br.status = 'active'
    ORDER BY br.requested_at DESC
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Failed to fetch user requests:', err);
      return res.status(500).json({ message: 'Failed to fetch requests' });
    }

    res.json(result);
  });
});

// ✅ POST /sell-book - Create a new listing in marketplace (with optional file upload for soft copies)
router.post('/sell-book', bookUpload.single('bookFile'), (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  const sellerId = req.session.user.id;
  const { type, title, author, description, acc_no, contact, status, book_format } = req.body;

  // Validate required fields
  if (!type || !title || !contact) {
    return res.status(400).json({ message: 'Type, title, and contact are required' });
  }

  // Validate book_format if provided
  const bookFormat = book_format || 'hard_copy';
  if (!['hard_copy', 'soft_copy'].includes(bookFormat)) {
    return res.status(400).json({ message: 'Invalid book format' });
  }

  // If soft copy, file must be uploaded
  if (bookFormat === 'soft_copy' && !req.file) {
    return res.status(400).json({ message: 'Soft copy books require a file upload' });
  }

  let filePath = null;
  let fileOriginalName = null;
  let fileSize = null;

  if (req.file) {
    filePath = `/uploads/book-files/${req.file.filename}`;
    fileOriginalName = req.file.originalname;
    fileSize = req.file.size;
  }

  const insertSql = `
    INSERT INTO used_books_marketplace
    (seller_id, type, title, author, description, acc_no, contact, status, book_format, file_path, file_original_name, file_size, uploaded_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'user')
  `;

  const values = [
    sellerId,
    type,
    title,
    author || null,
    description || null,
    acc_no || null,
    contact,
    status || 'available',
    bookFormat,
    filePath,
    fileOriginalName,
    fileSize
  ];

  db.query(insertSql, values, (err, result) => {
    if (err) {
      console.error('Error inserting book:', err);
      // Delete uploaded file if database insert fails
      if (req.file) {
        const uploadedFilePath = path.join(__dirname, '..', 'uploads', 'book-files', req.file.filename);
        if (fs.existsSync(uploadedFilePath)) {
          fs.unlinkSync(uploadedFilePath);
        }
      }
      return res.status(500).json({ message: 'Failed to list book for sale' });
    }

    res.status(201).json({
      message: bookFormat === 'soft_copy' ? 'Soft copy book uploaded successfully' : 'Book listed successfully',
      bookId: result.insertId
    });
  });
});

// ✅ Download soft copy book
router.get('/sell-books/download/:id', (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  const { id } = req.params;
  const userId = req.session.user.id;

  // Get book details
  const sql = `
    SELECT * FROM used_books_marketplace
    WHERE id = ? AND book_format = 'soft_copy'
  `;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) {
      return res.status(404).json({ message: 'Soft copy book not found' });
    }

    const book = results[0];

    if (!book.file_path) {
      return res.status(404).json({ message: 'File not found for this book' });
    }

    // Construct full file path
    const filePath = path.join(__dirname, '..', book.file_path);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Increment download count
    const updateCountSql = `
      UPDATE used_books_marketplace
      SET download_count = download_count + 1
      WHERE id = ?
    `;

    db.query(updateCountSql, [id], (err) => {
      if (err) console.error('Failed to update download count:', err);

      // Send file for download
      res.download(filePath, book.file_original_name, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          if (!res.headersSent) {
            res.status(500).json({ message: 'Error downloading file' });
          }
        }
      });
    });
  });
});

router.post('/sell-books/buy', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const buyerId = req.session.user.id;
  const { bookId } = req.body; // frontend should send { bookId: <number> }

  const fetchSql = `
    SELECT * FROM used_books_marketplace
    WHERE id = ? AND status = 'available'
  `;

  db.query(fetchSql, [bookId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    if (results.length === 0) {
      return res.status(404).json({ message: 'Book not available or already requested' });
    }

    const book = results[0];

    // Prevent buying your own listing
    if (book.seller_id === buyerId) {
      return res.status(403).json({ message: 'You cannot buy your own book' });
    }

    // Optional: insert into selling_books (if you need transaction history)
    const insertSql = `
      INSERT INTO selling_books (title, author, acc_no, contact, description, type, seller_id, buyer_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'requested')
    `;

    const insertValues = [
      book.title,
      book.author,
      book.acc_no,
      book.contact,
      book.description,
      book.type,
      book.seller_id,
      buyerId
    ];

    db.query(insertSql, insertValues, (insertErr) => {
      if (insertErr) {
        console.error('Insert failed:', insertErr);
        return res.status(500).json({ message: 'Failed to insert buy record' });
      }

      // Update the book status to 'requested'
      const updateSql = `
        UPDATE used_books_marketplace
        SET status = 'requested', buyer_id = ?, requested_at = NOW()
        WHERE id = ?
      `;

      db.query(updateSql, [buyerId, bookId], (updateErr) => {
        if (updateErr) {
          console.error('Update failed:', updateErr);
          return res.status(500).json({ message: 'Failed to update book status' });
        }

        res.status(200).json({ message: 'Book requested successfully' });
      });
    });
  });
});

module.exports = router;
