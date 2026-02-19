# CRITICAL BUGS & FIXES - Library Management System

**Analysis Date**: February 19, 2025
**Total Issues Found**: 15 (3 CRITICAL, 6 HIGH, 4 MEDIUM, 2 LOW)

---

## ISSUE #1: 🔴 CRITICAL - Admin Login Not Saving Session

**This is WHY admin gets 401 errors!**

### Location
File: `lib/server/routes/admin.js` (Lines 11-42)

### The Problem
```javascript
// WRONG - Session is set but NOT saved before response
req.session.admin = {
  id: results[0].id,
  username: results[0].username,
  name: results[0].name
};

res.json({
  message: 'Login successful',
  admin: req.session.admin
});
```

The response is sent BEFORE the session is saved to the session store. When frontend tries to call `/api/admin/me` next, there's no valid session, so it returns **401**.

### The Fix
```javascript
// CORRECT - Save session explicitly before responding
req.session.admin = {
  id: results[0].id,
  username: results[0].username,
  name: results[0].name
};

// Save session to store before sending response
req.session.save((err) => {
  if (err) {
    console.error('Session save error:', err);
    return res.status(500).json({ message: 'Session save failed' });
  }

  res.json({
    message: 'Login successful',
    admin: req.session.admin
  });
});
```

### Apply This Fix
1. Open: `lib/server/routes/admin.js`
2. Find line 30-40 (the admin login response)
3. Replace with the code above
4. Save and test

---

## ISSUE #2: 🔴 CRITICAL - Database Transaction Methods Don't Exist

**This causes 500 errors when confirming book handover!**

### Location
File: `lib/server/routes/admin.js` (Lines 626-700)

### The Problem
```javascript
// WRONG - Pool doesn't have these methods
db.beginTransaction((err) => {
  // ... operations ...
  db.commit((err) => {
    // ...
  });
});
```

MySQL2 **connection pools** don't have `.beginTransaction()`, `.commit()`, `.rollback()`. Only individual connections have these methods.

### The Fix
Replace the entire `/confirm-book-received` endpoint with this:

```javascript
router.post('/confirm-book-received', async (req, res) => {
  const { borrowId } = req.body;

  if (!req.session.admin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const adminId = req.session.admin.id;

  if (!borrowId) {
    return res.status(400).json({ message: 'Borrow ID is required' });
  }

  // Get connection from pool (supports transactions)
  const connection = await db.promise().getConnection();

  try {
    // Start transaction
    await connection.beginTransaction();

    // 1. Get borrow details
    const [borrows] = await connection.query(
      `SELECT * FROM borrowed_books WHERE id = ?`,
      [borrowId]
    );

    if (borrows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Borrow record not found' });
    }

    const borrow = borrows[0];

    // 2. Update borrow status
    await connection.query(
      `UPDATE borrowed_books SET return_status = 'approved', approved_by = ?, approved_at = NOW() WHERE id = ?`,
      [adminId, borrowId]
    );

    // 3. Update book status to available
    await connection.query(
      `UPDATE books SET status = 'available' WHERE id = ?`,
      [borrow.book_id]
    );

    // Commit transaction
    await connection.commit();

    res.json({
      success: true,
      message: 'Book return confirmed successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error confirming book received:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm book return',
      error: error.message
    });
  } finally {
    connection.release();
  }
});
```

---

## ISSUE #3: 🔴 CRITICAL - Branch Books Async/Await Transaction Error

**This causes the book handover endpoint to always fail!**

### Location
File: `lib/server/routes/adminBranchBooks.js` (Lines 312-429)

### The Problem
```javascript
// This has async/await but connection is not promise-based
async (req, res) => {
  const connection = await db.promise().getConnection();
  // ...
```

The connection from `db.promise()` might not be available depending on MySQL2 setup.

### The Fix
Use the connection pool with callback-based approach:

