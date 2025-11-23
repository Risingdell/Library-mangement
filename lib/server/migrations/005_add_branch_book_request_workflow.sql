-- ===================================================================
-- Migration: Branch Book Request Workflow with Admin Approval
-- Description: Adds admin approval workflow for branch book requests
--              (NOT for marketplace books - those use queue system only)
-- ===================================================================

-- ===================================================================
-- IMPORTANT: Marketplace vs Branch Books
-- ===================================================================
-- MARKETPLACE BOOKS (used_books_marketplace + book_requests):
--   - Student-to-student sales
--   - NO admin involvement
--   - Uses queue system (first-come-first-serve)
--   - Already implemented in marketplace_request_queue.sql
--
-- BRANCH BOOKS (books table):
--   - Library-owned books
--   - REQUIRES admin approval
--   - Admin confirms physical handover
--   - THIS migration handles branch books only
-- ===================================================================

USE library;

-- Step 1: Create branch_book_requests table for branch book requests
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

-- Step 2: Add book_format column to books table if it doesn't exist
-- This helps distinguish between hard copy and soft copy branch books
ALTER TABLE books
  ADD COLUMN IF NOT EXISTS book_format ENUM('hard_copy', 'soft_copy') DEFAULT 'hard_copy'
    COMMENT 'Format of the book',
  ADD COLUMN IF NOT EXISTS file_path VARCHAR(500) NULL
    COMMENT 'File path for soft copy books',
  ADD COLUMN IF NOT EXISTS type VARCHAR(100) NULL
    COMMENT 'Book type/category';

-- Step 3: Create view for admin pending branch book requests
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

-- Step 4: Create trigger to update book status when request is approved and handed over
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
      DATE_ADD(NOW(), INTERVAL 14 DAY), -- Default 14 day borrow period
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

-- ===================================================================
-- Migration Complete
-- ===================================================================
-- Summary:
-- - Created branch_book_requests table for branch book requests
-- - Added admin approval and handover confirmation workflow
-- - Created admin_pending_branch_requests view
-- - Added trigger to automatically create borrowed_books entry on handover
-- - Marketplace books (book_requests) remain UNCHANGED - no admin involvement
-- ===================================================================
