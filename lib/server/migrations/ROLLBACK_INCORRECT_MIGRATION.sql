-- ===================================================================
-- Rollback Script for Incorrect Admin Verification Migration
-- ===================================================================
-- Use this script ONLY if 005_add_admin_verified_purchase_workflow.sql
-- was already applied to your database
-- ===================================================================

USE library;

-- Display current state
SELECT 'Checking if incorrect migration was applied...' AS Status;

-- Check if admin_status column exists in book_requests
SELECT
    COLUMN_NAME,
    COLUMN_TYPE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'library'
  AND TABLE_NAME = 'book_requests'
  AND COLUMN_NAME IN ('admin_status', 'approved_by_admin');

-- ===================================================================
-- ROLLBACK STEPS
-- ===================================================================

-- Step 1: Drop foreign key constraint
SELECT 'Step 1: Removing foreign key constraint...' AS Status;
ALTER TABLE book_requests DROP FOREIGN KEY IF EXISTS fk_approved_by_admin;

-- Step 2: Drop admin-related indexes
SELECT 'Step 2: Removing admin-related indexes...' AS Status;
ALTER TABLE book_requests DROP INDEX IF EXISTS idx_admin_status;
ALTER TABLE book_requests DROP INDEX IF EXISTS idx_approved_by_admin;

-- Step 3: Remove admin verification columns from book_requests
SELECT 'Step 3: Removing admin columns from book_requests table...' AS Status;
ALTER TABLE book_requests
  DROP COLUMN IF EXISTS admin_status,
  DROP COLUMN IF EXISTS approved_by_admin,
  DROP COLUMN IF EXISTS approved_at,
  DROP COLUMN IF EXISTS confirmed_received_at,
  DROP COLUMN IF EXISTS rejection_reason;

-- Step 4: Drop incorrect purchased_books table
SELECT 'Step 4: Dropping purchased_books table...' AS Status;
DROP TABLE IF EXISTS purchased_books;

-- Step 5: Drop incorrect admin view
SELECT 'Step 5: Dropping admin_pending_purchases view...' AS Status;
DROP VIEW IF EXISTS admin_pending_purchases;

-- ===================================================================
-- VERIFICATION
-- ===================================================================

SELECT 'Rollback complete! Verifying...' AS Status;

-- Verify admin columns are removed from book_requests
SELECT
    CASE
        WHEN COUNT(*) = 0 THEN 'SUCCESS: No admin columns in book_requests'
        ELSE 'ERROR: Admin columns still exist in book_requests'
    END AS VerificationResult
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'library'
  AND TABLE_NAME = 'book_requests'
  AND COLUMN_NAME IN ('admin_status', 'approved_by_admin', 'approved_at', 'confirmed_received_at', 'rejection_reason');

-- Show remaining columns in book_requests
SELECT 'Current book_requests table structure:' AS Status;
DESCRIBE book_requests;

-- ===================================================================
-- NEXT STEPS
-- ===================================================================
-- After running this rollback, apply the correct migration:
-- SOURCE C:/xampp/htdocs/Lib/Lib/lib/server/migrations/005_add_branch_book_request_workflow.sql;
-- ===================================================================
