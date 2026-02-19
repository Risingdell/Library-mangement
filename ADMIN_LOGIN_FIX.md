# Admin Login 401 Error - Fix Guide

## Problem
**Error**: `Failed to load resource: the server responded with a status of 401`
- Admin cannot login to admin dashboard
- Cannot view or approve pending book requests

---

## Root Cause

The 401 error means: **"Invalid credentials - admin username/password not found in database"**

This happens when:
1. ❌ Admin record doesn't exist in `admins` table
2. ❌ Credentials don't match stored values
3. ❌ Database initialization wasn't completed

---

## Solution

### Step 1: Check Admin Credentials

**Default Admin Credentials:**
```
Username: admin
Password: admin123
```

**Try logging in with these credentials first.**

If that doesn't work, proceed to Step 2.

---

### Step 2: Verify Admin Exists in Database

Run this SQL command:

```sql
USE library;
SELECT * FROM admins;
```

**Expected Output:**
```
| id | name  | username | password   |
|----|-------|----------|------------|
| 5  | Admin | admin    | admin123   |
```

**If no results**, the admin record is missing. Go to Step 3.

---

### Step 3: Insert Admin Record

If the admin table is empty, insert the default admin:

```sql
USE library;

INSERT INTO admins (id, name, username, password)
VALUES (5, 'Admin', 'admin', 'admin123');
```

Or if id=5 already exists:
```sql
INSERT INTO admins (name, username, password)
VALUES ('Admin', 'admin', 'admin123');
```

---

### Step 4: Verify Database Connection

Make sure backend is connected to the correct database:

**Check `lib/server/.env`:**
```
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=library
```

All values must match your actual database setup.

---

### Step 5: Restart Backend

```bash
cd lib/server
npm start
```

---

### Step 6: Test Login

1. Go to: `http://localhost:5173/admin-login` (or your deployed URL)
2. Enter:
   - Username: `admin`
   - Password: `admin123`
3. Should redirect to admin dashboard ✅

---

## If Still Not Working

### Check Backend Logs

Look for these messages:

**✅ Expected:**
```
[Database] Connected to library
[Admin Login] User admin login successful
```

**❌ Error Signs:**
```
Error: Access denied for user 'root'@'localhost'
Error: Unknown database 'library'
Error: Table 'library.admins' doesn't exist
```

---

### Create Admin Manually

```sql
-- Delete existing admin if corrupted
DELETE FROM admins WHERE username = 'admin';

-- Insert fresh admin
INSERT INTO admins (id, name, username, password)
VALUES (1, 'Administrator', 'admin', 'admin123');

-- Verify
SELECT * FROM admins WHERE username = 'admin';
```

---

### Check Connection String

**Backend file**: `lib/server/db.js`

```javascript
const connection = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'library'
});
```

**Verify each value:**
- ✅ `host` - correct server address
- ✅ `user` - correct MySQL username
- ✅ `password` - correct MySQL password
- ✅ `database` - should be `library`

---

### Test MySQL Connection Directly

```bash
# Test from command line
mysql -u root -ppassword -h localhost library -e "SELECT * FROM admins;"

# Should return the admin record
```

---

## Production Issue (Render, Heroku, etc.)

If using a cloud database:

### 1. Check Production Database Credentials

```bash
# Check environment variables
echo $DB_HOST
echo $DB_USER
echo $DB_NAME
```

### 2. Connect to Production Database

```bash
mysql -u <prod_user> -p<prod_password> -h <prod_host> library
```

### 3. Verify Admin Record Exists

```sql
SELECT * FROM admins;
```

### 4. If Missing, Insert

```sql
INSERT INTO admins (id, name, username, password)
VALUES (1, 'Administrator', 'admin', 'admin123');
```

### 5. Verify Connection String

Update production environment variables to match your cloud database.

---

## Changing Admin Password

If you want to change the admin password:

```sql
UPDATE admins
SET password = 'new_secure_password'
WHERE username = 'admin';
```

Then login with new password.

---

## Adding Multiple Admins

```sql
INSERT INTO admins (name, username, password)
VALUES ('Secondary Admin', 'admin2', 'password456');

-- Verify
SELECT * FROM admins;
```

---

## Complete Troubleshooting Flow

```
❌ Admin Login Returns 401
    ↓
Check: Admin credentials correct?
    ├─ YES → Step 3: Insert admin record
    └─ NO → Step 1: Try default (admin/admin123)
    ↓
Check: Admin exists in database?
    ├─ YES → Check: Database connection correct?
    │       ├─ YES → Clear browser cache, restart backend
    │       └─ NO → Update DB connection string
    └─ NO → Insert admin record
    ↓
Check: Credentials match database?
    ├─ YES → Verify row 3: Backend connected to right database?
    │       ├─ YES → Try incognito window
    │       └─ NO → Fix connection string, restart
    └─ NO → Update password to 'admin123'
    ↓
✅ Login Successful!
```

---

## Common Admin Login Issues

| Error | Cause | Fix |
|-------|-------|-----|
| 400 Bad Request | Missing username/password fields | Ensure form fields have values |
| 401 Invalid credentials | Admin not found or password wrong | Insert admin record with correct password |
| 404 Not Found | `/api/admin/login` endpoint not registered | Check index.js routes registration |
| 500 Server Error | Database connection error | Check `.env` file, restart server |
| Connection refused | Backend not running | Run `npm start` in server directory |
| CORS error | Frontend & backend on different origins | Check CORS configuration |

---

## After Login Works

Once admin can login:

1. ✅ Admin Dashboard should load
2. ✅ Admin can view "Branch Book Requests" tab
3. ✅ Admin can see pending student book requests
4. ✅ Admin can approve/reject requests
5. ✅ Admin can confirm book handover

If requests still don't show:
- See: **PROJECT_ANALYSIS_AND_FIXES.md** → Issue #2
- Likely: Migration not applied
- Fix: Run `node apply-migration.js`

---

## Security Notes

**⚠️ WARNING: Hardcoded Passwords**

The database stores passwords in plain text. For production:

1. **Hash passwords**:
   ```javascript
   const bcrypt = require('bcrypt');
   const hashedPassword = await bcrypt.hash('admin123', 10);
   ```

2. **Verify on login**:
   ```javascript
   const isValid = await bcrypt.compare(inputPassword, storedHash);
   ```

3. **Update admin table**:
   ```sql
   ALTER TABLE admins ADD COLUMN password_hash VARCHAR(255);
   UPDATE admins SET password_hash = '$2b$10$...' WHERE username='admin';
   ```

---

## Quick Fix Summary

```bash
# 1. Check default credentials work
# Username: admin
# Password: admin123

# 2. If not, insert admin:
mysql -u root -p<password> library -e \
  "INSERT INTO admins (id, name, username, password)
   VALUES (1, 'Admin', 'admin', 'admin123');"

# 3. Verify:
mysql -u root -p<password> library -e "SELECT * FROM admins;"

# 4. Restart backend:
cd lib/server && npm start

# 5. Try login again
```

---

## Related Issues

If admin can now login but still can't see requests:
- Read: **PROJECT_ANALYSIS_AND_FIXES.md** → Issue #2
- Check: Migration `005_add_branch_book_request_workflow.sql` applied
- Fix: `node apply-migration.js`

