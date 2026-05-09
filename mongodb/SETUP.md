# MongoDB Setup Guide — Master Computers

## Option A: Local MongoDB (Development)

### 1. Install MongoDB Community Edition

**Ubuntu/Debian:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" \
  | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update && sudo apt install -y mongodb-org
sudo systemctl start mongod && sudo systemctl enable mongod
```

**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

**Windows:**
Download the MSI installer from https://www.mongodb.com/try/download/community

### 2. Verify connection
```bash
mongosh
# Should show: Connecting to: mongodb://127.0.0.1:27017
```

### 3. Set MONGODB_URI in backend/.env
```
MONGODB_URI=mongodb://localhost:27017/master_computers
```

---

## Option B: MongoDB Atlas (Cloud — Recommended for Production)

### 1. Create a free cluster
- Go to https://cloud.mongodb.com
- Create a free M0 cluster (512 MB — sufficient for this project)
- Choose region: Singapore or Mumbai (closest to Pakistan)

### 2. Configure access
- Database Access → Add Database User
  - Username: `mc_admin`
  - Password: (generate a strong password)
  - Role: `readWriteAnyDatabase`
- Network Access → Add IP Address → `0.0.0.0/0` (allow all, or your specific IP)

### 3. Get connection string
- Clusters → Connect → Connect your application
- Copy the URI, looks like:
  ```
  mongodb+srv://mc_admin:<password>@cluster0.xxxxx.mongodb.net/master_computers?retryWrites=true&w=majority
  ```
- Replace `<password>` with your actual password

### 4. Set in backend/.env
```
MONGODB_URI=mongodb+srv://mc_admin:yourpassword@cluster0.xxxxx.mongodb.net/master_computers?retryWrites=true&w=majority
```

---

## Seeding the Database

After MongoDB is running and `.env` is configured:

```bash
cd backend
npm install
node scripts/seed.js
```

**Output:**
```
[Seed] Connecting to MongoDB...
[Seed] Connected.
[Seed] Cleared existing data.
[Seed] Inserted 8 categories.
[Seed] Inserted 37 products.
[Seed] Admin user created.
       Email:    admin@mastercomputers.pk
       Password: admin123
[Seed] Demo customer created.
       Email:    demo@example.com
       Password: demo1234
[Seed] ✅ Database seeded successfully!
```

> ⚠️ Change the admin password immediately in production!

---

## Collections Created

| Collection     | Description                                  |
|----------------|----------------------------------------------|
| `users`        | Customers and admin accounts (bcrypt hashed) |
| `categories`   | Product categories (laptops, mobiles, etc.)  |
| `products`     | 37 Pakistani market products with PKR prices |
| `carts`        | User shopping carts (one doc per user)       |
| `orders`       | Order history with embedded item snapshots   |
| `productviews` | View history for K-Means recommendations     |

## Indexes (auto-created by Mongoose)

- `products`: text index on name+brand+description, indexes on category/price/brand
- `orders`: compound index on user+createdAt, index on status
- `productviews`: index on user+createdAt
