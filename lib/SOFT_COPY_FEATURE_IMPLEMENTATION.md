# Soft Copy / Hard Copy Feature Implementation - Used Books Marketplace

## Overview
This document describes the implementation of the soft copy (digital) and hard copy (physical) book feature for the Used Books Marketplace module.

## Features Implemented

### 1. Database Schema Updates
**File:** `server/migrations/004_add_book_format_and_file_upload.sql`

Added the following columns to `used_books_marketplace` table:
- `book_format` - ENUM('hard_copy', 'soft_copy') - Distinguishes between physical and digital books
- `file_path` - VARCHAR(500) - Path to uploaded digital file
- `file_original_name` - VARCHAR(255) - Original filename
- `file_size` - INT - File size in bytes
- `uploaded_by` - ENUM('user', 'admin') - Tracks who uploaded the book
- `download_count` - INT - Number of downloads (for analytics)

### 2. Backend API Updates
**File:** `server/routes/sellBooks.js`

#### New Features:
1. **Multer Configuration for Book Files**
   - Accepts: PDF, DOCX, DOC, EPUB, TXT
   - Max file size: 50MB
   - Storage location: `server/uploads/book-files/`
   - Filename format: `book-{userId}-{timestamp}-{random}.{ext}`

2. **Updated POST /sell-book Endpoint**
   - Now accepts `book_format` parameter (hard_copy or soft_copy)
   - Handles file upload via multipart/form-data
   - Validates soft copy requires file upload
   - Stores file metadata in database
   - Automatic file cleanup on database errors

3. **New GET /sell-books/download/:id Endpoint**
   - Downloads soft copy books
   - Increments download counter
   - Validates user authentication
   - Returns file with original filename

### 3. User Interface Updates

#### Student Sell Form
**File:** `src/Pages/MainPage.jsx`

**New Features:**
- Book Format selection dropdown (Hard Copy / Soft Copy)
- Conditional file upload input (shows only for soft copy)
- Dynamic form validation
- File type validation (.pdf, .doc, .docx, .epub, .txt)
- Maximum 50MB file size
- Visual feedback for format selection
- Updated submit button text based on format

#### Marketplace Display
**File:** `src/Pages/MainPage.jsx`

**New Features:**
- Book format badge (📖 Hard Copy / 📥 Soft Copy)
- Download button for soft copy books
- Download count display
- Admin badge for admin-uploaded books
- Disabled request/buy flow for soft copies
- Hidden contact info for soft copies (not needed)
- Separate action buttons based on book format

