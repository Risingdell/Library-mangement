-- ===================================================================
-- COMPLETE DATABASE FIX SCRIPT
-- ===================================================================
-- This script will:
-- 1. Remove incorrect admin verification from marketplace books
-- 2. Apply correct branch book request workflow
-- ===================================================================

USE library;

SET FOREIGN_KEY_CHECKS=0;

-- ===================================================================
-- PART 1: ROLLBACK INCORRECT MIGRATION
-- ===================================================================

SELECT '========================================' AS '';
SELECT 'PART 1: Removing incorrect admin verification from marketplace books...' AS '';
SELECT '========================================' AS '';

-- Drop incorrect view if exists
DROP VIEW IF EXISTS admin_pending_purchases;

-- Drop incorrect purchased_books table if exists
DROP TABLE IF EXISTS purchased_books;

-- Check if admin columns exist in book_requests
SELECT
    CASE
        WHEN COUNT(*) > 0 THEN 'Found admin columns in book_requests - will remove them'
        ELSE 'No admin columns found - skipping cleanup'
    END AS Status
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'library'
  AND TABLE_NAME = 'book_requests'
  AND COLUMN_NAME IN ('admin_status', 'approved_by_admin');

-- Drop foreign key constraint if exists
SET @fk_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = 'library'
    AND TABLE_NAME = 'book_requests'
    AND CONSTRAINT_NAME = 'fk_approved_by_admin'
);

SET @sql = IF(@fk_exists > 0,
    'ALTER TABLE book_requests DROP FOREIGN KEY fk_approved_by_admin',
    'SELECT "Foreign key fk_approved_by_admin does not exist - skipping" AS Status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop indexes if they exist
SET @idx1_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = 'library'
    AND TABLE_NAME = 'book_requests'
    AND INDEX_NAME = 'idx_admin_status'
);

SET @sql = IF(@idx1_exists > 0,
    'ALTER TABLE book_requests DROP INDEX idx_admin_status',
    'SELECT "Index idx_admin_status does not exist - skipping" AS Status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx2_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = 'library'
    AND TABLE_NAME = 'book_requests'
    AND INDEX_NAME = 'idx_approved_by_admin'
);

SET @sql = IF(@idx2_exists > 0,
    'ALTER TABLE book_requests DROP INDEX idx_approved_by_admin',
    'SELECT "Index idx_approved_by_admin does not exist - skipping" AS Status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Remove admin columns from book_requests one by one
SET @col1_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'library'
    AND TABLE_NAME = 'book_requests'
    AND COLUMN_NAME = 'admin_status'
);

SET @sql = IF(@col1_exists > 0,
    'ALTER TABLE book_requests DROP COLUMN admin_status',
    'SELECT "Column admin_status does not exist - skipping" AS Status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col2_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'library'
    AND TABLE_NAME = 'book_requests'
    AND COLUMN_NAME = 'approved_by_admin'
);

SET @sql = IF(@col2_exists > 0,
    'ALTER TABLE book_requests DROP COLUMN approved_by_admin',
    'SELECT "Column approved_by_admin does not exist - skipping" AS Status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col3_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'library'
    AND TABLE_NAME = 'book_requests'
    AND COLUMN_NAME = 'approved_at'
);

SET @sql = IF(@col3_exists > 0,
    'ALTER TABLE book_requests DROP COLUMN approved_at',
    'SELECT "Column approved_at does not exist - skipping" AS Status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col4_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'library'
    AND TABLE_NAME = 'book_requests'
    AND COLUMN_NAME = 'confirmed_received_at'
);

SET @sql = IF(@col4_exists > 0,
    'ALTER TABLE book_requests DROP COLUMN confirmed_received_at',
    'SELECT "Column confirmed_received_at does not exist - skipping" AS Status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col5_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'library'
    AND TABLE_NAME = 'book_requests'
    AND COLUMN_NAME = 'rejection_reason'
);

SET @sql = IF(@col5_exists > 0,
    'ALTER TABLE book_requests DROP COLUMN rejection_reason',
    'SELECT "Column rejection_reason does not exist - skipping" AS Status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '✓ Rollback complete - marketplace books no longer have admin verification' AS Status;

-- ===================================================================
-- PART 2: APPLY CORRECT BRANCH BOOK REQUEST WORKFLOW
-- ===================================================================

SELECT '' AS '';
SELECT '========================================' AS '';
SELECT 'PART 2: Creating branch book request workflow...' AS '';
SELECT '========================================' AS '';

-- Create branch_book_requests table
CREATE TABLE IF NOT EXISTS branch_book_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL COMMENT 'Reference to branch library book',
  student_id INT NOT NULL COMMENT 'Student requesting the book',
  requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending'
    COMMENT 'pending=awaiting admin, approved=admin approved, rejected=admin rejected, completed=book handed over',

  -- Admin approval tracking
  approved_by_admin INT NULL COMMENT 'Admin who approved/rejected the request',
  approved_at DATETIME NULL COMMENT 'When admin approved/rejected',
  rejection_reason TEXT NULL COMMENT 'Reason if admin rejected the request',

  -- Handover confirmation tracking
  confirmed_handed_over BOOLEAN DEFAULT FALSE COMMENT 'TRUE when admin confirms student received book',
  confirmed_by_admin INT NULL COMMENT 'Admin who confirmed handover',
  confirmed_at DATETIME NULL COMMENT 'When admin confirmed handover',

  -- Foreign keys
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by_admin) REFERENCES admins(id) ON DELETE SET NULL,
  FOREIGN KEY (confirmed_by_admin) REFERENCES admins(id) ON DELETE SET NULL,

  -- Indexes for performance
  INDEX idx_book_id (book_id),
  INDEX idx_student_id (student_id),
  INDEX idx_status (status),
  INDEX idx_requested_at (requested_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracks branch book requests with admin approval workflow';

SELECT '✓ Created branch_book_requests table' AS Status;

-- Add book_format columns to books table if they don't exist
SET @col_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'library'
    AND TABLE_NAME = 'books'
    AND COLUMN_NAME = 'book_format'
);

