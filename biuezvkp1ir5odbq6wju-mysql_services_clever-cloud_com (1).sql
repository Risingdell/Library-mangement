-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: biuezvkp1ir5odbq6wju-mysql.services.clever-cloud.com:3306
-- Generation Time: Feb 20, 2026 at 06:12 PM
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
-- Database: `biuezvkp1ir5odbq6wju`
--
CREATE DATABASE IF NOT EXISTS `biuezvkp1ir5odbq6wju` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `biuezvkp1ir5odbq6wju`;

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `username` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'bcrypt hashed password (new system)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `name`, `username`, `password`, `password_hash`) VALUES
(1, 'Administrator', 'admin', 'Admin@123', '$2b$10$b/oPvixjlWzt/yqYI.vA3.BupIjzGfTIFgd24HWaixJ/la/0ENUJK'),
(5, 'Admin', 'admin', 'admin123', '$2b$10$b/oPvixjlWzt/yqYI.vA3.BupIjzGfTIFgd24HWaixJ/la/0ENUJK');

-- --------------------------------------------------------

--
-- Stand-in structure for view `admin_pending_branch_requests`
-- (See below for the actual view)
--
CREATE TABLE `admin_pending_branch_requests` (
`acc_no` int
,`approved_at` datetime
,`approved_by_admin` int
,`author` varchar(255)
,`book_format` enum('hard_copy','soft_copy')
,`book_id` int
,`book_status` varchar(50)
,`confirmed_handed_over` tinyint(1)
,`request_id` int
,`requested_at` datetime
,`status` enum('pending','approved','rejected','completed')
,`student_email` varchar(255)
,`student_first_name` varchar(255)
,`student_id` int
,`student_last_name` varchar(255)
,`student_username` varchar(255)
,`student_usn` varchar(50)
,`title` varchar(255)
,`type` varchar(100)
);

-- --------------------------------------------------------

--
-- Table structure for table `auth_audit_log`
--

CREATE TABLE `auth_audit_log` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Username attempted',
  `auth_type` enum('user','admin') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'User or admin login',
  `action` enum('login_success','login_failed','logout','token_refresh') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Action performed',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'IPv4 or IPv6',
  `user_agent` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Browser user agent',
  `failure_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Why login failed',
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit log for all authentication attempts';

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
  `status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'available',
  `book_format` enum('hard_copy','soft_copy') COLLATE utf8mb4_general_ci DEFAULT 'hard_copy' COMMENT 'Format of the book',
  `file_path` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'File path for soft copy books',
  `type` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Book type/category'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`id`, `sl_no`, `acc_no`, `title`, `author`, `donated_by`, `date`, `status`, `book_format`, `file_path`, `type`) VALUES
