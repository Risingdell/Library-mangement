# Specific Code Fixes to Apply

## FIX #1: Apply Database Migration (CRITICAL)

**File**: `lib/server/migrations/005_add_branch_book_request_workflow.sql`

**Status**: ✅ Already exists - needs to be applied

**How to Apply**:

### Option A: Using Node.js Script
```bash
cd lib/server
node apply-migration.js
```

### Option B: Using MySQL Directly
```bash
cd lib/server
mysql -u <username> -p<password> -h <hostname> < migrations/005_add_branch_book_request_workflow.sql
```

### Option C: Check if Already Applied
```sql
USE library;

-- Check if table exists
SHOW TABLES LIKE 'branch_book_requests';

-- Check if view exists
SHOW VIEWS LIKE 'admin_pending_branch_requests';

-- View all pending requests
SELECT * FROM branch_book_requests WHERE status = 'pending';
```

---

## FIX #2: Fix Book Status Query (Ensure Books Are Available)

**File**: `lib/server/index.js`

**Current Issue**: Books might have NULL or empty status

**Suggested Fix**: Add a route to initialize book statuses

**Location**: Add after line 690 (after route registration)

```javascript
// Initialize book statuses on server start
const initializeBookStatuses = () => {
  const sql = `
    UPDATE books
    SET status = 'available'
    WHERE status IS NULL OR status = '' OR status = 'unknown'
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error initializing book statuses:', err);
      return;
    }
    console.log(`✅ Book statuses initialized: ${result.affectedRows} books updated`);
  });
};

// Call on server start
initializeBookStatuses();
```

---

## FIX #3: Add Better Error Logging (for debugging the 400 error)

**File**: `lib/server/routes/branchBooks.js`

**Location**: After line 14 (in handleBorrow function)

```javascript
router.post('/request', (req, res) => {
  const { bookId } = req.body;

  // ✅ ADD THIS: Better error logging
  console.log(`[BRANCH BOOK REQUEST] User ${req.session.user?.id} requesting book ${bookId}`);

  // Check if user is logged in
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Please login first.'
    });
  }
  // ... rest of code
```

**Location**: Before returning 400 error on line 94

```javascript
if (existingRequests.length > 0) {
  // ✅ ADD THIS: Log the conflict
  console.log(`[BRANCH BOOK REQUEST] User ${studentId} has existing request:`, existingRequests[0]);

  // Student has pending request for a different book
  return res.status(400).json({
    success: false,
    message: `You already have a ${existingRequests[0].status} request for "${existingRequests[0].title}". Please wait for admin confirmation or cancel that request first.`,
    existingRequest: {
      bookTitle: existingRequests[0].title,
      requestId: existingRequests[0].id,
      status: existingRequests[0].status
    }
  });
}
```

---

## FIX #4: Enhance Admin Request Fetching with Error Details

**File**: `lib/server/routes/adminBranchBooks.js`

**Location**: Modify the `/pending-requests` endpoint (line 13-42)

```javascript
router.get('/pending-requests', (req, res) => {
  // Check if admin is logged in
  if (!req.session.admin) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Admin access required.'
    });
  }

  // ✅ CHANGE: Query the actual table instead of view for better control
  const sql = `
    SELECT
      br.id,
      br.book_id,
      br.student_id,
      br.requested_at,
      br.status,
      br.approved_by_admin,
      br.approved_at,
      br.rejection_reason,
      br.confirmed_handed_over,
      b.title,
      b.author,
      b.acc_no,
      b.book_format,
      b.type,
      b.status AS book_status,
      u.username AS student_username,
      u.firstName AS student_first_name,
      u.lastName AS student_last_name,
      u.email AS student_email,
      u.usn AS student_usn
    FROM branch_book_requests br
    JOIN books b ON br.book_id = b.id
    JOIN users u ON br.student_id = u.id
    WHERE br.status = 'pending'
    ORDER BY br.requested_at ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching pending requests:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch pending requests',
        error: err.message // ✅ Include error message for debugging
      });
    }

    // ✅ Log for debugging
    console.log(`[ADMIN REQUESTS] Found ${results.length} pending requests`);

    res.json({
      success: true,
      data: results,
      count: results.length // ✅ Include count for debugging
    });
  });
});
```

---

## FIX #5: Add Request Status Check Endpoint (Helps Student Debug)

**File**: `lib/server/routes/branchBooks.js`

**Location**: After the DELETE endpoint (after line 249)

```javascript
/**
 * Check current request status (for student)
 * GET /api/branch-books/status/:requestId
 */
router.get('/status/:requestId', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }

  const { requestId } = req.params;
  const studentId = req.session.user.id;

  const sql = `
    SELECT
      br.id,
      br.book_id,
      br.status,
      br.requested_at,
      br.approved_at,
      br.confirmed_at,
      b.title,
      b.author
    FROM branch_book_requests br
    JOIN books b ON br.book_id = b.id
    WHERE br.id = ? AND br.student_id = ?
  `;

  db.query(sql, [requestId, studentId], (err, results) => {
    if (err) {
      console.error('Error fetching request status:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    res.json({
      success: true,
      data: results[0]
    });
  });
});
```

