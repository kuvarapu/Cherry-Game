# MongoDB Setup Guide for Cherry Game

## 🚨 **Current Issue:**
Registration is failing because MongoDB is not connected. The backend server is running but can't save user data.

## 🔧 **Quick Fix Options:**

### **Option 1: Install MongoDB Locally (Recommended)**

1. **Download MongoDB Community Server:**
   - Go to: https://www.mongodb.com/try/download/community
   - Download Windows version
   - Install with default settings

2. **Verify Installation:**
   - MongoDB should start automatically as a Windows service
   - Check Services (services.msc) for "MongoDB" service

3. **Restart Backend:**
   - Stop the current backend (Ctrl+C)
   - Run: `cd backend && npm start`

### **Option 2: Use MongoDB Atlas (Cloud - Free)**

1. **Create MongoDB Atlas Account:**
   - Go to: https://www.mongodb.com/atlas
   - Sign up for free account
   - Create free cluster

2. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

3. **Update Backend:**
   - Create `backend/config.js` file
   - Add your MongoDB Atlas connection string
   - Restart backend server

### **Option 3: Use Environment Variable**

1. **Set Environment Variable:**
   ```bash
   set MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cherry_game
   ```

2. **Restart Backend:**
   - Stop current backend (Ctrl+C)
   - Run: `cd backend && npm start`

## ✅ **After Setup:**
- Backend should show: "✅ Connected to MongoDB successfully!"
- Registration should work
- You can create users and play the game

## 🆘 **Need Help?**
- Check MongoDB service is running
- Verify connection string format
- Check firewall/network settings
- Try MongoDB Atlas if local installation fails
