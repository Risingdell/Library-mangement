// // const express = require("express");
// // const cors = require("cors");
// // const bodyParser = require("body-parser");
// // const db = require("./db"); // Your MySQL connection

// // const app = express();

// // // Replace line 7-8:
// // const PORT = process.env.PORT || 5000;

// // // Replace the bottom app.listen block (last 3 lines):

// // const session = require('express-session');

// // app.use(express.json());
// // app.use(require('cookie-parser')());

// // app.use(session({
// //   secret: 'library-secret-key', // change this to a strong secret in production
// //   resave: false,
// //   saveUninitialized: false,
// //   cookie: {
// //     secure: false, // Set to true in production if using HTTPS
// //     httpOnly: true,
// //     sameSite: 'lax'
// //   }
// // }));


// // app.use(bodyParser.json());
// // const corsOptions = {
// //   origin: function (origin, callback) {
// //     const allowedOrigins = process.env.NODE_ENV === 'production'
// //       ? [process.env.FRONTEND_URL || 'https://your-app.netlify.app']
// //       : ['http://localhost:5173', 'http://localhost:3000'];

// //     if (!origin || allowedOrigins.indexOf(origin) !== -1) {
// //       callback(null, true);
// //     } else {
// //       callback(new Error('Not allowed by CORS'));
// //     }
// //   },
// //   credentials: true,
// //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// //   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
// // };

// // app.use(cors(corsOptions));
// // // Register Route
// // app.post("/register", (req, res) => {
// //   const { username,email, password, firstName, lastName, usn } = req.body;

// //   if (!username ||!email|| !password || !firstName || !lastName || !usn) {
// //     return res.status(400).json({ message: "All fields are required" });
// //   }

// //   const sql = `
// //     INSERT INTO users (username,email, password, firstName, lastName, usn)
// //     VALUES (?,?, ?, ?, ?, ?)
// //   `;

// //   db.query(sql, [username,email, password, firstName, lastName, usn], (err, result) => {
// //     if (err) {
// //       console.error("Error inserting user:", err);
// //       return res.status(500).json({ message: "Registration failed" });
// //     }
// //     res.status(200).json({ message: "User registered successfully!" });
// //   });
// // });


// // app.get("/users", (req, res) => {
// //   db.query("SELECT * FROM users", (err, result) => {
// //     if (err) return res.status(500).send(err);
// //     res.send(result);
// //   });
// // });
// // app.post("/login", (req, res) => {
// //   const { username, password } = req.body;
// //   db.query(
// //     "SELECT * FROM users WHERE username = ? AND password = ?",
// //     [username, password],
// //     (err, result) => {
// //       if (err) {
// //         res.status(500).send({ message: "Server error" });
// //       } else if (result.length > 0) {
// //         // ✅ Store user in session
// //         const user = result[0];
// //         req.session.user = {
// //           id: user.id,
// //         username: user.username,
// //         email: user.email,
// //         usn: user.usn,
// //         firstName: user.firstName,
// //         lastName: user.lastName
// //         };
// //         res.status(200).send(result[0]); // Send user data
// //       } else {
// //         res.status(401).send({ message: "Invalid username or password" });
// //       }
// //     }
// //   );
// // });
// // /*app.get('/books', (req, res) => {
// //   db.query('SELECT * FROM books WHERE status = "available"', (err, result) => {
// //     if (err) return res.status(500).json(err);
// //     res.json(result);
// //   });
// // });*/

// // app.get('/books', (req, res) => {
// //   const sql = 'SELECT * FROM books WHERE status = "available"';
// //   db.query(sql, (err, result) => {
// //     if (err) return res.status(500).json(err);
// //     res.json(result);
// //   });
// // });









// // app.get('/api/user/profile', (req, res) => {
// //   console.log("SESSION:", req.session.user);
// //   if (req.session.user) {
// //     res.json(req.session.user); // ✅ Send the logged-in user
// //   } else {
// //     res.status(401).json({ message: "Unauthorized" });
// //   }
// // });


// // /*app.post('/borrow', (req, res) => {
// //   const { book_id } = req.body;

// //   if (!req.session.user) {
// //     return res.status(401).json({ message: "Unauthorized" });
// //   }

// //   const user_id = req.session.user.id;
// //   const borrowDate = new Date();
// //   const expiryDate = new Date();
// //   expiryDate.setDate(borrowDate.getDate() + 20);

// //   // Insert into borrowed_books
// //   const insertSql = `
// //     INSERT INTO borrowed_books (user_id, book_id, borrow_date, expiry_date)
// //     VALUES (?, ?, ?, ?)
// //   `;

