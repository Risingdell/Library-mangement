# Library Management System - Quick Reference Card

## File Paths Quick Lookup

| Feature | Frontend File | Backend File | Database Table |
|---------|---------------|--------------|-----------------|
| **Student borrows book** | MainPage.jsx:111 | branchBooks.js:13 | branch_book_requests |
| **Admin views requests** | AdminDashboard.jsx:105 | adminBranchBooks.js:13 | admin_pending_branch_requests (view) |
| **Admin approves** | AdminDashboard.jsx:* | adminBranchBooks.js:150 | branch_book_requests |
| **Admin confirms handover** | AdminDashboard.jsx:* | adminBranchBooks.js:312 | borrowed_books (new) |
| **Book listing** | MainPage.jsx:70 | index.js:804 | books |
| **User login** | Login.jsx | index.js:760 | users |

---

## Key Endpoint Reference

```
STUDENT ENDPOINTS:
═════════════════

POST /api/branch-books/request
  Send: { bookId: <number> }
  Get:  { success: true, requestId: <number> }
  Errors: 400 (validation), 401 (auth), 404 (book), 500 (db)

GET /api/branch-books/my-requests
  Returns: Array of student's requests

DELETE /api/branch-books/request/:requestId
  Cancel a pending request

GET /api/branch-books/status/:requestId
  Check request status (from FIXES_TO_APPLY.md)


ADMIN ENDPOINTS:
═══════════════

GET /api/admin/branch-books/pending-requests
  Returns: Array of requests with status='pending'
  Fields: id, book_id, student_id, status, book details, student details

GET /api/admin/branch-books/approved-requests
  Returns: Array of approved requests awaiting handover

POST /api/admin/branch-books/approve
  Send: { requestId: <number> }
  Action: Changes status from 'pending' to 'approved'

POST /api/admin/branch-books/reject
  Send: { requestId: <number>, rejectionReason: <string> }
  Action: Changes status to 'rejected'

POST /api/admin/branch-books/confirm-handover
  Send: { requestId: <number> }
  Action: Completes request + creates borrowed_books entry
```

---

## SQL Queries - Useful for Debugging

```sql
-- Check if migration applied
SHOW TABLES LIKE 'branch_book_requests';

-- View all pending requests
SELECT
  br.id, br.book_id, b.title, br.student_id, u.username,
  br.requested_at, br.status
FROM branch_book_requests br
JOIN books b ON br.book_id = b.id
JOIN users u ON br.student_id = u.id
WHERE br.status = 'pending'
ORDER BY br.requested_at ASC;

-- View requests by specific student
SELECT * FROM branch_book_requests
WHERE student_id = <user_id>
ORDER BY requested_at DESC;

-- View books currently borrowed
SELECT b.id, b.title, u.username, bb.borrow_date, bb.expiry_date
FROM borrowed_books bb
JOIN books b ON bb.book_id = b.id
JOIN users u ON bb.user_id = u.id
WHERE bb.return_status = 'active'
ORDER BY bb.expiry_date ASC;

-- View available books
SELECT id, title, author FROM books
WHERE status = 'available'
ORDER BY title;

-- Check for stuck requests (older than 7 days)
SELECT * FROM branch_book_requests
WHERE status = 'pending'
AND requested_at < DATE_SUB(NOW(), INTERVAL 7 DAY);

-- Clear old test data
DELETE FROM branch_book_requests
WHERE requested_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

---

## Error Messages & Meanings

```
400: Bad Request
  ├─ "Book ID is required" → Missing bookId in request
  ├─ "Book is not available" → Book status ≠ 'available'
  ├─ "Already have pending request" → Student has active request
  └─ "Cannot approve..." → Request already processed

401: Unauthorized
  ├─ "Unauthorized" → User not logged in
  └─ "Admin access required" → Admin not authenticated

404: Not Found
  ├─ "Book not found" → Book ID doesn't exist
  └─ "Request not found" → Request ID doesn't exist

500: Server Error
  ├─ "Database error" → SQL query failed
  ├─ "Table not found" → Migration not applied
  └─ Check backend logs for details
```

---

## Status Values & Meanings

```
branch_book_requests.status:
═══════════════════════════
'pending'     → Waiting for admin approval
'approved'    → Admin approved, waiting for handover confirmation
'rejected'    → Admin rejected request
'completed'   → Book handed over to student (moved to borrowed_books)

books.status:
═════════════
'available'   → Ready to borrow
'borrowed'    → Currently checked out to student
'damaged'     → Not available (optional status)
'reserved'    → Reserved by another student (optional)

borrowed_books.return_status:
════════════════════════════
'active'           → Currently borrowed
'pending_return'   → Student wants to return
'approved'         → Admin approved return
'rejected'         → Admin rejected return
```

---

## Browser DevTools Debugging

### Check Network Tab
```
POST /api/branch-books/request
  Status: 400 or 500?
  Response: { success: false, message: "..." }

GET /api/admin/branch-books/pending-requests
  Status: 401, 404, or 500?
  Response body should have error details
```

### Check Console Tab
```javascript
// Look for messages like:
[BRANCH BOOK REQUEST] User 42 requesting book 123
[ADMIN REQUESTS] Found 5 pending requests
Error: Failed to insert request
```

### Check Application Tab
```
Session Storage: admin_session ✓
Session Storage: user_session ✓
Local Storage: auth_token (if used) ✓
```

---

## Configuration Checklist

```
✓ lib/server/.env
  ├─ DB_HOST=localhost (or your server)
  ├─ DB_USER=root
  ├─ DB_PASS=password
  └─ DB_NAME=library

