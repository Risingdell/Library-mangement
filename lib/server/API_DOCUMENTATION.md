# Branch Books API Documentation

## Overview

This API manages the branch book request workflow where students request library books, admins approve/reject requests, and confirm physical book handover.

---

## Base URLs

- **Development**: `http://localhost:5000`
- **Production**: `https://your-backend.onrender.com`

---

## Authentication

All endpoints require active sessions:
- **Student routes**: User must be logged in (`req.session.user`)
- **Admin routes**: Admin must be logged in (`req.session.admin`)

---

## Student Endpoints

### 1. Request a Branch Book

**POST** `/api/branch-books/request`

Request a library book for borrowing.

**Headers:**
```
Content-Type: application/json
Cookie: connect.sid=<session_cookie>
```

**Request Body:**
```json
{
  "bookId": 1
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Book request submitted successfully. Waiting for admin approval.",
  "data": {
    "requestId": 5,
    "bookId": 1,
    "status": "pending"
  }
}
```

**Error Responses:**

- **401 Unauthorized** - User not logged in
```json
{
  "success": false,
  "message": "Unauthorized. Please login first."
}
```

- **400 Bad Request** - Book already requested
```json
{
  "success": false,
  "message": "You already have a pending or approved request for this book"
}
```

- **400 Bad Request** - Book not available
```json
{
  "success": false,
  "message": "Book is currently borrowed"
}
```

- **404 Not Found** - Book doesn't exist
```json
{
  "success": false,
  "message": "Book not found"
}
```

---

### 2. Get My Requests

**GET** `/api/branch-books/my-requests`

Get all branch book requests for the logged-in student.

**Headers:**
```
Cookie: connect.sid=<session_cookie>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "request_id": 5,
      "book_id": 1,
      "requested_at": "2025-01-15T10:30:00.000Z",
      "status": "pending",
      "approved_at": null,
      "confirmed_handed_over": 0,
      "confirmed_at": null,
      "rejection_reason": null,
      "title": "Introduction to Algorithms",
      "author": "Thomas H. Cormen",
      "acc_no": "CS001",
      "book_format": "hard_copy"
    }
  ]
}
```

**Statuses:**
- `pending` - Waiting for admin approval
- `approved` - Approved, waiting for handover
- `completed` - Book received
- `rejected` - Request rejected by admin

---

### 3. Cancel a Request

**DELETE** `/api/branch-books/request/:requestId`

Cancel a pending book request.

**Headers:**
```
Cookie: connect.sid=<session_cookie>
```

**URL Parameters:**
- `requestId` - ID of the request to cancel

**Success Response (200):**
```json
{
  "success": true,
  "message": "Request cancelled successfully"
}
```

**Error Responses:**

- **400 Bad Request** - Cannot cancel (not pending)
```json
{
  "success": false,
  "message": "Cannot cancel request with status: approved"
}
```

- **404 Not Found** - Request doesn't exist
```json
{
  "success": false,
  "message": "Request not found"
}
```

---

## Admin Endpoints

### 1. Get Pending Requests

**GET** `/api/admin/branch-books/pending-requests`

Get all pending branch book requests awaiting approval.

**Headers:**
```
Cookie: connect.sid=<admin_session_cookie>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "request_id": 5,
      "book_id": 1,
      "student_id": 3,
      "requested_at": "2025-01-15T10:30:00.000Z",
      "status": "pending",
      "title": "Introduction to Algorithms",
      "author": "Thomas H. Cormen",
      "acc_no": "CS001",
      "student_username": "john_doe",
      "student_first_name": "John",
      "student_last_name": "Doe",
      "student_email": "john@example.com",
      "student_usn": "4SN21CS001"
    }
  ]
}
```

---

### 2. Get Approved Requests (Awaiting Handover)

**GET** `/api/admin/branch-books/approved-requests`

Get all approved requests waiting for physical book handover.

**Headers:**
```
Cookie: connect.sid=<admin_session_cookie>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "request_id": 4,
      "book_id": 2,
      "student_id": 5,
      "status": "approved",
      "approved_at": "2025-01-15T11:00:00.000Z",
      "confirmed_handed_over": 0,
      "title": "Data Structures",
      "student_first_name": "Jane",
      "student_last_name": "Smith"
    }
  ]
}
```

---

### 3. Get All Requests (with filters)

**GET** `/api/admin/branch-books/all-requests?status=pending`

Get all branch book requests with optional status filter.

**Headers:**
```
Cookie: connect.sid=<admin_session_cookie>
```

**Query Parameters:**
- `status` (optional) - Filter by status: `pending`, `approved`, `rejected`, `completed`