// //   db.query(insertSql, [user_id, book_id, borrowDate, expiryDate], (err, result) => {
// //     if (err) {
// //       console.error('Error borrowing book:', err);
// //       return res.status(500).json({ message: 'Failed to borrow book' });
// //     }

// //     // Optional: Remove from books (if marking as unavailable instead, add a status column)
// //     const deleteSql = 'DELETE FROM books WHERE id = ?';
// //     db.query(deleteSql, [book_id], (err) => {
// //       if (err) {
// //         console.error('Error removing book:', err);
// //         return res.status(500).json({ message: 'Book borrowed, but failed to update availability' });
// //       }

// //       res.status(200).json({ message: 'Book borrowed successfully' });
// //     });
// //   });
// // });*/

// // /*app.post('/borrow', (req, res) => {
// //   const { book_id } = req.body;

// //   if (!req.session.user) {
// //     return res.status(401).json({ message: "Unauthorized" });
// //   }

// //   const user_id = req.session.user.id;
// //   const borrowDate = new Date();
// //   const expiryDate = new Date();
// //   expiryDate.setDate(borrowDate.getDate() + 20);

// //   const insertSql = `
// //     INSERT INTO borrowed_books (user_id, book_id, borrow_date, expiry_date)
// //     VALUES (?, ?, ?, ?)
// //   `;

// //   db.query(insertSql, [user_id, book_id, borrowDate, expiryDate], (err) => {
// //     if (err) {
// //       console.error('Error borrowing book:', err);
// //       return res.status(500).json({ message: 'Failed to borrow book' });
// //     }

// //     const updateSql = 'UPDATE books SET status = ? WHERE id = ?';
// //     db.query(updateSql, ['borrowed', book_id], (err) => {
// //       if (err) {
// //         console.error('Error updating book status:', err);
// //         return res.status(500).json({ message: 'Borrowed but status update failed' });
// //       }

// //       res.status(200).json({ message: 'Book borrowed successfully' });
// //     });
// //   });
// // });*/

// // app.post('/borrow', (req, res) => {
// //   const { book_id } = req.body;

// //   if (!req.session.user) {
// //     return res.status(401).json({ message: "Unauthorized" });
// //   }

// //   const user_id = req.session.user.id;
// //   const borrowDate = new Date();
// //   const expiryDate = new Date();
// //   expiryDate.setDate(borrowDate.getDate() + 20);

// //   // First, check the current status from books
// //   const statusQuery = 'SELECT status FROM books WHERE id = ?';

// //   db.query(statusQuery, [book_id], (err, result) => {
// //     if (err || result.length === 0) {
// //       return res.status(500).json({ message: "Failed to fetch book status" });
// //     }

// //     const bookStatus = result[0].status;

// //     if (bookStatus !== 'available') {
// //       return res.status(400).json({ message: "Book is already borrowed" });
// //     }

// //     const insertSql = `
// //       INSERT INTO borrowed_books (user_id, book_id, borrow_date, expiry_date, status)
// //       VALUES (?, ?, ?, ?, ?)
// //     `;

// //     db.query(insertSql, [user_id, book_id, borrowDate, expiryDate, bookStatus], (err) => {
// //       if (err) {
// //         console.error('Error borrowing book:', err);
// //         return res.status(500).json({ message: 'Failed to borrow book' });
// //       }

// //       const updateSql = 'UPDATE books SET status = ? WHERE id = ?';
// //       db.query(updateSql, ['borrowed', book_id], (err) => {
// //         if (err) {
// //           console.error('Error updating book status:', err);
// //           return res.status(500).json({ message: 'Borrowed but status update failed' });
// //         }

// //         res.status(200).json({ message: 'Book borrowed successfully' });
// //       });
// //     });
// //   });
// // });




// // app.get('/borrowed-books', (req, res) => {
// //   if (!req.session.user) {
// //     return res.status(401).json({ message: "Unauthorized" });
// //   }

// //   const sql = `
// // SELECT b.*, bb.borrow_date, bb.expiry_date, b.status FROM borrowed_books bb JOIN books b ON bb.book_id = b.id WHERE bb.user_id = ? AND ( bb.status = 'available' OR bb.returned_at IS NULL );
// //   `;

// //   db.query(sql, [req.session.user.id], (err, result) => {
// //     if (err) {
// //       console.error("❌ Error fetching borrowed books:", err); // Log exact SQL error
// //       return res.status(500).json({ message: "Failed to fetch borrowed books" });
// //     }

// //     res.status(200).json(result);
// //   });
// // });

// // /* borrow hidtory update
// // app.post('/return-book', (req, res) => {
// //   const { book_id } = req.body;

