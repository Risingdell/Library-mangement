# JWT Authentication - Complete Testing Guide

**Status**: Ready for end-to-end testing

This guide walks you through testing the complete JWT authentication flow.

---

## Prerequisites

✅ Database migration completed
✅ Admin user created with credentials: `username: admin, password: admin@123`
✅ Backend server code updated with JWT endpoints
✅ Frontend code updated with JWT service and token handling
✅ All syntax verified

---

## Part 1: Start Backend Server

### Step 1: Start the backend

```bash
cd lib/server
npm start
```

**Expected Output**:
```
✅ Connected to database
🔐 JWT authentication configured
🚀 Server running on port 5000
```

### Step 2: Verify backend is running

Open a terminal and test:

```bash
curl -X GET http://localhost:5000/books
```

**Expected**: Should return JSON array of books (or empty array)

---

## Part 2: Test Admin Login (Manual)

### Using curl to test the login endpoint

```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin@123"}'
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": 1,
      "username": "admin",
      "name": "Administrator"
    }
  }
}
```

**If you get 401**:
- Check admin credentials are correct
- Check database has admin user (query: `SELECT * FROM admins WHERE username = 'admin'`)
- Check password_hash column is populated

---

## Part 3: Test Protected Endpoint with JWT

### Using the token from login

Copy the `token` value from the login response above, then:

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  # Paste the token here

curl -X GET http://localhost:5000/api/admin/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response** (200 OK):
```json
{
  "id": 1,
  "username": "admin",
  "name": "Administrator"
}
```

**If you get 401**:
- Token might be invalid or expired
- Check Authorization header format is exactly: `Bearer <token>`
- Try logging in again to get fresh token

---

## Part 4: Test Token Refresh Endpoint

### Get a refresh token and use it to get a new access token

From the login response above, take the `refreshToken` value:

```bash
REFRESH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  # Paste the refreshToken here

curl -X POST http://localhost:5000/refresh-token \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}"
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  // NEW token
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**If you get 401**:
- Refresh token might be expired (7 day expiry)
- Try logging in again to get fresh refresh token

---

## Part 5: Test Frontend Login (Browser)

### Start frontend dev server

In a NEW terminal:

```bash
cd lib
npm run dev
```

**Expected Output**:
```
  VITE v7.0.6  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Navigate to admin login

1. Open browser: `http://localhost:5173/admin-login`
2. Enter credentials:
   - Username: `admin`
   - Password: `admin@123`
3. Click "Login to Dashboard"

**Expected Behavior**:
- Loading animation appears for ~5 seconds
- Browser redirects to `http://localhost:5173/admin-dashboard`
- Admin profile displays (name: Administrator)

### Verify tokens are stored

1. Open browser DevTools (F12)
2. Go to **Application > Storage > Local Storage > http://localhost:5173**
3. Should see two keys:
   - `token`: JWT access token
   - `refreshToken`: JWT refresh token

**If tokens don't appear**:
- Check browser console for errors
- Check if login returned 401 error
- Verify backend is running

### Verify JWT is sent in requests

1. Open DevTools **Network** tab
2. Click on any dashboard tab (e.g., "Members")
3. Look for API request (e.g., `/api/admin/members`)
4. Click on the request
5. Go to **Headers** tab
6. Look for: `Authorization: Bearer eyJ...`

**Expected**: Authorization header should be present on all API requests

---

## Part 6: Test Logout

### Click logout button

1. In admin dashboard, click the **Logout** button (bottom sidebar)
2. Redirects to `/admin-login`

### Verify tokens are cleared

1. Open DevTools **Application > Local Storage**
2. Keys `token` and `refreshToken` should be **gone** (cleared)
3. Trying to go back to `/admin-dashboard` should redirect to login

---

## Part 7: Test User Login (Optional)

### Register a user