---

## FIX #6: Enable CORS for Admin Requests (if needed)

**File**: `lib/server/index.js`

**Location**: Check around line 550-600 (CORS configuration)

```javascript
// If admin requests are failing with CORS errors, ensure CORS is configured:
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? [process.env.FRONTEND_URL || 'https://your-app.netlify.app']
      : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000'];

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,  // ✅ IMPORTANT: Enable credentials for session
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
```

---

## FIX #7: Add Debugging Endpoint (Optional - for Testing)

**File**: `lib/server/routes/branchBooks.js`

**Location**: After the DELETE endpoint (after line 249)

```javascript
/**
 * DEBUG: Get all requests for this student (with all details)
 * GET /api/branch-books/debug/my-status
 */
router.get('/debug/my-status', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const studentId = req.session.user.id;

  const sql = `
    SELECT
      br.id,
      br.book_id,
      br.status,
      br.requested_at,
      br.approved_at,
      br.confirmed_at,
      br.confirmed_handed_over,
      b.id as book_internal_id,
      b.title,
      b.author,
      b.status as book_status
    FROM branch_book_requests br
    LEFT JOIN books b ON br.book_id = b.id
    WHERE br.student_id = ?
    ORDER BY br.requested_at DESC
  `;

  db.query(sql, [studentId], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message
      });
    }

    res.json({
      success: true,
      totalRequests: results.length,
      activeRequests: results.filter(r => r.status !== 'completed' && r.status !== 'rejected').length,
      data: results
    });
  });
});
```

---

## FIX #8: Update Frontend to Show Better Error Messages

**File**: `lib/src/Pages/MainPage.jsx`

**Location**: Around line 129 (in handleBorrow catch block)

```javascript
.catch(err => {
  console.error('Request failed', err);

  // ✅ IMPROVED: Show the actual error from server
  let errorMessage = 'Failed to request book';

  if (err.response?.data?.message) {
    errorMessage = err.response.data.message;
  } else if (err.response?.status === 400) {
    errorMessage = 'Cannot request this book. You might already have a pending request.';
  } else if (err.response?.status === 401) {
    errorMessage = 'You need to login first';
  } else if (err.response?.status === 404) {
    errorMessage = 'Book not found';
  }

  showSnackbar('error', errorMessage);

  // ✅ Log detailed error for debugging
  console.log('Full error response:', {
    status: err.response?.status,
    data: err.response?.data,
    message: err.message
  });
})
```

---

## FIX #9: Verify Admin Dashboard Request Fetching

**File**: `lib/src/Pages/AdminDashboard.jsx`

**Location**: Around line 105-110

```javascript
else if (activeTab === 'branch-book-requests') {
  try {
    res = await axios.get(`${API_URL}/api/admin/branch-books/pending-requests`,
      { withCredentials: true });

    // ✅ IMPROVED: Better error handling
    if (res && res.data && res.data.data) {
      setBranchBookRequests(res.data.data);
      console.log(`[ADMIN] Loaded ${res.data.data.length} pending requests`);
    } else {
      console.warn('[ADMIN] Unexpected response format:', res.data);
    }
  } catch (fetchErr) {
    console.error('[ADMIN] Failed to fetch branch book requests:', {
      status: fetchErr.response?.status,
      message: fetchErr.response?.data?.message,
      error: fetchErr.message
    });
    showSnackbar('error', 'Failed to load branch book requests');
  }
}
```

---

## SUMMARY: Quick Fix Checklist

### Immediate Actions:
- [ ] **Apply Migration**: Run `lib/server/migrations/005_add_branch_book_request_workflow.sql`
- [ ] **Update Book Status**: Execute the SQL to set all books to 'available'
- [ ] **Restart Backend**: Kill and restart `npm start`
- [ ] **Clear Cache**: Clear browser cache and localStorage
- [ ] **Test Flow**:
  - [ ] Student logs in
  - [ ] Student requests a book → Should see success message
  - [ ] Admin logs in
  - [ ] Admin sees the request in "branch-book-requests" tab
  - [ ] Admin approves request
  - [ ] Admin confirms handover
  - [ ] Student's request status shows "completed"

### Optional Improvements:
- [ ] Add enhanced error logging (Fix #3)
- [ ] Improve admin endpoint (Fix #4)
- [ ] Add status check endpoint (Fix #5)
- [ ] Add debug endpoint (Fix #7)
- [ ] Update frontend error messages (Fix #8)

---

## Deployment Steps

After applying all fixes:

1. **Test Locally**:
   ```bash
   cd lib
   npm install
   npm run dev
   ```

2. **Deploy to Production**:
   ```bash
   git add .
   git commit -m "Fix branch book request workflow"
   git push origin main
   ```

3. **Apply Migration on Production Database**:
   ```bash
   mysql -u prod_user -ppassword -h prod_host < migrations/005_add_branch_book_request_workflow.sql
   ```

4. **Restart Production Server**:
   - Redeploy through your hosting platform (Railway, Vercel, etc.)