// //   if (!req.session.user) {
// //     return res.status(401).json({ message: "Unauthorized" });
// //   }

// //   const user_id = req.session.user.id;

// //   const deleteSql = 'DELETE FROM borrowed_books WHERE user_id = ? AND book_id = ?';
// //   const updateSql = 'UPDATE books SET status = "available" WHERE id = ?';

// //   db.query(deleteSql, [user_id, book_id], (err, result) => {
// //     if (err) {
// //       console.error("Error removing from borrowed_books:", err);
// //       return res.status(500).json({ message: "Failed to return book" });
// //     }

// //     db.query(updateSql, [book_id], (err2) => {
// //       if (err2) {
// //         console.error("Error updating book status:", err2);
// //         return res.status(500).json({ message: "Book removed, but status not updated" });
// //       }

// //       return res.status(200).json({ message: "Book submitted successfully!" });
// //     });
// //   });
// // });*/
// // app.post('/return-book', (req, res) => {
// //   const { book_id } = req.body;

// //   if (!req.session.user) {
// //     return res.status(401).json({ message: "Unauthorized" });
// //   }

// //   const user_id = req.session.user.id;

// //   // Logging for debugging
// //   console.log(`[RETURN] User ${user_id} is returning book ${book_id}`);

// //   // Check if the book is currently borrowed and not yet returned
// //   const checkBorrowSql = `
// //     SELECT * FROM borrowed_books
// //     WHERE user_id = ? AND book_id = ? AND returned_at IS NULL
// //   `;

// //   db.query(checkBorrowSql, [user_id, book_id], (checkErr, checkResult) => {
// //     if (checkErr) {
// //       console.error("Error checking borrowed_books:", checkErr);
// //       return res.status(500).json({ message: "Error checking borrow status" });
// //     }

// //     if (checkResult.length === 0) {
// //       return res.status(400).json({ message: "Book already returned or not borrowed" });
// //     }

// //     // ✅ Proceed to update `returned_at`
// //     const updateBorrowedSql = `
// //   UPDATE borrowed_books
// //   SET returned_at = NOW(), status = 'returned'
// //   WHERE user_id = ? AND book_id = ? AND returned_at IS NULL
// // `;


// //     const updateBookStatusSql = `
// //       UPDATE books
// //       SET status = 'available'
// //       WHERE id = ?
// //     `;

// //     db.query(updateBorrowedSql, [user_id, book_id], (err, result) => {
// //       if (err) {
// //         console.error("Error updating borrowed_books:", err);
// //         return res.status(500).json({ message: "Failed to submit book" });
// //       }

// //       db.query(updateBookStatusSql, [book_id], (err2) => {
// //         if (err2) {
// //           console.error("Error updating book status:", err2);
// //           return res.status(500).json({ message: "Status update failed" });
// //         }

// //         console.log(`[RETURN] Book ${book_id} returned by user ${user_id}`);
// //         return res.status(200).json({ message: "Book submitted successfully!" });
// //       });
// //     });
// //   });
// // });



// // app.get('/borrow-history', (req, res) => {
// //   if (!req.session.user) {
// //     return res.status(401).json({ message: "Unauthorized" });
// //   }

// //   const sql = `
// //     SELECT b.title, b.author, b.acc_no, bb.borrow_date, bb.expiry_date, bb.returned_at
// //     FROM borrowed_books bb
// //     JOIN books b ON bb.book_id = b.id
// //     WHERE bb.user_id = ? AND bb.returned_at IS NOT NULL
// //     ORDER BY bb.returned_at DESC
// //   `;

// //   db.query(sql, [req.session.user.id], (err, result) => {
// //     if (err) {
// //       console.error("Error fetching borrow history:", err);
// //       return res.status(500).json({ message: "Failed to fetch history" });
// //     }
// //     res.status(200).json(result);
// //   });
// // });

// // app.post('/sell-book', (req, res) => {
// //   if (!req.session.user) {
// //     return res.status(401).json({ message: "Unauthorized" });
// //   }

// //   const { type, title, author, description, acc_no, contact, status } = req.body;
// //   const sql = `
// //     INSERT INTO used_books_marketplace
// //     (seller_id, type, title, author, description, acc_no, contact, status)
// //     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
// //   `;
// //   db.query(sql, [req.session.user.id, type, title, author, description, acc_no, contact, status], (err, result) => {
// //     if (err) {
// //       console.error("Error inserting book:", err);
// //       return res.status(500).json({ message: "Failed to sell book" });
// //     }
// //     res.status(201).json({ message: "Book listed successfully" });
// //   });
// // });