1. Go to `http://localhost:5173/register`
2. Fill in the form with valid credentials:
   - Username: `testuser`
   - First Name: `Test`
   - Last Name: `User`
   - Email: `test@example.com`
   - USN: `12345`
   - Password: `Test@1234` (must have uppercase, lowercase, number, special char)
3. Click Register

### Login as user

1. Go to `http://localhost:5173/login`
2. Enter:
   - Username: `testuser`
   - Password: `Test@1234`
3. Click "Log in"

**Expected**:
- If registration pending: "Your account is pending admin approval" message
- If approved: Redirect to `/main` (main page)

### Approve user as admin

1. Go back to admin dashboard
2. Click "Registration Requests"
3. Find the pending user
4. Click "✅ Approve"
5. Now user can login

---

## Part 8: Test Cross-Origin (Production)

When deployed to Vercel (frontend) and Render (backend):

### Frontend on Vercel makes request to Render backend

1. Frontend makes API call to `https://backend.render.com/api/endpoint`
2. JWT is sent in Authorization header
3. Request completes successfully (no CORS cookie errors)

**Why this works**:
- Old method used cookies (CORS restricted)
- New method uses JWT in Authorization header (CORS allowed)

---

## Troubleshooting Guide

### Problem: "401 Unauthorized" on login

**Possible Causes & Fixes**:

1. **Wrong credentials**
   - Verify username is exactly: `admin`
   - Verify password is exactly: `admin@123`

2. **Admin user missing from database**
   - Run: `node lib/server/scripts/insertTestAdmin.js`
   - Check database: `SELECT * FROM admins;`

3. **Password hash doesn't match**
   - Run: `node lib/server/scripts/updateAdminPassword.js`
   - Then try login again

4. **Backend not running**
   - Make sure `npm start` is running in lib/server
   - Check for database connection errors

---

### Problem: "Stuck on loading" during login

**Possible Causes & Fixes**:

1. **Backend is down**
   - Check if `npm start` is still running
   - Check for error messages in server terminal

2. **Database connection failed**
   - Verify .env file has database credentials
   - Run: `mysql -u user -p -h host db_name -e "DESCRIBE admins;"`

3. **Frontend not connecting to backend**
   - Check VITE_API_URL environment variable
   - Should be set to: `http://localhost:5000` (dev) or Render URL (prod)

4. **Long loading is normal**
   - Dashboard has 5-second loading animation
   - This is expected

---

### Problem: "Token not included in requests"

**Possible Causes & Fixes**:

1. **JWT service not initialized**
   - Check lib/src/main.jsx has: `jwtService.setupInterceptor()`
   - Restart dev server: `npm run dev`

2. **Interceptor not working**
   - Open DevTools Console
   - Check for JavaScript errors
   - Look for messages from interceptor

3. **Token cleared unexpectedly**
   - Check localStorage in DevTools
   - Token might have been cleared by logout
   - Login again to get new token

---

### Problem: "CORS errors still appearing"

**Possible Causes & Fixes**:

1. **Some requests still use `withCredentials: true`**
   - Check AdminDashboard.jsx for any remaining `withCredentials: true`
   - Should be completely removed

2. **Backend CORS configuration**
   - Check lib/server/index.js has correct CORS setup
   - Should allow Authorization header: `allowedHeaders: ['Content-Type', 'Authorization']`

3. **Preflight requests failing**
   - Browser sends OPTIONS request before actual request
   - Check backend responds to OPTIONS requests

---

### Problem: "Token expired" (Advanced)

**Expected Behavior**:
- Access token expires after 24 hours
- Frontend automatically calls `/refresh-token`
- Gets new token and retries request
- User sees no error

**To test token expiry**:

1. Login and get token
2. Open DevTools > Application > Local Storage
3. Manually delete the `token` key (keep refreshToken)
4. Try to load a page
5. Should see 401, then refresh token should work
6. Page loads successfully

---

## Test Checklist

### ✅ Backend Tests

