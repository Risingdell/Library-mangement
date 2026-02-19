# 🏢 Deploying on College's Existing Server

**For Library Management System**

**Date:** February 17, 2026
**Use Case:** Using college's IT infrastructure

---

## ✅ **Yes, You Can Use College Server!**

If your college already has a server, you can absolutely deploy there instead of paying for cloud services.

---

## 💰 **How Costs Are Measured**

### **Cloud Services (Vercel + Render + Clever Cloud)**
```
Monthly Cost = Fixed subscription fees

Vercel:        ₹1,500-2,000/month (or free)
Render:        ₹500-1,000/month
Clever Cloud:  ₹600-1,000/month
─────────────────────────────────────
TOTAL:         ₹2,600-4,000/month

How it's measured:
  • You pay subscription = fixed monthly
  • Includes: Hosting, Storage, Bandwidth
  • Auto-scaling = costs increase if usage increases
```

### **College Server (Local Deployment)**
```
ONE-TIME COST: Hardware + Setup
  • Server purchase or repurpose: ₹0-30,000
  • OS installation: ₹0 (free Linux)
  • Software: ₹0 (free Node.js, MySQL)
  • Setup time: ₹0 (your IT staff)
  ─────────────────────────────────
  Initial: ₹0-30,000

MONTHLY COST: Only Operating Expenses
  • Electricity: ₹150-300/month
  • Internet: ₹0 (college's existing connection)
  • Backup drives: ₹0-500/month
  • Admin maintenance: ₹0 (college staff)
  ─────────────────────────────────
  Monthly: ₹150-300/month

How it's measured:
  • You only pay for electricity used
  • No subscription fees
  • Bandwidth included (college network)
  • No per-user charges
  • No storage charges
```

---

## 🔌 **Electricity Cost Calculation**

### **Server Power Consumption**

**Typical Server:**
```
Small PC/Mini PC:         30-50W (idle)
Regular Desktop:          80-120W (idle)
Small Server Machine:     150-250W (running)

Example: 50W server running 24/7
─────────────────────────────────
Daily:    50W × 24 hours = 1.2 kWh
Monthly:  1.2 kWh × 30 = 36 kWh
Yearly:   36 kWh × 12 = 432 kWh

Cost at ₹5 per kWh:
─────────────────────────────────
Monthly:  36 kWh × ₹5 = ₹180
Yearly:   432 kWh × ₹5 = ₹2,160
```

### **Cost Examples**

**Scenario 1: Small PC (50W)**
```
Monthly electricity: ₹180-200
Yearly:             ₹2,160-2,400
5-year cost:        ₹10,800-12,000
```

**Scenario 2: Desktop (100W)**
```
Monthly electricity: ₹300-350
Yearly:             ₹3,600-4,200
5-year cost:        ₹18,000-21,000
```

**Scenario 3: Small Server (200W)**
```
Monthly electricity: ₹600-700
Yearly:             ₹7,200-8,400
5-year cost:        ₹36,000-42,000
```

---

## 🏗️ **College Server Architecture**

### **If You Use College's Existing Server**

```
Architecture:

┌─────────────────────────────────────┐
│    COLLEGE'S LOCAL NETWORK           │
│                                      │
│  ┌──────────────────────────────┐   │
│  │  College Server              │   │
│  │  ┌──────────────────────────┐│   │
│  │  │ Frontend (React/Vite)    ││   │
│  │  │ - Static files           ││   │
│  │  │ - Built HTML/CSS/JS      ││   │
│  │  └──────────────────────────┘│   │
│  │  ┌──────────────────────────┐│   │
│  │  │ Backend (Node.js)        ││   │
│  │  │ - API Server             ││   │
│  │  │ - Port: 10000            ││   │
│  │  └──────────────────────────┘│   │
│  │  ┌──────────────────────────┐│   │
│  │  │ Database (MySQL)         ││   │
│  │  │ - Local MySQL instance   ││   │
│  │  │ - localhost:3306         ││   │
│  │  └──────────────────────────┘│   │
│  │  ┌──────────────────────────┐│   │
│  │  │ Web Server (Nginx)       ││   │
│  │  │ - Reverse proxy          ││   │
│  │  │ - Port: 80/443           ││   │
│  │  └──────────────────────────┘│   │
│  └──────────────────────────────┘   │
│                                      │
│  Access:                             │
│  • From college network:             │
│    http://server-ip/                 │
│  • From internet (optional):         │
│    https://library.college.edu       │
└─────────────────────────────────────┘
```

---

## 📋 **What You Need from College**

### **Hardware Requirements**

**Minimum (for 40-60 users):**
```
CPU:        4 cores (Intel i5 / Ryzen 5)
RAM:        8 GB
Storage:    500 GB SSD
Network:    1 Gbps local + college internet
Power:      Dedicated outlet (24/7)
Cooling:    Normal server room temp
```

**Recommended (for 100+ users):**
```
CPU:        8 cores (Intel i7 / Ryzen 7)
RAM:        16-32 GB
Storage:    1-2 TB SSD
Network:    Gigabit Ethernet
Power:      Dedicated power + UPS
Cooling:    Proper server room
```