// // // Mount the router
// // // In your main server file (e.g., app.js or server.js)
// // const sellBooksRoutes = require('./routes/sellBooks'); // ✅ correct path
// // app.use('/', sellBooksRoutes); // ✅ must use '/api'



// // // Admin login route
// // app.post('/api/admin/login', (req, res) => {
// //   const { username, password } = req.body;
// //   const sql = 'SELECT * FROM admins WHERE username = ? AND password = ?';
// //   db.query(sql, [username, password], (err, results) => {
// //     if (err) return res.status(500).json({ message: 'DB error' });
// //     if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

// //     req.session.admin = {
// //       id: results[0].id,
// //       username: results[0].username,
// //       name: results[0].name
// //     };
// //     res.json({ message: 'Login successful', admin: req.session.admin });
// //   });
// // });

// // // Get logged-in admin
// // app.get('/api/admin/me', (req, res) => {
// //   if (!req.session.admin) {
// //     return res.status(401).json({ message: 'Unauthorized' });
// //   }
// //   res.json(req.session.admin);
// // });

// // // Admin logout
// // app.post('/api/admin/logout', (req, res) => {
// //   req.session.destroy();
// //   res.json({ message: 'Logged out' });
// // });


// // const adminRoutes = require('./routes/admin');
// // app.use('/api/admin', adminRoutes);




// // app.listen(PORT, '0.0.0.0', () => {
// //   console.log(`🚀 Server running on port ${PORT}`);
// //   console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
// // });
// const express = require('express');
// const session = require('express-session');
// const cors = require('cors');
// const db = require('./db'); // Ensure db.js is in the same folder
// require('dotenv').config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//   credentials: true
// }));
// app.use(express.json());
// app.use(session({
//   secret: process.env.SESSION_SECRET || 'library-secret-key-development',
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: process.env.NODE_ENV === 'production',
//     httpOnly: true,
//     sameSite: 'lax'
//   }
// }));

// // Routes
// const sellBooksRoutes = require('./routes/sellBooks');
// const adminRoutes = require('./routes/admin');

// app.use('/api/sell', sellBooksRoutes);      // For book selling related routes
// app.use('/api/admin', adminRoutes);         // For admin login/logout routes

// // Start server
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
// });

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const compression = require('compression');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db'); // Ensure db.js is in the same folder
const { sendRegistrationConfirmationEmail } = require('./utils/emailService');
const { hashPassword, comparePassword, validatePasswordStrength } = require('./utils/password');
const { generateUserToken, generateAdminToken, generateRefreshToken, verifyRefreshToken } = require('./utils/jwt');
const { authenticateUser, authenticateAdmin } = require('./middleware/jwtAuthMiddleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable response compression for faster responses
app.use(compression());

// Configure Cloudinary for production or local storage for development
let upload;

if (process.env.NODE_ENV === 'production' && process.env.CLOUDINARY_CLOUD_NAME) {
  // Production: Use Cloudinary
  const cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'library/profile-images',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
      public_id: (req, file) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        return 'profile-' + req.session.user.id + '-' + uniqueSuffix;
      }
    }
  });

  upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  });
} else {
  // Development: Use local storage
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(__dirname, 'uploads', 'profile-images');
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, 'profile-' + req.session.user.id + '-' + uniqueSuffix + ext);
    }
  });

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  };

  upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  });
}

// --- Middleware ---
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // Allow all Vercel deployment URLs (*.vercel.app)
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // Check against allowed origins list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Reject all others
    console.log('❌ CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));
app.use(express.json());

// Configure session with Redis for production
let sessionConfig = {
  secret: process.env.SESSION_SECRET || 'library-secret-key-development',
  resave: false, // Changed to false - only save when modified
  saveUninitialized: false, // Don't create session until something stored
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true for HTTPS (required for sameSite: 'none')
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-origin in production
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/' // Cookie available for all paths
  },
  name: 'connect.sid', // Use default express-session cookie name
  proxy: process.env.NODE_ENV === 'production', // Trust proxy in production (Render/Vercel)
  rolling: true // Reset cookie expiry on each response
};

// Add Redis store in production if REDIS_URL is available
// Temporarily disabled due to Upstash connection issues
// Using in-memory sessions for now - sessions will reset on server restart
if (false && process.env.REDIS_URL) {
  const { RedisStore } = require('connect-redis');
  const { createClient } = require('redis');

  // Convert redis:// to rediss:// for TLS if needed
  let redisUrl = process.env.REDIS_URL;
  if (redisUrl.startsWith('redis://') && !redisUrl.startsWith('rediss://')) {
    redisUrl = redisUrl.replace('redis://', 'rediss://');
    console.log('🔒 Converting Redis URL to use TLS (rediss://)');
  }

  const redisClient = createClient({
    url: redisUrl,
    socket: {
      tls: true,
      rejectUnauthorized: false // Required for some Redis providers like Upstash
    }
  });

  redisClient.connect().catch(err => {
    console.error('❌ Redis connection failed:', err);
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis connected for session storage');
  });

  redisClient.on('error', (err) => {
    console.error('❌ Redis client error:', err);
  });

  sessionConfig.store = new RedisStore({ client: redisClient });
} else {
  console.log('⚠️  Using in-memory session store');
  console.log('⚠️  Sessions will be lost if server restarts');
  console.log('⚠️  This is OK for testing, but not ideal for production');
}

