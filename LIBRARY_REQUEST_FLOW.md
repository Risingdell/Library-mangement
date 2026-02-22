# Library Book Request Flow

Complete process from student interaction to admin confirmation.

---

## Overview

```
STUDENT                         SERVER (API)                        ADMIN
  │                                  │                                │
  │── Browse Library Books ─────────>│                                │
  │<─ See Available Books ───────────│                                │
  │                                  │                                │
  │── Request a Book ──────────────>│                                │
  │   POST /api/branch-books/request │                                │
  │<─ "Request submitted" ───────────│                                │
  │                                  │── branch_book_requests ──────>│DB
  │                                  │   status = 'pending'          │
  │                                  │                                │
  │── View My Requests ─────────────>│                                │
  │   GET /api/branch-books/my-requests                               │
  │<─ [ { status: 'pending', ... } ] │                                │
  │                                  │                           ADMIN LOGS IN
  │                                  │                                │
  │                                  │<── View Requests ─────────────│
  │                                  │    GET /api/admin/purchase-requests
  │                                  │── Returns pending/approved ──>│
  │                                  │                                │
  │                                  │              ┌─────────────────┤
  │                                  │              │  APPROVE / REJECT?
  │                                  │              └─────────────────┤
  │                                  │              ├── APPROVE ──────│
  │                                  │<── POST /api/admin/branch-books/approve
  │                                  │    status → 'approved'        │
  │                                  │    approved_by_admin = adminId │
  │                                  │    approved_at = NOW()         │
  │<─ Status updates to 'approved' ──│                                │
  │                                  │              ├── REJECT ───────│
  │                                  │<── POST /api/admin/branch-books/reject
  │                                  │    status → 'rejected'        │
  │                                  │    rejection_reason saved      │
  │<─ Status updates to 'rejected' ──│                                │
  │                                  │                                │
  │                                  │       (IF APPROVED - Physical Handover)
  │                                  │                                │
  │                                  │<── Confirm Handover ───────────│
  │                                  │    POST /api/admin/branch-books/confirm-handover
  │                                  │    confirmed_handed_over = true│
  │                                  │    confirmed_by_admin = adminId│
  │                                  │    confirmed_at = NOW()        │
  │<─ Status: "Handed Over" ─────────│                                │
  │                                  │                                │
```

---

## Step-by-Step Flow

### Phase 1: Student Registration & Login

```
[Student] ──> Register Account
                    │
                    ▼
             POST /api/auth/register
             (approval_status = 'pending')
                    │
                    ▼
             [Admin] Gets notification
             GET /api/admin/pending-users
                    │
                    ▼
        ┌─── APPROVE ──────────────── REJECT ───┐
        │                                       │
        ▼                                       ▼
POST /api/admin/approve-user         POST /api/admin/reject-user
approval_status = 'approved'         approval_status = 'rejected'
        │
        ▼
[Student] Can now login
```

---

### Phase 2: Student Requests a Library Book

```
[Student] Logs In
        │
        ▼
Browse Books (GET /api/branch-books)
        │
        ▼
Clicks "Request Book" button
        │
        ▼
POST /api/branch-books/request
Body: { book_id }
        │
        ▼
Server creates record in branch_book_requests:
┌─────────────────────────────────────────────┐
│ id          │ auto-increment                 │
│ student_id  │ from JWT token                 │
│ book_id     │ from request body              │
│ status      │ 'pending'                      │
│ requested_at│ NOW()                          │
└─────────────────────────────────────────────┘
        │
        ▼
Response: "Request submitted successfully"
        │
        ▼
[Student] Navigates to "Library Requests" tab
GET /api/branch-books/my-requests
        │
        ▼
Student sees their request:
┌──────────────────────────────────┐
│ Book Title   │ Physics Vol. 1    │
│ Author       │ H.C. Verma        │
│ Acc. No.     │ 1042              │
│ Status       │ ⏳ pending         │
│ Requested On │ 22 Feb 2026       │
└──────────────────────────────────┘
```

---

### Phase 3: Admin Reviews Requests

```
[Admin] Logs In
        │
        ▼
Opens "Book Purchase Requests" tab
GET /api/admin/purchase-requests
        │
        ▼
Query fetches from branch_book_requests:
WHERE status IN ('pending', 'approved')
        │
        ▼
Admin sees table:
┌────────────┬────────┬─────────────┬──────────┬────────────────────┐
│ Book Title │ Acc No │ Student     │ Req Date │ Actions            │
├────────────┼────────┼─────────────┼──────────┼────────────────────┤
│ Physics V1 │ 1042   │ Rahul (8CS) │ 22/2/26  │ ✅ Approve ❌ Reject│
└────────────┴────────┴─────────────┴──────────┴────────────────────┘
```

---

### Phase 4a: Admin Approves Request

```
[Admin] Clicks "✅ Approve"
        │
        ▼
Confirmation dialog appears
"Approve this branch book request?"
        │
        ▼
[Admin] Confirms
        │
        ▼
POST /api/admin/branch-books/approve
Body: { request_id }
        │
        ▼
Server updates branch_book_requests:
┌─────────────────────────────────────┐
│ status          │ 'approved'         │
│ approved_at     │ NOW()              │
│ approved_by_admin│ admin.id          │
└─────────────────────────────────────┘
        │
        ▼
Response: "Library book request approved successfully"
        │
        ▼
UI refreshes - button changes to:
┌────────────────────────────────────────────────┐
│ Status: ✅ Approved                            │
│ Action: 📦 Confirm Handover                    │
└────────────────────────────────────────────────┘
        │
        ▼
[Student] Library Requests tab now shows:
┌──────────────────────────────────┐
│ Status       │ ✅ approved        │
│ Approved On  │ 22 Feb 2026        │
└──────────────────────────────────┘
```

