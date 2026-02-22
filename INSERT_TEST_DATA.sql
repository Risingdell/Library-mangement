-- ============================================================
-- TEST DATA - Safe version using username lookups
-- No FK errors - skips if user doesn't exist
-- Database: biuezvkp1ir5odbq6wju
-- ============================================================

-- STEP 1: Check which students exist (run this first to verify)
-- SELECT id, username, usn, approval_status FROM users WHERE approval_status = 'approved';

-- ============================================================
-- PENDING requests (Approve/Reject buttons in admin)
-- ============================================================

INSERT INTO `branch_book_requests` (`book_id`, `student_id`, `requested_at`, `status`, `approved_by_admin`, `approved_at`, `rejection_reason`, `confirmed_handed_over`, `confirmed_by_admin`, `confirmed_at`)
SELECT 2, u.id, '2026-02-20 09:00:00', 'pending', NULL, NULL, NULL, 0, NULL, NULL
FROM users u WHERE u.username = 'dha2032k' AND u.approval_status = 'approved' LIMIT 1;

INSERT INTO `branch_book_requests` (`book_id`, `student_id`, `requested_at`, `status`, `approved_by_admin`, `approved_at`, `rejection_reason`, `confirmed_handed_over`, `confirmed_by_admin`, `confirmed_at`)
SELECT 17, u.id, '2026-02-20 10:30:00', 'pending', NULL, NULL, NULL, 0, NULL, NULL
FROM users u WHERE u.username = 'akshay_gowda' AND u.approval_status = 'approved' LIMIT 1;

INSERT INTO `branch_book_requests` (`book_id`, `student_id`, `requested_at`, `status`, `approved_by_admin`, `approved_at`, `rejection_reason`, `confirmed_handed_over`, `confirmed_by_admin`, `confirmed_at`)
SELECT 7, u.id, '2026-02-21 08:15:00', 'pending', NULL, NULL, NULL, 0, NULL, NULL
FROM users u WHERE u.username = 'dk' AND u.approval_status = 'approved' LIMIT 1;

INSERT INTO `branch_book_requests` (`book_id`, `student_id`, `requested_at`, `status`, `approved_by_admin`, `approved_at`, `rejection_reason`, `confirmed_handed_over`, `confirmed_by_admin`, `confirmed_at`)
SELECT 22, u.id, '2026-02-21 14:00:00', 'pending', NULL, NULL, NULL, 0, NULL, NULL
FROM users u WHERE u.username = 'dani' AND u.approval_status = 'approved' LIMIT 1;

INSERT INTO `branch_book_requests` (`book_id`, `student_id`, `requested_at`, `status`, `approved_by_admin`, `approved_at`, `rejection_reason`, `confirmed_handed_over`, `confirmed_by_admin`, `confirmed_at`)
SELECT 9, u.id, '2026-02-22 07:00:00', 'pending', NULL, NULL, NULL, 0, NULL, NULL
FROM users u WHERE u.username = 'dan' AND u.approval_status = 'approved' LIMIT 1;

INSERT INTO `branch_book_requests` (`book_id`, `student_id`, `requested_at`, `status`, `approved_by_admin`, `approved_at`, `rejection_reason`, `confirmed_handed_over`, `confirmed_by_admin`, `confirmed_at`)
SELECT 15, u.id, '2026-02-22 09:30:00', 'pending', NULL, NULL, NULL, 0, NULL, NULL
FROM users u WHERE u.username = 'chammu' AND u.approval_status = 'approved' LIMIT 1;

-- ============================================================
-- APPROVED but not handed over (Confirm Handover button)
-- ============================================================

INSERT INTO `branch_book_requests` (`book_id`, `student_id`, `requested_at`, `status`, `approved_by_admin`, `approved_at`, `rejection_reason`, `confirmed_handed_over`, `confirmed_by_admin`, `confirmed_at`)
SELECT 1, u.id, '2026-02-18 09:00:00', 'approved', a.id, '2026-02-18 11:00:00', NULL, 0, NULL, NULL
FROM users u, admins a WHERE u.username = 'chammu' AND u.approval_status = 'approved' AND a.id = 1 LIMIT 1;

