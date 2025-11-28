# 🚀 Cherry Game - Quick Deployment Guide

## Choose Your Deployment Method

### 🐳 1. Docker (Easiest - Recommended)

**Requirements:** Docker & Docker Compose installed

```bash
# 1. Clone the repository
git clone https://github.com/kuvarapu/Cherry-Game.git
cd Cherry-Game

# 2. Create .env file
cat > .env << EOF
MONGO_USERNAME=admin
MONGO_PASSWORD=secure_password_here
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
CORS_ORIGIN=http://localhost
EOF

# 3. Start everything
docker-compose up -d

# 4. Access the game
# Frontend: http://localhost
# Backend: http://localhost:4000
```

**Management Commands:**
```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Update and restart
git pull && docker-compose up -d --build
```

---

### ☁️ 2. Render.com (Free Tier)

**Backend Deployment:**

1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** cherry-game-backend
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Add environment variables:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_secret_key
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_CALLBACK_URL=https://your-backend.onrender.com/api/auth/google/callback
   ```
6. Click "Create Web Service"

**Frontend Deployment:**

1. Click "New +" → "Static Site"
2. Connect same repository
3. Configure:
   - **Name:** cherry-game-frontend
   - **Root Directory:** `frontend/public`
   - **Publish Directory:** `.`
4. Click "Create Static Site"

---

### 🌐 3. Vercel (Frontend) + Railway (Backend)

**Backend on Railway:**

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add MongoDB database (from templates)
5. Configure environment variables
6. Deploy!

**Frontend on Vercel:**

```bash
cd frontend
npx vercel --prod
```

---

### 🔧 4. VPS/Server Deployment

**Quick Setup Script:**

```bash
#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update && sudo apt install -y mongodb-org
sudo systemctl start mongod && sudo systemctl enable mongod

# Install PM2 and Nginx
sudo npm install -g pm2
sudo apt install -y nginx

# Clone and setup
cd /var/www
sudo git clone https://github.com/kuvarapu/Cherry-Game.git
cd Cherry-Game/backend
npm ci --production

# Create .env file
sudo tee .env > /dev/null <<EOF
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb://localhost:27017/cherry_game
JWT_SECRET=$(openssl rand -base64 32)
EOF

# Start backend with PM2
pm2 start server.js --name cherry-game-backend
pm2 save && pm2 startup

# Setup Nginx
sudo tee /etc/nginx/sites-available/cherry-game > /dev/null <<'EOF'
server {
    listen 80;
    server_name _;

    location / {
        root /var/www/Cherry-Game/frontend/public;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/cherry-game /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

echo "✅ Deployment complete! Access at http://your-server-ip"
```

---

## 🔐 MongoDB Setup (Production)

### Option A: MongoDB Atlas (Recommended - Free Tier)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create cluster (M0 Free tier)
4. Add database user
5. Whitelist IP (0.0.0.0/0 for development)
6. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/cherry_game?retryWrites=true&w=majority
   ```

### Option B: Local MongoDB

```bash
# Install
sudo apt install -y mongodb-org

# Start
sudo systemctl start mongod
sudo systemctl enable mongod

# Connection string
MONGODB_URI=mongodb://localhost:27017/cherry_game
```

---

## 🔑 Environment Variables

Create `.env` file in backend directory:

```env
# Required
NODE_ENV=production
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_random_secret

# Optional - Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-backend-url.com/api/auth/google/callback

# CORS
CORS_ORIGIN=https://your-frontend-url.com
```

---

## ✅ Deployment Checklist

Before going live:

- [ ] Set strong `JWT_SECRET` (use: `openssl rand -base64 32`)
- [ ] Configure MongoDB with authentication
- [ ] Update Google OAuth redirect URIs
- [ ] Set correct `CORS_ORIGIN`
- [ ] Enable HTTPS/SSL
- [ ] Set up domain name
- [ ] Configure backups
- [ ] Set up monitoring
- [ ] Test all features
- [ ] Configure rate limiting

---

## 🐛 Common Issues

**"Cannot connect to MongoDB"**
```bash
# Check MongoDB is running
sudo systemctl status mongod

# Check connection string format
MONGODB_URI=mongodb://localhost:27017/cherry_game
```

**"CORS Error"**
```bash
# Update backend/server.js CORS configuration
# Set CORS_ORIGIN to match your frontend URL
```

**"Google OAuth fails"**
```bash
# Update redirect URI in Google Cloud Console
# Match GOOGLE_CALLBACK_URL exactly
```

---

## 📊 Monitoring

Add to backend for basic health monitoring:

```javascript
// In server.js
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});
```

---

## 🔄 Updating Deployment

```bash
# Pull latest changes
git pull origin main

# Docker
docker-compose down
docker-compose up -d --build

# VPS
cd /var/www/Cherry-Game
git pull
cd backend && npm ci --production
pm2 restart cherry-game-backend
```

---

## 📞 Need Help?

- **Documentation:** See `DEPLOYMENT.md` for detailed guides
- **Issues:** Open issue on GitHub
- **Docker:** See `docker-compose.yml`
- **CI/CD:** See `.github/workflows/deploy.yml`

**Happy Gaming! 🍒**
