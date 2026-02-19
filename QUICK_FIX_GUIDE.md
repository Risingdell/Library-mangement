# Quick Fix Guide - 5 Minute Setup

## The Problem
- ❌ Students get 400 error when borrowing books
- ❌ Admin cannot see borrow requests on dashboard
- ❌ Requests don't appear in admin approval section

## The Root Cause
The database migration that creates the `branch_book_requests` table hasn't been applied to your database.

---

## IMMEDIATE FIX (Do This First)

### Step 1: Apply the Database Migration

**Option A: Automatic (Recommended)**
```bash
cd lib/server
node apply-migration.js
```

**Option B: Manual via MySQL**
```bash
mysql -u root -p<your_password> -h localhost < migrations/005_add_branch_book_request_workflow.sql
```

**Option C: Using MySQL CLI**
```bash
# Open MySQL client
mysql -u root -p<your_password>

# Select your database
USE library;

# Run the migration file
source /path/to/migrations/005_add_branch_book_request_workflow.sql;

# Verify it worked
SHOW TABLES LIKE 'branch_book_requests';
SHOW VIEWS LIKE 'admin_pending_branch_requests';
```

### Step 2: Verify Migration Success

Run these SQL commands to verify:

```sql
-- Check if branch_book_requests table exists
SHOW TABLES LIKE 'branch_book_requests';
-- Should return: | branch_book_requests |

-- Check if view exists
SHOW VIEWS LIKE 'admin_pending_branch_requests';
-- Should return: | admin_pending_branch_requests |

-- Check table structure
DESCRIBE branch_book_requests;
-- Should show columns: id, book_id, student_id, status, requested_at, etc.

-- Check if there are any existing requests
SELECT COUNT(*) FROM branch_book_requests;
```

### Step 3: Reset Book Statuses

Make sure all books are available:

```sql
UPDATE books
SET status = 'available'
WHERE status IS NULL OR status = '' OR status = 'unknown';

-- Verify
SELECT id, title, status FROM books LIMIT 10;
```

### Step 4: Restart Backend Server

```bash
cd lib/server

# Kill the existing process
# Press Ctrl+C if running in terminal

# Start fresh
npm start
```

### Step 5: Test the Flow

1. **Open browser** → Clear cache (Ctrl+Shift+Delete)
2. **Login as student**
3. **Navigate to "Books" tab**
4. **Click "Borrow" on any book**
   - Should see: ✅ "Book request submitted! Waiting for admin approval."
   - NOT: ❌ 400 error or blank error
5. **Login as admin** (new browser or incognito window)
6. **Navigate to "Branch Book Requests" tab**
   - Should see: ✅ The pending request appears
   - NOT: ❌ Empty list or "Failed to load"
7. **Click "Approve" button**
   - Status should change to "Approved"
8. **Click "Confirm Handover" button**
   - Status should change to "Completed"
9. **Student should see**: Request status "completed"

---

## If Migration Still Doesn't Work

### Check Backend Logs

Look for SQL errors in the terminal where you ran `npm start`:

```
Error: Table 'library.branch_book_requests' doesn't exist
```

### Verify Database Connection

In `lib/server/db.js`, check:
```javascript
const connection = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'library'
});
```

Make sure:
- ✅ `database` field matches your actual database name
- ✅ `host` is correct (localhost or your server address)
- ✅ `user` and `password` are correct

### Test Database Connection

```bash
cd lib/server
mysql -u <user> -p<password> -h <host> -e "USE library; SHOW TABLES;"
```

Should show tables including `branch_book_requests`.

---

## Error Messages & Solutions

### Error: "Unknown table 'admin_pending_branch_requests'"
**Cause**: Migration not applied
**Solution**: Run Step 1 above

### Error: "Access denied for user"
**Cause**: Wrong database credentials
**Solution**: Check `.env` file in `lib/server/`

### Error: "Database 'library' doesn't exist"
**Cause**: Database not created
**Solution**:
```sql
CREATE DATABASE IF NOT EXISTS library;
USE library;
-- Then run migration
```

