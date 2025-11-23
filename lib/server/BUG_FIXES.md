# Bug Fixes & Improvements

## Overview

Two critical issues have been fixed in the book request system:
1. **Marketplace Books: Multiple Request Bug**
2. **Branch Books: Admin Confirmation Flow Clarification**

---

## 🐛 **Bug #1: Students Could Request Multiple Marketplace Books**

### Problem

Students were able to request multiple marketplace books simultaneously because the validation only checked if they already requested **that specific book**, but didn't check if they had **other pending requests**.

### Example of the Bug:
```
Student requests "Book A" → Success (pending)
Student requests "Book B" → Success (pending) ❌ SHOULD FAIL
Student requests "Book C" → Success (pending) ❌ SHOULD FAIL
```

### Root Cause

**File:** `server/routes/sellBooks.js` (lines 132-141)

**Old Code:**
```javascript
// Only checked for THIS specific book
const checkExistingSql = `
  SELECT * FROM book_requests
  WHERE marketplace_book_id = ? AND requester_id = ? AND status = 'active'
`;
```

This allowed students to have multiple active requests for different books.

### Fix Applied

**New Code:**
```javascript
// Now checks for ANY active marketplace request
const checkAnyActiveSql = `
  SELECT br.id, br.marketplace_book_id, m.title
  FROM book_requests br
  JOIN used_books_marketplace m ON br.marketplace_book_id = m.id
  WHERE br.requester_id = ? AND br.status = 'active'
`;
```

### New Behavior

```
Student requests "Book A" → Success (pending)
Student requests "Book B" → ❌ BLOCKED
Error: "You already have a pending request for 'Book A'.
       Please complete or cancel that request first."
```

### Business Logic

**One Request at a Time Rule:**
- Student can only have **ONE active marketplace book request**
- Must either:
  - ✅ Complete the transaction (seller marks as sold, student confirms received)
  - ✅ Cancel the request
  - ⏸️ Wait for seller to cancel

Only then can they request another marketplace book.

---

## 🐛 **Issue #2: Branch Books Admin Confirmation Flow**

### Clarification

There was no bug, but the workflow needed clarification. Here's how it works:

### Branch Book Request Flow

#### **Step 1: Student Requests Book**

**POST** `/api/branch-books/request`
```json
{
  "bookId": 1
}
```

**What Happens:**
- ✅ Creates entry in `branch_book_requests` table
- ✅ Status: `'pending'`
- ⚠️ **Book status remains 'available'** (book stays visible)
- ⚠️ **Book is NOT assigned yet**

#### **Step 2: Book Visibility**

**Important:** The book **REMAINS VISIBLE** in "All Available Books" list until admin confirms handover.

**Why?**
- Request might be rejected
- Request might be cancelled
- Student might not show up to collect
- Book should be available for other requests if needed

#### **Step 3: Admin Approves Request**

**POST** `/api/admin/branch-books/approve`
```json
{
  "requestId": 5
}
```

**What Happens:**
- ✅ Updates `branch_book_requests.status = 'approved'`
- ✅ Sets `approved_by_admin = <admin_id>`
- ✅ Sets `approved_at = NOW()`
- ⚠️ **Book status still 'available'** (book still visible)
- ⚠️ **Book is STILL NOT assigned**

#### **Step 4: Admin Physically Gives Book to Student**

Admin hands the physical book to the student in person.

#### **Step 5: Admin Confirms Handover** ⭐ **CRITICAL STEP**

**POST** `/api/admin/branch-books/confirm-handover`
```json
{
  "requestId": 5
}
```

**What Happens (All in ONE transaction):**
1. ✅ Updates `branch_book_requests`:
   - `status = 'completed'`
   - `confirmed_handed_over = TRUE`
   - `confirmed_by_admin = <admin_id>`
   - `confirmed_at = NOW()`

2. ✅ Updates `books`:
   - `status = 'borrowed'`

