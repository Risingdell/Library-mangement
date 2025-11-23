# Database Migration Guide

## Summary of Changes

### ✅ **What Was Fixed**

The database has been corrected to properly handle two distinct book workflows:

1. **Marketplace Books** (Student ↔ Seller) - **NO ADMIN INVOLVEMENT**
2. **Branch Books** (Student → Admin → Assignment) - **REQUIRES ADMIN APPROVAL**

### 🗑️ **Removed Migration**

- ❌ `005_add_admin_verified_purchase_workflow.sql` → Renamed to `.DEPRECATED`
  - **Reason**: This incorrectly added admin verification to marketplace books

### ✅ **Corrected Migrations**

1. **`marketplace_request_queue.sql`** (Already exists)
   - Creates queue system for marketplace books
   - Student-to-student book sales
   - First-come-first-serve queue
   - Automatic queue promotion on cancellation
   - **NO admin involvement**

2. **`005_add_branch_book_request_workflow.sql`** (NEW - Corrected)
   - Creates request workflow for branch library books
   - Admin approval required
   - Admin handover confirmation required
   - Creates `branch_book_requests` table
   - Automatically creates `borrowed_books` entry on handover

---

## Database Structure

### 📚 **Marketplace Books** (Student-to-Student)

```
Tables:
├── used_books_marketplace  (Books listed for sale)
└── book_requests           (Queue of interested buyers)

Workflow:
1. Student lists book in marketplace
2. First student clicks "Request to Buy" → Gets priority
3. Other students join queue (first-come-first-serve)
4. If priority buyer cancels → Next in queue gets promoted automatically
5. NO admin involvement at any step
```

### 📖 **Branch Books** (Library Books)

```
Tables:
├── books                     (Branch library inventory)
├── branch_book_requests      (Student requests for books)
└── borrowed_books            (Confirmed borrowed books)

Workflow:
1. Student clicks "Request Book"
2. Request goes to admin (status: pending)
3. Admin reviews and approves request
4. Admin physically gives book to student
5. Admin clicks "Confirm Handed Over"
6. System automatically:
   - Creates borrowed_books entry
   - Updates book status to 'borrowed'
   - Marks request as completed
```

---

## How to Apply Migrations

### **Option 1: Using the Batch Script** (Recommended)

1. **Start XAMPP MySQL**
   - Open XAMPP Control Panel
   - Click "Start" next to MySQL

2. **Run the migration script**
   ```batch
   cd C:\xampp\htdocs\Lib\Lib\lib\server\migrations
   APPLY_MIGRATIONS.bat
   ```

3. The script will:
   - Check MySQL connection
   - Apply marketplace_request_queue.sql
   - Apply 005_add_branch_book_request_workflow.sql
   - Show verification results

### **Option 2: Manual Application**

1. **Start XAMPP MySQL** (if not running)

2. **Open MySQL command line or phpMyAdmin**

3. **Apply migrations in order:**

   ```sql
   -- First, apply marketplace queue system
   SOURCE C:/xampp/htdocs/Lib/Lib/lib/server/migrations/marketplace_request_queue.sql;

   -- Then, apply branch book request workflow
   SOURCE C:/xampp/htdocs/Lib/Lib/lib/server/migrations/005_add_branch_book_request_workflow.sql;
   ```

4. **Verify tables were created:**
   ```sql
   USE library;
   SHOW TABLES LIKE '%request%';
   ```

   You should see:
   - `book_requests` (marketplace books)
   - `branch_book_requests` (branch books)

---

## Verification

After applying migrations, verify the setup:

```sql
USE library;

-- Check marketplace book requests table
DESCRIBE book_requests;

-- Check branch book requests table
DESCRIBE branch_book_requests;

-- Check that book_requests does NOT have admin_status column
SHOW COLUMNS FROM book_requests LIKE 'admin_status';
-- Should return: Empty set (0.00 sec)

-- Check that branch_book_requests DOES have admin approval columns
SHOW COLUMNS FROM branch_book_requests LIKE '%admin%';
-- Should show: approved_by_admin, confirmed_by_admin
```

---

## Key Differences

| Feature | Marketplace Books | Branch Books |
|---------|-------------------|--------------|
| **Table** | `book_requests` | `branch_book_requests` |
| **Admin Approval** | ❌ NO | ✅ YES |
| **Queue System** | ✅ YES | ❌ NO |
| **Workflow** | Student → Queue → Seller | Student → Admin → Approval → Handover |
| **Purpose** | Used book sales | Library book borrowing |

---

## Troubleshooting

### MySQL Connection Failed

```
Error: Cannot connect to MySQL server
```

**Solution:**
1. Open XAMPP Control Panel
2. Start Apache and MySQL
3. Verify MySQL is running (should show green highlight)
4. Try running migrations again

### Migration Already Applied

```
Error: Table 'book_requests' already exists
```

**Solution:**
This means `marketplace_request_queue.sql` was already applied. Skip to applying `005_add_branch_book_request_workflow.sql`:

```batch
mysql -u root library < 005_add_branch_book_request_workflow.sql
```

### Deprecated Migration Was Applied

If the old incorrect migration (`005_add_admin_verified_purchase_workflow.sql`) was already applied, you need to rollback:

```sql
USE library;

-- Remove admin columns from book_requests (marketplace books shouldn't have these)
ALTER TABLE book_requests DROP FOREIGN KEY IF EXISTS fk_approved_by_admin;
ALTER TABLE book_requests DROP COLUMN IF EXISTS admin_status;
ALTER TABLE book_requests DROP COLUMN IF EXISTS approved_by_admin;
ALTER TABLE book_requests DROP COLUMN IF EXISTS approved_at;
ALTER TABLE book_requests DROP COLUMN IF EXISTS confirmed_received_at;
ALTER TABLE book_requests DROP COLUMN IF EXISTS rejection_reason;

-- Drop the incorrect purchased_books table
DROP TABLE IF EXISTS purchased_books;

-- Drop the incorrect view
DROP VIEW IF EXISTS admin_pending_purchases;

-- Now apply the correct migration
SOURCE C:/xampp/htdocs/Lib/Lib/lib/server/migrations/005_add_branch_book_request_workflow.sql;
```

---

## Support

For issues or questions:
1. Check this README
2. Verify MySQL is running in XAMPP
3. Check migration file paths are correct
4. Review error messages carefully