---

### Phase 4b: Admin Rejects Request

```
[Admin] Clicks "❌ Reject"
        │
        ▼
Prompt: "Enter rejection reason:"
[Admin] Types reason e.g. "Book currently in use by another student"
        │
        ▼
POST /api/admin/branch-books/reject
Body: { request_id, rejection_reason }
        │
        ▼
Server updates branch_book_requests:
┌─────────────────────────────────────┐
│ status           │ 'rejected'        │
│ rejection_reason │ (admin's reason)  │
│ approved_at      │ NOW()             │
└─────────────────────────────────────┘
        │
        ▼
Request removed from pending list
        │
        ▼
[Student] Library Requests tab now shows:
┌──────────────────────────────────────────────────────┐
│ Status         │ ❌ rejected                          │
│ Rejection Reason│ "Book currently in use..."          │
└──────────────────────────────────────────────────────┘
```

---

### Phase 5: Admin Confirms Physical Handover

```
(Physical step - Admin gives book to student in person)

[Admin] Opens "Book Purchase Requests" tab
        │
        ▼
Sees approved request with "📦 Confirm Handover" button
(request.status === 'approved' && !request.confirmed_handed_over)
        │
        ▼
[Admin] Physically hands book to student
        │
        ▼
[Admin] Clicks "📦 Confirm Handover"
        │
        ▼
Confirmation dialog:
"Confirm that you have physically handed over this book to the student?"
        │
        ▼
[Admin] Confirms
        │
        ▼
POST /api/admin/branch-books/confirm-handover
Body: { request_id }
        │
        ▼
Server updates branch_book_requests:
┌─────────────────────────────────────┐
│ confirmed_handed_over │ true         │
│ confirmed_at          │ NOW()        │
│ confirmed_by_admin    │ admin.id     │
└─────────────────────────────────────┘
        │
        ▼
Response: "Book handover confirmed successfully"
        │
        ▼
UI updates - button changes to:
┌──────────────────┐
│ ✅ Handed Over   │
└──────────────────┘
        │
        ▼
[Student] Library Requests tab shows:
┌──────────────────────────────────────┐
│ Status       │ ✅ handed over         │
│ Confirmed On │ 22 Feb 2026            │
└──────────────────────────────────────┘
```

---

## API Reference Summary

| Action                        | Method | Endpoint                                      | Auth       |
|-------------------------------|--------|-----------------------------------------------|------------|
| Request a library book        | POST   | `/api/branch-books/request`                   | Student    |
| View my library requests      | GET    | `/api/branch-books/my-requests`               | Student    |
| Cancel a library request      | DELETE | `/api/branch-books/request/:id`               | Student    |
| View all pending requests     | GET    | `/api/admin/purchase-requests`                | Admin      |
| View pending-only requests    | GET    | `/api/admin/branch-books/pending-requests`    | Admin      |
| View approved requests        | GET    | `/api/admin/branch-books/approved-requests`   | Admin      |
| Approve a request             | POST   | `/api/admin/branch-books/approve`             | Admin      |
| Reject a request              | POST   | `/api/admin/branch-books/reject`              | Admin      |
| Confirm physical handover     | POST   | `/api/admin/branch-books/confirm-handover`    | Admin      |

---

## Database Table: `branch_book_requests`

```
┌──────────────────────┬─────────────────────────────────────────────────┐
│ Column               │ Description                                     │
├──────────────────────┼─────────────────────────────────────────────────┤
│ id                   │ Primary key, auto-increment                     │
│ student_id           │ FK → users.id (who requested)                   │
│ book_id              │ FK → books.id (which book)                      │
│ status               │ enum: pending | approved | rejected              │
│ requested_at         │ When student made the request                   │
│ approved_at          │ When admin approved/rejected                    │
│ approved_by_admin    │ FK → admins.id (which admin decided)            │
│ rejection_reason     │ Text reason if rejected                         │
│ confirmed_handed_over│ Boolean - true when book physically given       │
│ confirmed_at         │ When handover was confirmed                     │
│ confirmed_by_admin   │ FK → admins.id (who confirmed handover)         │
└──────────────────────┴─────────────────────────────────────────────────┘
```

---

## Status Lifecycle

```
                    ┌──────────┐
                    │  pending │  ← Student submits request
                    └──────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
       ┌──────────┐          ┌──────────┐
       │ approved │          │ rejected │  ← Admin decision
       └──────────┘          └──────────┘
              │
              ▼
    confirmed_handed_over
         = true              ← Admin physically gives book
              │
              ▼
       ┌──────────────┐
       │ handed over  │  ← Final state (book with student)
       └──────────────┘
```

---

## Admin Dashboard Navigation

```
Sidebar
├── Profile
├── Registration Requests     ← Approve/Reject new student accounts
├── Members                   ← View all approved students
├── Borrowed Books            ← Books currently borrowed
├── Expired Books             ← Overdue borrowed books
├── Pending Returns           ← Students requesting to return books
├── Borrowing History         ← Full borrow/return history
├── Book Purchase Requests ◄──── Library book request management
│   ├── Shows: pending + approved requests
│   ├── Actions on pending: Approve / Reject
│   └── Actions on approved: Confirm Handover
├── Branch Book Requests      ← Shows only pending requests
├── Confirm Handover          ← Shows only approved (not yet handed)
├── Add Books                 ← Add new books to library
└── Upload Soft Copy Books    ← Upload digital books to marketplace
```
