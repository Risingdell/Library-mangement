# File Operations Flowchart - Library Management System

## Overview: How Each File Interacts with Others

---

## 1. BOOK BORROWING FLOW (Complete)

```
┌──────────────────────────────────────────────────────────────────┐
│                     BORROWING BOOKS WORKFLOW                      │
└──────────────────────────────────────────────────────────────────┘

STUDENT SIDE
════════════

  MainPage.jsx (Frontend)
        │
        ├─> [1] Loads available books
        │       GET /books (no auth)
        │       └─> Gets list of books with status='available'
        │
        ├─> [2] Student clicks "Borrow" button
        │       POST /api/branch-books/request
        │       └─> Sends: { bookId: 123 }
        │
        └─> handleBorrow() function processes response
            ├─> ✅ Success: Show "Request submitted"
            └─> ❌ Error: Show error message


BACKEND PROCESSING (Student Request)
════════════════════════════════════

  branchBooks.js (Route Handler)
        │
        ├─ [1] Validate Session
        │   └─> Check: req.session.user exists?
        │       ├─> ✅ Has session → Continue
        │       └─> ❌ No session → Return 401
        │
        ├─ [2] Validate Input
        │   └─> Check: bookId provided?
        │       ├─> ✅ Has bookId → Continue
        │       └─> ❌ No bookId → Return 400
        │
        ├─ [3] Check Book Exists & Available
        │   └─> Query: SELECT id, title, status FROM books WHERE id = ?
        │       ├─> ✅ Book exists & status='available' → Continue
        │       ├─> ❌ Book not found → Return 404
        │       └─> ❌ Book not available → Return 400
        │
        ├─ [4] Check for Existing Requests
        │   └─> Query: SELECT * FROM branch_book_requests
        │            WHERE student_id = ? AND status IN ('pending', 'approved')
        │       ├─> ✅ No existing requests → Continue
        │       └─> ❌ Has existing request → Return 400
        │              (User must cancel or wait)
        │
        └─ [5] Create Request
            └─> Query: INSERT INTO branch_book_requests
                       (book_id, student_id, status)
                       VALUES (?, ?, 'pending')
                ├─> ✅ Success → Return 200 with requestId
                └─> ❌ Error → Return 500


DATABASE (After Student Request)
═════════════════════════════════

  branch_book_requests table
  ├─ id: 1
  ├─ book_id: 123
  ├─ student_id: 42
  ├─ status: 'pending'  ⬅️ WAITING FOR ADMIN
  ├─ requested_at: 2025-02-19 10:00:00
  └─ approved_by_admin: NULL
     (will be filled when admin approves)


ADMIN SIDE
══════════

  AdminDashboard.jsx (Frontend)
        │
        ├─> [1] Click on "Branch Book Requests" tab
        │
        ├─> [2] Fetch Pending Requests
        │       GET /api/admin/branch-books/pending-requests
        │       └─> Should display: "Request 1: student_name wants book_title"
        │
        └─> [3] Admin clicks "Approve"
                POST /api/admin/branch-books/approve
                └─> Sends: { requestId: 1 }


BACKEND PROCESSING (Admin Approval)
═══════════════════════════════════

  adminBranchBooks.js (/pending-requests endpoint)
        │
        ├─ [1] Check Admin Session
        │   └─> Check: req.session.admin exists?
        │       ├─> ✅ Admin session → Continue
        │       └─> ❌ No admin session → Return 401
        │
        └─ [2] Fetch Pending Requests
            └─> Query: SELECT * FROM admin_pending_branch_requests
                       WHERE status = 'pending'
                ├─> ✅ Gets all pending requests
                └─> Returns JSON with request details


  adminBranchBooks.js (/approve endpoint)
        │
        ├─ [1] Validate Admin & Request ID
        │   └─> req.session.admin + requestId provided?
        │
        ├─ [2] Check Request Status
        │   └─> SELECT status FROM branch_book_requests WHERE id = ?
        │       ├─> ✅ Status = 'pending' → Continue
        │       └─> ❌ Not pending → Return 400
        │
        └─ [3] Update Request
            └─> UPDATE branch_book_requests
                SET status = 'approved',
                    approved_by_admin = ?,
                    approved_at = NOW()
                WHERE id = ?
                ├─> ✅ Success → Return 200
                └─> ❌ Error → Return 500


DATABASE (After Admin Approval)
═══════════════════════════════

  branch_book_requests table
  ├─ id: 1
  ├─ book_id: 123
  ├─ student_id: 42
  ├─ status: 'approved'  ⬅️ APPROVED, WAITING FOR HANDOVER
  ├─ requested_at: 2025-02-19 10:00:00
  ├─ approved_by_admin: 5 (admin id)
  ├─ approved_at: 2025-02-19 10:30:00
  └─ confirmed_handed_over: FALSE


HANDOVER PHASE
══════════════

  AdminDashboard.jsx
        │
        ├─> Click "Confirm Handover"
        │
        └─> POST /api/admin/branch-books/confirm-handover
            └─> Sends: { requestId: 1 }


  adminBranchBooks.js (/confirm-handover endpoint)
        │
        ├─ [1] Validate Request
        │   └─> Is approved? Is not already confirmed?
        │
        ├─ [2] UPDATE branch_book_requests
        │   └─> status = 'completed'
        │       confirmed_handed_over = TRUE
        │       confirmed_by_admin = ?
        │       confirmed_at = NOW()
        │
        ├─ [3] UPDATE books
        │   └─> status = 'borrowed' (was 'available')
        │
        └─ [4] INSERT into borrowed_books
            └─> Create record:
                ├─ book_id: 123
                ├─ user_id: 42
                ├─ borrow_date: NOW()
                ├─ expiry_date: NOW() + 14 days
                └─ return_status: 'active'


FINAL DATABASE STATE
════════════════════

  branch_book_requests
  ├─ status: 'completed'  ✅ DONE
  ├─ confirmed_handed_over: TRUE

  books
  ├─ id: 123
  └─ status: 'borrowed'  (student has the book)

  borrowed_books (NEW ENTRY)
  ├─ book_id: 123
  ├─ user_id: 42
  ├─ borrow_date: 2025-02-19
  ├─ expiry_date: 2025-03-05 (14 days)
  └─ return_status: 'active'
```