### **Questions to Ask College IT**

```
1. "Do you have an old computer we can repurpose?"
   → Many colleges have unused machines

2. "Can we use existing server space?"
   → Some colleges have spare capacity

3. "Can we allocate an IP address?"
   → For network access

4. "What's the power budget?"
   → How much power can we use

5. "Do you have backup/UPS?"
   → For reliability

6. "Can we access from outside campus?"
   → For remote access capability
```

---

## 🚀 **Setup Steps on College Server**

### **Step 1: Prepare Server (30 min)**

```bash
# If using existing server:
sudo apt update && sudo apt upgrade

# If new machine:
# 1. Install Ubuntu Server 20.04 (free)
# 2. Connect to college network
# 3. Get IP address from IT
```

### **Step 2: Install Required Software (30 min)**

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install -y mysql-server

# Install Nginx (web server)
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

### **Step 3: Setup Database (15 min)**

```bash
# Start MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Create database
mysql -u root -p
CREATE DATABASE library_db;
CREATE USER 'library_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON library_db.* TO 'library_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### **Step 4: Deploy Application (15 min)**

```bash
# Clone repository
git clone https://github.com/Risingdell/Library-mangement.git
cd Library-mangement/lib

# Install dependencies
cd server
npm install

# Configure .env for local MySQL
cat > .env << EOF
NODE_ENV=production
PORT=10000
DB_HOST=localhost
DB_PORT=3306
DB_USER=library_user
DB_PASSWORD=strong_password
DB_NAME=library_db
SESSION_SECRET=your-random-secret
FRONTEND_URL=http://server-ip
EOF

# Start backend (in background)
npm start &

# Go to frontend
cd ..
npm install
npm run build