app.use(session(sessionConfig));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ---
const sellBooksRoutes = require('./routes/sellBooks');
const adminRoutes = require('./routes/admin');
const branchBooksRoutes = require('./routes/branchBooks');
const adminBranchBooksRoutes = require('./routes/adminBranchBooks');

app.use('/', sellBooksRoutes);              // Book selling routes (mounted at root)
app.use('/api/admin', adminRoutes);         // Admin login, borrowed books, add book, etc.
app.use('/api/branch-books', branchBooksRoutes);  // Student branch book requests
app.use('/api/admin/branch-books', adminBranchBooksRoutes);  // Admin branch book management

// --- User Authentication Routes ---
app.post("/register", async (req, res) => {
  const { username, password, usn, firstName, lastName, email } = req.body;

  if (!username || !password || !usn || !firstName || !lastName || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Validate USN format: 4SN23AD000 (4 digits, SN, 2 digits, AD, 3 digits)
  // Pattern: [1-4]SN[0-9]{2}AD[0-9]{3}
  const usnPattern = /^[1-4]SN\d{2}AD\d{3}$/;

  if (!usnPattern.test(usn)) {
    return res.status(400).json({
      message: "Invalid USN format. USN must follow the pattern: 4SN23AD000 (Example: 1SN23AD001, 4SN23AD999)",
      invalidField: "usn"
    });
  }

  // Additional check: USN must contain "AD" for successful registration
  if (!usn.includes("AD")) {
    return res.status(400).json({
      message: "Invalid USN. Only students with 'AD' department code can register.",
      invalidField: "usn"
    });
  }

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({
      message: "Password does not meet requirements",
      errors: passwordValidation.errors,
      invalidField: "password"
    });
  }

  try {
    // Hash password using bcrypt
    const hashedPassword = await hashPassword(password);

    const sql = `
      INSERT INTO users (username, password_hash, usn, firstName, lastName, email, approval_status, registered_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
    `;

    db.query(sql, [username, hashedPassword, usn, firstName, lastName, email], (err, result) => {
      if (err) {
        console.error("Error inserting user:", err);

        // Check for duplicate entry errors
        if (err.code === 'ER_DUP_ENTRY') {
          if (err.message.includes('username')) {
            return res.status(400).json({ message: "Username already exists" });
          } else if (err.message.includes('usn')) {
            return res.status(400).json({ message: "USN already registered" });
          } else if (err.message.includes('email')) {
            return res.status(400).json({ message: "Email already registered" });
          }
        }

        return res.status(500).json({ message: "Registration failed" });
      }

      // Send registration confirmation email (non-blocking - don't fail registration if email fails)
      if (email) {
        sendRegistrationConfirmationEmail(email, {
          firstName: firstName,
          lastName: lastName,
          username: username
        }).catch(emailError => {
          // Log email error but don't fail the registration
          console.error('Confirmation email failed for user:', username, emailError);
        });
      }

      res.status(201).json({
        success: true,
        message: "Registration successful! Please check your email for confirmation. Please wait approximately 2 hours for admin approval.",
        status: "pending",
        waitTime: "2 hours"
      });
    });

  } catch (err) {
    console.error("Password hashing error:", err);
    return res.status(500).json({ message: "Registration failed" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required",
      code: "MISSING_CREDENTIALS"
    });
  }

  try {
    const sql = `
      SELECT id, username, firstName, lastName, email, usn, password_hash, approval_status, rejection_reason
      FROM users
      WHERE username = ?
    `;

    db.query(sql, [username], async (err, results) => {
      if (err) {
        console.error("Database error during login:", err);
        return res.status(500).json({ message: "Login failed" });
      }

      // User not found
      if (results.length === 0) {
        return res.status(401).json({
          message: "Invalid credentials",
          code: "INVALID_CREDENTIALS"
        });
      }

      const user = results[0];

      // Check approval status BEFORE validating password
      if (user.approval_status === 'pending') {
        return res.status(403).json({
          message: "Your account is pending admin approval. Please wait for approval to access the system.",
          status: "pending"
        });
      }

      if (user.approval_status === 'rejected') {
        const reason = user.rejection_reason || "No reason provided";
        return res.status(403).json({
          message: `Your registration has been rejected. Reason: ${reason}`,
          status: "rejected",
          reason: reason
        });
      }

      // Only allow approved users to login
      if (user.approval_status !== 'approved') {
        return res.status(403).json({
          message: "Your account status does not allow login. Please contact the administrator.",
          status: user.approval_status
        });
      }

      // Validate password using bcrypt
      try {
        // Support both password_hash (new) and password (legacy) columns
        const passwordHash = user.password_hash || user.password;
        const passwordMatch = await comparePassword(password, passwordHash);

        if (!passwordMatch) {
          return res.status(401).json({
            message: "Invalid credentials",
            code: "INVALID_CREDENTIALS"
          });
        }

        // Password correct - generate tokens
        const token = generateUserToken({
          id: user.id,
          username: user.username,
          email: user.email
        });

        const refreshToken = generateRefreshToken(user.id, 'user');

        console.log("✅ User logged in:", username, "Token generated");

        // Return response with tokens
        res.status(200).json({
          success: true,
          message: "Login successful",
          data: {
            token: token,
            refreshToken: refreshToken,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              usn: user.usn
            }
          }
        });

      } catch (err) {
        console.error("Password comparison error:", err);
        return res.status(500).json({ message: "Login failed" });
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
});

// Refresh token endpoint - allows frontend to get new access token when expired
app.post("/refresh-token", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is required" });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Generate new access token
    if (decoded.type === 'user') {
      // Fetch user data from database
      const sql = `SELECT id, username, email FROM users WHERE id = ?`;
      db.query(sql, [decoded.userId], (err, results) => {
        if (err || results.length === 0) {
          return res.status(401).json({ message: "User not found" });
        }

        const user = results[0];
        const token = generateUserToken({
          id: user.id,
          username: user.username,
          email: user.email
        });

        res.json({
          success: true,
          token: token,
          refreshToken: generateRefreshToken(user.id, 'user')
        });
      });
    } else if (decoded.type === 'admin') {
      // Fetch admin data from database
      const sql = `SELECT id, username, name FROM admins WHERE id = ?`;
      db.query(sql, [decoded.userId], (err, results) => {
        if (err || results.length === 0) {
          return res.status(401).json({ message: "Admin not found" });
        }

        const admin = results[0];
        const token = generateAdminToken({
          id: admin.id,
          username: admin.username,
          name: admin.name
        });

        res.json({
          success: true,
          token: token,
          refreshToken: generateRefreshToken(admin.id, 'admin')
        });
      });
    } else {
      res.status(401).json({ message: "Invalid token type" });
    }
  } catch (err) {
    console.error("Token refresh error:", err);
    res.status(401).json({ message: "Token refresh failed" });
  }
});

app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
});

