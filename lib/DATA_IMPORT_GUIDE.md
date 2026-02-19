# 📊 Data Import Guide - Real Books to Clever Cloud

**Purpose:** Import real book data from Excel files to your Clever Cloud database while preserving user and admin accounts.

**Status:** Ready to execute
**Database:** Clever Cloud (bfjxqdkabitgzq9zhbfo-mysql.services.clever-cloud.com)
**Time to Complete:** ~5 minutes

---

## 🎯 What This Does

### ✅ Keeps (Preserved)
- ✅ All user accounts (registration/login works)
- ✅ Admin accounts (librarian access)
- ✅ User profiles and images
- ✅ Database structure and schema

### 🗑️ Clears (Removed)
- ❌ Test books (3 sample books)
- ❌ Test borrowing records
- ❌ Test marketplace listings
- ❌ Test book requests

### ✨ Adds (New)
- ✨ 300+ real books from Excel files
- ✨ Complete book catalog
- ✨ Ready for production

---

## 📋 Prerequisites

### 1. Node.js & npm
```bash
node --version  # Should be v16 or higher
npm --version
```

### 2. Required npm Packages
The script uses `xlsx` for Excel parsing. Install it:

```bash
cd c:\Users\Dell\Desktop\LIB\Library-mangement\lib\server
npm install xlsx mysql2
```

**Package check:**
```bash
npm list xlsx mysql2
```

Expected output:
```
├── mysql2@3.14.3
├── xlsx@0.18.x
└── ...
```

### 3. Environment Configuration
The `.env.production` file has been created with Clever Cloud credentials:
- ✅ Host: bfjxqdkabitgzq9zhbfo-mysql.services.clever-cloud.com
- ✅ User: u00ypk5kfqvhjiqo
- ✅ Password: [configured]
- ✅ Database: bfjxqdkabitgzq9zhbfo

### 4. Excel Files
All three Excel files must be present in:
```
c:\Users\Dell\Desktop\LIB\Library-mangement\lib\
├── Placement Library Book Details.xlsx    ✅
├── placement_books.SIT.xlsx               ✅
└── PLT LIBRARY BOOK DETAILS.xlsx          ✅
```

---

## 🚀 How to Run the Import

### Step 1: Navigate to Server Directory
```bash
cd c:\Users\Dell\Desktop\LIB\Library-mangement\lib\server
```

### Step 2: Verify Environment
```bash
# Check that .env.production exists and has correct credentials
cat .env.production

# Verify xlsx is installed
npm list xlsx
```

### Step 3: Run the Import Script
```bash
# Using default local database (if testing)
node scripts/import_real_books.js

# OR using Clever Cloud (production)
NODE_ENV=production node scripts/import_real_books.js
```

### Step 4: Watch the Output
The script will show:
```
[HH:MM:SS] ✅ Connected to database: bfjxqdkabitgzq9zhbfo
[HH:MM:SS] ✅ Users in system: 5
[HH:MM:SS] ✅ Admins in system: 1
[HH:MM:SS] ✅ Cleared books: X rows deleted
[HH:MM:SS] ✅ Cleared borrowed_books: X rows deleted
[HH:MM:SS] ✅ Cleared book_requests: X rows deleted
[HH:MM:SS] ✅ Cleared selling_books: X rows deleted
[HH:MM:SS] ✅ Cleared used_books_marketplace: X rows deleted
[HH:MM:SS] ✅ Read 305 rows from Placement Library Book Details.xlsx
[HH:MM:SS] ✅ Read 454 rows from placement_books (SIT).xlsx
[HH:MM:SS] ✅ Read 506 rows from PLT LIBRARY BOOK DETAILS.xlsx
[HH:MM:SS] ✅ Imported: 305 books
[HH:MM:SS] ✅ Imported: 150 books (additional from file 2)
[HH:MM:SS] ✅ Imported: 145 books (additional from file 3)
[HH:MM:SS] ✅ Total unique books imported: 600+
```

---

## 📊 Expected Results

### Books Imported
- **File 1:** ~300-305 books (primary source)
- **File 2:** ~100-150 additional books (after dedup)
- **File 3:** ~100-150 additional books (after dedup)
- **Total:** 500-600 unique books

### Database State After Import
```sql
-- Users and admins preserved
SELECT COUNT(*) FROM users;     -- Should be > 0
SELECT COUNT(*) FROM admins;    -- Should be >= 1

-- Books imported
SELECT COUNT(*) FROM books;     -- Should be 500-600

-- Borrowed books and marketplace cleared
SELECT COUNT(*) FROM borrowed_books;      -- Should be 0
SELECT COUNT(*) FROM book_requests;       -- Should be 0
SELECT COUNT(*) FROM used_books_marketplace; -- Should be 0
```

---

## ✅ Verification Steps

After the import completes, verify everything is working:

### 1. Check Database via Command Line
```bash
# Connect to Clever Cloud database
mysql -h bfjxqdkabitgzq9zhbfo-mysql.services.clever-cloud.com \
       -u u00ypk5kfqvhjiqo \
       -p tHs0EhMBc7wHlL3K4pJvF2b9 \
       -D bfjxqdkabitgzq9zhbfo

# In MySQL prompt:
SELECT COUNT(*) as total_books FROM books;
SELECT COUNT(DISTINCT author) as unique_authors FROM books;
SELECT * FROM users LIMIT 1;
SELECT * FROM admins LIMIT 1;
```

