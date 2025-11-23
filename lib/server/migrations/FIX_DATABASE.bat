@echo off
REM ===================================================================
REM COMPLETE DATABASE FIX
REM ===================================================================
REM This script will:
REM 1. Remove incorrect admin verification from marketplace books
REM 2. Apply correct branch book request workflow
REM ===================================================================

echo ===================================================================
echo DATABASE FIX SCRIPT
echo ===================================================================
echo.
echo This will:
echo 1. Remove admin verification from marketplace books (book_requests)
echo 2. Create proper branch book request workflow (branch_book_requests)
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul

REM Set MySQL path
set MYSQL_PATH=C:\xampp\mysql\bin\mysql.exe
set DB_NAME=library
set DB_USER=root
set DB_PASS=

echo.
echo Checking MySQL connection...
%MYSQL_PATH% -u %DB_USER% -p%DB_PASS% -e "SELECT 'MySQL Connected!' AS Status;" 2>nul
if errorlevel 1 (
    echo.
    echo ===================================================================
    echo ERROR: Cannot connect to MySQL!
    echo ===================================================================
    echo Please make sure XAMPP MySQL is running.
    echo Start it from XAMPP Control Panel.
    echo ===================================================================
    pause
    exit /b 1
)

echo.
echo ===================================================================
echo Applying database fix...
echo ===================================================================
echo.

%MYSQL_PATH% -u %DB_USER% -p%DB_PASS% %DB_NAME% < FIX_DATABASE.sql

if errorlevel 1 (
    echo.
    echo ===================================================================
    echo ERROR: Database fix failed!
    echo ===================================================================
    echo Please check the error messages above.
    echo ===================================================================
    pause
    exit /b 1
)

echo.
echo ===================================================================
echo SUCCESS! Database has been fixed.
echo ===================================================================
echo.
pause
