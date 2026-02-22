-- ============================================================
-- TEST DATA: branch_book_requests
-- ============================================================
-- Purpose: Covers all status scenarios for testing the full
--          admin approval + handover workflow
--
-- Existing approved students:
--   id=8   | dan       | USN: 014
--   id=26  | Dhanush   | USN: 4SN23AD014
--   id=28  | Akshay    | USN: 4SN23AD004
--   id=54  | dani      | USN: 4SN23AD001
--   id=56  | Dhruva    | USN: 4SN23AD036
--   id=58  | chammu    | USN: 4SN23AD055
--
-- Existing admin:
--   id=1   | admin
--   id=5   | admin
--
-- Books used: ids 1-10 (already in db)
-- ============================================================

-- Clear existing test requests (optional - comment out if you want to keep id=3)
-- DELETE FROM `branch_book_requests` WHERE id != 3;

-- ============================================================
-- SCENARIO 1: PENDING requests (admin has not acted yet)
-- These will show up in "Book Purchase Requests" tab
-- with Approve / Reject buttons
-- ============================================================

INSERT INTO `branch_book_requests`
  (`book_id`, `student_id`, `requested_at`, `status`, `approved_by_admin`, `approved_at`, `rejection_reason`, `confirmed_handed_over`, `confirmed_by_admin`, `confirmed_at`)
VALUES
  -- Student Dhanush requests "TURNING POINT" (book id=2)
  (2, 26, '2026-02-20 09:00:00', 'pending', NULL, NULL, NULL, 0, NULL, NULL),

  -- Student Akshay requests "A MODERN APPROACH TO VERBAL REASONING" (book id=17)
  (17, 28, '2026-02-20 10:30:00', 'pending', NULL, NULL, NULL, 0, NULL, NULL),

  -- Student Dhruva requests "A FAST TRACK COURSE IN MENTAL ABILITY" (book id=7)
  (7, 56, '2026-02-21 08:15:00', 'pending', NULL, NULL, NULL, 0, NULL, NULL),

  -- Student dani requests "ACE QUANT" (book id=22)
  (22, 54, '2026-02-21 14:00:00', 'pending', NULL, NULL, NULL, 0, NULL, NULL);

-- ============================================================
-- SCENARIO 2: APPROVED requests (not yet handed over)
-- These will show "📦 Confirm Handover" button in the UI
-- Also appear in "Confirm Handover" tab
-- ============================================================

INSERT INTO `branch_book_requests`
  (`book_id`, `student_id`, `requested_at`, `status`, `approved_by_admin`, `approved_at`, `rejection_reason`, `confirmed_handed_over`, `confirmed_by_admin`, `confirmed_at`)
VALUES
  -- Student chammu requests "CODING AND DECODING" (book id=1) - APPROVED, not handed
  (1, 58, '2026-02-18 09:00:00', 'approved', 1, '2026-02-18 11:00:00', NULL, 0, NULL, NULL),

  -- Student dan requests "A HANDBOOK ON CIVIL ENGINEERING" (book id=8) - APPROVED, not handed
  (8, 8, '2026-02-17 10:00:00', 'approved', 5, '2026-02-17 15:00:00', NULL, 0, NULL, NULL),

  -- Student Dhanush requests "A MODEERN APPROACH TO LOGICAL REASONING" (book id=10) - APPROVED
  (10, 26, '2026-02-16 08:30:00', 'approved', 1, '2026-02-16 12:00:00', NULL, 0, NULL, NULL);

-- ============================================================
-- SCENARIO 3: REJECTED requests
-- These will NOT appear in admin pending/approved lists
-- Student sees them with rejected status + reason
-- ============================================================

INSERT INTO `branch_book_requests`
  (`book_id`, `student_id`, `requested_at`, `status`, `approved_by_admin`, `approved_at`, `rejection_reason`, `confirmed_handed_over`, `confirmed_by_admin`, `confirmed_at`)
VALUES
  -- Student Akshay's earlier request was REJECTED
  (3, 28, '2026-02-15 09:00:00', 'rejected', 5, '2026-02-15 11:00:00', 'Book is currently reserved for another student', 0, NULL, NULL),

  -- Student Dhruva's request was REJECTED
  (5, 56, '2026-02-14 10:00:00', 'rejected', 1, '2026-02-14 14:00:00', 'Book not available in this branch - please check again next week', 0, NULL, NULL);

-- ============================================================
-- SCENARIO 4: CONFIRMED HANDED OVER (completed workflow)
-- Confirmed_handed_over = 1, admin confirmed delivery
-- These will show "✅ Handed Over" badge
-- ============================================================

INSERT INTO `branch_book_requests`
  (`book_id`, `student_id`, `requested_at`, `status`, `approved_by_admin`, `approved_at`, `rejection_reason`, `confirmed_handed_over`, `confirmed_by_admin`, `confirmed_at`)
VALUES
  -- Student dani got "ADVANCED ENGLISH GRAMMAR" (book id=23) - FULLY COMPLETED
  (23, 54, '2026-02-10 09:00:00', 'approved', 1, '2026-02-10 12:00:00', NULL, 1, 5, '2026-02-11 10:00:00'),

  -- Student chammu got "ALL-IN-ONE SUNSTAR" (book id=24) - FULLY COMPLETED
  (24, 58, '2026-02-08 09:00:00', 'approved', 5, '2026-02-08 14:00:00', NULL, 1, 1, '2026-02-09 11:00:00');

-- ============================================================
-- VERIFICATION QUERIES (run these to check inserted data)
-- ============================================================

-- Check all requests grouped by status:
-- SELECT status, COUNT(*) as count FROM branch_book_requests GROUP BY status;

-- Check pending (admin should see these first):
-- SELECT br.id, b.title, u.username, br.status, br.requested_at
-- FROM branch_book_requests br
-- JOIN books b ON br.book_id = b.id
-- JOIN users u ON br.student_id = u.id
-- WHERE br.status = 'pending'
-- ORDER BY br.requested_at ASC;

-- Check approved not handed over (confirm handover tab):
-- SELECT br.id, b.title, u.username, br.approved_at
-- FROM branch_book_requests br
-- JOIN books b ON br.book_id = b.id
-- JOIN users u ON br.student_id = u.id
-- WHERE br.status = 'approved' AND br.confirmed_handed_over = 0;
