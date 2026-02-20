# JWT Implementation - Next Steps Guide

**Status**: Core backend implementation complete. Ready for database migration and middleware application.

---

## 🎯 IMMEDIATE ACTION REQUIRED

### Step 1: Execute Database Migration (CRITICAL) ⚠️

Before testing any login functionality, run the database migration:

```bash
mysql -u u9vwnxvk2ljksy3a -p -h biuezvkp1ir5odbq6wju-mysql.services.clever-cloud.com < lib/server/migrations/006_migrate_to_jwt_auth.sql
```

**What this does**:
- Adds `password_hash` column to `users` table
- Adds `password_hash` column to `admins` table
- Creates `jwt_blacklist` table for token revocation
- Creates `auth_audit_log` table for login tracking
- Creates stored procedures for automatic cleanup

**Verification**:
```bash
# Check that password_hash column was added
mysql -u u9vwnxvk2ljksy3a -p -h biuezvkp1ir5odbq6wju-mysql.services.clever-cloud.com biuezvkp1ir5odbq6wju -e "DESCRIBE users;"
# Should show password_hash column with VARCHAR(255)
```

---

## 📋 Phase 3.4: Apply JWT Middleware (NEXT)

### Files to Update

**File 1: lib/server/index.js** (20+ endpoints)

Find all lines with `if (!req.session.user)` and replace pattern:

```javascript
// FIND THIS PATTERN:
app.post('/api/branch-books/request', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const user_id = req.session.user.id;
  // ... rest of endpoint code
});

// REPLACE WITH THIS PATTERN:
app.post('/api/branch-books/request', authenticateUser, (req, res) => {
  // Middleware already checked authentication, user is in req.user
  const user_id = req.user.id;
  // ... rest of endpoint code
});
```

**Add this import at the top** (if not already there):
```javascript
const { authenticateUser } = require('./middleware/jwtAuthMiddleware');
```

**Endpoints to update in index.js** (use grep to find):
```bash
grep -n "if (!req.session.user)" lib/server/index.js
```

---

**File 2: lib/server/routes/admin.js** (15+ endpoints)

Apply same pattern but for admin endpoints:

```javascript
// FIND THIS:
router.get('/borrowed-books', (req, res) => {
  if (!req.session.admin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  // ...
});

// REPLACE WITH:
router.get('/borrowed-books', authenticateAdmin, (req, res) => {
  // Middleware already checked, admin is in req.admin
  // ...
});
```

**Add this import** (if not already there):
```javascript
const { authenticateAdmin } = require('../middleware/jwtAuthMiddleware');
```

**Find admin endpoints**:
```bash
grep -n "if (!req.session.admin)" lib/server/routes/admin.js
```

---

**File 3: lib/server/routes/branchBooks.js** (5+ endpoints)

Similar pattern for user endpoints:
```javascript
const { authenticateUser } = require('../middleware/jwtAuthMiddleware');

// Apply authenticateUser middleware to all user-only endpoints
```

---

**File 4: lib/server/routes/adminBranchBooks.js** (5+ endpoints)

Similar pattern for admin endpoints:
```javascript
const { authenticateAdmin } = require('../middleware/jwtAuthMiddleware');

// Apply authenticateAdmin middleware to all admin-only endpoints
```

---

## ✅ How to Apply Middleware Systematically

1. **Count endpoints to update**:
   ```bash
   grep -c "if (!req.session" lib/server/index.js
   grep -c "if (!req.session" lib/server/routes/admin.js
   grep -c "if (!req.session" lib/server/routes/branchBooks.js
   grep -c "if (!req.session" lib/server/routes/adminBranchBooks.js
   ```

2. **For each file**:
   - Add import at top
   - For each endpoint:
     - Remove `if (!req.session.xxx)` check
     - Add middleware to route declaration
     - Replace session references with JWT references

3. **Test after each file**

---

## 📝 Local Testing After Middleware Application

### Test User Authentication
```bash
# 1. Get token
TOKEN=$(curl -s -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Test@1234"}' | jq -r '.data.token')

# 2. Use token to access protected endpoint
curl -X GET http://localhost:5000/api/branch-books/my-requests \
  -H "Authorization: Bearer $TOKEN"

# Should return data, not 401
```

### Test Admin Authentication
```bash
# 1. Get admin token
ADMIN_TOKEN=$(curl -s -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"AdminPass@123"}' | jq -r '.data.token')

# 2. Use token on admin endpoint
curl -X GET http://localhost:5000/api/admin/borrowed-books \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Should return data, not 401
```

---

## 🔄 Phase 4: Frontend Updates (After Phase 3.4)

Once middleware is applied, create frontend JWT service:

### 1. Create JWT Service (lib/src/services/jwtService.js)
See JWT_IMPLEMENTATION_PLAN.md section 4.1 for complete code