app.get('/books', (req, res) => {
  const sql = 'SELECT * FROM books WHERE status = "available"';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.get('/api/user/profile', authenticateUser, (req, res) => {
  // authenticateUser middleware already verified JWT and populated req.user
  // Fetch user data including profile image from database
  const sql = 'SELECT id, username, usn, profile_image FROM users WHERE id = ?';
  db.query(sql, [req.user.id], (err, result) => {
    if (err || result.length === 0) {
      return res.status(500).json({ message: "Error fetching user profile" });
    }

    const user = result[0];

    // Handle both Cloudinary URLs and local paths
    let profileImageUrl = null;
    if (user.profile_image) {
      if (user.profile_image.startsWith('http')) {
        // Cloudinary URL - use as-is
        profileImageUrl = user.profile_image;
      } else {
        // Local path - prepend backend URL
        const baseURL = process.env.BACKEND_URL || 'http://localhost:5000';
        profileImageUrl = baseURL + user.profile_image;
      }
    }

    const profileData = {
      id: user.id,
      username: user.username,
      usn: user.usn,
      profileImage: profileImageUrl
    };

    res.json(profileData);
  });
});

// Upload profile image endpoint
app.post('/api/user/upload-profile-image', authenticateUser, upload.single('profileImage'), (req, res) => {
  // authenticateUser middleware already verified JWT and populated req.user

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const userId = req.user.id;

  // Determine image path based on storage type
  let imagePath, imageUrl;

  if (process.env.NODE_ENV === 'production' && process.env.CLOUDINARY_CLOUD_NAME) {
    // Cloudinary: req.file.path contains the full Cloudinary URL
    imagePath = req.file.path; // Full Cloudinary URL
    imageUrl = req.file.path;  // Return as-is
  } else {
    // Local storage: construct path from filename
    imagePath = `/uploads/profile-images/${req.file.filename}`;
    const baseURL = process.env.BACKEND_URL || 'http://localhost:5000';
    imageUrl = baseURL + imagePath;
  }

  // Get old image path to delete it (only for local storage)
  const getOldImageSql = 'SELECT profile_image FROM users WHERE id = ?';
  db.query(getOldImageSql, [userId], (err, result) => {
    if (!err && result.length > 0 && result[0].profile_image) {
      // Only delete local files (not Cloudinary URLs)
      if (!result[0].profile_image.startsWith('http')) {
        const oldImagePath = path.join(__dirname, result[0].profile_image);
        // Delete old image file if it exists
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      // Note: For Cloudinary, old images remain in cloud (manual cleanup needed)
    }

    // Update database with new image path
    const updateSql = 'UPDATE users SET profile_image = ? WHERE id = ?';
    db.query(updateSql, [imagePath, userId], (err, result) => {
      if (err) {
        console.error('Error updating profile image:', err);
        return res.status(500).json({ message: "Failed to update profile image" });
      }

      res.status(200).json({
        message: "Profile image uploaded successfully",
        imageUrl: imageUrl
      });
    });
  });
});

// Remove profile image endpoint
app.delete('/api/user/remove-profile-image', authenticateUser, (req, res) => {
  // authenticateUser middleware already verified JWT and populated req.user
  const userId = req.user.id;

  // Get current image path to delete the file
  const getImageSql = 'SELECT profile_image FROM users WHERE id = ?';
  db.query(getImageSql, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching profile image" });
    }

    if (result.length > 0 && result[0].profile_image) {
      // Only delete local files (not Cloudinary URLs)
      if (!result[0].profile_image.startsWith('http')) {
        const imagePath = path.join(__dirname, result[0].profile_image);

        // Delete the image file if it exists
        if (fs.existsSync(imagePath)) {
          try {
            fs.unlinkSync(imagePath);
          } catch (deleteErr) {
            console.error('Error deleting image file:', deleteErr);
          }
        }
      }
      // Note: Cloudinary images are not automatically deleted (manual cleanup needed)
    }

    // Update database to set profile_image to NULL
    const updateSql = 'UPDATE users SET profile_image = NULL WHERE id = ?';
    db.query(updateSql, [userId], (err, result) => {
      if (err) {
        console.error('Error removing profile image:', err);
        return res.status(500).json({ message: "Failed to remove profile image" });
      }

      res.status(200).json({ message: "Profile image removed successfully" });
    });
  });
});

// Logout endpoint (JWT-based - client handles token removal)
app.post('/api/user/logout', authenticateUser, (req, res) => {
  // For JWT, logout is handled on client side (token removed from localStorage)
  // Server just confirms logout
  res.json({ success: true, message: "Logged out successfully" });
});

app.post('/borrow', (req, res) => {
  const { book_id } = req.body;

  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user_id = req.session.user.id;
  const borrowDate = new Date();
  const expiryDate = new Date();
  expiryDate.setDate(borrowDate.getDate() + 20);

  // First check if this user already has 2 active borrowed books
  const checkBorrowLimitSql = `
    SELECT COUNT(*) as active_count FROM borrowed_books
    WHERE user_id = ? AND return_status = 'active'
  `;

  db.query(checkBorrowLimitSql, [user_id], (err, limitResult) => {
    if (err) {
      console.error('Error checking borrow limit:', err);
      return res.status(500).json({ message: 'Failed to process request' });
    }

    const activeCount = limitResult[0].active_count;

    if (activeCount >= 2) {
      return res.status(400).json({
        message: 'You have reached the borrowing limit of 2 books. Please return a book before borrowing another one.',
        currentlyBorrowed: activeCount,
        limit: 2
      });
    }

    // Check if this user already has an active borrow for this specific book
    const checkDuplicateSql = `
      SELECT id FROM borrowed_books
      WHERE user_id = ? AND book_id = ? AND return_status = 'active'
    `;

    db.query(checkDuplicateSql, [user_id, book_id], (err, duplicateResult) => {
      if (err) {
        console.error('Error checking for duplicate borrow:', err);
        return res.status(500).json({ message: 'Failed to process request' });
      }

      if (duplicateResult.length > 0) {
        return res.status(400).json({ message: 'You have already borrowed this book' });
      }

      const statusQuery = 'SELECT status FROM books WHERE id = ?';

    db.query(statusQuery, [book_id], (err, result) => {
      if (err || result.length === 0) {
        return res.status(500).json({ message: "Failed to fetch book status" });
      }

      const bookStatus = result[0].status;

      if (bookStatus !== 'available') {
        return res.status(400).json({ message: "Book is already borrowed" });
      }

      const insertSql = `
        INSERT INTO borrowed_books (user_id, book_id, borrow_date, expiry_date, return_status, status)
        VALUES (?, ?, ?, ?, 'active', 'borrowed')
      `;

      db.query(insertSql, [user_id, book_id, borrowDate, expiryDate], (err) => {
        if (err) {
          console.error('Error borrowing book:', err);
          return res.status(500).json({ message: 'Failed to borrow book' });
        }

        const updateSql = 'UPDATE books SET status = ? WHERE id = ?';
        db.query(updateSql, ['borrowed', book_id], (err) => {
          if (err) {
            console.error('Error updating book status:', err);
            return res.status(500).json({ message: 'Borrowed but status update failed' });
          }

          res.status(200).json({ message: 'Book borrowed successfully' });
        });
      });
    });
    });
  });
});

app.get('/borrowed-books', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const sql = `
    SELECT
      b.*,
      bb.borrow_date,
      bb.expiry_date,
      bb.return_status,
      bb.returned_at,
      bb.rejection_reason,
      b.status as book_status
    FROM borrowed_books bb
    JOIN books b ON bb.book_id = b.id
    WHERE bb.user_id = ?
    AND (bb.return_status IN ('active', 'pending_return', 'rejected') OR bb.returned_at IS NULL)
    ORDER BY
      CASE bb.return_status
        WHEN 'active' THEN 1
        WHEN 'rejected' THEN 2
        WHEN 'pending_return' THEN 3
      END,
      bb.borrow_date DESC
  `;

  db.query(sql, [req.session.user.id], (err, result) => {
    if (err) {
      console.error("Error fetching borrowed books:", err);
      return res.status(500).json({ message: "Failed to fetch borrowed books" });
    }

    res.status(200).json(result);
  });
});