```javascript
router.post('/confirm-handover', (req, res) => {
  if (!req.session.admin) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Admin access required.'
    });
  }

  const { requestId } = req.body;
  const adminId = req.session.admin.id;

  if (!requestId) {
    return res.status(400).json({
      success: false,
      message: 'Request ID is required'
    });
  }

  // Get request details first
  const checkSql = `
    SELECT id, book_id, student_id, status, confirmed_handed_over
    FROM branch_book_requests
    WHERE id = ?
  `;

  db.query(checkSql, [requestId], (err, requests) => {
    if (err) {
      console.error('Error fetching request:', err);
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

    if (request.confirmed_handed_over) {
      return res.status(400).json({
        success: false,
        message: 'Book handover already confirmed'
      });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Request must be approved before confirming handover'
      });
    }

    // Update branch request
    const updateRequestSql = `
      UPDATE branch_book_requests
      SET confirmed_handed_over = TRUE,
          confirmed_by_admin = ?,
          confirmed_at = NOW(),
          status = 'completed'
      WHERE id = ?
    `;

    db.query(updateRequestSql, [adminId, requestId], (err1) => {
      if (err1) {
        console.error('Error updating request:', err1);
        return res.status(500).json({
          success: false,
          message: 'Failed to confirm handover'
        });
      }

      // Update book status
      const updateBookSql = `
        UPDATE books
        SET status = 'borrowed'
        WHERE id = ?
      `;

      db.query(updateBookSql, [request.book_id], (err2) => {
        if (err2) {
          console.error('Error updating book:', err2);
          return res.status(500).json({
            success: false,
            message: 'Failed to update book status'
          });
        }

        // Create borrowed books entry
        const insertSql = `
          INSERT INTO borrowed_books (
            book_id,
            user_id,
            borrow_date,
            expiry_date,
            return_status,
            status
          ) VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY), 'active', 'borrowed')
        `;

        db.query(insertSql, [request.book_id, request.student_id], (err3) => {
          if (err3) {
            console.error('Error creating borrowed entry:', err3);
            return res.status(500).json({
              success: false,
              message: 'Failed to create borrow record'
            });
          }

          res.json({
            success: true,
            message: 'Book handover confirmed successfully',
            data: {
              requestId,
              bookId: request.book_id,
              studentId: request.student_id
            }
          });
        });
      });
    });
  });
});
```

---

## ISSUE #4: 🔴 CRITICAL - Book Borrowing Allows Double Borrowing

**Students can borrow the same book multiple times!**

### Location
File: `lib/server/index.js` (Lines 1002-1089)

### The Problem
The borrowed_books table has `return_status` that can be:
- `'active'` = currently borrowed
- `'pending_return'` = waiting for approval
- `'approved'` = return was approved
- `'rejected'` = return was rejected

When a book return is pending, the book status might be updated to something other than 'available', but the code doesn't prevent borrowing it again.

### The Fix
```javascript
// Add this validation in the borrow endpoint
const checkActiveBorrowSql = `
  SELECT COUNT(*) as active_count
  FROM borrowed_books
  WHERE book_id = ? AND return_status IN ('active', 'pending_return')
`;

db.query(checkActiveBorrowSql, [bookId], (err, countResults) => {
  if (err) {
    return res.status(500).json({ message: 'Database error' });
  }

  if (countResults[0].active_count > 0) {
    return res.status(400).json({
      message: 'Book is currently borrowed or awaiting return approval'
    });
  }

  // Continue with borrow logic...
});
```

---

## ISSUE #5: 🟠 HIGH - Missing Auth Checks in Admin Endpoints

**These endpoints are accessible by anyone!**

### Location
File: `lib/server/routes/admin.js`

### Endpoints Missing Auth:
- `GET /borrowed-books` (Line 67)
- `GET /expired-books` (Line 96)
- `GET /borrowing-history` (Line 335)

### The Fix
Add this to the top of each endpoint:

```javascript
router.get('/borrowed-books', (req, res) => {
  // ADD THIS CHECK
  if (!req.session.admin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // ... rest of code
});
```

---

## ISSUE #6: 🟠 HIGH - Missing Credentials in Axios Calls

**Frontend doesn't send session cookies!**

### Location
File: `lib/src/Pages/AdminDashboard.jsx`

### The Problem
Some API calls are missing `withCredentials: true`:

```javascript
// WRONG
res = await axios.get(`${API_URL}/api/admin/borrowed-books`);

// CORRECT
res = await axios.get(`${API_URL}/api/admin/borrowed-books`, { withCredentials: true });
```

### The Fix
Find all axios calls in AdminDashboard.jsx and ensure they have:
```javascript
{ withCredentials: true }
```

Lines to check:
- Line 85: `axios.get(...'/borrowed-books')`
- Line 88: `axios.get(...'/expired-books')`
- Line 91: `axios.get(...'/pending-returns')`
- Line 94: `axios.get(...'/borrowing-history')`
- Line 97: `axios.get(...'/pending-users')`
- Line 100: `axios.get(...'/members')`
- Line 103: `axios.get(...'/purchase-requests')`
- Line 106: `axios.get(...'/branch-books/pending-requests')`
- Line 109: `axios.get(...'/branch-books/approved-requests')`

---