(1, 1, 100001, 'CODING AND DECODING', '10 SECONDS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(2, 2, 100002, 'TURNING POINT\r\nA JOURNEY THROUGH CHALLENGES', 'A.P.J. ABDUL KALAM', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(3, 3, 100003, 'WHY SOME POSITIVE THINKERS GET \r\nPOWERFULRESULTS', 'NORMAN VINCENT PEALE', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(4, 4, 100004, '201 EXPANDED PROVERBS', 'JOICE P JOSE', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(5, 5, 100005, '303 LETTERS FOR ALL OCCASION', 'ANAND GANGULY', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(6, 6, 100006, 'A COMPLETE MANUAL NDA/NA (NATIONAL DEFENCE ACADEMY & NAVAL ACADEMY)', 'MAJOR MEHAR SINGH', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(7, 7, 100007, 'A FAST TRACK COURSE IN MENTAL ABILITY', 'AMOGH GOEL', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(8, 8, 100008, 'A HANDBOOK ON CIVIL ENGINEERING ESE,GATE,PSU\'S AND OTHER COMPETITIVE EXAMS', 'MADE EASY PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(9, 9, 100009, 'A HANDBOOK ON ELECTRONICS ENGINEERING', 'MADE EASY PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(10, 10, 100010, 'A MODEERN APPROACH TO\r\n LOGICAL REASONING', 'DR. R.S. AGGARWAL', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(11, 11, 100011, 'A MODERN APPORACH TO LOGICAL REASONING', 'DR.R.S.AGGARWAL', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(12, 12, 100012, 'A MODERN APPROACH TO LOGICAL \r\nREASONING', 'DR.R.S.AGGARWAL', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(13, 13, 100013, 'A MODERN APPROACH TO LOGICAL REASONING', 'DR.R.S.AGGARWAL', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(14, 14, 100014, 'A MODERN APPROACH TO NON VERBAL REASONING', 'DR.R.S.AGGARWAL', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(15, 15, 100015, 'A MODERN APPROACH TO VERBAL & NON VERBAL REASONING', 'DR.R.S.AGGARWAL', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(16, 16, 100016, 'A MODERN APPROACH TO\r\n VERBAL & NON-VERBAL REASONING', 'R. S. AGGARWAL', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(17, 17, 100017, 'A MODERN APPROACH TO VERBAL REASONING', 'DR.R.S.AGGARWAL', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(18, 18, 100018, 'A MODERN APPROACH TO\r\n VERBAL REASONING', 'DR.R.S.AGGARWAL', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(19, 19, 100019, 'A NEW APPROACH TO \r\nDATA INTERPRETATION AND DATA\r\nSUFFICIENCY', 'ER. R. K. MOHANTY &\r\nRAJESH SINGH', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(20, 20, 100020, 'A TO Z \r\nTIPS FOR SUCCESS', 'ANTONETTE JESUMANI', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(21, 21, 100021, 'A.P.J ABDUL KALAM LEARNING HOW TO FLY', 'A.P.J.ABDUL KALAM', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(22, 22, 100022, 'ACE QUANT A COMPLETE GUIDE ON QUANTITATIVE APTITUDE FOR BANKING &INSURANCE EXAMINATIONS', 'AADA 247 PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(23, 23, 100023, 'ADVANCED ENGLISH GRAMMAR', 'MARTIN HEWINGS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(24, 24, 100024, 'ALL-IN-ONE\r\nSUNSTAR EXAM SCANNER B.E.\r\n8TH SEMESTER EEE\r\n(PREVIOUS EXAM PAPERS SOLVED)', 'SUNSTAR PUBLICATION', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(25, 25, 100025, 'ALL-IN-ONE\r\nSUNSTAR EXAM SCANNER\r\nB.E. 6TH SEM MECH ENGG', 'SUNSTAR PUBLICATION', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(26, 26, 100026, 'AN ANALYTICAL APPROACH FOR\r\n COMPREHENSIVE REASONING', 'DR. M. B. LAL &\r\nASHOK GUPTA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(27, 27, 100027, 'AN INTEGRAL APPROACH TO\r\n SOFTWARE ENGINEERING', 'PANKAJ JALOTE', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(28, 28, 100028, 'ANALITICAL REASONING & LOGICAL REASONING', 'PEEYUSH BHARDWAJ', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(29, 29, 100029, 'ANALOG ELECTRONIC CIRCUITS\r\nA SIMPLIFIED APPROACH', 'U. B. MAHADEVASWAMY', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(30, 30, 100030, 'ANALYTICAL REASONING', 'MK PANDEY', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(31, 31, 100031, 'ANALYTICAL WRITING & ESSAYS\r\n FOR ADMISSION TO FOREIGN UNIVERSITIES  \r\nGMAT, GRE & TOEFL', 'M. J. ASHOK', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(32, 32, 100032, 'ANTEMNAS & PROPAGATION', 'U.A.BAKSHI ,A.V.BAKSHI & K.A.BAKSHI', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(33, 33, 100033, 'APPLIED MATHEMATICS', 'G.S.UDUPI', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(34, 34, 100034, 'APTIMITHRA\r\nYOUR FRIEND FOR CRACKING APTITUDE TESTS', 'MC GRAW HILL EDUCATION', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(35, 35, 100035, 'APTITUDE B2A BASIC ADVANCED', 'NEERAJA ANAND V & PRAGADEESHWARA PRABHU C N', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(36, 36, 100036, 'ART OF SENTENCE MAKING IN ENGLISH', 'J. D. MURTHY', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(37, 37, 100037, 'ATTITUDE IS EVERYTHING', 'JEFF KELLER', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(38, 38, 100038, 'ATTITUDES OF GRATTITUDE\r\n(HOW TI GIVE AND RECEIVE JOY EVERYDAY OF YOUR LIFE)', 'M. J .RYAN', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(39, 39, 100039, 'AWESOME GRAMAMAR', 'BECKY BURCKMYER', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(40, 40, 100040, 'BECOME AN EFFECTIVE LEADER', 'DALE CARNEGIE', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(41, 41, 100041, 'BETTER THAN GOOD', 'ZIG ZIGLAR', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(42, 42, 100042, 'BLITZ\r\nTHE IT QUIZ BOOK\r\nTHE DEFINITIVE TOME OF IT QUIZZING', 'RAVEESH MAYYA K.', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(43, 43, 100043, 'BOOK OF ENGLISH GRAMMAR', 'DR.S.N. KULKARNI', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(44, 44, 100044, 'BREAKING THE CODE OF SSB \r\nPSYCOLOGICAL TEST\r\nDO YOU HAVE IT IN YOU?', 'SHAURYA PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(45, 45, 100045, 'BUSINESS TAXATION I&II', 'K.SADASHIVA RAO', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(46, 46, 100046, 'BUSINESS TAXATION WITH INCOME TAX AND INDIRECT TAXES', 'DR.RAVINDRA DIWAN & PRIN.GOPALKRISHNA BHAT', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(47, 47, 100047, 'CAMPUS INTERVIEWS', 'GOPALSINGH N.S. & SUBHAS BABALADI', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(48, 48, 100048, 'CAREER PRIME', '', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(49, 49, 100049, 'CERTIFICATE PHYSICAL AND HUMAN GEOGRAPHY', 'GOH CHENG LEONG', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(50, 50, 100050, 'CHAPTERWISE PREVIOUS YEARS\'\r\nSOLVED PAPERS 2017-2000\r\nGATE \r\nCOMPUTER SCIENCE & INFORMATION TECHNOLOGY', 'SURAJ SINGH', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(51, 51, 100051, 'CHARACTER\r\n HELPS TO PERSONALITY GROWTH', 'SAMUEL SMILES', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(52, 52, 100052, 'CIVIL SERVICES APTITUDE TEST (CSAT) LOGICAL REASONING AND\r\nANALYTICAL ABILITY', 'PRATIYOGITHA SAHITYA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(53, 53, 100053, 'CIVIL SERVICES APTITUDE TEST (CSAT) LOGICAL REASONING AND ANALYTICAL ABILITY', 'PRATIYOGITA SAHITYA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(54, 54, 100054, 'CODING INTERVIEW QUESTIONS', 'NARASIMHA KARUMANCHI', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(55, 55, 100055, 'COMPILERS \r\nPRINCIPLES , TECHNIQUES AND TOOLS', 'ALFRED V. AHO\r\nMONICA S. LAM\r\nRAVI SETHI\r\nJEFFREY D. ULLMAN', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(56, 56, 100056, 'COMPLETE COMPETITION MATHEMATICS', 'NEETIKA GOYAL', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(57, 57, 100057, 'COMPLETE PERSONALITY DEVELOPMENT \r\nCOURSE', 'SURYA SINHA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(58, 58, 100058, 'COMPREHENSIVE COMPUTER AWARENESS', 'TARUN GOYAL \r\nANUJ SOM', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(59, 59, 100059, 'COMPUTER ORGANIZATION', 'CARL HAMACHER \r\nVONKO VRANESIC \r\nSAFWAT ZAKY', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(60, 60, 100060, 'CONCISE ENGLISH GRAMMAR', 'R.GUPTA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(61, 61, 100061, 'CONJUNCTION, PREPOSITION,\r\n INTERJECTION AND ARTICLE', 'S.L.N. SHARMA \r\nK. SHANKARANARAYANA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(62, 62, 100062, 'CONTEMPORARY COMMUNICATIVE ENGLISH', 'DR.SHRUTI DAS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(63, 63, 100063, 'C-PROGRAMMING TECHNIQUES\r\nI & II SEMESTER', 'A. M. PADMA REDDY', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(64, 64, 100064, 'CRACK GATE/IES/PSUIs & \r\nOTHER COMPETITIVE EXAMS WITH \r\nARIHANT\'S HANDBOOK SERIES\r\nCOMPUTER SCIENCE & IT', 'SURABHI MISHRA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(65, 65, 100065, 'CRACKING THE C,C++,AND JAVA INTERVIEW', 'S G GANESH & SUBHASH K U', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(66, 66, 100066, 'CREATIVE WRITING', 'GRATIAN VAS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(67, 67, 100067, 'DATA INTERPRETATION', 'QUANTECH ORIGIN', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(68, 68, 100068, 'DATA INTERPRETATION & DATA \r\nSUFFICIENCY FOR \r\nSBI, IBPS, LIC, GICs AND COMPETITIVE EXAMS', 'S. VIJAY', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(69, 69, 100069, 'DATA SCIENCE AND BIG DATA ANALYTICS', 'ICT ACADEMY', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(70, 70, 100070, 'DICSRETE MATHEMATICAL STRUCTURES', 'DR. D. S. CHANDRASEKHARAIAH', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(71, 71, 100071, 'DISCRETE  MATHEMATICAL STRUCTURES\r\nFOR THIRD SEMESTER B.E. CLASSES (CSE & ISE BRANCHES)', 'DR. D. S. CHANDRASEKHARAIAH', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(72, 72, 100072, 'DYNAMIC MEMORY GROUP DISCUSSION', 'TARUN CHAKARBORTY', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(73, 73, 100073, 'EASY & SELF STUDY OF ENGLISH \r\nWITH SPOKEN ENGLISH', 'K. S. SHESHADRI', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(74, 74, 100074, 'EDUCATIONAL ASPIRATIONS AND SCIENTIFIC ATTITUDES', 'KALLURI (CH)DURGA RANI & D.BHASKARA RAO', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(75, 75, 100075, 'EFFECTIVE COMMUNICATION', 'JOHN ADAIR', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(76, 76, 100076, 'ENGINEERING MATHEMATICS\r\nFOR GATE', 'S.RANGANATHAM\r\nT.K.V.IYENGAR\r\nD.MALLIKARJUNA REDDY\r\nS.SREENADH', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(77, 77, 100077, 'ENGLISH FOR COMPETITIVE EXAMINATIONS', 'DR. V. SARASWATHI & \r\nDR. MAYA K. MUDBHATKAL', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(78, 78, 100078, 'ENVIRONMENTAL STUDIES', 'DR.R.GEETHA BALAKRISHNA & K.G.LAKSHMINARAYANA BHATTA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(79, 79, 100079, 'ESE 2019 PRELIMINARY EXAMINATION\r\nGENERAL STUDIES AND ENGINEERING APTITUDE\r\n(STANDARD AND QUALITY PRACTICES IN PRODUCTION , CONSTRUCTION , MAINTENANCE AND SERVICES', 'MADE EASY PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(80, 80, 100080, 'ESE,GATE REASONING APTITUDE', 'MADE EASY PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(81, 81, 100081, 'ESSENTIAL ENGLISH GRAMMAR\r\nA SELF STUDY REFERENCE AND PRACTICE\r\nBOOK FOR ELEMENTARY STUDENTS OF ENGLISH', 'RAYMOND MURPHY', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(82, 82, 100082, 'EXAM SUCCESS SERIES\r\nNON-VERBAL REASONING', 'VIJAY SHANKAR SRIVASTVA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(83, 83, 100083, 'EXCEL IN GRAMMAR\r\n(FOR SECENDARY AND SENIOR SECENDARY CLASSES)', 'DOREEN DE CASTRO\r\nSHAKEELA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(84, 84, 100084, 'EXCELLENT ENGLISH GRAMMER AND COMPOSITION', 'H.S.BHATIA MA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(85, 85, 100085, 'EXPECTED QUESTIONS AND ANSWERS\r\nFOR ALL INTERVIEWS', 'JASON KOCHUVEEDAN', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(86, 86, 100086, 'EXTEAME BRAIN WORKOUT\r\nVOLUME-II', 'MARCEL DANESI', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(87, 87, 100087, 'FACING INTERVIEWS', 'SUNNEY THARAPPAN', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(88, 88, 100088, 'FASCINATING FUN WITH NUMBERS', 'B.A.HASANABBA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(89, 89, 100089, 'FAST TRACK OBJECTIVE ARITHMATIC', 'RAJESH VERMA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(90, 90, 100090, 'FAST TRACK OBJECTIVE ARITHMETIC', 'RAJESH VERMA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(91, 91, 100091, 'FINITE AUTOMATA &\r\nFORMAL LANGUAGES FOR \r\nIV SEM CS/IS', 'A. M. PADMA REDDY', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(92, 92, 100092, 'FINITE AUTOMATA &\r\nFORMAL LANGUAGES FOR \r\nV SEM CS/IS', 'A.M. PADMA REDDY', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(93, 93, 100093, 'FREE ENGLISH GRAMMAR', 'ESPRESSOENGLISH', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(94, 94, 100094, 'G K PUBLICATION\'S U.P.S.C.\r\nES (ENGINEERING SERVICE)\r\nGENERAL ABILITY TEST', 'GK PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(95, 95, 100095, 'GATE    (COMPUTER SCIENCE & INFORMATION TECHNOLOGY)', 'NITESH JAIN', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(96, 96, 100096, 'GATE 2011 (MECHANICAL ENGINEERING)', 'GK PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(97, 97, 100097, 'GATE 2014 [ GRATITUDE APTITUDE TEST IN ENGINEEERING] MECHANICAL ENGINEERING', 'GK PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(98, 98, 100098, 'GATE 2016 \r\nGRADUATE APTITUDE TEST IN ENGINEERINFG \r\n20 YEARS CHAPTER -WISE \r\nSOLVED PAPERS 1996-2015\r\nMECHANICAL ENGINEERING', 'GK PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(99, 99, 100099, 'GATE 2016 (MECHANICAL ENGINEERING)', 'GK PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(100, 100, 100100, 'GATE 2016 [ GRATITUDE APTITUDE TEST IN ENGINEEERING] ELECTRONICS & COMMUNICATION', 'GK PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(101, 101, 100101, 'GATE 2018 MECHANICAL ENGINEERING', 'MADE EASY PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(102, 102, 100102, 'GATE 2019 (LIFE SCIENCE CHEMISTRY & GENERAL APTITUDE)', 'PRABHANSHU KUMAR& SANTOSH KUMAR RAI', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(103, 103, 100103, 'GATE 2019\r\n(GENERAL APTITUDE )\r\nVERBAL ABILITY| NUMERICAL ABILITY', 'GK PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(104, 104, 100104, 'GATE 2020 GENERAL APTITUDE', 'GK PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(105, 105, 100105, 'GATE COMPUTER SCIENCE & IT 2017', 'MADE EASY PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(106, 106, 100106, 'GATE GRATITUDE APTITUDE TEST IN ENGINEERING', 'GK PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(107, 107, 100107, 'GATE PAPERS\r\nELECTRI\\ONICS & COMMUNICATION ENGINEERING', 'GK PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(108, 108, 100108, 'GATE TUTOR', 'ER.ANKIT GOEL & ALKA SINGH', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(109, 109, 100109, 'GENERAL AWARENESS TESTS\r\n ON CURRENT EVENTS\r\nWITH EXPLANATORY ANSWERS', 'V.V.K. SUBBURAJ', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(110, 110, 100110, 'GENERAL INTELLIGENCE AND TEST OF REASONING (VERBAL &NON VERBAL)', 'DR.N.K.PORWAL', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(111, 111, 100111, 'GENERAL INTELLIGENCE AND \r\nTEST OF REASONING (VERBAL & NON-VERBAL)', 'DR. N. K. PORWAL', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(112, 112, 100112, 'GENERAL INTELLIGENCE AND\r\nMENTAL ABILITY TEST\r\n1000+ SOLVED MCQs FREQUENTLY ASKED \r\nIN VARIOUS EXAMINTIONS', 'R. GUPTA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(113, 113, 100113, 'GENERAL KNOWLEDGE', 'GATE WAY TO KNOWLEDGE', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(114, 114, 100114, 'GENERAL KNOWLEDGE 2020', 'MANOHAR PANDEY', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(115, 115, 100115, 'GENERAL KNOWLEDGE HAND BOOK', 'R.GUPTA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(116, 116, 100116, 'GENERAL KNOWLEDGE TODAY', '', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(117, 117, 100117, 'GENERAL KNOWLEDGEQUIZ & PUZZLES', 'M.K. SOMANATH PANICKER', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(118, 118, 100118, 'GENERAL MENTAL ABILITY', 'D.S.KRISHNAN', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(119, 119, 100119, 'GRAMMAR MASTER', 'D.TRESSLER & GRATIAN VAS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(120, 120, 100120, 'GREAT SPEAKERS AREN\'T BORN \r\nTHE COMPLETE GUIDE TO WINNING PRESENTATIONS', 'GEORGE KOPS &\r\nRICHARD WORTH', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(121, 121, 100121, 'GROUP DISCUSSION', 'NITIN SHARMA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(122, 122, 100122, 'GROUP DISCUSSION \r\nMORE THEN 100 TOPICS COVERED', 'NITIN SHARMA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(123, 123, 100123, 'GROUP DISCUSSION \r\nUSEFUL FOR COMPETITIVE EXAMS', 'AJAI B KHER', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(124, 124, 100124, 'GROUP DISCUSSION (MORE THAN 100 TOPICS COVERED)', 'NITIN SHARMA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(125, 125, 100125, 'GUIDE FOR MENTAL ABILITY TEST', 'Y P SINGHAL', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(126, 126, 100126, 'HIGH SCHOOL ENGLISH GRAMMAR &\r\nCOMPOSITION', 'WREN &\r\nMARTIN\r\nN.D.V.PRASAD RAO', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(127, 127, 100127, 'HIGH SPEED SYSTEM BASIC ARITHMATIC', 'DR. A. KUMAR', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(128, 128, 100128, 'HOW TO CRACK GROUP DISCUSSION \r\n& PERSONAL INTERVIEWS', 'M. B. SIVARAMAKRISHNAN', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(129, 129, 100129, 'HOW TO CRACK TEST OF REASONING\r\nIN ALL COMPETITIVE EXAMS\r\nVERBAL , ANALYTICAL & NON-VERBAL REASONING', 'JAIKISHAN\r\nPREMKISHAN', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(130, 130, 100130, 'HOW TO DEVELOP SELF-CONFIDENCE \r\n& INFLUENCE PEOPLE BY\r\nPUBLIC SPEAKING', 'DALE CARNEGIE', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(131, 131, 100131, 'HOW TO ENJOY YOUR LIFE AND YOUR JOB', 'DALE CARNEGIE', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(132, 132, 100132, 'HOW TO PASS VERBAL REASONING TEST', 'HARRRY TOLLEY& KEN THOMAS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(133, 133, 100133, 'HOW TO PREPARE FOR QUANTITATIVE APTITUDE FOR CAT', 'ARUN SHARMA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(134, 134, 100134, 'HOW TO PREPARE FOR THE GRE (GRADUATE RECORD EXAMINATION WITH CD -ROM)2005-2006 EDITION', 'SHARON WEINER GREEN& IRA K WOLF ,PH.D', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(135, 135, 100135, 'HOW TO PREPARE FOR THE QUANTITATIVE APTITUDE FOR THE CAT', 'CHANDRESH AGRAWAL', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(136, 136, 100136, 'HOW TO WRITE AND APEAK BETTER', 'READERS DIGEST', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(137, 137, 100137, 'IAM THE MIND\r\nMUCH MORE POWERFUL THAN THE BRAIN', 'DEEP TRIVEDI', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(138, 138, 100138, 'IBPS (INSTITUTE OF BANKING PERSONNEL SELECTION)PO/MT', 'R.GUPTA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(139, 139, 100139, 'IMPROVE YOUR ENGLISH CONVERSATION', 'KAVITA KAPOOR', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(140, 140, 100140, 'IMPROVE YOUR IDIOM  AND PHRASES', 'J. S. BRIGHT', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(141, 141, 100141, 'IMPROVE YOUR VOGABULARY', 'KUMAR & ARORA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(142, 142, 100142, 'INTEGRAL CALCULUS FOR BEGINNERS', 'JOSEPH EDWARDS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(143, 143, 100143, 'INTERNATIONAL BESTSELLER SCORING STRATEGIES FOR THE TOEFL IBT', 'BRUCE STIRLING', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(144, 144, 100144, 'IT INTERVIEW QUESTIONS', 'NARASIMHA KARUMANCHI', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(145, 145, 100145, 'JAVA PROGRAMMING FOR ANDROID \r\nDEVELOPERS FOR DUMMIES', 'BARRY BURD', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(146, 146, 100146, 'JEE MAIN (INCLUDE AIEEE SOLVED PAPERS', 'VIKAS JAIN', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(147, 147, 100147, 'JUMBLED SENTENCES & PARAGRAPHS', 'SC GUPTA & KUMKUM GUPTA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(148, 148, 100148, 'LATEST GENERAL KNOWLEDGE\r\n2015', 'V.V.K. SUBBURAJ', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(149, 149, 100149, 'LEARN TO EARN MONEY\r\nKEEPING STRESS AWAY FROM LIFE', 'SANJEEV KUMAR', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(150, 150, 100150, 'LEGACY \r\nLETTERS FROM EMINENT PARENTS TO THEIR DAUGHTERS', 'SUDHA MENON', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(151, 151, 100151, 'LET US C', 'YASHAVANT KANETKAR', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(152, 152, 100152, 'LET US JAVA', 'YASHAVANT KANETKAR', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(153, 153, 100153, 'LETTER WRITING', 'LEE JARVIS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(154, 154, 100154, 'LIFE IS BEAUTIFUL', 'PRADDEP ISHWAR', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(155, 155, 100155, 'LOGICAL & ANALYTICAL REASONING\r\n(USEFUL FOR ALL COMPETITIVE EXAMINATION)', 'A. K. GUPTHA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(156, 156, 100156, 'M.B.A. ENTRANCE EXAM FOR KARNATAKA VTU PGCET/K.MAT', 'PRAKASH & SAROJA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(157, 157, 100157, 'MANORAMA YEARBOOK 2020', 'MAMMEN MATHEW', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(158, 158, 100158, 'MANUAL TO GROUP DISCUSSIONS 0', 'P.S.BRIGHT', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(159, 159, 100159, 'MANUFACTURING PROCESS - III\r\nMENTAL FORMING PROCESS', 'KESTOOR PRAVEEN', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(160, 160, 100160, 'MASTER MENTAL ABILITY \r\nIN 30 DAYS', 'VINEESH', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(161, 161, 100161, 'MATHABILITY AWAKEN THE MATH CENIUS IN YOUR CHILD', 'SHAKUNTALA DEVI', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(162, 162, 100162, 'MATHEMATICS(  A+WINNER)', 'TALENT BOOK PUBLISHERS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(163, 163, 100163, 'MENTAL & REASONING ABILITY', 'DR. R. P. DATASON', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(164, 164, 100164, 'MENTAL ABILITY', 'A.BALARAJU', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(165, 165, 100165, 'MENTAL ABILITY \r\n(USEFUL FOR K.A.S., U.G.C., B.ED., P.S.I., N.E.T. AND ALL COMPETITIVE EXAMS)', 'A.BALARAJU', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(166, 166, 100166, 'MENTAL ABILITY (IAS/KAS/PSI/ESI/FDA/SDA/PDO/PC/RRB/KSRTC/B.ED./D.ED./UGC - NET KSET,KPSC GROUP \'C\',BANKING AND FOR OTHER COMPETITIVE EXAMS)', 'MANJUNATH BADAGI', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(167, 167, 100167, 'MENTAL ABILITY TEST', 'R.GUPTA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(168, 168, 100168, 'MENTAL MATHEMATICS', 'SHREE BOOK CENTRE', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(169, 169, 100169, 'METHODS OF MENTAL MATHEMATICS', 'B.A.HASANABBA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(170, 170, 100170, 'MICROSOFT OFFICE 2010\r\nTRAINING GUIDE', 'PROF. SATISH JAIN\r\nM. GEETAH \r\nKRATIKA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(171, 171, 100171, 'MILLENNIUM QUIZ', 'WIN WIN BOOKS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(172, 172, 100172, 'MORE PUZZLES', 'SHAKUNTALA DEVI', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(173, 173, 100173, 'NEW MODERN ENGLISH GRAMMAR', 'ARVIND SUGUR', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(174, 174, 100174, 'NEW MODERN TO ENGLISH GRAMMAR', 'ARVIND SUGUR', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(175, 175, 100175, 'NON VERBAL REASONING', 'DR.LAL&MISHRA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(176, 176, 100176, 'OBJECT ORIENTED PROGRAMMING WITH JAVA', 'RAJKUMAR BUYYA /S THAMARAI SELVI/XINGCHEN CHU', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(177, 177, 100177, 'OBJECTIVE AND GENERAL COMPUTER AWARENEESS', 'SANJAY SONI', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(178, 178, 100178, 'OBJECTIVE ENGLISH', 'EDGAR THORPE & SHOWICK THORPE', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(179, 179, 100179, 'OBJECTIVE GENERAL ENGLISH', 'SP BAKSHI', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(180, 180, 100180, 'OBJECTIVE MECHANICAL ENGINEERING', 'AIRHANT PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(181, 181, 100181, 'OBJECTIVE QUESTIONS & ANSWERS IN \r\nELECTRICAL ENGINEERING\r\n(FOR UPSC ENGINEERING SERVICEC EXAMINATIONS, \r\nGATE, OBJECTIVE TESTS, INTERVIEWS ETC.)', 'R. R. GUPTA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(182, 182, 100182, 'OBJECT-ORIENTED MODELING AND DESIGN WITH UML', 'MICHAEL R BLAHA \r\nJAMES R RUMBAUGH', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(183, 183, 100183, 'OBJECT-ORIENTED PROGRAMMING \r\nWITH C++', 'E BALAGURUSWAMY', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(184, 184, 100184, 'ONE WORD \r\nSYNONYMS AND ANTONYMS', 'MBJ. PANCRAS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(185, 185, 100185, 'OXFORD A-Z OFGRAMMAR AND \r\nPUNCTUATION', 'JOHN SEELY', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(186, 186, 100186, 'OXFORD GUIDE TO PLAIN ENGLISH', 'MARTIN CUTTS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(187, 187, 100187, 'PATHFINDER CDS\r\nCOMBINED DEFENCE SERVICES \r\nENTRANCE EXAMINATION', 'RAJIV KASHYAP\r\nDIGVIJAY SINGH\r\nNEHA CHANDRA\r\nHARI NARAYAN &\r\nANUPAM RASTOGI', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(188, 188, 100188, 'PERFECT SPOKEN ENGLISH\r\nENHANCING CONFIDENCE LEVEL \r\nFOR BETTER COMMUNICATION', 'REWA BHASIN', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(189, 189, 100189, 'PLACEMENT SUCCESS FROM \r\nCAREERSVALLEY.COM', 'KAMALKK KANNAN &\r\nBALAJEE KANNAN', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(190, 190, 100190, 'POPULAR MASTER GUIDE AFCAT (AIR FORCE COMMON ADMISSION TEST)', 'R.GUPTA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(191, 191, 100191, 'POPULAR MASTER MENTAL ABILITY TEST', 'R.GUPTA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(192, 192, 100192, 'PRINCIPLES AND PRACTICES\r\n OF INFORMATION SRCURITY', 'DR. MICHAEL E. WHITMAN\r\nHERBERT J. MATTORD', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(193, 193, 100193, 'PRINCIPLES OF SUCCESS IN INTERVIEW', 'C. SYLENDRA BABU', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(194, 194, 100194, 'PROGRAMMING IN BASIC', 'E BALAGURUSWAMY', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(195, 195, 100195, 'PUZZLES TO PUZZLE YOU', 'SHAKUNTALA DEVI', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(196, 196, 100196, 'PYTHON APPLICATION PROGRAMMING', 'A.A.PUNTAMBEKAR', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(197, 197, 100197, 'QUANTITATIVE APTITUDE', 'SHRIPAD DEO', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(198, 198, 100198, 'QUANTITATIVE APTITUDE \r\n(SELF LEARNING , EXAMINATION ORIENTED)', 'V.RAJAMANI', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(199, 199, 100199, 'QUANTITATIVE APTITUDE \r\nFOR COMPETITIVE EXAMINATIONS\r\nFULLY SOLVED', 'R.K.TYAGI', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(200, 200, 100200, 'QUANTITATIVE APTITUDE &\r\nDATA INTERPRETATION\r\nTOPIC-WISE SOLVED PAPERS\r\nFOR IBPS/SBI BANK PO/CLERK PRELIM &\r\nMAIN EXAMS(2010-20)', 'DISHA PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(201, 201, 100201, 'QUANTITATIVE APTITUDE (SELF LEARNING ,EXAMINATION ORIENTED)', 'V.RAJAMANI', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(202, 202, 100202, 'QUANTITATIVE APTITUDE FOR COMPEITATIVE EXAMS', 'DISHA NURTURING AMBITIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(203, 203, 100203, 'QUANTITATIVE APTITUDE FOR COMPETITIVE  AND ACADEMIC EXAMINATIONS', 'DR.S.S.CHEEMA,NAVRATAN SINGH,MONIKA SAHA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(204, 204, 100204, 'QUANTITATIVE APTITUDE FOR COMPETITIVE EXAMINATIONS', 'DR.R.S.AGGARWAL', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(205, 205, 100205, 'QUANTITATIVE APTITUDE FOR IBPS/SBI BANK PO/CLERK PRELIM &MAINS', 'DISHA NURTURING AMBITIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(206, 206, 100206, 'QUANTITATIVE APTITUDE FOR NUMERICAL ABILITY', 'SANJEEV JOON', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(207, 207, 100207, 'QUANTITATIVE APTITUDE FOR QUANTITATIVE EXAMINATION', 'DIPAK KUMAR YUGNIRMAL', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(208, 208, 100208, 'QUANTITATIVE APTITUDE NUMERICAL ABILITY', 'KIRAN INSTITUTE OF CAREER EXCELLENCE PVT LTD', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(209, 209, 100209, 'QUANTITATIVE APTITUDE\r\nFOR BANK PO/CLERK,LIC,GIC AND OTHER COMPETITIVE EXAMS', 'DHANKAR PUBLICATIONS PVT.LTD.', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(210, 210, 100210, 'QUANTITATIVE APTITUDE\r\nFOR COMPETITIVE EXAMINATIONS \r\n(FULLY SOLVED) \r\nAS PER NEW EXAMINATION PATTERN', 'DR.R.S.AGGARWAL', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(211, 211, 100211, 'QUICK COMMERCIAL MATHS', 'SUNIL CHUGH', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(212, 212, 100212, 'QUICKER MATHS', 'M.TYRA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(213, 213, 100213, 'QUICKER REASONING TEST', 'DR.M.B.LAL & A.K.SINGH', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(214, 214, 100214, 'R. GUPTA\'S \r\nSUPER QUICKER ARITHMETIC', 'R.GUPTA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(215, 215, 100215, 'RAPID QUANTITATIVE APTITUDE\r\nWITH SHORTCUTS & TRICKS FOR COMPETITIVE EXAMS', 'DISHA PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(216, 216, 100216, 'READ TO LEAD \r\nFINANCIAL MANAGEMENT', 'DR. SREENIVAS D. L.\r\nPROF. B. DIWAKER NAIDU', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(217, 217, 100217, 'REASONING ABILITY', 'R.C.AGGARWAL', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(218, 218, 100218, 'REASONING ABILITY\r\nFOR ALL COMPETITIVE AND ACADEMIC EXAMINATION', 'R. C. AGGARWAL', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(219, 219, 100219, 'REASONING TEST (VERBAL & NON VERBAL)', 'DR.M.B..LAL& A.K.SINGH', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(220, 220, 100220, 'REASONING\r\n(SELF LEARNING,EXAMINATION ORIENTED)', 'V.RAJAMANI', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(221, 221, 100221, 'ROBIN SHARMA THE LEADER WHO HAD NO TITLE', 'ROBIN SHARMA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(222, 222, 100222, 'ROBIN SHARMA THE MASTERY MANUAL', 'ROBIN SHARMA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(223, 223, 100223, 'RULES OF ENGLISH GRAMMAR', 'ANANDRAO S KALE', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(224, 224, 100224, 'SECRETS BEHIND FASTER CALCULATIONS\r\nTRAIN YOUR BRAIN TO BECOME A HUMAN CALCULATOR', 'PRAVEEN TYAGI', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(225, 225, 100225, 'SHARPEN YOUR VOCABULARY', 'KAVITA KAPOOR', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(226, 226, 100226, 'SHORTCUTS IN QUANTITATIVE APTITUDE', 'DISHA PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(227, 227, 100227, 'SHORTCUTS IN QUANTITATIVE APTITUDE \r\nFOR COMPETITIVE EXAMS', 'DISHA PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(228, 228, 100228, 'SHORTCUTS IN REASONING', 'DISHA PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(229, 229, 100229, 'SHORTCUTS IN REASONING (VERBAL ,NON VERBAL & ANALYTICAL)', 'DISHA NURTURING AMBITIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(230, 230, 100230, 'SHORTCUTS IN REASONING\r\n(VERBAL,NON-VERBAL & ANALYTICAL)\r\nFOR COMPETITIVE EXASMS', 'DISHA PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(231, 231, 100231, 'SPEED MATHEMATICS \r\nSIMPLE SHORTCUT METHODS TO SOLVE \r\nCOMPLEX MATHEMATICAL EQUATIONS \r\nAND PROBLEMS', 'S. BALASUBRAMANIAN', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(232, 232, 100232, 'SPOKEN ENGLISH \r\nA PRACTICAL COURSE FOR SPEAKING \r\nENGLISH CORRECTLY & EFFECTIVELY', 'V & S PUBLISHERS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(233, 233, 100233, 'SSB INTERVIEW', 'MANOJ MEHAR SINGH & P.S.BRIGHT', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(234, 234, 100234, 'SSC CGL TIER-1\r\nGEENRAL INTELLIGENCE & REASONING \r\n(VERBAL & NON VERBAL)', 'DR. N. K. PORWAL', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(235, 235, 100235, 'SSC CHSL (10+2)\r\nCOMBINED HIGHER SECENDARY LEVEL \r\nONLINE EXAMINATION 2018\r\nLDC/DEO/PSA\r\nSOLVED PAPERS 2017-2009', 'ARIHANT PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(236, 236, 100236, 'SSC CONSTANTABLE (GD)\r\nCAPFs, NIA & SSF (BSF, CISF, CRPF, SSB & ITBPF) & \r\nRIFLEMAN (GD)\r\nMOCK TEST', 'SH. S. N. PRASAD', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(237, 237, 100237, 'STEP BY STEP APPROACH TO \r\nENGLISH CONVERSATION', 'MADAN SOOD', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(238, 238, 100238, 'STEPM BY STEP ENGLISH GRAMMAR', 'V.V.BHAT,MRS.JAYASHREE SHETTY', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(239, 239, 100239, 'STUDENTS GUIDE TO INCOME TAX INCLUDING GST', 'DR,VINOD K.SINGHANIA & DR.MONICA SINGHANIA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(240, 240, 100240, 'SUNSTAR K.A.S QUESTION BANK \r\nGEENRAL STUDIES \r\nPRELIMINARY EXAM QUESTION PAPERS \r\n[WITH ANSWERS]', 'SUNSTAR PUBLICATION', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(241, 241, 100241, 'SURE SUCCESS IN INTERVIEWS', 'JAYANT NEOGY', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(242, 242, 100242, 'SYNONYMS AND ANTONYMS', 'MAHENDRA KUMAR &\r\nNEELAM ARORA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(243, 243, 100243, 'T.I.M.E', '', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(244, 244, 100244, 'TEACH YOURSELF QUANTITATIVE APTITUDE', 'ARUN SHARMA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(245, 245, 100245, 'TEACH YOURSELF THE ART OF CONVERSATION', 'ERIC WATSON', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(246, 246, 100246, 'TEACHING APTITUDE &\r\n TEACHING ATTITUDE (INCLUDING \r\nTEACHING SKILLS & TEACHING INTEREST)', 'R. GUPTA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(247, 247, 100247, 'TEACHING APTITUDE &\r\n TEACHING ATTITUDE TEST', 'ARIHANT PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(248, 248, 100248, 'TEACHING APTITUDE (AN IMMENSELY USEFUL BOOK FOR ALL TEACHER\'S EXAMINATIONS', 'R.GUPTA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(249, 249, 100249, 'TEST YOUR C SKILLS', 'YASHAVANT KANETKAR', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(250, 250, 100250, 'TEST YOUR SKILLS IN C', 'S THAMARAI SELVI\r\nR MURUGESAN', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(251, 251, 100251, 'TEST YOUR UNIX SKILLS', 'YASHAVANT KANETKAR', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(252, 252, 100252, 'THE BEST BOOK FOR PLACEMENT\r\nAPTITUDE TEST PREPARATION', 'APTIMITHRA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(253, 253, 100253, 'THE CHALLENGE \r\nTO DEVELOP YOUR RESOURCES', 'DR. MARIE MIGNON MASCARENHAS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(254, 254, 100254, 'THE COMPETITION AND OTHER STORIES', 'DEEPALI KALE', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(255, 255, 100255, 'THE COMPLETE GUIDE TO \r\nGROUP DISCUSSION \r\n(PRACTICAL TIPS MOCK DISCUSSION\r\nDO\'S &  DON\'TS)', 'PROF. SHRIKANT PRASOON', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(256, 256, 100256, 'THE LEXICON FOR ETHICS, INTEGRITY & APTITUDE', 'N.N.OJHA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(257, 257, 100257, 'THE QUICK & EASY WAY TO EFFECTIVE SPEAKING', 'DALE CARNEGIE', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(258, 258, 100258, 'THE QUICK & EASY WAY TO\r\n EFFECTIVE SPEAKING', 'DALE CARNEGIE', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(259, 259, 100259, 'THE SECRET', 'RHONDA BYRNE', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(260, 260, 100260, 'THE SECRET \r\nHERO', 'RHONDA BYRNE', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(261, 261, 100261, 'THE SECRETS OF GETTING SUCCESS IN INTERVIEWS', 'S HUNDIWALA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(262, 262, 100262, 'THINK AND GROW RICH', 'NEPOLIAN HILL', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(263, 263, 100263, 'TIPS & TECHNIQUES IN ENGLISH \r\nFOR COMPETITIVE EXAMS', 'DISHA PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(264, 264, 100264, 'TIPS & TECHNIQUES IN ENGLISH FOR COMPETITIVE EXAMS', 'DISHA NURTURING AMBITIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(265, 265, 100265, 'TIPS AND TECHNIQUES IN ENGLISH FOR  COMPEITITIVE EXAMS', 'DISHA NURTURING AMBITIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(266, 266, 100266, 'TIPS FOR BECOMING A BILLIONAIRE \r\nTHINK BIG BECOME BIG\r\nREALIZE YOUR DREAMS WITH ELAN!', 'TARUN ENGINEER', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(267, 267, 100267, 'TRAINING AND DEVELOPMENT METHOD', 'DR.RISHIPAL', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(268, 268, 100268, 'UNIVERSAL LETTER WRITER WHAT TO SAY AND HOW TO SAY IT', 'ANDREW ELLIOT', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(269, 269, 100269, 'UNRIVALED PERFORMANCE ,FLEXIBILITY,AND VALUE FOR AUTOMATED TEST', 'NATIONAL INSTRUMENTS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(270, 270, 100270, 'UPKAR\'S  NEW PARADIGM \r\nREASONING TEST \r\n(USEFUL FOR VARIOUS COMPETITIVE EXAMS)', 'PRATIYOGITA DARPAN', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(271, 271, 100271, 'UPKAR\'S \r\nA FRESH APPROACH TO REASONING TEST\r\nWITH LOGICAL REASONING', 'DR. LAL & \r\nMAURYA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(272, 272, 100272, 'UPKAR\'S \r\nMENTAL ABILITY TEST', 'UPKAR\'S PUBLICATION', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(273, 273, 100273, 'UPKAR\'S MENTAL ABILITY TEST', 'DR. LAL &\r\nJAIN', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(274, 274, 100274, 'UPKAR\'S BASIC NUMERACY & DATA \r\nINTERPRETATION\r\nFOR UNIOIN & STATE CIVIL SERVICES (PRE)\r\nAND OTHER COMPETITIVE EXAMS', 'NISHANT K.SHAKYA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(275, 275, 100275, 'UPKARS ELEMENTARY MATHEMATICS', 'ASHOK GUPTA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(276, 276, 100276, 'UPKARS INTERVIES AND GROUR DISCUSSIONS', 'T.S.JAIN&GUPTA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(277, 277, 100277, 'UPKAR\'S NER \r\n(NORMAL ENTRY RECRUITMENT TESTS)', 'DR. M. B. LAL', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(278, 278, 100278, 'UPKAR\'S NEW PARADIGM\r\n REASONING TEST \r\nUSEFUL FOR VARIOUS COMPETITIVE EXAMS', 'DISHA PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(279, 279, 100279, 'UPKAR\'S REASONING TEST\r\n(VERBAL & NON-VERBAL)', 'DR. M. B. LAL &\r\nA.K. SINGH', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(280, 280, 100280, 'UPKAR\'S REASONING TEST\r\n(VERBAL & NON-VERBAL)\r\nUSEFUL FOR VARIOUS COMPETITIVE EXAMS', 'DR.M.B.LAL &\r\nA.K. SINGH', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(281, 281, 100281, 'UPKAR\'S UGC NET/JRF/SET\r\nTEACHING & RESEARCH APTITUDE', 'PRATIYOGITA DARPAN', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(282, 282, 100282, 'UPKAR\'S VEDIC MATHEMATICS SUTRA', 'DR.A.KUMAR', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(283, 283, 100283, 'UPKAR\'S VERBAL REASONING\r\n(USEFUL FOR VARIOUS COMPETITIVE EXAMS)', 'DR. LAL & KUMAR', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(284, 284, 100284, 'UPKAR\'S\r\n NON-VERBAL REASONING\r\n(USEFUL FOR VARIOUS COMPETITIVE EXAMS)', 'DR.LAL & MISHRA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(285, 285, 100285, 'UPKAR\'S\r\nMATHEMATICAL FORMULAE', 'DR. N. K. SINGH', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(286, 286, 100286, 'UPSC CIVIL SERVICES PRELIM(PAPER-II) CSAT YEARWISE & TOPICWISE', 'KIRAN INSTITUTE OF CAREER EXCELLENCE PVT LTD', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(287, 287, 100287, 'VEDIC MATHEMATICS', 'PANIT RAMNANDAN SHASHTRI', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(288, 288, 100288, 'WILEY ACINGTHE GATE \r\nCOMPUTER SCIENCE AND INFORMATION TECHNOLOGY', 'ANIL KUMAR VERMA \r\nGUARAV SHARMA \r\nKULDEEP SINGH', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(289, 289, 100289, 'WILEY EXAM EXPERT\r\nGENERAL APTITUDE FOR CAMPUS PLACEMENTS', 'UMA MAHESHWARI', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(290, 290, 100290, 'WINNING AT INTERVIEWS', 'EDGAR THORPE \r\nSHOWICK THORPE', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(291, 291, 100291, 'WITH THE CCE ADVANTAGE \r\nNEW GRAMMAR PLUS', 'RATNA SAGAR', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(292, 292, 100292, 'WORD POWER MADE EASY\r\nTHE MOST EFFECTIVE VOCABULARY\r\nBUILDER IN THE ENGLISH LANGUAGE', 'NORMAN LEWIS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(293, 293, 100293, 'WORD POWER MADE EASY\r\nTHE NO. 1 VOCABULARY\r\nBUILDER IN THE ENGLISH LANGUAGE', 'NORMAN LEWIS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(294, 294, 100294, 'WORDS COMMONLY CONFUSED', 'R.GUPTA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(295, 295, 100295, 'WORLD HISTORY FOR CIVIL SERVICE EXAMINATIONS', 'KRISHNA REDDY', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(296, 296, 100296, 'YOU CAN HEAL YOUR LIFE', 'LOUISE .L.HAY', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(297, 297, 100297, 'YOUR GUIDE TO MODERN ENGLISH', 'MALPE PRESS PVT LTD', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(298, 298, 100298, 'ZERO TO ONE (NOTES ON STARTUPS OR HOW TO BUILD THE FUTURE)', 'PETER THIEL', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(299, 299, 100299, 'Total', '', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(300, 300, 100300, 'Placement Officer', '', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(301, 301, 100301, 'SUNSTAR EXAM SCANNER', '', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(302, 302, 100302, 'CIVIL SERVICES APTITUDE TEST(CSAT) LOGICAL REASONING AND ANALYTICAL ABILITY', 'PRATIYOGITA SAHITYA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(303, 303, 100303, '2016 GATE [ GRATITUDE APTITUDE TEST IN ENGINEEERING] ELECTRONICS & COMMUNICATION', 'GK PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(304, 304, 100304, '2014 GATE [ GRATITUDE APTITUDE TEST IN ENGINEEERING] MECHANICAL ENGINEERING', 'GK PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(305, 305, 100305, 'CIVIL SERVICES APTITUDE TEST (CSAT)\r\nLOGICAL REASONING AND\r\nANALYTICAL ABILITY', 'PRATIYOGITHA SAHITYA', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(306, 306, 100306, 'GENERAL INTELLIGENCE AND\r\nTEST OF REASONING\r\n(VERBAL & NON-VERBAL)', 'DR. N. K. PORWAL', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(307, 307, 100307, '2016 GATE \r\nGRADUATE APTITUDE TEST IN ENGINEERINFG \r\n20 YEARS CHAPTER -WISE \r\nSOLVED PAPERS 1996-2015\r\nMECHANICAL ENGINEERING', 'GK PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL),
(308, 308, 100308, '2018 GATE MECHANICAL ENGINEERING', 'MADE EASY PUBLICATIONS', 'Placement Library', NULL, 'available', 'hard_copy', NULL, NULL);

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
-- Table structure for table `branch_book_requests`
--

CREATE TABLE `branch_book_requests` (
  `id` int NOT NULL,
  `book_id` int NOT NULL COMMENT 'Reference to branch library book',
  `student_id` int NOT NULL COMMENT 'Student requesting the book',
  `requested_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','approved','rejected','completed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending' COMMENT 'pending=awaiting admin, approved=admin approved, rejected=admin rejected, completed=book handed over',
  `approved_by_admin` int DEFAULT NULL COMMENT 'Admin who approved/rejected the request',
  `approved_at` datetime DEFAULT NULL COMMENT 'When admin approved/rejected',
  `rejection_reason` text COLLATE utf8mb4_unicode_ci COMMENT 'Reason if admin rejected the request',
  `confirmed_handed_over` tinyint(1) DEFAULT '0' COMMENT 'TRUE when admin confirms student received book',
  `confirmed_by_admin` int DEFAULT NULL COMMENT 'Admin who confirmed handover',
  `confirmed_at` datetime DEFAULT NULL COMMENT 'When admin confirmed handover'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tracks branch book requests with admin approval workflow';

--
-- Dumping data for table `branch_book_requests`
--

INSERT INTO `branch_book_requests` (`id`, `book_id`, `student_id`, `requested_at`, `status`, `approved_by_admin`, `approved_at`, `rejection_reason`, `confirmed_handed_over`, `confirmed_by_admin`, `confirmed_at`) VALUES
(3, 1, 8, '2026-02-19 05:37:39', 'pending', NULL, NULL, NULL, 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `jwt_blacklist`
--

CREATE TABLE `jwt_blacklist` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL COMMENT 'NULL if admin logout',
  `token_jti` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'JWT ID (jti claim)',
  `token_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Hash of token for verification',
  `blacklisted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL COMMENT 'When token expires (from exp claim)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Blacklisted JWT tokens for revocation';

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
  `profile_image` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'URL or path to user profile image',
  `approval_status` enum('pending','approved','rejected') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `approved_by` int DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejection_reason` text COLLATE utf8mb4_general_ci,
  `registered_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `password_hash` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'bcrypt hashed password (new system)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `firstName`, `lastName`, `username`, `email`, `usn`, `password`, `profile_image`, `approval_status`, `approved_by`, `approved_at`, `rejection_reason`, `registered_at`, `password_hash`) VALUES
(8, 'User', '', 'dan', 'dan@temp.com', '014', '123', 'https://res.cloudinary.com/dszrb7ckt/image/upload/v1761220858/library/profile-images/profile-8-1761220857911-758978364.jpg', 'approved', NULL, NULL, NULL, '2025-10-23 18:17:51', NULL),
(26, 'Dhanush', 'm', 'dha2032k', 'dhanush1818@fmail.com', '4SN23AD014', '718718', NULL, 'approved', 5, '2025-10-24 08:56:37', NULL, '2025-10-24 08:55:21', NULL),
(28, 'Akshay ', 'Gowda', 'akshay_gowda', 'akshaygowda3333@gmail.com', '4SN23AD004', 'Akshay99452', NULL, 'approved', 5, '2025-10-25 02:19:24', NULL, '2025-10-25 00:46:21', NULL),
(54, 'dan', 'm', 'dani', 'dani@gmail.com', '4SN23AD001', '718718', NULL, 'approved', 5, '2025-11-23 12:07:00', NULL, '2025-11-02 05:39:54', NULL),
(56, 'Dhruva', 'Kumar', 'dk', 'dhruva718718m@gmail.com', '4SN23AD036', '718718', NULL, 'approved', 5, '2025-11-22 11:58:56', NULL, '2025-11-19 09:19:58', NULL),
(58, 'Dhanush', 'M', 'chammu', 'dhanush718718m@gmail.com', '4SN23AD055', 'qwertyuiop', NULL, 'approved', 5, '2025-11-24 04:29:30', NULL, '2025-11-24 04:28:52', NULL),
(59, 'Likhith ', 'Rai', 'likki', 'shralikki2024@gmail.com', '4SN23AD002', 'jackbhau1233', NULL, 'pending', NULL, NULL, NULL, '2025-11-25 08:22:13', NULL),
(62, 'Mahesh', 'Bahubali', 'kattappa', 'kattappa@gmail.com', '4SN23AD005', 'checkitup@ok', NULL, 'pending', NULL, NULL, NULL, '2025-11-25 14:26:43', NULL),
(63, 'rakshith', 'kumar', 'rakshith', 'alice@farm.com', '4SN23AD051', 'rasksuth', NULL, 'pending', NULL, NULL, NULL, '2025-11-25 14:54:12', NULL),
(64, 'Sanjay', 'Kamath', 'sanjuuu', 'sanjaykamath07@gmail.com', '4SN22AD111', 'password@123', NULL, 'pending', NULL, NULL, NULL, '2025-11-26 10:22:37', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `auth_audit_log`
--
ALTER TABLE `auth_audit_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_timestamp` (`timestamp`);

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
-- Indexes for table `branch_book_requests`
--
ALTER TABLE `branch_book_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `approved_by_admin` (`approved_by_admin`),
  ADD KEY `confirmed_by_admin` (`confirmed_by_admin`),
  ADD KEY `idx_book_id` (`book_id`),
  ADD KEY `idx_student_id` (`student_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_requested_at` (`requested_at`);

--
-- Indexes for table `jwt_blacklist`
--
ALTER TABLE `jwt_blacklist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_jti` (`token_jti`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_expires_at` (`expires_at`);

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
  ADD UNIQUE KEY `usn` (`usn`),
  ADD KEY `idx_approval_status` (`approval_status`),
  ADD KEY `idx_registered_at` (`registered_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `auth_audit_log`
--
ALTER TABLE `auth_audit_log`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=309;

--
-- AUTO_INCREMENT for table `book_requests`
--
ALTER TABLE `book_requests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `borrowed_books`
--
ALTER TABLE `borrowed_books`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `branch_book_requests`
--
ALTER TABLE `branch_book_requests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `jwt_blacklist`
--
ALTER TABLE `jwt_blacklist`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `selling_books`
--
ALTER TABLE `selling_books`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `used_books_marketplace`
--
ALTER TABLE `used_books_marketplace`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

-- --------------------------------------------------------

--
-- Structure for view `admin_pending_branch_requests`
--
DROP TABLE IF EXISTS `admin_pending_branch_requests`;

CREATE ALGORITHM=UNDEFINED DEFINER=`u9vwnxvk2ljksy3a`@`%` SQL SECURITY DEFINER VIEW `admin_pending_branch_requests`  AS SELECT `br`.`id` AS `request_id`, `br`.`book_id` AS `book_id`, `br`.`student_id` AS `student_id`, `br`.`requested_at` AS `requested_at`, `br`.`status` AS `status`, `br`.`approved_by_admin` AS `approved_by_admin`, `br`.`approved_at` AS `approved_at`, `br`.`confirmed_handed_over` AS `confirmed_handed_over`, `b`.`title` AS `title`, `b`.`author` AS `author`, `b`.`acc_no` AS `acc_no`, `b`.`book_format` AS `book_format`, `b`.`type` AS `type`, `b`.`status` AS `book_status`, `u`.`username` AS `student_username`, `u`.`firstName` AS `student_first_name`, `u`.`lastName` AS `student_last_name`, `u`.`email` AS `student_email`, `u`.`usn` AS `student_usn` FROM ((`branch_book_requests` `br` join `books` `b` on((`br`.`book_id` = `b`.`id`))) join `users` `u` on((`br`.`student_id` = `u`.`id`))) WHERE (`br`.`status` in ('pending','approved')) ORDER BY `br`.`requested_at` ASC ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `auth_audit_log`
--
ALTER TABLE `auth_audit_log`
  ADD CONSTRAINT `auth_audit_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

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
-- Constraints for table `branch_book_requests`
--
ALTER TABLE `branch_book_requests`
  ADD CONSTRAINT `branch_book_requests_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `branch_book_requests_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `branch_book_requests_ibfk_3` FOREIGN KEY (`approved_by_admin`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `branch_book_requests_ibfk_4` FOREIGN KEY (`confirmed_by_admin`) REFERENCES `admins` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `jwt_blacklist`
--
ALTER TABLE `jwt_blacklist`
  ADD CONSTRAINT `jwt_blacklist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

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