**Visual Design:**
- Green download button for soft copies
- Format badges with distinct colors:
  - Hard Copy: Blue (#dbeafe)
  - Soft Copy: Green (#d1fae5)
- Download info panel with stats
- Admin badge in yellow

### 4. Admin Panel Features
**File:** `src/Pages/AdminDashboard.jsx`

**New Admin Tab:** "Upload Soft Copy Books to Marketplace"

Features:
- Dedicated form for uploading soft copy books
- File upload with validation
- All standard book metadata fields
- Auto-marked as uploaded_by='admin'
- Success/error feedback
- Books appear in marketplace with "Uploaded by Admin" badge

### 5. Styling Updates
**File:** `src/Pages/MainPage.css`

New styles added:
- `.btn-download` - Green download button with hover effects
- `.book-format` - Format badge styling
- `.format-hard_copy` - Blue badge for physical books
- `.format-soft_copy` - Green badge for digital books
- `.download-info` - Download statistics panel
- `.download-count` - Download counter display
- `.admin-badge` - Yellow badge for admin uploads

## User Workflows

### For Students - Selling a Soft Copy Book:
1. Navigate to "Sell Book" tab
2. Select "Soft Copy" from Book Format dropdown
3. Upload digital file (PDF, DOCX, etc.)
4. Fill in book details (title, author, description, etc.)
5. Click "Upload Soft Copy"
6. Book appears in marketplace with download button

### For Students - Selling a Hard Copy Book:
1. Navigate to "Sell Book" tab
2. Select "Hard Copy" from Book Format dropdown
3. Fill in book details and contact number
4. Click "Submit for Selling"
5. Book appears in marketplace with request/buy flow

### For Students - Downloading a Soft Copy:
1. Browse marketplace
2. Find soft copy book (marked with 📥 Soft Copy badge)
3. Click "📥 Download" button
4. File downloads instantly
5. No request/buy process needed

### For Admin - Uploading Soft Copy Books:
1. Login to Admin Dashboard
2. Navigate to "Upload Soft Copy Books" tab
3. Upload digital file
4. Fill in book metadata
5. Click "📥 Upload to Marketplace"
6. Book appears to all users with "Uploaded by Admin" badge

## Key Differences: Soft Copy vs Hard Copy

| Feature | Soft Copy (Digital) | Hard Copy (Physical) |
|---------|-------------------|---------------------|
| Format Badge | 📥 Soft Copy (Green) | 📖 Hard Copy (Blue) |
| Action Button | Download | Request/Buy |
| Contact Info | Hidden | Visible with WhatsApp link |
| Status | Always "Available" | Available → Requested → Sold → Completed |
| Request Queue | Not applicable | Full queue system |
| Transaction Flow | Instant download | Request → Seller Approval → Delivery → Confirmation |
| Analytics | Download count | Request count |
| Uploaded By | User or Admin | User only |

## File Upload Security

1. **File Type Validation:**
   - Frontend: HTML accept attribute
   - Backend: MIME type checking
   - Allowed: PDF, DOCX, DOC, EPUB, TXT

2. **File Size Limits:**
   - Maximum: 50MB
   - Validated on both frontend and backend

3. **Storage:**
   - Local: `server/uploads/book-files/`
   - Unique filenames prevent overwrites
   - Files served statically via Express

4. **Access Control:**
   - Download endpoint requires authentication
   - Users must be logged in to download

## Database Migration Steps

To apply the database changes, run the migration file:

```sql
-- Run this SQL file on your database
source server/migrations/004_add_book_format_and_file_upload.sql
```

Or manually execute the SQL commands in your MySQL client.

## API Endpoints Summary

### Updated Endpoints:
- **POST /sell-book**
  - Now accepts multipart/form-data
  - New params: `book_format`, `bookFile`
  - Handles file upload for soft copies

### New Endpoints:
- **GET /sell-books/download/:id**
  - Downloads soft copy book files
  - Increments download counter
  - Returns file with original filename

## Testing Checklist

### User Features:
- [ ] Upload soft copy book as student
- [ ] Upload hard copy book as student
- [ ] Download soft copy from marketplace
- [ ] Request hard copy from marketplace
- [ ] View download count
- [ ] See format badges correctly
- [ ] Contact info hidden for soft copies
- [ ] Contact info visible for hard copies

### Admin Features:
- [ ] Upload soft copy as admin
- [ ] Admin badge appears on admin-uploaded books
- [ ] All students can see and download admin books

### Edge Cases:
- [ ] Try uploading wrong file type (rejected)
- [ ] Try uploading file > 50MB (rejected)
- [ ] Try creating soft copy without file (rejected)
- [ ] Download counter increments correctly
- [ ] File cleanup on database error

## Benefits

1. **For Students:**
   - Instant access to digital study materials
   - No physical exchange needed
   - Available 24/7
   - Multiple students can access simultaneously

2. **For Admin:**
   - Centralized distribution of official materials
   - Analytics on popular resources
   - No physical stock management

3. **For Platform:**
   - Clear separation of digital and physical workflows
   - Reduced transaction complexity for digital items
   - Better user experience with appropriate UX for each type

## Future Enhancements

Potential improvements:
1. File preview before download
2. Multiple file formats (videos, presentations)
3. File version management
4. Category/tag filtering
5. Rating/review system for soft copies
6. Download history for users
7. Cloud storage integration (AWS S3, Cloudinary)
8. Compression for large files
9. Virus scanning for uploaded files
10. Bookmark/favorite soft copies

## Notes

- All existing hard copy books default to `book_format='hard_copy'`
- Soft copies are always in "available" status
- Admin contact is set to "admin@library.com" for admin uploads
- Download button opens in new tab for better UX
- File paths are relative to server root for portability
