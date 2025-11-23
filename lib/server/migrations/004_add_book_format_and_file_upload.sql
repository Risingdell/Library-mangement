-- ===================================================================
-- Migration: Add Book Format (Soft Copy / Hard Copy) and File Upload Support
-- Description: Adds support for digital books (soft copies) with file upload
--              and distinguishes them from physical books (hard copies)
-- ===================================================================

-- Step 1: Add book_format and file_path columns to used_books_marketplace
ALTER TABLE used_books_marketplace
  ADD COLUMN book_format ENUM('hard_copy', 'soft_copy') DEFAULT 'hard_copy' COMMENT 'Book format: hard_copy (physical) or soft_copy (digital)',
  ADD COLUMN file_path VARCHAR(500) NULL COMMENT 'Path to uploaded digital file for soft copies',
  ADD COLUMN file_original_name VARCHAR(255) NULL COMMENT 'Original filename of uploaded file',
  ADD COLUMN file_size INT NULL COMMENT 'File size in bytes',
  ADD COLUMN uploaded_by ENUM('user', 'admin') DEFAULT 'user' COMMENT 'Who uploaded this book',
  ADD COLUMN download_count INT DEFAULT 0 COMMENT 'Number of times soft copy has been downloaded';

-- Step 2: Add index for performance
ALTER TABLE used_books_marketplace
  ADD INDEX idx_book_format (book_format),
  ADD INDEX idx_uploaded_by (uploaded_by);

-- Step 3: Update existing records to be hard_copy by default
UPDATE used_books_marketplace
SET book_format = 'hard_copy'
WHERE book_format IS NULL;

-- ===================================================================
-- Migration Complete
-- ===================================================================
-- Summary:
-- - Added book_format column to distinguish between physical and digital books
-- - Added file_path and related columns for soft copy file storage
-- - Added uploaded_by to track admin vs user uploads
-- - Added download_count for analytics
-- ===================================================================
