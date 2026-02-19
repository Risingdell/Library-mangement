# 📊 Infrastructure Sizing & Cost Analysis
**For 40-60 Concurrent Users Library Management System**

**Created:** February 17, 2026
**Use Case:** College Library with active students

---

## 📈 Per-User Resource Analysis

### Database Storage per User
```
User Profile:
  • User record:             ~500 bytes
  • Profile image URL:       ~200 bytes
  • Basic data:              ~300 bytes
  ─────────────────────────
  Per user in DB:            ~1 KB

Activity Data (per user over 1 year):
  • Borrow history:          ~5 KB (10 borrows × 500 bytes)
  • Return records:          ~3 KB (10 returns × 300 bytes)
  • Session logs:            ~2 KB (monthly)
  ─────────────────────────
  Total activity:            ~10 KB

TOTAL PER USER PER YEAR:     ~11 KB database storage
```

### User Session Memory
```
Active Session (in RAM):
  • Session data:            ~2-3 KB per active user
  • User info cache:         ~1 KB
  ─────────────────────────
  Per concurrent user:       ~3-4 KB RAM

For 60 concurrent users:
  60 users × 3.5 KB =       ~210 KB RAM (for sessions only)
```

### Bandwidth per User
```
Daily usage (1 active user):
  • Book browsing:           ~2 MB (images, data)
  • Borrow operation:        ~50 KB
  • Profile page:            ~500 KB
  • API calls:               ~1 MB
  ─────────────────────────
  Per user per day:          ~3.5-4 MB

For 60 concurrent users:
  60 users × 4 MB × 30 days = 7.2 GB/month
```

### File Storage (Profile Images)
```
Average profile image:       ~500 KB (compressed by Cloudinary)
Per user:                    ~500 KB (1 image)

For 1000 students:
  1000 × 500 KB =           ~500 MB storage
```

---

## 🖥️ OPTION 1: Cloud Deployment (Current - Render + Vercel)

### Architecture
```
Frontend (Vercel)
    ↓
Backend (Render)
    ↓
Database (Clever Cloud MySQL)
    ↓
File Storage (Cloudinary)
```

### Monthly Costs for 40-60 Users

| Component | Service | Plan | Cost |
|-----------|---------|------|------|
| **Backend** | Render | Standard (2GB RAM) | $7/month |
| **Frontend** | Vercel | Pro | $20/month |
| **Database** | Clever Cloud | Standard (1GB) | $10/month |
| **File Storage** | Cloudinary | Free tier | $0 |
| **Session Storage** | Redis (Render) | Free | $0 |
| **Bandwidth** | Included | - | $0 |
| **TOTAL/MONTH** | - | - | **$37/month** |

### Pros ✅
- ✅ Easy to scale (add resources as needed)
- ✅ Automatic backups
- ✅ 99.9% uptime guarantee
- ✅ Global CDN (fast loading)
- ✅ No server maintenance
- ✅ Can start free and upgrade
- ✅ Professional hosting

### Cons ❌
- ❌ $37-50/month cost
- ❌ Dependent on internet
- ❌ No local control

---

## 🏢 OPTION 2: College Local Server

### Hardware Requirements for 40-60 Concurrent Users

#### Minimum Specs
```
CPU:            4 cores (Intel i5/Ryzen 5 equivalent)
RAM:            8 GB minimum
                16 GB recommended

Storage:        1 TB SSD
                (OS + App + Database + Backups)

Network:        1 Gbps local network
                10 Mbps upload to internet (recommended)
```

#### Server Machine Examples
```
Option A: Repurpose Old Computer
  Cost:         ₹0 (reuse existing)
  Specs:        Intel i5, 8GB RAM, 500GB SSD
  Result:       Can handle 40-60 users ✓

Option B: Small Dedicated Server
  Cost:         ₹20,000-30,000 (one-time)
  Specs:        Ryzen 5 5600X, 16GB RAM, 1TB SSD
  Result:       Can handle 100+ users ✓

Option C: Mini PC/NUC
  Cost:         ₹15,000-25,000
  Specs:        Intel Core i7, 16GB RAM, 512GB SSD
  Result:       Compact, quiet, efficient ✓
```

### Monthly Costs (Local Server)

| Component | Detail | Cost |
|-----------|--------|------|
| **Hardware** | One-time purchase | ₹20,000-30,000 |
| **Electricity** | ~50W per hour | ₹150-200/month |
| **Internet** | Existing college connection | ₹0 |
| **Maintenance** | Admin time (sysadmin) | ₹0-2,000/month |
| **Backups** | External HDD | ₹2,000-5,000 (one-time) |
| **TOTAL/MONTH** | - | **₹150-2,000/month** |

**One-time setup:** ₹25,000-35,000

### Installation on Local Server

```bash
# 1. Install Node.js & npm
sudo apt install nodejs npm  # Ubuntu/Debian
# or
brew install node            # macOS

# 2. Install MySQL
sudo apt install mysql-server
# Configure database

# 3. Clone and setup project
git clone <your-repo>
cd Library-mangement/lib/server
npm install

# 4. Configure .env for local MySQL
DB_HOST=localhost
DB_USER=library_user
DB_PASSWORD=secure_password
DB_NAME=library_db

# 5. Run application
npm start

# 6. Setup reverse proxy (nginx)
# Forward port 80/443 → Node.js on 10000
```

### Pros ✅
- ✅ One-time hardware cost
- ✅ Lowest ongoing cost (₹150-200/month)
- ✅ Complete local control
- ✅ No cloud dependency
- ✅ Fast local network
- ✅ Can backup locally
- ✅ Good for 40-60 users

### Cons ❌
- ❌ Requires IT admin to manage
- ❌ Single point of failure
- ❌ No automatic backup
- ❌ Power outage = downtime
- ❌ Manual scaling
- ❌ Not accessible from outside (needs setup)