**Success Response (200):**
```json
{
  "success": true,
  "data": [...]
}
```

---

### 4. Approve a Request

**POST** `/api/admin/branch-books/approve`

Approve a pending branch book request.

**Headers:**
```
Content-Type: application/json
Cookie: connect.sid=<admin_session_cookie>
```

**Request Body:**
```json
{
  "requestId": 5
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Request approved successfully"
}
```

**Error Responses:**

- **400 Bad Request** - Cannot approve non-pending request
```json
{
  "success": false,
  "message": "Cannot approve request with status: completed"
}
```

---

### 5. Reject a Request

**POST** `/api/admin/branch-books/reject`

Reject a pending branch book request.

**Headers:**
```
Content-Type: application/json
Cookie: connect.sid=<admin_session_cookie>
```

**Request Body:**
```json
{
  "requestId": 5,
  "rejectionReason": "Book is currently reserved for another purpose"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Request rejected successfully"
}
```

---

### 6. Confirm Book Handover ⭐ **IMPORTANT**

**POST** `/api/admin/branch-books/confirm-handover`

Confirm that the admin has physically handed the book to the student.

**This endpoint:**
1. Marks the request as completed
2. Updates book status to 'borrowed'
3. Creates a `borrowed_books` entry
4. **Replaces the database trigger functionality**

**Headers:**
```
Content-Type: application/json
Cookie: connect.sid=<admin_session_cookie>
```

**Request Body:**
```json
{
  "requestId": 5
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Book handover confirmed successfully. Book has been assigned to student.",
  "data": {
    "requestId": 5,
    "bookId": 1,
    "studentId": 3
  }
}
```

**Error Responses:**

- **400 Bad Request** - Request not approved yet
```json
{
  "success": false,
  "message": "Request must be approved before confirming handover"
}
```

- **400 Bad Request** - Already confirmed
```json
{
  "success": false,
  "message": "Book handover already confirmed"
}
```

---

### 7. Get Statistics

**GET** `/api/admin/branch-books/stats`

Get branch book request statistics.

**Headers:**
```
Cookie: connect.sid=<admin_session_cookie>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "total_requests": 25,
    "pending_count": 5,
    "approved_count": 8,
    "rejected_count": 2,
    "completed_count": 10,
    "awaiting_handover_count": 3
  }
}
```

---

## Complete Workflow Example

### Student Side:

1. **Student requests a book:**
   ```bash
   POST /api/branch-books/request
   Body: { "bookId": 1 }
   ```

2. **Student checks request status:**
   ```bash
   GET /api/branch-books/my-requests
   ```

### Admin Side:

3. **Admin sees pending requests:**
   ```bash
   GET /api/admin/branch-books/pending-requests
   ```

4. **Admin approves the request:**
   ```bash
   POST /api/admin/branch-books/approve
   Body: { "requestId": 5 }
   ```

5. **Admin physically gives book to student**

6. **Admin confirms handover:**
   ```bash
   POST /api/admin/branch-books/confirm-handover
   Body: { "requestId": 5 }
   ```

7. **System automatically:**
   - Updates `branch_book_requests.status = 'completed'`
   - Updates `books.status = 'borrowed'`
   - Creates entry in `borrowed_books` table

---

## Testing with cURL

### Student - Request a book:
```bash
curl -X POST http://localhost:5000/api/branch-books/request \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -d '{"bookId": 1}'
```

### Admin - Approve request:
```bash
curl -X POST http://localhost:5000/api/admin/branch-books/approve \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=ADMIN_SESSION_COOKIE" \
  -d '{"requestId": 5}'
```

### Admin - Confirm handover:
```bash
curl -X POST http://localhost:5000/api/admin/branch-books/confirm-handover \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=ADMIN_SESSION_COOKIE" \
  -d '{"requestId": 5}'
```

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description here",
  "error": "Technical error details (only in development)"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in)
- `404` - Not Found
- `500` - Internal Server Error

---

## Database Tables Used

| Table | Purpose |
|-------|---------|
| `branch_book_requests` | Stores all branch book requests with admin approval tracking |
| `books` | Library inventory (status updated on handover) |
| `borrowed_books` | Final assignment after handover (auto-created) |
| `users` | Student information |
| `admins` | Admin information |

---

## Next Steps

1. ✅ Apply `PRODUCTION_FIX_NO_TRIGGER.sql` to your Clever Cloud database
2. ✅ Deploy this backend code to Render
3. ⏳ Update your frontend to use these endpoints
4. ⏳ Test the complete workflow

---

**Ready to test? Start your server and try the endpoints!**