3. ✅ Creates `borrowed_books` entry:
   - `book_id = <book_id>`
   - `user_id = <student_id>`
   - `borrow_date = NOW()`
   - `expiry_date = NOW() + 14 days`
   - `return_status = 'active'`
   - `status = 'borrowed'`

**Now:**
- ✅ Book is **REMOVED** from "All Available Books"
- ✅ Book appears in student's **"My Books"** section
- ✅ Student can now see it in their borrowed books list

---

## 🔒 **Additional Validation Added**

### Both Systems Now Enforce "One Active Request" Rule

#### **Marketplace Books:**
- Student can only have ONE active marketplace book request at a time
- Blocked from requesting other books until current request is resolved

#### **Branch Books:**
- Student can only have ONE pending/approved branch book request at a time
- Blocked from requesting other books until:
  - ✅ Admin confirms handover (completed)
  - ✅ Admin rejects request
  - ✅ Student cancels request

### Error Messages

**Marketplace Book Attempt:**
```json
{
  "success": false,
  "message": "You already have a pending request for 'Introduction to Algorithms'. Please complete or cancel that request first.",
  "existingRequest": {
    "bookTitle": "Introduction to Algorithms",
    "requestId": 5
  }
}
```

**Branch Book Attempt:**
```json
{
  "success": false,
  "message": "You already have a pending request for 'Data Structures'. Please wait for admin confirmation or cancel that request first.",
  "existingRequest": {
    "bookTitle": "Data Structures",
    "requestId": 3,
    "status": "pending"
  }
}
```

---

## 📊 **Database Tables Affected**

### Marketplace Books
| Table | Changes |
|-------|---------|
| `book_requests` | Validation checks for ANY active request |
| `used_books_marketplace` | No changes |

### Branch Books
| Table | When Updated |
|-------|--------------|
| `branch_book_requests` | On request, approve, reject, confirm |
| `books` | **Only on confirm handover** (status → 'borrowed') |
| `borrowed_books` | **Only on confirm handover** (new entry) |

---

## 🧪 **Testing the Fixes**

### Test Case 1: Marketplace - Multiple Request Prevention

```bash
# Step 1: Student requests Book A
POST /sell-books/request
Body: { "id": 1 }
Response: ✅ "Book successfully requested!"

# Step 2: Student tries to request Book B
POST /sell-books/request
Body: { "id": 2 }
Response: ❌ "You already have a pending request for 'Book A'"
```

### Test Case 2: Branch Books - Visibility Until Handover

```bash
# Step 1: Student requests book
POST /api/branch-books/request
Body: { "bookId": 1 }

# Step 2: Check book is still available
GET /books
Response: ✅ Book ID 1 still shows status='available'

# Step 3: Admin approves
POST /api/admin/branch-books/approve
Body: { "requestId": 5 }

# Step 4: Check book STILL available
GET /books
Response: ✅ Book ID 1 STILL shows status='available'

# Step 5: Admin confirms handover
POST /api/admin/branch-books/confirm-handover
Body: { "requestId": 5 }

# Step 6: Check book NOW borrowed
GET /books
Response: ✅ Book ID 1 NOW shows status='borrowed'

# Step 7: Check student's borrowed books
GET /borrowed-books
Response: ✅ Book appears in student's list
```

---

## 📝 **Summary of Changes**

### Files Modified:
1. `server/routes/sellBooks.js` - Added validation for multiple marketplace requests
2. `server/routes/branchBooks.js` - Added validation for multiple branch requests

### Business Rules Enforced:
- ✅ One active marketplace request per student
- ✅ One pending/approved branch request per student
- ✅ Books visible until admin confirms handover
- ✅ Books only assigned after confirmation

### User Experience:
- ✅ Clear error messages explaining why request failed
- ✅ Shows which book is currently pending
- ✅ Provides request ID for reference

---

## 🚀 **Deployment Checklist**

- [x] Code changes applied
- [x] Validation logic tested
- [x] Error messages reviewed
- [ ] Deploy to production
- [ ] Test with real users
- [ ] Monitor for edge cases

---

**Both fixes are now applied and ready for deployment!**
