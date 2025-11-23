# Quick Testing Guide

## Prerequisites

1. ✅ Database migration applied (`PRODUCTION_FIX_NO_TRIGGER.sql`)
2. ✅ Backend code deployed
3. ✅ Server running

---

## Test Checklist

### 1. Start Your Server

```bash
cd C:\xampp\htdocs\Lib\Lib\lib\server
npm start
```

Server should start on `http://localhost:5000`

---

### 2. Login as Student

**POST** `http://localhost:5000/login`

```json
{
  "username": "your_username",
  "password": "your_password"
}
```

Save the session cookie from the response.

---

### 3. Test Student - Request a Book

**POST** `http://localhost:5000/api/branch-books/request`

```json
{
  "bookId": 1
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Book request submitted successfully. Waiting for admin approval.",
  "data": {
    "requestId": 1,
    "bookId": 1,
    "status": "pending"
  }
}
```

✅ **Test Passed** if you get `success: true`

---

### 4. Test Student - View My Requests

**GET** `http://localhost:5000/api/branch-books/my-requests`

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "request_id": 1,
      "status": "pending",
      "title": "Book Title",
      ...
    }
  ]
}
```

✅ **Test Passed** if you see your request with status `"pending"`

---

### 5. Login as Admin

**POST** `http://localhost:5000/api/admin/login`

```json
{
  "username": "admin_username",
  "password": "admin_password"
}
```

Save the admin session cookie.

---

### 6. Test Admin - View Pending Requests

**GET** `http://localhost:5000/api/admin/branch-books/pending-requests`

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "request_id": 1,
      "status": "pending",
      "student_first_name": "John",
      ...
    }
  ]
}
```

✅ **Test Passed** if you see the student's pending request

---

### 7. Test Admin - Approve Request

**POST** `http://localhost:5000/api/admin/branch-books/approve`

```json
{
  "requestId": 1
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Request approved successfully"
}
```

✅ **Test Passed** if you get success message

---

### 8. Test Admin - View Approved Requests

**GET** `http://localhost:5000/api/admin/branch-books/approved-requests`

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "request_id": 1,
      "status": "approved",
      "confirmed_handed_over": 0,
      ...
    }
  ]
}
```

✅ **Test Passed** if you see the request with status `"approved"`

---

### 9. Test Admin - Confirm Handover ⭐ **CRITICAL TEST**

**POST** `http://localhost:5000/api/admin/branch-books/confirm-handover`

```json
{
  "requestId": 1
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Book handover confirmed successfully. Book has been assigned to student.",
  "data": {
    "requestId": 1,
    "bookId": 1,
    "studentId": 3
  }
}
```

✅ **Test Passed** if you get success message

---

### 10. Verify Database Changes

After confirming handover, check the database:

#### Check branch_book_requests:
```sql
SELECT * FROM branch_book_requests WHERE id = 1;
```

**Expected:**
- `status` = `'completed'`
- `confirmed_handed_over` = `1`
- `confirmed_at` = timestamp
- `confirmed_by_admin` = admin ID

#### Check books:
```sql
SELECT * FROM books WHERE id = 1;
```

**Expected:**
- `status` = `'borrowed'`

#### Check borrowed_books:
```sql
SELECT * FROM borrowed_books WHERE book_id = 1 ORDER BY id DESC LIMIT 1;
```

**Expected:**
- New entry created
- `user_id` = student ID
- `borrow_date` = today
- `expiry_date` = today + 14 days
- `return_status` = `'active'`

✅ **ALL TESTS PASSED** if all 3 tables are updated correctly

---

### 11. Test Admin - View Statistics

**GET** `http://localhost:5000/api/admin/branch-books/stats`

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "total_requests": 1,
    "pending_count": 0,
    "approved_count": 0,
    "rejected_count": 0,
    "completed_count": 1,
    "awaiting_handover_count": 0
  }
}
```

✅ **Test Passed** if `completed_count` = 1

---

## Testing with Postman

### Import Collection

1. Open Postman
2. Create a new collection: "Branch Books API"
3. Add requests for each endpoint above
4. Set up environment variables:
   - `BASE_URL`: `http://localhost:5000`
   - `STUDENT_SESSION`: (save after login)
   - `ADMIN_SESSION`: (save after admin login)

### Test Sequence

1. Student Login → Save session cookie
2. Request Book → Note requestId
3. View My Requests
4. Admin Login → Save admin session cookie
5. View Pending Requests
6. Approve Request
7. View Approved Requests
8. Confirm Handover
9. Check Database
10. View Statistics

---

## Common Issues

### Issue 1: "Unauthorized" Error
**Solution:** Make sure you're including the session cookie in the request headers

### Issue 2: "Request not found"
**Solution:** Check that the requestId exists and belongs to the user

### Issue 3: "Cannot approve request with status: completed"
**Solution:** Request was already processed. Check current status.

### Issue 4: "Database error"
**Solution:**
- Check if migration was applied
- Verify database connection
- Check server logs for details

### Issue 5: Transaction fails on handover
**Solution:**
- Ensure database supports transactions
- Check foreign key constraints
- Verify all related tables exist

---

## Success Criteria

All tests pass when:

✅ Student can request a book
✅ Request appears in admin pending list
✅ Admin can approve request
✅ Request appears in approved list
✅ Admin can confirm handover
✅ `branch_book_requests` updated to completed
✅ `books` status changed to borrowed
✅ `borrowed_books` entry created automatically
✅ Statistics show correct counts

---

**If all tests pass, your backend is ready for production!**