app.post('/return-book', (req, res) => {
  const { book_id } = req.body;

  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user_id = req.session.user.id;

  // Check if book is currently borrowed and not yet submitted for return
  const checkBorrowSql = `
    SELECT * FROM borrowed_books
    WHERE user_id = ? AND book_id = ?
    AND returned_at IS NULL
    AND (return_status = 'active' OR return_status IS NULL)
  `;

  db.query(checkBorrowSql, [user_id, book_id], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Error checking borrowed_books:", checkErr);
      return res.status(500).json({ message: "Error checking borrow status" });
    }

    if (checkResult.length === 0) {
      return res.status(400).json({ message: "Book already submitted for return or not borrowed" });
    }

    // Update status to pending_return instead of immediately making it available
    const updateBorrowedSql = `
      UPDATE borrowed_books
      SET returned_at = NOW(),
          return_status = 'pending_return',
          status = 'pending_return'
      WHERE user_id = ? AND book_id = ? AND returned_at IS NULL
    `;

    // Update book status to pending_return (not available yet)
    const updateBookStatusSql = `
      UPDATE books
      SET status = 'pending_return'
      WHERE id = ?
    `;

    db.query(updateBorrowedSql, [user_id, book_id], (err, result) => {
      if (err) {
        console.error("Error updating borrowed_books:", err);
        return res.status(500).json({ message: "Failed to submit book" });
      }

      db.query(updateBookStatusSql, [book_id], (err2) => {
        if (err2) {
          console.error("Error updating book status:", err2);
          return res.status(500).json({ message: "Status update failed" });
        }

        res.status(200).json({ message: "Book return request submitted! Waiting for admin approval." });
      });
    });
  });
});

app.get('/borrow-history', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const sql = `
    SELECT b.title, b.author, b.acc_no, bb.borrow_date, bb.expiry_date, bb.returned_at
    FROM borrowed_books bb
    JOIN books b ON bb.book_id = b.id
    WHERE bb.user_id = ? AND bb.returned_at IS NOT NULL
    ORDER BY bb.returned_at DESC
  `;

  db.query(sql, [req.session.user.id], (err, result) => {
    if (err) {
      console.error("Error fetching borrow history:", err);
      return res.status(500).json({ message: "Failed to fetch history" });
    }
    res.status(200).json(result);
  });
});

// --- Health Check Endpoint ---
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// --- Session Debug Endpoint (remove in production) ---
app.get('/api/debug/session', (req, res) => {
  res.json({
    hasSession: !!req.session,
    sessionID: req.sessionID,
    hasUser: !!req.session?.user,
    user: req.session?.user || null,
    cookies: req.headers.cookie || 'no cookies',
    origin: req.headers.origin
  });
});

// --- Start server ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Health check: http://0.0.0.0:${PORT}/health`);
});