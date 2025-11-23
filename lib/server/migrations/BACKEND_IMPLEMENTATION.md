# Backend Implementation Guide

## Overview

Since Clever Cloud doesn't allow database triggers, the **book assignment logic** must be implemented in your backend API code.

---

## What Needs to Be Implemented

When an admin **confirms handover** of a branch book to a student, your backend should:

1. Update the `branch_book_requests` record:
   - Set `confirmed_handed_over = TRUE`
   - Set `confirmed_by_admin = <admin_id>`
   - Set `confirmed_at = NOW()`
   - Set `status = 'completed'`

2. Update the `books` record:
   - Set `status = 'borrowed'`

3. Create a `borrowed_books` record:
   - Insert a new row with the book and student details
   - Set borrow date and expiry date (e.g., 14 days)

---

## API Endpoint Implementation

### **Route: POST /api/admin/branch-books/confirm-handover**

```javascript
// backend/routes/adminBranchBooks.js

const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * Confirm that admin has handed over a branch book to student
 * This replaces the database trigger functionality
 */
router.post('/confirm-handover', async (req, res) => {
  const { requestId, adminId } = req.body;

  // Validate input
  if (!requestId || !adminId) {
    return res.status(400).json({
      success: false,
      message: 'Request ID and Admin ID are required'
    });
  }

  // Start transaction
  const connection = await db.promise().getConnection();

  try {
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
      message: 'Book handover confirmed successfully',
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

module.exports = router;
```

---

## Complete Branch Book Request Flow

### **1. Student Requests Book**

**POST /api/branch-books/request**

```javascript
router.post('/request', async (req, res) => {
  const { bookId, studentId } = req.body;

  try {
    const [result] = await db.promise().query(
      `INSERT INTO branch_book_requests (book_id, student_id, status)
       VALUES (?, ?, 'pending')`,
      [bookId, studentId]
    );

    res.json({
      success: true,
      message: 'Book request submitted',
      requestId: result.insertId
    });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create request'
    });
  }
});
```

---

### **2. Admin Approves Request**

**POST /api/admin/branch-books/approve**

```javascript
router.post('/approve', async (req, res) => {
  const { requestId, adminId } = req.body;

  try {
    await db.promise().query(
      `UPDATE branch_book_requests
       SET status = 'approved',
           approved_by_admin = ?,
           approved_at = NOW()
       WHERE id = ? AND status = 'pending'`,
      [adminId, requestId]
    );

    res.json({
      success: true,
      message: 'Request approved successfully'
    });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve request'
    });
  }
});
```

---

### **3. Admin Rejects Request**

**POST /api/admin/branch-books/reject**

```javascript
router.post('/reject', async (req, res) => {
  const { requestId, adminId, rejectionReason } = req.body;

  try {
    await db.promise().query(
      `UPDATE branch_book_requests
       SET status = 'rejected',
           approved_by_admin = ?,
           approved_at = NOW(),
           rejection_reason = ?
       WHERE id = ? AND status = 'pending'`,
      [adminId, rejectionReason, requestId]
    );

    res.json({
      success: true,
      message: 'Request rejected'
    });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject request'
    });
  }
});
```

---

### **4. Admin Confirms Handover**

Use the `confirm-handover` endpoint shown above.

---

## Integration with Existing Code

Add the routes to your Express app:

```javascript
// server.js or app.js

const adminBranchBooksRouter = require('./routes/adminBranchBooks');
const branchBooksRouter = require('./routes/branchBooks');

// Admin routes (protected by admin auth middleware)
app.use('/api/admin/branch-books', authenticateAdmin, adminBranchBooksRouter);

// Student routes (protected by student auth middleware)
app.use('/api/branch-books', authenticateStudent, branchBooksRouter);
```

---

## Database Queries for Admin Dashboard

### **Get Pending Requests**

```javascript
router.get('/pending-requests', async (req, res) => {
  try {
    const [requests] = await db.promise().query(
      `SELECT * FROM admin_pending_branch_requests
       WHERE status = 'pending'
       ORDER BY requested_at ASC`
    );

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending requests'
    });
  }
});
```

### **Get Approved Requests (Awaiting Handover)**

```javascript
router.get('/approved-requests', async (req, res) => {
  try {
    const [requests] = await db.promise().query(
      `SELECT * FROM admin_pending_branch_requests
       WHERE status = 'approved' AND confirmed_handed_over = FALSE
       ORDER BY approved_at ASC`
    );

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching approved requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch approved requests'
    });
  }
});
```

---

## Testing the Implementation

### **1. Test Student Request**

```bash
curl -X POST http://your-backend.render.com/api/branch-books/request \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": 1,
    "studentId": 5
  }'
```

### **2. Test Admin Approval**

```bash
curl -X POST http://your-backend.render.com/api/admin/branch-books/approve \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": 1,
    "adminId": 2
  }'
```

### **3. Test Admin Handover Confirmation**

```bash
curl -X POST http://your-backend.render.com/api/admin/branch-books/confirm-handover \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": 1,
    "adminId": 2
  }'
```

---

## Error Handling

Make sure to handle these scenarios:

- ✅ Request not found
- ✅ Request already confirmed
- ✅ Request not approved yet
- ✅ Book already borrowed
- ✅ Student not found
- ✅ Book not found
- ✅ Database transaction failures

---

## Summary

| Step | Action | API Endpoint | Updates |
|------|--------|--------------|---------|
| 1 | Student requests book | POST /api/branch-books/request | `branch_book_requests` |
| 2 | Admin approves | POST /api/admin/branch-books/approve | `branch_book_requests.status='approved'` |
| 3 | Admin confirms handover | POST /api/admin/branch-books/confirm-handover | `branch_book_requests`, `books`, `borrowed_books` |

---

**This replaces the trigger functionality and works with Clever Cloud's restrictions!**
