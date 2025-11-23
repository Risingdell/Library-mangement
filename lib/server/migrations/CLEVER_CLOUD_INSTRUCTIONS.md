# How to Apply Database Fix to Clever Cloud

## 🚨 **IMPORTANT - Read Before Proceeding**

This migration will:
- ✅ Remove admin verification from `book_requests` (marketplace books)
- ✅ Drop `purchased_books` table (incorrect table)
- ✅ Create `branch_book_requests` table (for branch book admin workflow)
- ✅ Safe for production - uses IF EXISTS checks

---

## 📋 **Prerequisites**

- Access to your Clever Cloud console
- Database: `biuezvkp1ir5odbq6wju`
- **BACKUP YOUR DATABASE FIRST!**

---

## 🔐 **Step 1: Backup Your Database**

### Option A: Clever Cloud Console
1. Go to Clever Cloud Dashboard
2. Select your MySQL add-on: `biuezvkp1ir5odbq6wju`
3. Click **"Backups"** tab
4. Click **"Create Backup"** button
5. Wait for backup to complete

### Option B: Manual Backup via Command Line
```bash
# Get your database credentials from Clever Cloud console
mysqldump -h your-clever-cloud-host \
  -u your-username \
  -p biuezvkp1ir5odbq6wju > backup_$(date +%Y%m%d).sql
```

---

## 🚀 **Step 2: Apply the Fix**

### **Option A: Using Clever Cloud Console (Recommended)**

1. **Login to Clever Cloud**
   - Go to https://console.clever-cloud.com/
   - Navigate to your MySQL add-on

2. **Open phpMyAdmin**
   - In your MySQL add-on dashboard
   - Click on **"phpMyAdmin"** link
   - Login with your database credentials

3. **Select Your Database**
   - Click on `biuezvkp1ir5odbq6wju` in the left sidebar

4. **Run the Migration**
   - Click on **"SQL"** tab at the top
   - Open `PRODUCTION_FIX.sql` from your local machine
   - Copy the ENTIRE contents
   - Paste into the SQL query box
   - Click **"Go"** button at the bottom

5. **Verify Results**
   - Scroll to the bottom of the results
   - You should see:
     ```
     ✓ SUCCESS: book_requests has NO admin columns (marketplace books)
     ✓ SUCCESS: branch_book_requests table created (branch books)
     ✓ PRODUCTION DATABASE FIX COMPLETE!
     ```

---

### **Option B: Using MySQL Command Line**

1. **Get Database Credentials**
   - Clever Cloud Dashboard → Your MySQL add-on
   - Copy: Host, Port, User, Password, Database name

2. **Connect to Database**
   ```bash
   mysql -h your-clever-cloud-host.mysql.services.clever-cloud.com \
     -P 3306 \
     -u your-username \
     -p \
     biuezvkp1ir5odbq6wju
   ```

3. **Run the Migration**
   ```bash
   source /path/to/PRODUCTION_FIX.sql
   ```

   Or paste the entire SQL content directly

---

### **Option C: Using MySQL Workbench or DBeaver**

1. **Create New Connection**
   - Host: `your-clever-cloud-host.mysql.services.clever-cloud.com`
   - Port: `3306`
   - User: `your-username`
   - Password: `your-password`
   - Database: `biuezvkp1ir5odbq6wju`

2. **Open SQL File**
   - Open `PRODUCTION_FIX.sql`
   - Execute the entire file

3. **Check Results**
   - Review output messages for success confirmations

---

## ✅ **Step 3: Verify the Fix**

After running the migration, verify in phpMyAdmin or your SQL client:

### **1. Check `book_requests` table (Marketplace Books)**
```sql
DESCRIBE book_requests;
```

**Should NOT have these columns:**
- ❌ `admin_status`
- ❌ `approved_by_admin`
- ❌ `approved_at`
- ❌ `confirmed_received_at`
- ❌ `rejection_reason`

**Should have these columns:**
- ✅ `id`
- ✅ `marketplace_book_id`
- ✅ `requester_id`
- ✅ `requested_at`
- ✅ `status`
- ✅ `is_priority_buyer`
- ✅ `cancelled_at`
- ✅ `completed_at`

### **2. Check `branch_book_requests` table exists**
```sql
DESCRIBE branch_book_requests;
```

**Should have these columns:**
- ✅ `id`
- ✅ `book_id`
- ✅ `student_id`
- ✅ `requested_at`
- ✅ `status`
- ✅ `approved_by_admin` ← Admin approval columns
- ✅ `approved_at`
- ✅ `confirmed_handed_over`
- ✅ `confirmed_by_admin`
- ✅ `confirmed_at`
- ✅ `rejection_reason`

### **3. Verify `purchased_books` table is gone**
```sql
SHOW TABLES LIKE 'purchased_books';
```
**Should return:** Empty set (0 rows)

---

## 📊 **Final Database Structure**

After the fix, you'll have:

### **Marketplace Books (Student ↔ Seller)**
```
Tables:
- used_books_marketplace (books for sale)
- book_requests (queue, NO admin columns)

Workflow:
Student → Request → Queue → Seller
NO admin involvement
```

### **Branch Books (Library → Student)**
```
Tables:
- books (library inventory)
- branch_book_requests (with admin approval)
- borrowed_books (final assignment)

Workflow:
Student → Request → Admin Approval → Handover → Assignment
REQUIRES admin confirmation
```

---

## 🔄 **Step 4: Update Your Backend Code**

After database migration, update your backend API endpoints:

### **For Marketplace Books** (`/api/marketplace/...`)
- **Remove** all admin approval logic
- **Use** queue system only
- **Reference** `book_requests` table (no admin columns)

### **For Branch Books** (`/api/books/...`)
- **Use** `branch_book_requests` table
- **Implement** admin approval endpoints
- **Implement** handover confirmation endpoints

---

## 🚨 **Troubleshooting**

### Error: "Table 'purchased_books' doesn't exist"
**Solution:** This is expected if the migration ran successfully. The incorrect table was dropped.

### Error: "Column 'admin_status' doesn't exist in 'book_requests'"
**Solution:** This means the cleanup was successful! The column should not exist.

### Error: "Duplicate column name"
**Solution:** The migration already ran. Check the verification queries to confirm success.

### Error: "Cannot connect to database"
**Solution:**
1. Check Clever Cloud status page
2. Verify database credentials
3. Check if database is sleeping (restart it in Clever Cloud console)

---

## 📞 **Need Help?**

If you encounter issues:

1. **Check Clever Cloud Logs**
   - Dashboard → MySQL add-on → Logs

2. **Check Migration Output**
   - Review all messages from the SQL execution
   - Look for specific error messages

3. **Restore from Backup** (if needed)
   - Clever Cloud Dashboard → Backups → Restore

---

## ✅ **Success Checklist**

- [ ] Database backed up
- [ ] Migration script executed without errors
- [ ] `book_requests` has NO admin columns
- [ ] `branch_book_requests` table exists
- [ ] `purchased_books` table is gone
- [ ] Verification queries all passed
- [ ] Backend code updated (if needed)

---

**You're all set! Your production database is now correctly structured.**