# Copy built files to Nginx
sudo cp -r dist/* /var/www/html/

# Restart Nginx
sudo systemctl restart nginx
```

### **Step 5: Verify (5 min)**

```bash
# Check if services running
ps aux | grep node
ps aux | grep mysql
sudo systemctl status nginx

# Test from college network
# Open browser: http://server-ip
# Should see the app!
```

**Total setup time: ~2 hours**

---

## 💸 **Cost Comparison: 3-Year Analysis**

### **Option A: Cloud (Current Setup)**
```
Vercel:           ₹1,500/month
Render:           ₹700/month
Clever Cloud:     ₹800/month
─────────────────────────────
Monthly:          ₹3,000/month

Year 1:   ₹36,000
Year 2:   ₹36,000
Year 3:   ₹36,000
─────────────────────────────
TOTAL 3 YEARS:    ₹108,000
```

### **Option B: Reuse Old College Computer (Best!)**
```
Initial cost:     ₹0 (repurpose existing)
Electricity:      ₹200/month
─────────────────────────────

Year 1:   ₹0 + (₹200 × 12) = ₹2,400
Year 2:   ₹200 × 12 = ₹2,400
Year 3:   ₹200 × 12 = ₹2,400
─────────────────────────────
TOTAL 3 YEARS:    ₹7,200

SAVINGS:          ₹100,800!!! 🎉
```

### **Option C: Buy Mini PC**
```
Initial cost:     ₹25,000
Electricity:      ₹300/month
─────────────────────────────

Year 1:   ₹25,000 + (₹300 × 12) = ₹28,600
Year 2:   ₹300 × 12 = ₹3,600
Year 3:   ₹300 × 12 = ₹3,600
─────────────────────────────
TOTAL 3 YEARS:    ₹35,800

SAVINGS:          ₹72,200 vs Cloud
```

---

## 🔐 **Maintenance & Support**

### **What College IT Needs to Do**

```
Daily:      Nothing (automatic)
Weekly:     Monitor disk space
Monthly:    Security updates
Quarterly:  Database optimization
Yearly:     Check hardware health

Time per month: ~2 hours max
```

### **Backup Strategy (IMPORTANT!)**

```
Daily:      Backup database to USB drive
Weekly:     Full system backup to NAS
Monthly:    Archive to Google Drive/Azure
Yearly:     Archive to offline storage

Cost: ₹500-1000 one-time for backup drives
```

---

## 📱 **Access Methods**

### **From College Network (Easy)**
```
Students access from campus:
  http://server-ip
  or
  http://library.college.local (if using DNS)

No authentication needed
Fast (local network)
```

### **From Internet (Requires Setup)**

**Option A: Using College VPN**
```
Students outside campus:
  1. Connect to college VPN
  2. Access: http://server-ip
  3. Works like being on campus

Best security + easy access
```

**Option B: Public IP + HTTPS**
```
Make server accessible from internet:
  1. Get public IP from college
  2. Setup HTTPS (Let's Encrypt - free)
  3. Point domain: library.college.edu
  4. Everyone can access

Needs firewall rules + security
```

**Option C: SSH Tunnel**
```
Advanced: Create secure tunnel
  ssh -L 8080:localhost:10000 user@server
  Then access: http://localhost:8080

For IT staff administration
```

---

## ⚠️ **Important Considerations**

### **Pros of College Server** ✅
```
✅ Saves ₹100,000+ over 3 years
✅ Full control of data
✅ Fast local network
✅ No internet dependency
✅ No subscription fees
✅ Educational value for IT staff
✅ Can handle 100-200 users easily
```

### **Cons of College Server** ❌
```
❌ Requires IT staff to manage
❌ No automatic backup
❌ Single point of failure
❌ Power outage = downtime
❌ Requires physical space
❌ Limited redundancy
❌ Manual updates needed
```

### **Solutions to Cons**

```
Single point of failure:
  → Use UPS (Uninterruptible Power Supply)
  → Cost: ₹5,000-10,000

No automatic backup:
  → Setup automatic backup script
  → Backup to external drive daily
  → Cost: ₹1,000-2,000

No redundancy:
  → Keep spare hard drive
  → Spare MySQL backup ready
  → Cost: ₹2,000

Requires IT staff:
  → College IT team handles it
  → Document everything
  → Cost: College salary
```

---

## 🎯 **Recommendation for Your College**

### **Best Option: Repurpose Old College Computer**

```
PLAN:
  Hardware:   Ask IT for old computer
              (likely Intel i5 + 8GB RAM)

  Software:   Install Ubuntu Server (free)
              Install Node.js (free)
              Install MySQL (free)

  Location:   College server room

  Cost:       ₹0 hardware + ₹200/month electricity

  Timeline:   2 hours to setup

  Result:     Save ₹100,000 over 3 years!
```

### **If No Old Computer Available**

```
PLAN:
  Hardware:   Buy used Mini PC
              (₹15,000-20,000)

  Cost:       ₹20,000 one-time + ₹300/month

  Timeline:   2 hours to setup

  Result:     Save ₹70,000 over 3 years!
```

---

## 📊 **Cost Breakdown Examples**

### **Example 1: Using Repurposed Computer**
```
INITIAL SETUP:
  Hardware:       ₹0 (reuse old computer)
  OS:             ₹0 (free Linux)
  Software:       ₹0 (free Node.js, MySQL)
  Setup time:     ₹0 (college IT)
  ─────────────────────────────
  INITIAL COST:   ₹0

MONTHLY RUNNING:
  Electricity:    ₹200 (50W × 24hrs × ₹5/kWh)
  Maintenance:    ₹0 (college IT staff)
  Internet:       ₹0 (college connection)
  ─────────────────────────────
  MONTHLY COST:   ₹200

YEARLY COST:      ₹2,400
3-YEAR COST:      ₹7,200

vs Cloud ₹108,000:  SAVE ₹100,800!
```

### **Example 2: Buying New Mini PC**
```
INITIAL SETUP:
  Hardware:       ₹20,000 (new Mini PC)
  OS:             ₹0 (free Linux)
  Software:       ₹0 (free)
  Setup time:     ₹0 (IT)
  Backup drive:   ₹2,000 (external HDD)
  UPS:            ₹5,000 (optional, for reliability)
  ─────────────────────────────
  INITIAL COST:   ₹27,000

MONTHLY RUNNING:
  Electricity:    ₹300
  Maintenance:    ₹0 (IT staff)
  ─────────────────────────────
  MONTHLY COST:   ₹300

YEARLY COST:      ₹3,600
3-YEAR COST:      ₹27,000 + (₹3,600 × 3) = ₹38,800

vs Cloud ₹108,000:  SAVE ₹69,200!
```

---

## 📞 **What to Tell College IT**

### **Pitch to Your IT Department**

```
"We have a library management system that needs
to be deployed for 40-60 students.

Current plan: Pay cloud services ₹3,000/month

Better plan: Use a college computer server
  • One-time setup (2 hours)
  • Monthly cost: Only electricity ₹200-300
  • Save ₹3,000 × 12 = ₹36,000/year
  • Full control of data
  • Educational opportunity for IT team

Hardware needed:
  • Old/new computer with 8GB+ RAM
  • 500GB+ storage
  • Existing college power + network

Request:
  • Server space in server room
  • IP address allocation
  • Backup power if possible
  • Support for OS installation + MySQL
"
```

---

## ✅ **Decision Matrix**

| Factor | Cloud (Render) | College Server |
|--------|---|---|
| **Cost/month** | ₹3,000 | ₹200-300 |
| **Setup time** | 30 min | 2 hours |
| **Uptime** | 99.9% | 95% (needs UPS) |
| **Scalability** | Unlimited | Up to 200 users |
| **Control** | Limited | Full |
| **Backup** | Auto | Manual |
| **Best for** | Production, critical | College, budget-conscious |

---

## 🎓 **Summary**

**If college has a server:**
- ✅ YES, use it!
- ✅ Cost: ₹200-300/month (electricity only)
- ✅ Save ₹36,000/year vs cloud
- ✅ Full control of data
- ✅ Educational for IT team

**Ask college IT:**
1. "Can we use an old computer?"
2. "Can we place it in server room?"
3. "Can we allocate an IP address?"
4. "Can we get 24/7 power access?"

**Setup:** 2 hours, then running costs only!