✓ lib/server/db.js
  ├─ Connection pool configured
  ├─ Credentials match .env
  └─ Database name = 'library'

✓ lib/server/index.js
  ├─ Routes registered: line 689
  ├─ CORS enabled: credentials: true
  └─ Session configured: httpOnly: true

✓ lib/server/routes/branchBooks.js
  ├─ POST /request handler exists
  └─ Database queries using db.query()

✓ lib/server/routes/adminBranchBooks.js
  ├─ GET /pending-requests handler exists
  ├─ POST /approve handler exists
  └─ POST /confirm-handover handler exists

✓ Database (library)
  ├─ users table ✓
  ├─ admins table ✓
  ├─ books table ✓
  ├─ branch_book_requests table ✓ (from migration)
  └─ borrowed_books table ✓
```

---

## Quick Test Sequences

### Test 1: Book Request (5 minutes)
1. Open http://localhost:5173
2. Register new student
3. Login as student
4. Go to Books tab
5. Click Borrow on any book
6. ✅ Should see: "Book request submitted!"
7. ❌ If error: Check migration applied

### Test 2: Admin Approval (3 minutes)
1. Open http://localhost:5173 in new tab
2. Go to /admin-login
3. Login with admin/admin123
4. Click "Branch Book Requests" tab
5. ✅ Should see the request from Test 1
6. ❌ If empty: Check admin session & migration

### Test 3: Complete Flow (10 minutes)
1. From Test 2: Click "Approve" button
2. ✅ Status should change to "Approved"
3. Click "Confirm Handover"
4. ✅ Status should change to "Completed"
5. Go back to student view
6. ✅ Request should show "completed"
7. Go to "Borrowed Books" tab
8. ✅ Book should appear with 14-day expiry

---

## Common Fixes (One-Liners)

```bash
# Fix 1: Apply migration
node lib/server/apply-migration.js

# Fix 2: Reset book statuses
mysql -u root -ppassword library -e "UPDATE books SET status='available';"

# Fix 3: Restart backend
cd lib/server && npm start

# Fix 4: Clear frontend cache
# Press Ctrl+Shift+Delete in browser

# Fix 5: View database logs
mysql library -e "SELECT * FROM branch_book_requests LIMIT 10;"

# Fix 6: Check table exists
mysql library -e "SHOW TABLES LIKE 'branch_book_requests';"
```

---

## API Response Examples

### Success Response
```json
{
  "success": true,
  "message": "Book request submitted successfully",
  "data": {
    "requestId": 1,
    "bookId": 123,
    "status": "pending"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "You already have a pending request for \"Introduction to Algorithms\"",
  "existingRequest": {
    "bookTitle": "Introduction to Algorithms",
    "requestId": 1,
    "status": "pending"
  }
}
```

### Admin Pending Requests Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "book_id": 123,
      "student_id": 42,
      "status": "pending",
      "requested_at": "2025-02-19T10:00:00Z",
      "title": "Introduction to Algorithms",
      "author": "Cormen",
      "student_username": "john_doe",
      "student_email": "john@example.com"
    }
  ]
}
```

---

## Performance Notes

- Migration takes ~1 second to execute
- Request creation takes ~100ms
- Admin view query takes ~50ms (if indexed correctly)
- Approve/reject action takes ~100ms
- Handover confirmation takes ~200ms (creates multiple records)

---

## Security Checklist

```
✓ User authentication required for student routes
✓ Admin authentication required for admin routes
✓ SQL injection prevented (using parameterized queries)
✓ Session cookies httpOnly = true
✓ CORS credentials enabled
✓ Request validation on all endpoints
✓ Foreign key constraints in database
✓ No passwords logged
```

---

## Monitoring & Alerts

Watch for these patterns:

**🔴 CRITICAL**
- Multiple 500 errors → Database down
- "/pending-requests" returns 404 → Migration not applied
- "Table doesn't exist" in logs → Apply migration

**🟡 WARNING**
- Requests stuck in 'pending' > 7 days → Admin not approving
- Books stuck with 'borrowed' status → Return workflow broken
- High error rate on POST /request → Validation failing

**🟢 NORMAL**
- Mix of pending/approved/completed requests
- Books cycling between available/borrowed
- ~100-200ms response times

---

## Useful Links

- Database file: `/lib/server/db.js`
- Migration file: `/lib/server/migrations/005_add_branch_book_request_workflow.sql`
- Student route: `/lib/server/routes/branchBooks.js`
- Admin route: `/lib/server/routes/adminBranchBooks.js`
- Student UI: `/lib/src/Pages/MainPage.jsx`
- Admin UI: `/lib/src/Pages/AdminDashboard.jsx`
- Main server: `/lib/server/index.js`

---

## For Support

**If you get stuck:**
1. Check QUICK_FIX_GUIDE.md
2. Check ANALYSIS_SUMMARY.md
3. Check backend console logs
4. Check MySQL query errors
5. Check browser Network tab
6. Verify migration applied
7. Clear browser cache
8. Restart backend

**Most common fix: Apply the migration!**

