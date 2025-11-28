# 🗄️ Connect Cherry Game to MongoDB

Your backend is now configured to connect to MongoDB! Choose one option below:

---

## ⚡ Option 1: MongoDB Atlas (Cloud - FREE & Recommended)

### Step 1: Create Account & Cluster

**MongoDB Atlas is now open in your browser!**

1. **Sign up** at https://www.mongodb.com/cloud/atlas/register
   - Use Google/GitHub or email
   
2. **Create a FREE Cluster (M0)**
   - Click "Build a Database"
   - Choose **FREE** shared tier (M0)
   - Provider: AWS (or any)
   - Region: Choose closest to you
   - Cluster Name: `Cluster0` (default is fine)
   - Click "Create Cluster"

### Step 2: Create Database User

1. **Security → Database Access** → Add New Database User
   - Authentication Method: Password
   - Username: `cherrygame`
   - Password: Click "Autogenerate Secure Password" and **SAVE IT**
   - Database User Privileges: **Atlas admin** or **Read and write to any database**
   - Click "Add User"

### Step 3: Allow Network Access

1. **Security → Network Access** → Add IP Address
   - Click "Allow Access from Anywhere"
   - IP Address: `0.0.0.0/0` (auto-filled)
   - Click "Confirm"

### Step 4: Get Connection String

1. **Deployment → Database** → Click "Connect" on your cluster
2. Choose **"Connect your application"**
3. Driver: **Node.js** version **4.1 or later**
4. Copy the connection string:
   ```
   mongodb+srv://cherrygame:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 5: Update Your .env File

Open `backend\.env` and update:

```env
# Replace the MONGODB_URI line with your connection string
MONGODB_URI=mongodb+srv://cherrygame:YOUR_ACTUAL_PASSWORD@cluster0.xxxxx.mongodb.net/cherry-game?retryWrites=true&w=majority
```

**Important:**
- Replace `<password>` with your actual password
- Add `/cherry-game` before the `?` to specify the database name

### Step 6: Restart Your Server

```powershell
# Stop the current server (Ctrl+C in the backend terminal)
# Then restart:
cd backend
node server.js
```

You should see: `✅ Connected to MongoDB successfully!`

---

## 🖥️ Option 2: Local MongoDB (For Development)

### Step 1: Install MongoDB

Download: https://www.mongodb.com/try/download/community

**Windows:**
1. Download MongoDB Community Server (MSI)
2. Run installer
3. Choose "Complete" setup
4. Install MongoDB as a Service: ✅ Yes
5. Install MongoDB Compass: ✅ Yes (GUI tool)

### Step 2: Verify Installation

```powershell
# Check if MongoDB is running
Get-Service MongoDB
```

Should show: Status = Running

### Step 3: Update .env

Your `.env` already has the local connection:
```env
MONGODB_URI=mongodb://localhost:27017/cherry-game
```

This is the default and will work automatically!

### Step 4: Restart Server

```powershell
cd backend
node server.js
```

You should see: `✅ Connected to MongoDB successfully!`

---

## 🔍 Verify Connection

### Test Your Backend

1. **Start the server:**
   ```powershell
   cd backend
   node server.js
   ```

2. **Look for this message:**
   ```
   ✅ Connected to MongoDB successfully!
   📊 Database: MongoDB Atlas (Cloud)
   ```
   OR
   ```
   ✅ Connected to MongoDB successfully!
   📊 Database: Local MongoDB
   ```

3. **Test the API:**
   ```powershell
   curl http://localhost:4000/api/health
   ```

### Create a Test User

```powershell
curl -X POST http://localhost:4000/api/register `
  -H "Content-Type: application/json" `
  -d '{"username":"testuser","email":"test@test.com","password":"test123"}'
```

Should return user data with `_id` from MongoDB!

---

## 🎮 Play with Database

### MongoDB Compass (GUI)

If you installed MongoDB Compass:

1. Open MongoDB Compass
2. **For Atlas:** Paste your connection string
3. **For Local:** Use `mongodb://localhost:27017`
4. Click "Connect"
5. Browse databases → `cherry-game` → collections:
   - `users` - All registered users
   - `games` - Game history

### View Your Data

You can see:
- User profiles
- Game statistics
- Win/loss records
- Game history

---

## 🚨 Troubleshooting

### "MongoNetworkError: failed to connect"

**MongoDB Atlas:**
- Check IP whitelist: 0.0.0.0/0 allowed?
- Verify username/password are correct
- Wait 1-2 minutes after creating cluster

**Local MongoDB:**
```powershell
# Check if service is running
Get-Service MongoDB

# If not running, start it
Start-Service MongoDB
```

### "Authentication failed"

- Double-check username and password in connection string
- Password should not have special characters that need URL encoding
- If it does, use MongoDB Compass to connect and test first

### "Cannot read properties of undefined"

- Make sure you added `/cherry-game` to the connection string before `?`
- Correct: `...mongodb.net/cherry-game?retryWrites=true`
- Wrong: `...mongodb.net/?retryWrites=true`

---

## 📊 Production Setup

### For Render/Vercel Deployment

Add to Render environment variables:
```
MONGODB_URI = mongodb+srv://cherrygame:PASSWORD@cluster0.xxxxx.mongodb.net/cherry-game?retryWrites=true&w=majority
```

Your app will automatically use it!

---

## ✅ Connection Checklist

- [ ] MongoDB Atlas account created OR local MongoDB installed
- [ ] Database user created with password
- [ ] Network access allowed (0.0.0.0/0 for Atlas)
- [ ] Connection string copied
- [ ] `backend\.env` updated with MONGODB_URI
- [ ] Server restarted
- [ ] See "✅ Connected to MongoDB successfully!" message
- [ ] Test user registration works

---

**🎉 Once connected, your game data will persist across server restarts!**

All user accounts, profiles, and game history will be saved to MongoDB.
