-- ===================================================================
-- Migration: Admin-Verified Book Purchase Workflow
-- Description: Adds admin approval and confirmation for marketplace book purchases
--              to ensure proper tracking of physical book handover
-- ===================================================================

-- Step 1: Add new columns to book_requests for admin verification
ALTER TABLE book_requests
  ADD COLUMN admin_status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending'
    COMMENT 'Admin approval status for purchase',
  ADD COLUMN approved_by_admin INT NULL
    COMMENT 'Admin who approved the request',
  ADD COLUMN approved_at DATETIME NULL
    COMMENT 'When admin approved the request',
  ADD COLUMN confirmed_received_at DATETIME NULL
    COMMENT 'When admin confirmed student received the book',
  ADD COLUMN rejection_reason TEXT NULL
    COMMENT 'Reason if admin rejected the request',
  ADD CONSTRAINT fk_approved_by_admin FOREIGN KEY (approved_by_admin) REFERENCES admins(id) ON DELETE SET NULL;

-- Step 2: Create purchased_books table for tracking assigned books
CREATE TABLE IF NOT EXISTS purchased_books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL COMMENT 'Reference to marketplace book',
  student_id INT NOT NULL COMMENT 'Student who purchased the book',
  seller_id INT NOT NULL COMMENT 'Original seller',
  request_id INT NOT NULL COMMENT 'Reference to book_request',
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  type VARCHAR(100),
  description TEXT,
  book_format ENUM('hard_copy', 'soft_copy') DEFAULT 'hard_copy',
  file_path VARCHAR(500) NULL COMMENT 'For soft copies',
  purchase_price DECIMAL(10,2) NULL COMMENT 'Optional: if you want to track price',
  requested_at DATETIME NOT NULL,
  confirmed_received_at DATETIME NOT NULL,
  confirmed_by_admin INT NOT NULL COMMENT 'Admin who confirmed handover',

  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (request_id) REFERENCES book_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (confirmed_by_admin) REFERENCES admins(id) ON DELETE RESTRICT,

  INDEX idx_student_id (student_id),
  INDEX idx_seller_id (seller_id),
  INDEX idx_confirmed_at (confirmed_received_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracks books purchased and assigned to students after admin verification';

-- Step 3: Add indexes for performance
ALTER TABLE book_requests
  ADD INDEX idx_admin_status (admin_status),
  ADD INDEX idx_approved_by_admin (approved_by_admin);

-- Step 4: Update existing active requests to 'pending' admin status
UPDATE book_requests
SET admin_status = 'pending'
WHERE status = 'active' AND admin_status IS NULL;

-- Step 5: Create a view for admin to see pending purchase requests
CREATE OR REPLACE VIEW admin_pending_purchases AS
SELECT
  br.id AS request_id,
  br.marketplace_book_id,
  br.requester_id,
  br.requested_at,
  br.is_priority_buyer,
  br.admin_status,
  m.title,
  m.author,
  m.type,
  m.book_format,
  m.description,
  m.contact AS seller_contact,
  u_requester.username AS student_username,
  u_requester.firstName AS student_first_name,
  u_requester.lastName AS student_last_name,
  u_requester.email AS student_email,
  u_requester.usn AS student_usn,
  u_seller.username AS seller_username,
  u_seller.firstName AS seller_first_name,
  u_seller.lastName AS seller_last_name
FROM book_requests br
JOIN used_books_marketplace m ON br.marketplace_book_id = m.id
JOIN users u_requester ON br.requester_id = u_requester.id
JOIN users u_seller ON m.seller_id = u_seller.id
WHERE br.status = 'active'
  AND br.admin_status IN ('pending', 'approved')
  AND m.book_format = 'hard_copy'
ORDER BY br.requested_at ASC;

-- ===================================================================
-- Migration Complete
-- ===================================================================
-- Summary:
-- - Added admin_status to book_requests for approval tracking
-- - Created purchased_books table for tracking assigned books
-- - Added admin foreign key for verification tracking
-- - Created admin_pending_purchases view for easy querying
-- - All physical book purchases now require admin confirmation
-- ===================================================================