- [ ] Backend server starts without errors
- [ ] Database connection successful
- [ ] Admin user exists in database
- [ ] `curl` login request returns JWT token
- [ ] `curl` request with JWT token succeeds
- [ ] `/refresh-token` endpoint works
- [ ] Protected endpoints require token (401 without token)

### ✅ Frontend Tests (Development)

- [ ] Frontend dev server starts
- [ ] Admin login page loads
- [ ] Login with correct credentials succeeds
- [ ] Tokens appear in localStorage
- [ ] Admin dashboard loads
- [ ] API requests have Authorization header
- [ ] Logout clears tokens
- [ ] Cannot access dashboard after logout

### ✅ Frontend Tests (Production - Vercel)

- [ ] Admin login on Vercel succeeds
- [ ] Gets token from Render backend
- [ ] Dashboard loads with data
- [ ] All API calls work (no CORS errors)
- [ ] Tokens persist in localStorage
- [ ] Logout works

---

## Quick Test Script

Save as `test-jwt.sh`:

```bash
#!/bin/bash

API="http://localhost:5000"
ADMIN_USER="admin"
ADMIN_PASS="admin@123"

echo "🔄 Testing JWT Authentication..."
echo ""

# Test 1: Admin Login
echo "1️⃣ Admin Login"
RESPONSE=$(curl -s -X POST $API/api/admin/login \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$ADMIN_USER\", \"password\": \"$ADMIN_PASS\"}")

TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
REFRESH=$(echo $RESPONSE | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  echo "Response: $RESPONSE"
  exit 1
fi

echo "✅ Login successful"
echo "Token: ${TOKEN:0:50}..."
echo ""

# Test 2: Protected Endpoint
echo "2️⃣ Protected Endpoint with JWT"
RESULT=$(curl -s -X GET $API/api/admin/me \
  -H "Authorization: Bearer $TOKEN")

if echo $RESULT | grep -q '"id"'; then
  echo "✅ Protected endpoint accessible"
  echo "Response: $RESULT"
else
  echo "❌ Protected endpoint failed"
  echo "Response: $RESULT"
fi
echo ""

# Test 3: Refresh Token
echo "3️⃣ Token Refresh"
REFRESH_RESPONSE=$(curl -s -X POST $API/refresh-token \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH\"}")

NEW_TOKEN=$(echo $REFRESH_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$NEW_TOKEN" ]; then
  echo "❌ Token refresh failed"
  echo "Response: $REFRESH_RESPONSE"
else
  echo "✅ Token refreshed successfully"
  echo "New Token: ${NEW_TOKEN:0:50}..."
fi

echo ""
echo "✅ All tests passed!"
```

Run it:
```bash
chmod +x test-jwt.sh
./test-jwt.sh
```

---

## Summary

You now have a complete JWT authentication system:

1. ✅ **User/Admin Login** → Returns JWT token
2. ✅ **Token Storage** → Persists in localStorage
3. ✅ **Token Usage** → Automatically added to requests via interceptor
4. ✅ **Token Refresh** → Automatic refresh on expiry
5. ✅ **Protected Endpoints** → Require valid JWT
6. ✅ **Cross-Origin** → JWT in header solves CORS issues
7. ✅ **Logout** → Clears tokens completely

**Next Steps**:
1. Run the tests in this guide
2. Fix any issues found
3. Deploy to production (Vercel frontend, Render backend)
4. Test production deployment

---

## Production Checklist

Before deploying to production:

- [ ] .env file has strong JWT_SECRET (not the default)
- [ ] FRONTEND_URL in .env matches production Vercel URL
- [ ] API_URL in frontend environment variables matches Render backend URL
- [ ] Database credentials are correct
- [ ] All plain-text passwords have been hashed (run migratePasswords.js)
- [ ] HTTPS is enforced (secure tokens)
- [ ] Token expiry times are set appropriately
- [ ] Logging is configured for monitoring

---

**Last Updated**: Phase 4 Implementation Complete
**Status**: Ready for Testing ✅