---

## 2. DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                   CLIENT LAYER (Frontend)                    │
│                                                              │
│  MainPage.jsx ←→ AdminDashboard.jsx                        │
│  (Student UI)      (Admin UI)                              │
└────────────────┬────────────────┬──────────────────────────┘
                 │                │
         ┌───────┴────────┬───────┴────────┐
         │                │                │
    Axios POST/GET        │            Axios POST/GET
    withCredentials       │            withCredentials
         │                │                │
┌────────▼───────────────▼────────────────▼──────────────┐
│                  API LAYER (Routes)                      │
│                                                          │
│  branchBooks.js        adminBranchBooks.js             │
│  ├─ POST /request       ├─ GET /pending-requests        │
│  ├─ GET /my-requests    ├─ GET /approved-requests       │
│  └─ DELETE /request/:id ├─ POST /approve                │
│                         ├─ POST /reject                 │
│                         └─ POST /confirm-handover       │
└────────┬────────────────────┬──────────────────────────┘
         │                    │
    db.query()           db.query()
         │                    │
┌────────▼────────────────────▼──────────────────────────┐
│                 DATABASE LAYER (MySQL)                   │
│                                                          │
│  branch_book_requests  ←→  books                        │
│  ├─ id                      ├─ id                       │
│  ├─ book_id (FK)           ├─ title                     │
│  ├─ student_id (FK)        ├─ author                    │
│  ├─ status                 └─ status (available/borrowed)
│  ├─ requested_at                                        │
│  └─ approved_by_admin (FK)  users                       │
│                             ├─ id                       │
│  borrowed_books  ←─────────→ ├─ username                │
│  ├─ id                       ├─ email                   │
│  ├─ book_id (FK)            └─ firstName               │
│  ├─ user_id (FK)                                        │
│  ├─ borrow_date             admins                      │
│  └─ expiry_date             ├─ id                       │
│                             └─ username                │
│  admin_pending_branch_requests (VIEW)                   │
│  └─ Filtered view of branch_book_requests              │
│     for admin dashboard display                        │
└────────────────────────────────────────────────────────┘
```

---

## 3. ERROR HANDLING FLOW

```
┌─────────────────────────────────────────────────────────────┐
│                    ERROR SCENARIOS                           │
└─────────────────────────────────────────────────────────────┘

Scenario 1: Student NOT Logged In
═══════════════════════════════════
  POST /api/branch-books/request
  └─> req.session.user === undefined
      └─> Return 401: "Unauthorized. Please login first."
          └─> Frontend shows: "You need to login first"


Scenario 2: Invalid Book ID
═════════════════════════════
  POST /api/branch-books/request { bookId: 9999 }
  └─> SELECT FROM books WHERE id = 9999
      └─> No result
          └─> Return 404: "Book not found"