### 2. Update Login Component (lib/src/Pages/Login.jsx)
See JWT_IMPLEMENTATION_PLAN.md section 4.2 for complete code

### 3. Update Auth Context (lib/src/Context/AuthProvider.jsx)
See JWT_IMPLEMENTATION_PLAN.md section 4.4 for complete code

---

## 🧪 Testing Checklist After Middleware

- [ ] User login returns JWT token
- [ ] Admin login returns JWT token
- [ ] Token included in Authorization header on requests
- [ ] Protected endpoints accept JWT token
- [ ] Protected endpoints reject invalid tokens with 401
- [ ] Refresh token works correctly
- [ ] Token expiry is enforced
- [ ] Cross-origin requests work (Vercel → Render)
- [ ] User can borrow books (full flow test)
- [ ] Admin can view pending requests (full flow test)

---

## 🚀 Before Final Deployment

### 1. Migrate Existing Passwords
```bash
cd lib/server
node scripts/migratePasswords.js
```
This hashes all plain-text passwords in the database.

### 2. Run Full Test Suite
```bash
# Test user registration with password requirements
# Test user login
# Test admin login
# Test protected endpoints
# Test cross-origin from Vercel
```

### 3. Deploy to Render
```bash
git add .
git commit -m "Implement JWT authentication with bcrypt password hashing

- Implement JWT token generation and verification
- Add bcrypt password hashing with validation
- Update login endpoints to return JWT tokens
- Add JWT authentication middleware
- Update all protected endpoints to use JWT
- Add password strength requirements
- Add audit logging framework"

git push origin deploy-version
# Render will auto-deploy
```

### 4. Verify Production
- Test login on Vercel frontend
- Check tokens in Network tab
- Verify localStorage has token and refreshToken
- Test protected endpoints
- Monitor Render logs

---

## 📊 Progress Summary

| Component | Status | Files |
|-----------|--------|-------|
| JWT Utilities | ✅ Done | utils/jwt.js |
| Password Hashing | ✅ Done | utils/password.js |
| JWT Middleware | ✅ Done | middleware/jwtAuthMiddleware.js |
| User Login | ✅ Done | index.js |
| Admin Login | ✅ Done | routes/admin.js |
| User Register | ✅ Done | index.js |
| DB Migration | ✅ Ready | migrations/006_*.sql |
| Middleware Application | ⏳ TODO | 4 files, 45+ endpoints |
| Frontend Service | ⏳ TODO | services/jwtService.js |
| Frontend Components | ⏳ TODO | Pages/*.jsx |
| Password Migration | ⏳ TODO | scripts/migratePasswords.js |
| Testing | ⏳ TODO | |
| Deployment | ⏳ TODO | |

---

## 📚 Documentation Files

- **JWT_IMPLEMENTATION_PLAN.md** - Original comprehensive plan
- **JWT_IMPLEMENTATION_PROGRESS.md** - Progress tracker
- **JWT_CONVERSION_STATUS.md** - Current status report
- **PHASE3_IMPLEMENTATION_SUMMARY.md** - Phase 3 details
- **JWT_NEXT_STEPS.md** - This file

---

## 🆘 Troubleshooting

### "401 Unauthorized" after login
- Check database migration ran successfully
- Verify password_hash column exists
- Ensure JWT_SECRET is set in .env

### "Token verification failed"
- Check JWT_SECRET matches in .env
- Verify token format in Authorization header
- Token should be "Bearer <token>"

### "CORS errors still appearing"
- JWT removes cookie issues, but you may still need CORS header
- Check FRONTEND_URL in .env
- Verify axios doesn't use withCredentials

### "Password mismatch on login"
- If migrating from plain-text, run migratePasswords.js
- Legacy plain-text passwords still work until migrated
- Check password requirements (8 chars, mixed case, number, special)

---

## 💡 Key Points

1. **Database migration is CRITICAL** - Must run before testing login
2. **Middleware application is final backend step** - ~45 endpoints to update
3. **Frontend needs JWT service** - Stores and sends tokens automatically
4. **Legacy password support** - Old passwords still work until migrated
5. **Stateless authentication** - No session storage needed
6. **Cross-origin finally works** - JWT in header solves Vercel ↔ Render issue

---

## 📞 Quick Reference Commands

```bash
# Check database migration
mysql -u user -p -h host db_name -e "DESCRIBE users;" | grep password_hash

# Find endpoints to update
grep -rn "if (!req.session" lib/server/

# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Test login and get token
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}' | jq '.data.token'

# Use token on protected endpoint
curl -X GET http://localhost:5000/api/endpoint \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Migrate passwords
cd lib/server && node scripts/migratePasswords.js
```

---

**Status**: Ready to proceed with Phase 3.4 and Phase 4 ✅