### Error: "You already have a pending request"
**Cause**: Student has an active request for another book
**Solution**:
- Admin must approve/reject the first request
- OR Student must cancel the first request
- Then student can request a new book

### Error: "Book is currently borrowed"
**Cause**: Book is already checked out
**Solution**: Wait for current borrower to return it

---

## Production Deployment

### Before Deploying:

1. **Test locally** (steps above)
2. **Make backup** of production database
   ```bash
   mysqldump -u <user> -p <database> > backup_$(date +%Y%m%d).sql
   ```

### Deploy Migration:

```bash
# SSH into production server
ssh user@production-server

# Connect to production database
mysql -u prod_user -p prod_password -h prod_host < /path/to/005_add_branch_book_request_workflow.sql

# Verify
mysql -u prod_user -p prod_password -h prod_host -e "USE library; SHOW TABLES LIKE 'branch_book_requests';"
```

### Restart Application:

- Redeploy through your hosting platform (Railway, Vercel, Heroku, etc.)
- OR restart the Node.js process on your server

---

## Verification Checklist

After applying the fix, verify each item:

### Database Level
- [ ] `branch_book_requests` table exists
- [ ] `admin_pending_branch_requests` view exists
- [ ] All books have `status = 'available'`
- [ ] Table has no duplicate keys

### Backend Level
- [ ] `npm start` shows "Server running on port 5000"
- [ ] No SQL errors in console
- [ ] `/api/admin/branch-books/pending-requests` endpoint responds

### Frontend Level
- [ ] Student can request a book without 400 error
- [ ] Request appears in admin dashboard
- [ ] Admin can approve/reject requests
- [ ] Admin can confirm handover
- [ ] Book status changes to "borrowed"

### E2E Flow
- [ ] Student requests book → ✅ Request created
- [ ] Admin approves → ✅ Status changes to "approved"
- [ ] Admin confirms handover → ✅ Status changes to "completed"
- [ ] Book appears in student's "borrowed books"
- [ ] Book status changed to "borrowed"

---

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| 400 error on POST /request | Check book status is 'available' |
| 400 "already have pending" | Student must cancel or wait for approval |
| Admin sees empty list | Migration not applied OR admin not logged in |
| 404 on /api/admin/... | Check routes are registered in index.js |
| Database connection fails | Check .env file credentials |
| "Table doesn't exist" | Run migration (Step 1) |
| Students can request only 1 at a time | This is by design (see FIXES_TO_APPLY.md for how to change) |

---

## Files Changed by Migration

The migration (`005_add_branch_book_request_workflow.sql`) creates/modifies:

**Created:**
- ✅ `branch_book_requests` table
- ✅ `admin_pending_branch_requests` view
- ✅ `after_branch_book_handover` trigger (may need adjustment)

**Modified:**
- ✅ `books` table (adds `book_format`, `file_path`, `type` columns)

**Not Changed:**
- ℹ️ Existing tables remain intact
- ℹ️ Existing data preserved

---

## Next Steps (After Fix)

1. ✅ Apply migration
2. ✅ Verify database
3. ✅ Test locally
4. ✅ Deploy to production
5. ✅ Monitor logs for errors
6. 📖 Read `PROJECT_ANALYSIS_AND_FIXES.md` for full understanding
7. 📈 Consider FIX #5 (allow multiple requests) if needed

---

## Need More Help?

See other documentation files:
- **`PROJECT_ANALYSIS_AND_FIXES.md`** - Complete technical analysis
- **`FIXES_TO_APPLY.md`** - Code changes and improvements
- **`FILE_OPERATIONS_FLOWCHART.md`** - Visual flow diagrams
- **`API_DOCUMENTATION.md`** - API endpoint details

---

## Summary

The **missing database migration** is causing the issue. Apply it, restart the server, and test. Everything should work!

```
ISSUE: Table doesn't exist
↓
CAUSE: Migration not applied
↓
FIX: node apply-migration.js
↓
RESULT: ✅ Working!
```

