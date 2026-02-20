# Quick Start - Testing JWT Flow

**TL;DR** - Test the JWT authentication in 5 minutes

---

## Step 1: Start Backend (Terminal 1)

```bash
cd c:/Users/Dell/Desktop/LIB/Library-mangement/lib/server
npm start
```

**Wait for**: `Server running on port 5000`

---

## Step 2: Start Frontend (Terminal 2)

```bash
cd c:/Users/Dell/Desktop/LIB/Library-mangement/lib
npm run dev
```

**Wait for**: `Local: http://localhost:5173/`

---

## Step 3: Test Admin Login (Browser)

1. Open: `http://localhost:5173/admin-login`
2. Enter:
   - Username: `admin`
   - Password: `admin@123`
3. Click "Login to Dashboard"
4. **Expected**: Redirect to dashboard after ~5 second loading animation

---

## Step 4: Verify JWT is Working

**In Browser DevTools (F12)**:

### Check tokens are stored
1. Open **Application > Storage > Local Storage > http://localhost:5173**
2. Should see:
   - `token` (long string starting with `eyJ`)
   - `refreshToken` (long string starting with `eyJ`)

### Check Authorization header is sent
1. Open **Network** tab
2. Click on any dashboard tab
3. Look for any API request (e.g., `/api/admin/members`)
4. Click on the request
5. Go to **Headers** section
6. Should see: `Authorization: Bearer eyJ...`

---

## Step 5: Test Logout

1. Click **Logout** button (bottom of sidebar)
2. **Expected**: Redirect to admin login page
3. Check DevTools **Local Storage**:
   - `token` key should be **gone**
   - `refreshToken` key should be **gone**

---

## Step 6: Test Re-login

1. Login again with same credentials
2. Should get new tokens
3. Dashboard should work

---

## If Anything Fails

### "401 Unauthorized" on login
```bash
# Check admin exists in database
mysql -u [user] -p -h [host] [db] -e "SELECT * FROM admins WHERE username='admin';"
```

### "CORS errors" in console
- Check DevTools Network tab
- Verify Authorization header is present
- If not, jwtService might not be initialized

### "Stuck on loading"
- Check browser console (F12) for errors
- Check if backend is still running
- Look for "Failed to fetch" errors

### "Tokens not appearing"
- Check browser console for JavaScript errors
- Check if login returned 200 or 401
- Try clearing browser cache (Ctrl+Shift+Delete)

---

## Quick Curl Tests (Optional)

### Test 1: Admin Login
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin@123"}'
```

Should return:
```json
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "refreshToken": "eyJ...",
    "admin": {...}
  }
}
```

### Test 2: Protected Endpoint
```bash
TOKEN="[copy token from Test 1]"

curl -X GET http://localhost:5000/api/admin/me \
  -H "Authorization: Bearer $TOKEN"
```

Should return:
```json
{
  "id": 1,
  "username": "admin",
  "name": "Administrator"
}
```

---

## Success Criteria

✅ All of these should be true:

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Admin login works with credentials
- [ ] Redirects to dashboard after login
- [ ] localStorage has token and refreshToken
- [ ] API requests show Authorization header
- [ ] Dashboard displays admin profile
- [ ] Can click tabs and load data
- [ ] Logout button clears tokens
- [ ] Can't access dashboard after logout
- [ ] Can login again successfully

---

## What to Check in Code

If something doesn't work, verify these files were updated:

### Frontend Changes
- ✅ `lib/src/services/jwtService.js` exists
- ✅ `lib/src/Pages/AdminLogin.jsx` imports jwtService
- ✅ `lib/src/Pages/AdminDashboard.jsx` has NO `withCredentials: true`
- ✅ `lib/src/main.jsx` calls `jwtService.setupInterceptor()`

### Backend Changes
- ✅ `lib/server/index.js` has `/refresh-token` endpoint
- ✅ Imports include `generateAdminToken` and `verifyRefreshToken`

---

## Next Steps After Testing

If everything works:
1. Review `TESTING_JWT_FLOW.md` for comprehensive testing
2. Test user registration and login flow
3. Deploy to production (Vercel + Render)
4. Test production deployment
5. Monitor logs for any issues

---

## Common Issues Quick Fix

| Issue | Quick Fix |
|-------|-----------|
| 401 login error | Run: `node lib/server/scripts/insertTestAdmin.js` |
| Tokens not stored | Check browser console for errors |
| No Authorization header | Restart frontend: `npm run dev` |
| CORS errors | Verify `withCredentials: true` removed |
| Dashboard stuck loading | Check backend is running on 5000 |

---

**Time to complete**: 5-10 minutes

**Ready?** Start with Step 1! 🚀
