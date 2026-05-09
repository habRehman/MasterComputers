# 🖥️ Master Computers — AI-Powered E-Commerce Platform

![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)
![Python](https://img.shields.io/badge/ML-Python-3776AB?logo=python)
![License](https://img.shields.io/badge/License-MIT-blue)

Full-stack MERN e-commerce platform for the Pakistani market with AI/ML-powered recommendation system and price prediction.

## 🚀 Features

- JWT Authentication
- Product Search & Filtering
- Shopping Cart System
- Admin Dashboard
- AI Product Recommendations
- Laptop Price Prediction
- MongoDB Integration
- Responsive UI
- Pakistani Payment Methods

## 🛠 Tech Stack

- React + TypeScript
- Node.js + Express
- MongoDB + Mongoose
- Python + Flask
- Scikit-learn
- Tailwind CSS

## 📸 Screenshots

(Add screenshots here)

## 🌐 Live Demo

Frontend:
https://your-vercel-link.vercel.app

Backend API:
https://your-render-link.onrender.com

## ⚡ Quick Start

```bash
git clone https://github.com/habRehman/MasterComputers.git
cd master-computers
---


# 📚 Full Installation Guide

## 📋 Table of Contents
1. [What You Need](#1-what-you-need)
2. [Install Node.js](#2-install-nodejs)
3. [Install Python](#3-install-python)
4. [Install MongoDB on Windows](#4-install-mongodb-on-windows)
5. [Verify MongoDB is Running](#5-verify-mongodb-is-running)
6. [Extract the Project](#6-extract-the-project)
7. [Configure .env Files](#7-configure-env-files)
8. [Install Dependencies](#8-install-dependencies)
9. [Seed the Database](#9-seed-the-database)
10. [Start All Three Services](#10-start-all-three-services)
11. [Open in Browser](#11-open-in-browser)
12. [Login Accounts](#12-login-accounts)
13. [Where Does the Data Go?](#13-where-does-the-data-go)
14. [Troubleshooting](#14-troubleshooting)
15. [Project Structure](#15-project-structure)

---

## 1. What You Need

You need these three programs installed before anything else:

| Program  | Required Version | Download Link |
|----------|-----------------|---------------|
| Node.js  | 18 or higher    | https://nodejs.org |
| Python   | 3.10 or higher  | https://python.org/downloads |
| MongoDB  | 7.0 Community   | https://www.mongodb.com/try/download/community |

**Check if already installed** — open Command Prompt and type:
```
node --version
python --version
mongod --version
```
If all three show version numbers, skip to [Step 6](#6-extract-the-project).

---

## 2. Install Node.js

1. Go to **https://nodejs.org**
2. Click the large **"LTS"** button (Long Term Support — most stable)
3. Run the downloaded `.msi` file
4. Click **Next → Next → Install → Finish** (keep all defaults)
5. **Close and reopen** Command Prompt after installing
6. Verify: type `node --version` — should show `v20.x.x` or higher ✅

---

## 3. Install Python

1. Go to **https://python.org/downloads**
2. Click **"Download Python 3.x.x"**
3. Run the `.exe` installer
4. ⚠️ **CRITICAL:** On the first screen, check **"Add Python to PATH"** at the bottom — this is easy to miss!
5. Click **"Install Now"**
6. **Close and reopen** Command Prompt after installing
7. Verify: type `python --version` — should show `Python 3.x.x` ✅

---

## 4. Install MongoDB on Windows

### Step 1 — Download
1. Go to **https://www.mongodb.com/try/download/community**
2. Check these settings on the page:
   - Version: **7.0.x** (or latest 7.x)
   - Platform: **Windows**
   - Package: **msi**
3. Click **Download**

### Step 2 — Install
1. Run the downloaded `.msi` file
2. Click **Next**
3. Click **"I accept the terms"** → **Next**
4. Choose **"Complete"** → **Next**
5. On the **Service Configuration** screen:
   - ✅ Make sure **"Install MongoDB as a Service"** is checked
   - Service Name: `MongoDB` (leave as is)
   - Data Directory: `C:\Program Files\MongoDB\Server\7.0\data\` (leave as is)
   - Log Directory: `C:\Program Files\MongoDB\Server\7.0\log\` (leave as is)
   - Click **Next**
6. On the **Install MongoDB Compass** screen:
   - You can **uncheck** it to save time — we don't need the GUI
   - Click **Next**
7. Click **Install** (may need administrator permission — click Yes)
8. Click **Finish**

### What just happened?
MongoDB is now installed as a **Windows Service**. This means:
- It starts automatically every time Windows boots
- It runs in the background — you don't need to start it manually
- Your data is stored at `C:\Program Files\MongoDB\Server\7.0\data\`

---

## 5. Verify MongoDB is Running

Open **Command Prompt** and type:
```
net start MongoDB
```

You should see one of these messages:
- `"The MongoDB service is already started."` ✅ (already running — perfect)
- `"The MongoDB service was started successfully."` ✅ (just started)

If you see an error, try:
```
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --version
```

If that works, MongoDB is installed but not running as a service. Start it manually:
```
net start MongoDB
```

---

## 6. Extract the Project

1. Right-click the ZIP file you downloaded
2. Click **"Extract All..."**
3. Choose a location — we recommend: `C:\Projects\master-computers\`
4. Click **Extract**
5. You should now have a folder called `master-computers` with these subfolders:
   ```
   master-computers\
   ├── backend\
   ├── frontend\
   ├── ml_service\
   └── mongodb\
   ```

---

## 7. Configure .env Files

The project needs two configuration files. These store settings like your database address and secret key.

### Backend .env

1. Open `C:\Projects\master-computers\backend\` in File Explorer
2. You will see a file called `.env.example`
3. **Copy** it (Ctrl+C) and **Paste** it in the same folder (Ctrl+V)
4. Rename the copy to `.env` (just `.env` — no other extension)
   - If Windows warns you about changing the extension, click **Yes**
   - If you can't see extensions, open File Explorer → View → check "File name extensions"
5. Open `.env` in Notepad (right-click → Open with → Notepad)
6. It looks like this:

```
MONGODB_URI=mongodb://localhost:27017/master_computers
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
ML_SERVICE_URL=http://localhost:5001
PORT=5000
NODE_ENV=development
```

7. Change `JWT_SECRET` to any long random text. Example:
```
JWT_SECRET=MasterComputersPakistan2024SecretKey!XYZ789
```

8. Leave everything else exactly as is
9. Save (Ctrl+S) and close Notepad

### Frontend .env

1. Open `C:\Projects\master-computers\frontend\`
2. Copy `.env.example` and rename the copy to `.env`
3. Open `.env` in Notepad — it contains:
```
VITE_API_URL=http://localhost:5000/api
```
4. Leave it exactly as is
5. Save and close

---

## 8. Install Dependencies

You need to run `npm install` in two folders and `pip install` in one.

### Open Three Command Prompt Windows

Press **Win + R**, type `cmd`, press Enter — repeat three times to get 3 windows.

### Window 1 — ML Service (Python)

```cmd
cd C:\Projects\master-computers\ml_service
pip install flask scikit-learn pandas numpy joblib
```

Wait for it to finish (may take 1–2 minutes). You should see `Successfully installed...`.

### Window 2 — Backend (Node.js)

```cmd
cd C:\Projects\master-computers\backend
npm install
```

Wait for it to finish. You should see `added XX packages`.

### Window 3 — Frontend (React)

```cmd
cd C:\Projects\master-computers\frontend
npm install
```

Wait for it to finish (may take 2–3 minutes). You should see `added XX packages`.

---

## 9. Seed the Database

**This fills your MongoDB with Pakistani products, categories, and accounts.**
Do this once. You only need to do it again if you want to reset everything.

In **Window 2** (backend), run:
```cmd
node scripts\seed.js
```

You should see:
```
╔══════════════════════════════════════╗
║   Master Computers — DB Seed Script  ║
╚══════════════════════════════════════╝

[1/6] Connecting to MongoDB...
      ✅ Connected to: mongodb://localhost:27017/master_computers

[2/6] Clearing old data...
      ✅ Collections cleared

[3/6] Inserting categories...
      ✅ Inserted 8 categories

[4/6] Inserting products...
      ✔  laptops: 8 products
      ✔  mobiles: 7 products
      ✔  monitors: 4 products
      ✔  components: 5 products
      ✔  accessories: 4 products
      ✔  networking: 2 products
      ✔  storage: 2 products
      ✅ Inserted 32 products total

[5/6] Creating admin user...
      ✅ Admin created
         Email:    admin@mastercomputers.pk
         Password: admin123

[6/6] Creating demo customer...
      ✅ Demo customer created
         Email:    demo@example.com
         Password: demo1234

╔══════════════════════════════════════╗
║  ✅  Database seeded successfully!   ║
╚══════════════════════════════════════╝
```

**If you see an error:**
- `MongoServerError: connect ECONNREFUSED` → MongoDB is not running. Run: `net start MongoDB`
- `Cannot find module` → Run `npm install` first

---

## 10. Start All Three Services

You need **all three** running at the same time. Use the three Command Prompt windows.

### Window 1 — Start ML Service

```cmd
cd C:\Projects\master-computers\ml_service
python app.py
```

Wait until you see:
```
✅  All models ready. Listening on http://localhost:5001
```
**Leave this window open.**

### Window 2 — Start Backend

```cmd
cd C:\Projects\master-computers\backend
npm run dev
```

Wait until you see:
```
[MongoDB] Connected: mongodb://localhost:27017/master_computers
[Server] Running on http://localhost:5000
```
**Leave this window open.**

### Window 3 — Start Frontend

```cmd
cd C:\Projects\master-computers\frontend
npm run dev
```

Wait until you see:
```
  VITE v5.x.x  ready in 500ms
  ➜  Local:   http://localhost:5173/
```
**Leave this window open.**

---

## 11. Open in Browser

Open Chrome, Edge, or Firefox and go to:

**http://localhost:5173**

You should see the Master Computers homepage with Pakistani products! 🎉

**Verify all services work:**

| Service     | URL to test in browser            | What you should see |
|-------------|----------------------------------|---------------------|
| Frontend    | http://localhost:5173            | Full website loads  |
| Backend API | http://localhost:5000/api/health | `{"status":"ok"}`   |
| ML Service  | http://localhost:5001/health     | `{"status":"ok"}`   |

---

## 12. Login Accounts

After seeding, these accounts are ready:

### 🔑 Admin Account
- **Email:** `admin@mastercomputers.pk`
- **Password:** `admin123`
- **What you can do:** Full admin dashboard at `/admin` — manage products, view orders, see ML cluster chart

### 👤 Demo Customer Account
- **Email:** `demo@example.com`
- **Password:** `demo1234`
- **What you can do:** Browse, add to cart, checkout, view orders

> ⚠️ Change these passwords before making this accessible over the internet!

---

## 13. Where Does the Data Go?

This is exactly where each piece of data is stored on your computer:

### MongoDB Data (Products, Orders, Users, Cart)

MongoDB stores all database files in this folder on Windows:
```
C:\Program Files\MongoDB\Server\7.0\data\
```

Inside that folder, MongoDB creates files like:
- `collection-0-XXXX.wt` — actual product/user/order data
- `WiredTiger.wt` — database engine file
- `mongod.lock` — lock file (shows DB is running)

**The specific database** for this project is called `master_computers`.
You can see it by opening Command Prompt and typing:
```
"C:\Program Files\MongoDB\Server\7.0\bin\mongosh.exe"
```
Then in the Mongo shell:
```
show dbs
use master_computers
show collections
db.products.count()
db.users.find().pretty()
```

**MongoDB log files** are at:
```
C:\Program Files\MongoDB\Server\7.0\log\mongod.log
```

### Collections in master_computers database

| Collection     | What it stores                          | Created by |
|----------------|-----------------------------------------|------------|
| `categories`   | 8 product categories (laptops, mobiles) | seed.js    |
| `products`     | All 32+ products with PKR prices        | seed.js    |
| `users`        | Customer and admin accounts             | seed.js + register |
| `carts`        | Shopping cart (one document per user)   | Add to Cart button |
| `orders`       | All placed orders                       | Checkout page |
| `productviews` | Which products each user viewed         | Product detail page |

### JWT Tokens (Login Sessions)

When a user logs in, the server creates a **JWT token** (JSON Web Token).
This token is stored in the user's browser in **localStorage** — not on your server.

Location in browser: DevTools → Application → Local Storage → `mc_token`

The token expires after **7 days** (set by `JWT_EXPIRES_IN=7d` in `.env`).

### Uploaded Product Images

Product images come from **Unsplash** (a free photo website) via URLs stored in MongoDB.
No image files are saved on your computer — they load from the internet when you browse.

### ML Model Data

The ML models (K-Means and Linear Regression) are trained **in memory** every time you start `python app.py`. No model files are saved to disk. Training takes about 1 second.

The training data is hardcoded in `ml_service/app.py` in the `PRICE_TRAINING_DATA` list.

### Summary

```
Your Computer
│
├── C:\Program Files\MongoDB\Server\7.0\data\
│   └── [MongoDB database files — products, users, orders, cart]
│
├── C:\Projects\master-computers\
│   ├── backend\.env              [your secret JWT key — never share this]
│   ├── frontend\.env             [API URL]
│   └── [all project code files]
│
└── User's Browser (localStorage)
    └── mc_token                  [JWT login token — expires in 7 days]
```

---

## 14. Troubleshooting

### ❌ "node is not recognized as an internal or external command"
Node.js is not installed or not in PATH.
→ Reinstall Node.js from https://nodejs.org
→ Close ALL Command Prompt windows and reopen them after install

### ❌ "python is not recognized"
Python not in PATH.
→ Reinstall Python and **check "Add Python to PATH"** on first screen
→ Or try `py --version` instead of `python --version`

### ❌ "MongoServerError: connect ECONNREFUSED 127.0.0.1:27017"
MongoDB is not running.
→ Open Command Prompt as **Administrator** (right-click → Run as administrator)
→ Type: `net start MongoDB`
→ Then try your command again

### ❌ Seed says "connect ECONNREFUSED" even after starting MongoDB
Your `MONGODB_URI` in `.env` might be wrong.
→ Open `backend\.env` and make sure this line is exactly:
   `MONGODB_URI=mongodb://localhost:27017/master_computers`

### ❌ "Cannot find module 'express'" or similar
You forgot `npm install`.
→ In the `backend\` folder, run: `npm install`
→ In the `frontend\` folder, run: `npm install`

### ❌ Products page loads but is empty
The database was not seeded.
→ Run: `node scripts\seed.js` from the `backend\` folder

### ❌ Login says "Invalid email or password"
The seed didn't run, or ran with an error.
→ Run `node scripts\seed.js` again — it clears old data and re-creates accounts

### ❌ Admin panel shows "Admin access required"
You're not logged in as admin, or JWT_SECRET changed after login.
→ Log out and log in again with `admin@mastercomputers.pk` / `admin123`

### ❌ Chatbot says "Price prediction service unavailable"
The ML service (Python) is not running.
→ Open a Command Prompt, go to `ml_service\`, run `python app.py`

### ❌ Port 5000 already in use
Another program is using port 5000.
→ In `backend\.env`, change `PORT=5001`
→ In `frontend\.env`, change `VITE_API_URL=http://localhost:5001/api`

### ❌ Port 5173 already in use
Vite will automatically try 5174, 5175 etc. Just open the URL it shows.

### ❌ npm install fails on frontend (EACCES or permission error)
→ Run Command Prompt as Administrator and try again

---

## 15. Project Structure

```
master-computers\
│
├── 📄 README.md                     ← You are reading this
│
├── 📁 backend\                      Node.js + Express REST API (port 5000)
│   ├── .env.example                 Copy to .env and edit
│   ├── .env                         ← YOUR SETTINGS (create this from .env.example)
│   ├── server.js                    Main server — starts Express, connects MongoDB
│   ├── package.json                 Node.js dependencies list
│   │
│   ├── 📁 middleware\
│   │   ├── db.js                    MongoDB connection with auto-reconnect
│   │   └── auth.js                  JWT authentication — protects private routes
│   │
│   ├── 📁 models\                   MongoDB collection schemas (Mongoose)
│   │   ├── User.js                  Email, password (hashed), name, role
│   │   ├── Product.js               Name, price(PKR), specs, images, stock
│   │   ├── Category.js              Laptops, Mobiles, Monitors, etc.
│   │   ├── Cart.js                  One document per user, embedded items
│   │   ├── Order.js                 Order with embedded item snapshots
│   │   └── ProductView.js           Tracks which products user viewed (for ML)
│   │
│   ├── 📁 routes\                   API endpoints
│   │   ├── auth.js                  POST /register, POST /login, GET /profile
│   │   ├── products.js              GET /products, GET /products/:id
│   │   ├── cart.js                  GET/POST/PATCH/DELETE /cart
│   │   ├── orders.js                GET/POST /orders
│   │   ├── admin.js                 Admin-only: stats, product CRUD, order updates
│   │   └── ml.js                    Proxy to Python ML service
│   │
│   └── 📁 scripts\
│       └── seed.js                  ← RUN THIS ONCE to fill database with data
│
├── 📁 frontend\                     React 18 + TypeScript + Tailwind (port 5173)
│   ├── .env.example                 Copy to .env and edit
│   ├── .env                         ← YOUR SETTINGS (create this from .env.example)
│   ├── index.html                   HTML entry point
│   ├── vite.config.ts               Vite bundler config
│   ├── tailwind.config.js           Tailwind CSS config with custom animations
│   │
│   └── 📁 src\
│       ├── App.tsx                  Router — all page routes defined here
│       ├── main.tsx                 React entry point
│       ├── index.css                Global styles + animation keyframes
│       │
│       ├── 📁 components\
│       │   ├── Navbar\              Top navigation, search, cart count
│       │   ├── ProductCard\         Product grid card with hover effects
│       │   ├── ML\
│       │   │   ├── PriceChatbot.tsx Floating AI chatbot (bottom-right)
│       │   │   └── Recommendations  K-Means product recommendations
│       │   └── UI\
│       │       ├── Footer.tsx       Site footer
│       │       └── ProtectedRoute   Redirects if not logged in
│       │
│       ├── 📁 context\
│       │   ├── AuthContext.tsx      Login state — JWT stored in localStorage
│       │   └── CartContext.tsx      Cart items and total
│       │
│       ├── 📁 pages\
│       │   ├── HomePage.tsx         Landing page with hero + featured products
│       │   ├── ProductsPage.tsx     Browse all products with filters + sort
│       │   ├── ProductDetailPage    Single product — specs, add to cart, AI recs
│       │   ├── CartPage.tsx         Shopping cart with shipping progress bar
│       │   ├── CheckoutPage.tsx     COD / Easypaisa / JazzCash checkout
│       │   ├── OrdersPage.tsx       Order history + animated status tracker
│       │   ├── ProfilePage.tsx      Edit name, phone, city, address
│       │   ├── AdminPage.tsx        Dashboard: stats, product CRUD, order mgmt
│       │   └── AuthPages.tsx        Login + Register pages
│       │
│       ├── 📁 types\
│       │   └── index.ts             TypeScript interfaces for all data models
│       │
│       └── 📁 utils\
│           └── api.ts               Axios client with JWT auto-attach + helpers
│
├── 📁 ml_service\                   Python Flask ML service (port 5001)
│   ├── app.py                       Full ML service — read comments inside!
│   └── requirements.txt             Python package list
│
└── 📁 mongodb\
    └── SETUP.md                     Alternative MongoDB Atlas (cloud) setup guide
```

---

## Tech Stack

| Layer        | Technology            | Why we use it |
|--------------|-----------------------|---------------|
| Frontend     | React 18 + Vite       | Fast, modern UI framework |
| Language     | TypeScript            | Type-safe, fewer bugs |
| Styling      | Tailwind CSS          | Utility-first, responsive |
| Animations   | Custom CSS keyframes  | Smooth page transitions |
| Backend      | Node.js + Express     | Fast REST API server |
| Database     | MongoDB + Mongoose    | Flexible document storage |
| Auth         | JWT + bcryptjs        | Secure login, hashed passwords |
| ML Framework | Python scikit-learn   | K-Means + Linear Regression |
| ML Server    | Flask                 | Lightweight Python web server |

---

Master Computers — Pakistan's Tech Store