INSERT INTO `branch_book_requests` (`book_id`, `student_id`, `requested_at`, `status`, `approved_by_admin`, `approved_at`, `rejection_reason`, `confirmed_handed_over`, `confirmed_by_admin`, `confirmed_at`)
SELECT 8, u.id, '2026-02-17 10:00:00', 'approved', a.id, '2026-02-17 15:00:00', NULL, 0, NULL, NULL
FROM users u, admins a WHERE u.username = 'dan' AND u.approval_status = 'approved' AND a.id = 1 LIMIT 1;

INSERT INTO `branch_book_requests` (`book_id`, `student_id`, `requested_at`, `status`, `approved_by_admin`, `approved_at`, `rejection_reason`, `confirmed_handed_over`, `confirmed_by_admin`, `confirmed_at`)
SELECT 10, u.id, '2026-02-16 08:30:00', 'approved', a.id, '2026-02-16 12:00:00', NULL, 0, NULL, NULL
FROM users u, admins a WHERE u.username = 'dha2032k' AND u.approval_status = 'approved' AND a.id = 1 LIMIT 1;

INSERT INTO `branch_book_requests` (`book_id`, `student_id`, `requested_at`, `status`, `approved_by_admin`, `approved_at`, `rejection_reason`, `confirmed_handed_over`, `confirmed_by_admin`, `confirmed_at`)
SELECT 11, u.id, '2026-02-15 11:00:00', 'approved', a.id, '2026-02-15 14:00:00', NULL, 0, NULL, NULL
FROM users u, admins a WHERE u.username = 'dani' AND u.approval_status = 'approved' AND a.id = 1 LIMIT 1;

-- ============================================================
-- REJECTED requests (student sees rejection reason)
-- ============================================================

INSERT INTO `branch_book_requests` (`book_id`, `student_id`, `requested_at`, `status`, `approved_by_admin`, `approved_at`, `rejection_reason`, `confirmed_handed_over`, `confirmed_by_admin`, `confirmed_at`)
SELECT 3, u.id, '2026-02-15 09:00:00', 'rejected', a.id, '2026-02-15 11:00:00', 'Book is currently reserved for another student', 0, NULL, NULL
FROM users u, admins a WHERE u.username = 'akshay_gowda' AND u.approval_status = 'approved' AND a.id = 1 LIMIT 1;

INSERT INTO `branch_book_requests` (`book_id`, `student_id`, `requested_at`, `status`, `approved_by_admin`, `approved_at`, `rejection_reason`, `confirmed_handed_over`, `confirmed_by_admin`, `confirmed_at`)
SELECT 5, u.id, '2026-02-14 10:00:00', 'rejected', a.id, '2026-02-14 14:00:00', 'Book not available in this branch - please check again next week', 0, NULL, NULL
FROM users u, admins a WHERE u.username = 'dk' AND u.approval_status = 'approved' AND a.id = 1 LIMIT 1;

-- ============================================================
-- FULLY COMPLETED - handed over
-- ============================================================

INSERT INTO `branch_book_requests` (`book_id`, `student_id`, `requested_at`, `status`, `approved_by_admin`, `approved_at`, `rejection_reason`, `confirmed_handed_over`, `confirmed_by_admin`, `confirmed_at`)
SELECT 23, u.id, '2026-02-10 09:00:00', 'approved', a.id, '2026-02-10 12:00:00', NULL, 1, a.id, '2026-02-11 10:00:00'
FROM users u, admins a WHERE u.username = 'dani' AND u.approval_status = 'approved' AND a.id = 1 LIMIT 1;

INSERT INTO `branch_book_requests` (`book_id`, `student_id`, `requested_at`, `status`, `approved_by_admin`, `approved_at`, `rejection_reason`, `confirmed_handed_over`, `confirmed_by_admin`, `confirmed_at`)
SELECT 24, u.id, '2026-02-08 09:00:00', 'approved', a.id, '2026-02-08 14:00:00', NULL, 1, a.id, '2026-02-09 11:00:00'
FROM users u, admins a WHERE u.username = 'chammu' AND u.approval_status = 'approved' AND a.id = 1 LIMIT 1;

-- ============================================================
-- VERIFY: what was inserted
-- ============================================================
SELECT
  br.id,
  b.title AS book,
  u.username AS student,
  br.status,
  br.confirmed_handed_over AS handed_over,
  br.requested_at
FROM branch_book_requests br
JOIN books b ON br.book_id = b.id
JOIN users u ON br.student_id = u.id
ORDER BY br.status, br.requested_at DESC;