Scenario 3: Book Not Available
═══════════════════════════════
  POST /api/branch-books/request { bookId: 123 }
  └─> SELECT FROM books WHERE id = 123
      └─> books[0].status !== 'available' (it's 'borrowed')
          └─> Return 400: "Book is currently borrowed"


Scenario 4: Student Already Has Pending Request
════════════════════════════════════════════════
  POST /api/branch-books/request { bookId: 456 }
  └─> SELECT FROM branch_book_requests
          WHERE student_id = 42 AND status IN ('pending', 'approved')
      └─> Found 1 existing request
          └─> Return 400: "You already have a <status> request for '<book>'
              Please wait for admin confirmation or cancel that request first."


Scenario 5: Admin NOT Logged In
════════════════════════════════
  GET /api/admin/branch-books/pending-requests
  └─> req.session.admin === undefined
      └─> Return 401: "Unauthorized. Admin access required."


Scenario 6: Database Error
═══════════════════════════
  POST /api/branch-books/request
  └─> db.query() throws error
      └─> Return 500: "Database error"
          └─> console.error() logs the actual error


Scenario 7: Migration Not Applied
═══════════════════════════════════
  GET /api/admin/branch-books/pending-requests
  └─> SELECT FROM admin_pending_branch_requests
      └─> Table doesn't exist (migration not run)
          └─> MySQL Error 1146: "Table doesn't exist"
              └─> Return 500: "Failed to fetch pending requests"
```

---

## 4. REQUEST VALIDATION CHAIN

```
Student Request → Validation Chain → Database Insert
        │
        ├─ [1] Session Check
        │       ├─ ✅ Session exists → Continue
        │       └─ ❌ No session → Error 401
        │
        ├─ [2] Input Validation
        │       ├─ ✅ bookId provided → Continue
        │       └─ ❌ Missing bookId → Error 400
        │
        ├─ [3] Book Lookup
        │       ├─ ✅ Book exists → Continue
        │       └─ ❌ Book not found → Error 404
        │
        ├─ [4] Book Availability
        │       ├─ ✅ status='available' → Continue
        │       └─ ❌ status≠'available' → Error 400
        │
        ├─ [5] Request Conflict Check
        │       ├─ ✅ No existing request → Continue
        │       └─ ❌ Has pending request → Error 400
        │
        └─ [6] Database Insert
                ├─ ✅ Success → Return request ID
                └─ ❌ Insert fails → Error 500
```

---

## 5. TABLE RELATIONSHIPS

```
┌───────────────────────────────────────────────────────────┐
│                   TABLE RELATIONSHIPS                      │
└───────────────────────────────────────────────────────────┘

users
  │
  ├─ 1 ←──→ Many: branch_book_requests (student_id FK)
  ├─ 1 ←──→ Many: borrowed_books (user_id FK)
  └─ 1 ←──→ Many: admins (if admin_id in users)

books
  │
  ├─ 1 ←──→ Many: branch_book_requests (book_id FK)
  └─ 1 ←──→ Many: borrowed_books (book_id FK)

admins
  │
  ├─ 1 ←──→ Many: branch_book_requests (approved_by_admin FK)
  └─ 1 ←──→ Many: borrowed_books (approved_by FK)

branch_book_requests
  ├─ Foreign Keys:
  │  ├─ book_id → books.id
  │  ├─ student_id → users.id
  │  └─ approved_by_admin → admins.id
  └─ Status Values:
     ├─ 'pending' → Waiting for admin approval
     ├─ 'approved' → Admin approved, waiting for handover
     ├─ 'rejected' → Admin rejected
     └─ 'completed' → Book handed over to student

borrowed_books
  ├─ Foreign Keys:
  │  ├─ book_id → books.id
  │  ├─ user_id → users.id
  │  └─ approved_by → admins.id
  └─ return_status Values:
     ├─ 'active' → Currently borrowed
     ├─ 'pending_return' → Student wants to return
     ├─ 'approved' → Return approved by admin
     └─ 'rejected' → Return rejected by admin
```

---

## 6. FILE DEPENDENCY TREE

```
Frontend (lib/src)
│
├─ MainPage.jsx
│   ├─ Imports: axios
│   ├─ Calls:
│   │   ├─ GET /books
│   │   ├─ POST /api/branch-books/request
│   │   ├─ GET /api/branch-books/my-requests
│   │   └─ DELETE /api/branch-books/request/:id
│   └─ Displays: "Waiting for admin approval"
│
└─ AdminDashboard.jsx
    ├─ Imports: axios
    ├─ Calls:
    │   ├─ GET /api/admin/branch-books/pending-requests
    │   ├─ GET /api/admin/branch-books/approved-requests
    │   ├─ POST /api/admin/branch-books/approve
    │   ├─ POST /api/admin/branch-books/reject
    │   └─ POST /api/admin/branch-books/confirm-handover
    └─ Displays: Request list with action buttons


Backend (lib/server)
│
├─ index.js
│   ├─ Imports:
│   │   ├─ routes/branchBooks
│   │   ├─ routes/adminBranchBooks
│   │   └─ db
│   ├─ Mounts:
│   │   ├─ app.use('/api/branch-books', branchBooksRoutes)
│   │   └─ app.use('/api/admin/branch-books', adminBranchBooksRoutes)
│   └─ Connects to: MySQL database
│
├─ routes/branchBooks.js
│   ├─ Imports: db from ../db
│   ├─ Exports: router
│   └─ Endpoints:
│       ├─ POST /request
│       ├─ GET /my-requests
│       └─ DELETE /request/:id
│
├─ routes/adminBranchBooks.js
│   ├─ Imports: db from ../db
│   ├─ Exports: router
│   └─ Endpoints:
│       ├─ GET /pending-requests
│       ├─ GET /approved-requests
│       ├─ POST /approve
│       ├─ POST /reject
│       └─ POST /confirm-handover
│
├─ db.js
│   └─ Exports: MySQL connection pool
│
└─ migrations/005_add_branch_book_request_workflow.sql
    ├─ Creates: branch_book_requests TABLE
    ├─ Creates: admin_pending_branch_requests VIEW
    └─ Creates: Triggers for status updates
```

---

## 7. COMPLETE REQUEST LIFECYCLE

```
┌──────────────────────────────────────────────────────────────┐
│              COMPLETE REQUEST LIFECYCLE                       │
└──────────────────────────────────────────────────────────────┘

TIME    STUDENT ACTION          BACKEND ACTION           DATABASE STATE
────    ──────────────────      ──────────────────       ─────────────────
T0      [App loads]
        MainPage.jsx loads
        GET /books              branchBooks.js handles   books table:
                                Returns all available    └─ status='available'
                                books

T1      [Student clicks
        "Borrow" button]
        POST /request            Validates session        branch_book_requests:
        {bookId: 123}           Validates bookId         └─ [empty]
                                Checks book status
                                Checks existing requests

T2                              INSERT successful        branch_book_requests:
                                Returns requestId        └─ id:1, status:'pending'
        [Student sees success]
        "Request submitted!"

T3      [Admin logs in]
        AdminDashboard
        Click "branch-book
        -requests" tab
        GET /pending-requests   adminBranchBooks.js      Queries:
                                SELECT from VIEW         └─ Shows 1 pending

T4      [Admin clicks
        "Approve"]
        POST /approve           UPDATE status=           branch_book_requests:
        {requestId: 1}          'approved'               └─ status:'approved'

T5      [Admin clicks
        "Confirm Handover"]
        POST /confirm-handover  1. UPDATE status=        branch_book_requests:
        {requestId: 1}          'completed'              ├─ status:'completed'
                                2. UPDATE book status=   └─ confirmed_handed_over:TRUE
                                'borrowed'
                                3. INSERT into
                                borrowed_books           books:
                                                         └─ status:'borrowed'

                                                         borrowed_books:
                                                         └─ id:1, book_id:123,
                                                            user_id:42,
                                                            expiry_date:T5+14days

T6+     [Student has book]
        [After 14 days]         Triggers check          borrowed_books:
                                expiry_date             └─ return_status:'active'
                                Admin can mark            (awaits return)
                                expired

TN      [Student returns book]
        POST /pending-return     Admin views in           borrowed_books:
                                "pending-returns" tab    └─ return_status:
                                                           'pending_return'

        Admin approves return   UPDATE return_status    books:
                                = 'approved'            └─ status:'available'
                                UPDATE book status=      (available again)
                                'available'
```

---

## Key Insights

1. **Two-Step Approval**: Admin must both APPROVE and CONFIRM HANDOVER
2. **One Request Per Time**: Student can only have 1 active pending/approved request
3. **View vs Table**: Admin dashboard uses VIEW for performance, but actual queries use TABLE
4. **Status Fields**: Different tables track different status types (branch_book_requests.status vs borrowed_books.return_status)
5. **FK Relationships**: All foreign keys cascade on delete to maintain referential integrity