---

## 📊 Cost Comparison Over 3 Years

### Cloud (Render + Vercel)
```
Monthly: ₹37 USD = ~₹3,000/month
Year 1:  ₹36,000
Year 2:  ₹36,000
Year 3:  ₹36,000
─────────────────
TOTAL:   ₹108,000
```

### Local Server
```
One-time: ₹30,000 (hardware)
Monthly:  ₹200 (electricity)

Year 1:  ₹30,000 + (₹200 × 12) = ₹32,400
Year 2:  ₹200 × 12 = ₹2,400
Year 3:  ₹200 × 12 = ₹2,400
─────────────────────────
TOTAL:   ₹37,200

Savings: ₹70,800 over 3 years!
```

---

## 🎯 RECOMMENDATION FOR 40-60 USERS

### Best Option: **LOCAL SERVER** ✅

**Why?**
1. College likely has IT infrastructure already
2. One-time cost of ₹30,000 = pays for itself in 10 months
3. Super low ongoing cost (just electricity)
4. Best performance on local network
5. Better data control/security
6. Scalable to 100-200 users later

### Setup Steps:
```
1. Get old/new computer with:
   - 4+ CPU cores
   - 8GB+ RAM
   - 500GB+ SSD

2. Install Linux (Ubuntu Server - free)

3. Install:
   - Node.js & npm
   - MySQL Database
   - Nginx (reverse proxy)

4. Clone your GitHub repo

5. Configure .env for local MySQL

6. Run application

7. Setup automatic backups

8. Configure network access
```

### Hardware Examples:
```
Option A: Repurposed old college computer
  Cost:     ₹0
  Works:    YES (for 40-60 users)

Option B: Used Dell/HP Mini PC
  Cost:     ₹15,000
  Works:    YES (for 100+ users)

Option C: New Mini PC (Ryzen)
  Cost:     ₹25,000
  Works:    YES (for 150+ users)
```

---

## 🔧 If Going Local: Important Setup

### Backup Strategy
```
Daily:    Database backup to external HDD
Weekly:   Full system backup
Monthly:  Archive to cloud (Google Drive/Azure)
```

### Security
```
- Firewall on college network
- Strong admin password
- Regular security updates
- Limit external access
- VPN for remote admin
```

### Redundancy (Optional)
```
For mission-critical:
- 2 backup computers
- Automatic failover
- Sync database between servers
```

---

## 📱 Network Accessibility

### Local Network Only
```
Access: Only from college network
Setup: Easy, just connect to IP
Security: Very good (internal only)
Cost: None
```

### Remote Access (Optional)
```
If students want to access from home:

Option A: VPN
  - Connect to college VPN
  - Access library like being on campus

Option B: Public IP + Firewall
  - Make accessible from anywhere
  - Need stronger security
  - College needs to allow

Option C: Reverse Proxy
  - Use services like Cloudflare
  - Free SSL, DDoS protection
  - Still on local server
```

---

## 🎓 Recommended Setup for College

```
HARDWARE:
  Computer:       Repurposed old Dell/HP or new Mini PC
  RAM:            8-16 GB
  Storage:        SSD 500GB+
  Backup Drive:   External 2TB HDD

NETWORK:
  Location:       College server room
  Power:          Dedicated outlet + UPS (optional)
  Backup Power:   UPS for 30 min (optional)

SOFTWARE:
  OS:             Ubuntu Server 20.04 (free)
  Database:       MySQL 8.0 (free)
  App Server:     Node.js + Express (free)
  Reverse Proxy:  Nginx (free)

MANAGEMENT:
  Admin:          College IT staff
  Backups:        Automated daily
  Updates:        Monthly security patches
  Monitoring:     Simple monitoring script

USERS:
  Supported:      40-60 concurrent
  Can scale to:   100-200 with same hardware

COST:
  Hardware:       ₹20,000-30,000 (one-time)
  Monthly:        ₹150-300 (just electricity)
  Backup power:   ₹5,000 (optional)
  ─────────────────────────────────
  TOTAL/YEAR:     ₹2,400-3,600 ✨
```

---

## ⚠️ When to Choose Cloud Instead

Choose **Render + Vercel** (cloud) if:
```
✓ Need 99.99% uptime (business critical)
✓ Want automatic scaling (100-500+ users)
✓ Don't have IT staff to manage
✓ Need geographic redundancy
✓ Want global access without setup
✓ Prefer "set and forget"
✓ Have budget for monthly costs
```

---

## 📞 Final Recommendation

**For a college with 40-60 concurrent users:**

### PRIMARY: Local Server ✅ (RECOMMENDED)
- **Cost:** ₹30,000 one-time + ₹200/month
- **Performance:** Excellent
- **Reliability:** Good (with proper maintenance)
- **Scalability:** Up to 200+ users
- **Control:** Full

### SECONDARY: Cloud (Render + Vercel)
- **Cost:** ₹3,000/month
- **Performance:** Good
- **Reliability:** Excellent (99.9%)
- **Scalability:** Unlimited
- **Control:** Limited

---

## 📊 Space Summary

**Per User Database:** ~11 KB/year
**Per 100 Students:** ~1.1 MB/year
**Per 1000 Students:** ~11 MB/year

**Profile Images:** ~500 MB for 1000 students (Cloudinary handles)

**Database Size:** ~1-2 GB for 1000 students with 3 years history

**Total Server Space Needed:** 500 GB SSD (plenty of margin)

---

**Conclusion:** For a college library with 40-60 users, **a local server is the most cost-effective and practical solution.** Use a repurposed computer or invest ₹25,000 once, and enjoy ₹200/month operating costs forever!