### 2. Test Backend API Locally
```bash
# Start backend server
npm run dev

# In another terminal, test the API
curl http://localhost:5000/books
# Should return 500+ books in JSON format
```

### 3. Test Frontend Locally
```bash
# In another terminal
npm run dev

# Visit http://localhost:5173
# - Register new user
# - Login
# - See 500+ books in the catalog
# - Try borrowing a book
```

---

## 🔧 Troubleshooting

### Error: "xlsx package not found"
**Solution:**
```bash
npm install xlsx
```

### Error: "Cannot connect to database"
**Solution:**
Check credentials in `.env.production`:
```bash
# Verify these are correct:
DB_HOST=bfjxqdkabitgzq9zhbfo-mysql.services.clever-cloud.com
DB_USER=u00ypk5kfqvhjiqo
DB_PASSWORD=[check in .env.production]
DB_NAME=bfjxqdkabitgzq9zhbfo
```

Test connection:
```bash
mysql -h bfjxqdkabitgzq9zhbfo-mysql.services.clever-cloud.com \
       -u u00ypk5kfqvhjiqo -p
```

### Error: "Foreign key constraint violated"
**Solution:**
The script clears tables in the correct order (child tables first). If this error occurs, check that:
1. No active connections to the database
2. Foreign key checks are enabled
3. Run again - it should work on retry

### Error: "Access denied for user"
**Solution:**
The credentials may have changed. Check:
1. Clever Cloud console for current credentials
2. Update `.env.production` with new credentials
3. Test connection first before running import

### Import is slow
**Normal!** Importing 600+ books takes time. The script should complete in 2-5 minutes depending on connection speed.

### Import didn't add expected number of books
**Check:**
```bash
# See how many unique books were imported
mysql -h bfjxqdkabitgzq9zhbfo-mysql.services.clever-cloud.com \
       -u u00ypk5kfqvhjiqo -p bfjxqdkabitgzq9zhbfo \
       -e "SELECT COUNT(*) as total FROM books;"

# See unique titles
mysql -h bfjxqdkabitgzq9zhbfo-mysql.services.clever-cloud.com \
       -u u00ypk5kfqvhjiqo -p bfjxqdkabitgzq9zhbfo \
       -e "SELECT COUNT(DISTINCT title) as unique_titles FROM books;"
```

---

## 🔄 Rollback (If Needed)

If something goes wrong, a backup was created:

```bash
# List backups created
ls -la c:\Users\Dell\Desktop\LIB\Library-mangement\lib\backup_*.sql

# The backup file contains the state before import
# To restore (only books data, not users), manually run the SQL file
# OR contact support for full database restoration
```

---

## 📱 Testing After Import

### Test 1: User Registration Still Works
1. Visit http://localhost:5173
2. Click "Register"
3. Create new account
4. **Expected:** Account created successfully ✅

### Test 2: User Login Still Works
1. Click "Login"
2. Use credentials from registration
3. **Expected:** Login successful ✅

### Test 3: See Books
1. After login, go to "Browse Books"
2. **Expected:** See 500+ books listed ✅

### Test 4: Borrow a Book
1. Click on a book
2. Click "Borrow"
3. Set return date
4. **Expected:** Book borrowed successfully ✅

### Test 5: Admin Login
1. Visit http://localhost:5173/admin
2. Username: `admin`
3. Password: `admin123`
4. **Expected:** Admin dashboard loads ✅

---

## 🌐 After Production Deployment

Once you deploy to Render and Vercel:

### 1. Verify Live API
```bash
curl https://library-backend-XXXX.onrender.com/books | head -20
# Should return 500+ books
```

### 2. Test Live Frontend
1. Visit https://library-XXXX.vercel.app
2. Register, login, browse books
3. **Expected:** Everything works ✅

### 3. Monitor First Day
- Check logs for errors
- Monitor database performance
- Verify backups are running

---

## 📝 Data Import Log

The script creates a log of the import. Check for:

```
Location: c:\Users\Dell\Desktop\LIB\Library-mangement\lib\backup_YYYY-MM-DD_HH-MM-SS.sql

Contains:
- Timestamp of import
- Number of rows cleared per table
- Number of rows imported
- Sample books imported
```

---

## 🎯 Success Criteria

✅ Import completes without errors
✅ 500+ books in database
✅ All users preserved
✅ All admins preserved
✅ Login/registration works
✅ Can see books in UI
✅ Can borrow books
✅ Backend API works
✅ No console errors

---

## 📞 Next Steps

### If Import Successful ✅
1. Deploy backend to Render.com
2. Deploy frontend to Vercel.com
3. Test live system
4. Go-live with customers

### If Import Failed ❌
1. Check troubleshooting section above
2. Verify Excel files are in correct location
3. Verify Clever Cloud credentials
4. Run import script again
5. Contact support if needed

---

## 📊 Import Statistics

After successful import, you should see:

```
Database: bfjxqdkabitgzq9zhbfo-mysql.services.clever-cloud.com
Users: 5+
Admins: 1+
Books: 500+
Authors: 200+
Borrowed Books: 0 (cleared)
Marketplace Listings: 0 (cleared)
Book Requests: 0 (cleared)
```

---

## 🚀 Ready to Import?

```bash
cd c:\Users\Dell\Desktop\LIB\Library-mangement\lib\server
NODE_ENV=production node scripts/import_real_books.js
```

---

**Document Version:** 1.0
**Last Updated:** February 17, 2026
**Status:** Ready to Execute
