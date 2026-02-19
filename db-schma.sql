-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: bfjxqdkabitgzq9zhbfo-mysql.services.clever-cloud.com:3306
-- Generation Time: Feb 16, 2026 at 06:16 PM
-- Server version: 8.0.22-13
-- PHP Version: 8.2.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bfjxqdkabitgzq9zhbfo`
--
CREATE DATABASE IF NOT EXISTS `bfjxqdkabitgzq9zhbfo` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `bfjxqdkabitgzq9zhbfo`;

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `username` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `name`, `username`, `password`) VALUES
(5, 'Admin', 'admin', 'admin123');

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

CREATE TABLE `books` (
  `id` int NOT NULL,
  `sl_no` int NOT NULL,
  `acc_no` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `author` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `donated_by` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `date` date DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`id`, `sl_no`, `acc_no`, `title`, `author`, `donated_by`, `date`, `status`) VALUES
(4, 1, 1001, 'Introduction to Algorithms', 'Thomas H. Cormen', 'College Library', '2024-01-01', 'available'),
(5, 2, 1002, 'Clean Code', 'Robert C. Martin', 'College Library', '2024-01-01', 'available'),
(6, 3, 1003, 'Design Patterns', 'Gang of Four', 'College Library', '2024-01-01', 'available');

-- --------------------------------------------------------

--
-- Table structure for table `book_requests`
--

CREATE TABLE `book_requests` (
  `id` int NOT NULL,
  `marketplace_book_id` int NOT NULL,
  `requester_id` int NOT NULL,
  `requested_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('active','cancelled','completed') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `is_priority_buyer` tinyint(1) DEFAULT '0' COMMENT 'TRUE if this is the current active/first buyer in queue',
  `cancelled_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tracks all buyer requests for marketplace books with queue management';

-- --------------------------------------------------------

--
-- Table structure for table `borrowed_books`
--

CREATE TABLE `borrowed_books` (
  `id` int NOT NULL,
  `book_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `borrow_date` date NOT NULL,
  `expiry_date` date NOT NULL,
  `returned_at` datetime DEFAULT NULL,
  `return_status` enum('active','pending_return','approved','rejected') COLLATE utf8mb4_general_ci DEFAULT 'active' COMMENT 'active=borrowed, pending_return=waiting approval, approved=return approved, rejected=return rejected',
  `approved_by` int DEFAULT NULL COMMENT 'Admin who approved/rejected the return',
  `approved_at` datetime DEFAULT NULL COMMENT 'Timestamp when return was approved/rejected',
  `rejection_reason` text COLLATE utf8mb4_general_ci COMMENT 'Reason if return was rejected',
  `status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'borrowed'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `selling_books`
--

CREATE TABLE `selling_books` (
  `id` int NOT NULL,
  `acc_no` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `author` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `type` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `contact` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `seller_id` int DEFAULT NULL,
  `buyer_id` int DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `used_books_marketplace`
--

CREATE TABLE `used_books_marketplace` (
  `id` int NOT NULL,
  `acc_no` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `author` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `type` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `contact` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `seller_id` int DEFAULT NULL,
  `requested_by` int DEFAULT NULL,
  `buyer_id` int DEFAULT NULL,
  `status` enum('available','requested','sold','completed') COLLATE utf8mb4_general_ci DEFAULT 'available',
  `requested_at` datetime DEFAULT NULL COMMENT 'When first request was made (priority buyer timestamp)',
  `received_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `active_requester_id` int DEFAULT NULL COMMENT 'Current priority buyer (first in queue)',
  `sold_at` datetime DEFAULT NULL COMMENT 'When seller marked as sold',
  `completed_at` datetime DEFAULT NULL COMMENT 'When transaction fully completed (both sold and received)',
  `total_requests` int DEFAULT '0' COMMENT 'Count of active requests',
  `book_format` enum('hard_copy','soft_copy') COLLATE utf8mb4_general_ci DEFAULT 'hard_copy' COMMENT 'Book format: hard_copy (physical) or soft_copy (digital)',
  `file_path` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Path to uploaded digital file for soft copies',
  `file_original_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Original filename of uploaded file',
  `file_size` int DEFAULT NULL COMMENT 'File size in bytes',
  `uploaded_by` enum('user','admin') COLLATE utf8mb4_general_ci DEFAULT 'user' COMMENT 'Who uploaded this book',
  `download_count` int DEFAULT '0' COMMENT 'Number of times soft copy has been downloaded'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `firstName` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `lastName` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `usn` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `profile_image` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'URL or path to user profile image'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `book_requests`
--
ALTER TABLE `book_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_marketplace_book` (`marketplace_book_id`),
  ADD KEY `idx_requester` (`requester_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_priority` (`is_priority_buyer`),
  ADD KEY `idx_requested_at` (`requested_at`);

--
-- Indexes for table `borrowed_books`
--
ALTER TABLE `borrowed_books`
  ADD PRIMARY KEY (`id`),
  ADD KEY `book_id` (`book_id`),
  ADD KEY `fk_borrowed_books_approved_by` (`approved_by`),
  ADD KEY `idx_return_status` (`return_status`),
  ADD KEY `idx_user_status` (`user_id`,`return_status`);

--
-- Indexes for table `selling_books`
--
ALTER TABLE `selling_books`
  ADD PRIMARY KEY (`id`),
  ADD KEY `seller_id` (`seller_id`),
  ADD KEY `buyer_id` (`buyer_id`);

--
-- Indexes for table `used_books_marketplace`
--
ALTER TABLE `used_books_marketplace`
  ADD PRIMARY KEY (`id`),
  ADD KEY `seller_id` (`seller_id`),
  ADD KEY `requested_by` (`requested_by`),
  ADD KEY `buyer_id` (`buyer_id`),
  ADD KEY `idx_active_requester` (`active_requester_id`),
  ADD KEY `idx_status_enhanced` (`status`),
  ADD KEY `idx_book_format` (`book_format`),
  ADD KEY `idx_uploaded_by` (`uploaded_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `usn` (`usn`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `book_requests`
--
ALTER TABLE `book_requests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `borrowed_books`
--
ALTER TABLE `borrowed_books`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `selling_books`
--
ALTER TABLE `selling_books`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `used_books_marketplace`
--
ALTER TABLE `used_books_marketplace`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `book_requests`
--
ALTER TABLE `book_requests`
  ADD CONSTRAINT `book_requests_ibfk_1` FOREIGN KEY (`marketplace_book_id`) REFERENCES `used_books_marketplace` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `book_requests_ibfk_2` FOREIGN KEY (`requester_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `borrowed_books`
--
ALTER TABLE `borrowed_books`
  ADD CONSTRAINT `borrowed_books_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `borrowed_books_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_borrowed_books_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `selling_books`
--
ALTER TABLE `selling_books`
  ADD CONSTRAINT `selling_books_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `selling_books_ibfk_2` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `used_books_marketplace`
--
ALTER TABLE `used_books_marketplace`
  ADD CONSTRAINT `fk_active_requester` FOREIGN KEY (`active_requester_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `used_books_marketplace_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `used_books_marketplace_ibfk_2` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `used_books_marketplace_ibfk_3` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
