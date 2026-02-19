#!/bin/bash

################################################################################
# Library Management System - Data Import Script
#
# Purpose: Import real books from Excel files to Clever Cloud database
# Preserves: Users and Admin accounts
# Clears: Test book data
#
# Usage: chmod +x run_import.sh && ./run_import.sh
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m' # No Color

# Print colored output
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║        LIBRARY MANAGEMENT SYSTEM - DATA IMPORT             ║${NC}"
    echo -e "${BLUE}║              Clever Cloud Database                         ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Main execution
print_header

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed!"
    exit 1
fi

print_success "Node.js and npm are installed"
echo

# Check node_modules
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found"
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install dependencies"
        exit 1
    fi
fi

# Check if xlsx is installed
if ! npm list xlsx &> /dev/null; then
    print_warning "xlsx package not found"
    echo "Installing xlsx..."
    npm install xlsx
    if [ $? -ne 0 ]; then
        print_error "Failed to install xlsx"
        exit 1
    fi
fi

print_success "All prerequisites verified"
echo

# Run the import script
echo "🚀 Starting data import..."
echo

export NODE_ENV=production
node scripts/import_real_books.js

# Check result
if [ $? -eq 0 ]; then
    echo
    print_success "Import completed successfully!"
    echo
    echo "Next steps:"
    echo "  1. Deploy backend to Render.com"
    echo "  2. Deploy frontend to Vercel.com"
    echo "  3. Test the live system"
    echo
else
    print_error "Import failed!"
    echo "Please check the error messages above."
    exit 1
fi