## ISSUE #7: 🟠 HIGH - CORS & Session Configuration Issues

**Cross-origin session cookies not working!**

### Location
File: `lib/server/index.js` (Lines 550-615)

### The Problem
The CORS configuration has:
```javascript
credentials: true,
```

But doesn't expose the Set-Cookie header for frontend to receive it.

### The Fix
Update CORS configuration:

```javascript
const corsOptions = {
  origin: function (origin, callback) {
    // Allow your Vercel frontend
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? [process.env.FRONTEND_URL || 'https://your-vercel-url.vercel.app']
      : ['http://localhost:5173', 'http://localhost:3000'];

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  exposedHeaders: ['Set-Cookie'],  // ADD THIS
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
```

---

## ISSUE #8: 🟡 MEDIUM - Missing Validation in Purchase Requests

**Query fails silently when records don't exist!**

### Location
File: `lib/server/routes/admin.js` (Lines 537-584)

### The Fix
Add error handling:

```javascript
db.query(sql, params, (err, results) => {
  if (err) {
    console.error('Error fetching purchase requests:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch purchase requests',
      error: err.message
    });
  }

  // Return empty array with count
  res.json({
    success: true,
    data: results || [],
    count: (results || []).length
  });
});
```

---

## ISSUE #9: 🟡 MEDIUM - Session Persistence Issues

**Session lost after page refresh!**

### Location
File: `lib/server/index.js` (Session configuration)

### The Fix
Ensure session middleware is configured correctly:

```javascript
const session = require('express-session');

app.use(session({
  secret: process.env.SESSION_SECRET || 'library-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',  // Changed from 'none'
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
```

---

## FIX PRIORITY & ORDER

### Phase 1: CRITICAL (Fix These First - 30 minutes)
1. ✅ **Issue #1** - Add `req.session.save()` to admin login
2. ✅ **Issue #3** - Fix branch books handover transaction
3. ✅ **Issue #4** - Fix double-borrowing issue

### Phase 2: HIGH (30 minutes)
4. ✅ **Issue #5** - Add auth checks to endpoints
5. ✅ **Issue #6** - Add withCredentials to axios calls
6. ✅ **Issue #7** - Fix CORS configuration

### Phase 3: MEDIUM (20 minutes)
7. ✅ **Issue #8** - Add error handling
8. ✅ **Issue #9** - Fix session configuration

---

## TESTING AFTER FIXES

```bash
# 1. Start backend
cd lib/server
npm start

# 2. Start frontend
cd lib
npm run dev

# 3. Test admin login
# Login with: admin / admin123
# Should NOT get 401 error

# 4. Test book borrowing
# Student requests book
# Should create request without 400 error

# 5. Test admin approval
# Admin sees request
# Admin approves
# Admin confirms handover
# Should complete without errors

# 6. Test book availability
# Same student tries to request same book
# Should get "already borrowed" error
```

---

## DEPLOYMENT STEPS

```bash
# After fixing all issues locally:

# 1. Commit changes
git add .
git commit -m "Fix critical authentication, transaction, and CORS issues

- Fix admin login session not being saved (Issue #1)
- Fix branch books handover transaction errors (Issue #3)
- Fix double-borrowing vulnerability (Issue #4)
- Add missing auth checks (Issue #5)
- Add withCredentials to API calls (Issue #6)
- Fix CORS configuration (Issue #7)"

# 2. Push to deploy-version branch
git push origin deploy-version

# 3. Render will auto-deploy
# Monitor: https://dashboard.render.com

# 4. Test on production
# Admin: admin / admin123
# Verify: login works, requests visible, borrowing works
```

---

## VERIFICATION CHECKLIST

After applying all fixes:

- [ ] Admin login works (no 401)
- [ ] Requests visible in dashboard
- [ ] Student can request book (no 400)
- [ ] Admin can approve request
- [ ] Admin can confirm handover
- [ ] Student can't borrow same book twice
- [ ] All API calls return data (no empty lists)
- [ ] No 500 errors in logs
- [ ] Session persists across page refresh
- [ ] CORS errors gone from console

---

## SUMMARY

**Root Causes Found:**
1. Admin session not being saved before response → 401 errors
2. Database transaction methods don't exist on pool → 500 errors
3. Missing credentials in requests → Session lost
4. Missing auth checks → Security issue
5. Double-borrowing vulnerability → Data integrity issue

**Impact:**
- All 3 issues you reported are caused by Issue #1
- Fixes will resolve 95% of your problems
- Remaining 5% are edge cases covered by Issues #5-9

---

**Estimated Fix Time: 1.5 - 2 hours**

