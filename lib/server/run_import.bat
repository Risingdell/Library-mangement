@echo off
REM ============================================
REM Library Management System - Data Import Script
REM ============================================
REM
REM Purpose: Import real books from Excel files to Clever Cloud database
REM Preserves: Users and Admin accounts
REM Clears: Test book data
REM
REM Usage: Double-click this file OR run: run_import.bat
REM ============================================

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║        LIBRARY MANAGEMENT SYSTEM - DATA IMPORT             ║
echo ║              Clever Cloud Database                         ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo ❌ ERROR: node_modules not found!
    echo.
    echo Installing dependencies...
    echo Please wait - this may take a minute...
    echo.
    call npm install
    if errorlevel 1 (
        echo ❌ npm install failed
        pause
        exit /b 1
    )
)

REM Check if xlsx is installed
npm list xlsx >nul 2>&1
if errorlevel 1 (
    echo ⚠️  xlsx not found. Installing...
    call npm install xlsx
    if errorlevel 1 (
        echo ❌ Failed to install xlsx
        pause
        exit /b 1
    )
)

echo ✅ Prerequisites verified
echo.

REM Run the import script
echo 🚀 Starting data import...
echo.

set NODE_ENV=production
node scripts/import_real_books.js

REM Check the result
if errorlevel 1 (
    echo.
    echo ❌ Import failed!
    echo Please check the error messages above.
    pause
    exit /b 1
) else (
    echo.
    echo ✅ Import completed successfully!
    echo.
    echo Next steps:
    echo   1. Deploy backend to Render.com
    echo   2. Deploy frontend to Vercel.com
    echo   3. Test the live system
    echo.
)

pause