SET @sql = IF(@col_exists = 0,
    "ALTER TABLE books ADD COLUMN book_format ENUM('hard_copy', 'soft_copy') DEFAULT 'hard_copy' COMMENT 'Format of the book'",
    'SELECT "Column book_format already exists - skipping" AS Status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'library'
    AND TABLE_NAME = 'books'
    AND COLUMN_NAME = 'file_path'
);

SET @sql = IF(@col_exists = 0,
    "ALTER TABLE books ADD COLUMN file_path VARCHAR(500) NULL COMMENT 'File path for soft copy books'",
    'SELECT "Column file_path already exists - skipping" AS Status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'library'
    AND TABLE_NAME = 'books'
    AND COLUMN_NAME = 'type'
);

SET @sql = IF(@col_exists = 0,
    "ALTER TABLE books ADD COLUMN type VARCHAR(100) NULL COMMENT 'Book type/category'",
    'SELECT "Column type already exists - skipping" AS Status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '✓ Added book_format columns to books table' AS Status;

-- Create view for admin pending branch book requests
CREATE OR REPLACE VIEW admin_pending_branch_requests AS
SELECT
  br.id AS request_id,
  br.book_id,
  br.student_id,
  br.requested_at,
  br.status,
  br.approved_by_admin,
  br.approved_at,
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
WHERE br.status IN ('pending', 'approved')
ORDER BY br.requested_at ASC;

SELECT '✓ Created admin_pending_branch_requests view' AS Status;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS after_branch_book_handover;

-- Create trigger
DELIMITER $$

CREATE TRIGGER after_branch_book_handover
AFTER UPDATE ON branch_book_requests
FOR EACH ROW
BEGIN
  -- When admin confirms handover, update book status to borrowed
  -- and create entry in borrowed_books table
  IF NEW.confirmed_handed_over = TRUE AND OLD.confirmed_handed_over = FALSE THEN
    -- Update book status to borrowed
    UPDATE books
    SET status = 'borrowed'
    WHERE id = NEW.book_id;

    -- Create borrowed_books entry
    INSERT INTO borrowed_books (
      book_id,
      user_id,
      borrow_date,
      expiry_date,
      return_status,
      status
    ) VALUES (
      NEW.book_id,
      NEW.student_id,
      NOW(),
      DATE_ADD(NOW(), INTERVAL 14 DAY),
      'active',
      'borrowed'
    );

    -- Update request status to completed
    UPDATE branch_book_requests
    SET status = 'completed'
    WHERE id = NEW.id;
  END IF;
END$$

DELIMITER ;

SELECT '✓ Created trigger for branch book handover' AS Status;

SET FOREIGN_KEY_CHECKS=1;

-- ===================================================================
-- VERIFICATION
-- ===================================================================

SELECT '' AS '';
SELECT '========================================' AS '';
SELECT 'VERIFICATION' AS '';
SELECT '========================================' AS '';

-- Verify book_requests has NO admin columns
SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '✓ SUCCESS: book_requests (marketplace) has NO admin columns'
        ELSE '✗ ERROR: book_requests still has admin columns!'
    END AS 'Marketplace Books Check'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'library'
  AND TABLE_NAME = 'book_requests'
  AND COLUMN_NAME IN ('admin_status', 'approved_by_admin');

-- Verify branch_book_requests exists and has admin columns
SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✓ SUCCESS: branch_book_requests table exists'
        ELSE '✗ ERROR: branch_book_requests table not found!'
    END AS 'Branch Books Check'
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'library'
  AND TABLE_NAME = 'branch_book_requests';

-- Show final table list
SELECT '' AS '';
SELECT 'Request Tables:' AS '';
SELECT TABLE_NAME, TABLE_COMMENT
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'library'
  AND TABLE_NAME LIKE '%request%'
ORDER BY TABLE_NAME;

SELECT '' AS '';
SELECT '========================================' AS '';
SELECT '✓ DATABASE FIX COMPLETE!' AS '';
SELECT '========================================' AS '';
SELECT '' AS '';
SELECT 'Summary:' AS '';
SELECT '- Marketplace books (book_requests): NO admin involvement' AS '';
SELECT '- Branch books (branch_book_requests): REQUIRES admin approval' AS '';
SELECT '========================================' AS '';
