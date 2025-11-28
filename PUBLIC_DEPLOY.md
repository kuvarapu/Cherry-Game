# 🚀 Quick Public Deployment Guide

## Deploy Your Cherry Game to the Internet - FREE!

This guide will help you create a public link for your Cherry Game in minutes.

---

## 🎯 Recommended: Render + Vercel (100% Free)

### Step 1: Deploy Backend to Render.com

**1. Push your code to GitHub:**
```powershell
cd "D:\CHERRY GAME"
git add .
git commit -m "Ready for deployment"
git push origin main
```

**2. Deploy on Render:**
- Go to [https://render.com](https://render.com)
- Sign up/Login with GitHub
- Click "New +" → "Web Service"
- Connect your `Cherry-Game` repository
- Render will auto-detect the configuration from `render.yaml`
- Click "Create Web Service"

**3. Add Environment Variables:**
In Render dashboard, add:
```
MONGODB_URI = mongodb+srv://your-mongodb-atlas-uri
JWT_SECRET = (auto-generated)
FRONTEND_URL = https://your-frontend.vercel.app
CORS_ORIGIN = https://your-frontend.vercel.app
```

**4. Get your backend URL:**
```
https://cherry-game-backend.onrender.com
```

### Step 2: Deploy Frontend to Vercel

**1. Install Vercel CLI:**
```powershell
npm install -g vercel
```

**2. Login to Vercel:**
```powershell
vercel login
```

**3. Update frontend config:**
Edit `frontend/public/config.js`:
```javascript
window.CHERRY_GAME_CONFIG = {
  API_URL: 'https://cherry-game-backend.onrender.com/api'
};
window.CHERRY_GAME_API_URL = window.CHERRY_GAME_CONFIG.API_URL;
```

**4. Deploy:**
```powershell
cd "D:\CHERRY GAME"
vercel --prod
```

**5. Your public link:**
```
https://cherry-game.vercel.app
```

---

## 🔗 Alternative: Railway (One-Click Deploy)

### Backend on Railway

**1. Click this button to deploy:**
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/kuvarapu/Cherry-Game)

**2. Or manual deploy:**
- Go to [https://railway.app](https://railway.app)
- "New Project" → "Deploy from GitHub repo"
- Select `Cherry-Game`
- Add environment variables:
  ```
  MONGODB_URI=your-mongodb-uri
  JWT_SECRET=your-secret-key
  PORT=4000
  ```

**3. Get your public URL:**
```
https://cherry-game-production.up.railway.app
```

---

## 🗄️ Database: MongoDB Atlas (Free)

**1. Create free cluster:**
- Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
- Create account → Create FREE cluster (M0)
- Choose region closest to you

**2. Create database user:**
- Database Access → Add New User
- Username: `cherrygame`
- Password: (auto-generate and save it)
- Built-in Role: Read and write to any database

**3. Whitelist IP:**
- Network Access → Add IP Address
- Click "Allow Access from Anywhere" (0.0.0.0/0)

**4. Get connection string:**
- Databases → Connect → Connect your application
- Copy the connection string:
```
mongodb+srv://cherrygame:<password>@cluster0.xxxxx.mongodb.net/cherry-game?retryWrites=true&w=majority
```
- Replace `<password>` with your actual password

---

## 🎮 Complete Deployment URLs

After deployment, you'll have:

### Frontend (Public Game):
```
https://cherry-game.vercel.app
```
or
```
https://cherry-game.netlify.app
```

### Backend API:
```
https://cherry-game-backend.onrender.com/api
```
or
```
https://cherry-game-production.up.railway.app/api
```

### Share this link with anyone:
```
🎮 Play Cherry Game: https://cherry-game.vercel.app
```

---

## ⚡ Ultra-Quick Deploy (Under 5 minutes)

### Option 1: Render Auto-Deploy

1. **Push to GitHub:**
```powershell
git add .
git commit -m "Deploy"
git push
```

2. **Connect to Render:**
- [https://render.com](https://render.com) → New Web Service → Connect GitHub
- Auto-deploys from `render.yaml`

3. **Done!** Your link: `https://cherry-game-backend.onrender.com`

### Option 2: Vercel Auto-Deploy

```powershell
vercel --prod
```
**Done!** Your link: `https://cherry-game.vercel.app`

---

## 🔧 Update Deployment After Changes

### Update Backend (Render):
```powershell
git add .
git commit -m "Update game"
git push
```
Render auto-deploys on push!

### Update Frontend (Vercel):
```powershell
vercel --prod
```

---

## 📱 Mobile-Friendly Public Link

Your deployed game will be accessible from:
- ✅ Desktop browsers
- ✅ Mobile phones
- ✅ Tablets
- ✅ Any device with internet

---

## 🌐 Custom Domain (Optional)

### Add your .in domain:

**On Vercel:**
1. Project Settings → Domains
2. Add `cherrygame.in`
3. Update DNS:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

**On Render:**
1. Settings → Custom Domain
2. Add `api.cherrygame.in`
3. Update DNS:
   ```
   Type: CNAME
   Name: api
   Value: your-app.onrender.com
   ```

---

## 🎉 Test Your Public Link

Once deployed, test:
1. Open your public URL
2. Register a new account
3. Play a game
4. Check profile stats
5. Share the link with friends!

---

## 🚨 Troubleshooting

### "Cannot connect to backend"
- Check `frontend/public/config.js` has correct backend URL
- Verify CORS_ORIGIN in backend environment variables
- Check backend is running: visit `https://your-backend.onrender.com/api/health`

### "Database connection failed"
- Verify MongoDB Atlas connection string
- Check IP whitelist (0.0.0.0/0)
- Ensure database user has correct permissions

### "Google OAuth not working"
- Update Google Console redirect URIs with production URLs
- Set environment variables in Render dashboard

---

## 📊 Free Tier Limits

### Render (Backend):
- ✅ 750 hours/month
- ✅ Auto-sleep after 15 min inactivity
- ✅ First request may take 30s (cold start)

### Vercel (Frontend):
- ✅ Unlimited bandwidth
- ✅ 100 GB/month
- ✅ Always fast (no cold starts)

### MongoDB Atlas:
- ✅ 512 MB storage
- ✅ Good for ~10,000 users

---

## 🔗 Quick Links

- **Render Dashboard:** https://dashboard.render.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **MongoDB Atlas:** https://cloud.mongodb.com
- **GitHub Repo:** https://github.com/kuvarapu/Cherry-Game

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas cluster created
- [ ] Backend deployed to Render
- [ ] Environment variables configured
- [ ] Frontend config updated with backend URL
- [ ] Frontend deployed to Vercel
- [ ] Test public link
- [ ] Share with friends!

---

**Your Cherry Game is now LIVE on the internet! 🎮🍒**
