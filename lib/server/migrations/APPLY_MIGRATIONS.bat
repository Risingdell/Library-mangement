@echo off
REM ===================================================================
REM Migration Application Script
REM ===================================================================
REM This script applies all necessary migrations to set up the database
REM for the corrected marketplace and branch book workflows
REM ===================================================================

echo ===================================================================
echo Applying Database Migrations for Library Management System
echo ===================================================================
echo.

REM Set MySQL path (adjust if your XAMPP is installed elsewhere)
set MYSQL_PATH=C:\xampp\mysql\bin\mysql.exe
set DB_NAME=library
set DB_USER=root
set DB_PASS=

echo Checking MySQL connection...
%MYSQL_PATH% -u %DB_USER% -p%DB_PASS% -e "SELECT 'MySQL Connected Successfully!' AS Status;" 2>nul
if errorlevel 1 (
    echo.
    echo ===================================================================
    echo ERROR: Cannot connect to MySQL!
    echo ===================================================================
    echo Please make sure:
    echo 1. XAMPP MySQL is running (start it from XAMPP Control Panel^)
    echo 2. MySQL path is correct (currently set to: %MYSQL_PATH%^)
    echo 3. Database credentials are correct (user: %DB_USER%^)
    echo ===================================================================
    pause
    exit /b 1
)

echo.
echo ===================================================================
echo Step 1: Applying marketplace_request_queue.sql
echo (Queue system for marketplace books - NO admin involvement^)
echo ===================================================================
%MYSQL_PATH% -u %DB_USER% -p%DB_PASS% %DB_NAME% < marketplace_request_queue.sql
if errorlevel 1 (
    echo ERROR: Failed to apply marketplace_request_queue.sql
    pause
    exit /b 1
)
echo SUCCESS: Marketplace queue system created!

echo.
echo ===================================================================
echo Step 2: Applying 005_add_branch_book_request_workflow.sql
echo (Admin approval workflow for branch books ONLY^)
echo ===================================================================
%MYSQL_PATH% -u %DB_USER% -p%DB_PASS% %DB_NAME% < 005_add_branch_book_request_workflow.sql
if errorlevel 1 (
    echo ERROR: Failed to apply 005_add_branch_book_request_workflow.sql
    pause
    exit /b 1
)
echo SUCCESS: Branch book request workflow created!

echo.
echo ===================================================================
echo Migration Complete!
echo ===================================================================
echo.
echo Database Structure Summary:
echo ---------------------------
echo 1. MARKETPLACE BOOKS (Student to Student^):
echo    - Table: used_books_marketplace
echo    - Queue: book_requests
echo    - NO admin involvement
echo    - First-come-first-serve queue system
echo.
echo 2. BRANCH BOOKS (Library owned^):
echo    - Table: books
echo    - Requests: branch_book_requests
echo    - REQUIRES admin approval and handover confirmation
echo.
echo ===================================================================

REM Show created tables
echo.
echo Verifying created tables...
echo.
%MYSQL_PATH% -u %DB_USER% -p%DB_PASS% %DB_NAME% -e "SHOW TABLES LIKE '%%request%%';"

echo.
echo ===================================================================
echo All migrations applied successfully!
echo ===================================================================
pause
