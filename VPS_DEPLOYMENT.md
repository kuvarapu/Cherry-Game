# VPS Deployment Guide - Cherry Game

## 🚀 Complete VPS Deployment Guide

This guide will help you deploy Cherry Game to any Ubuntu VPS (DigitalOcean, AWS EC2, Linode, etc.).

## Prerequisites

- Ubuntu 20.04 or 22.04 VPS
- Root or sudo access
- Domain name (optional but recommended)
- SSH access to your VPS

## Step-by-Step Deployment

### Step 1: Initial VPS Setup

**Connect to your VPS:**
```bash
ssh root@your-vps-ip
```

**Upload the setup script:**
```bash
# On your local machine
scp vps-setup.sh root@your-vps-ip:/root/

# On your VPS
chmod +x /root/vps-setup.sh
./vps-setup.sh
```

This script installs:
- Node.js 18
- MongoDB 7
- Nginx
- PM2 (Process Manager)
- Git

### Step 2: Deploy Your Application

**Clone your repository:**
```bash
cd /var/www/cherry-game
git clone https://github.com/kuvarapu/Cherry-Game.git .
chown -R cherryapp:cherryapp .
```

**Run deployment script:**
```bash
chmod +x deploy-to-vps.sh

# With your domain
./deploy-to-vps.sh yourdomain.com admin@yourdomain.com

# Without domain (will use VPS IP)
./deploy-to-vps.sh
```

### Step 3: Configure DNS (if using domain)

Point your domain to your VPS IP:

**A Record:**
```
Type: A
Name: @
Value: YOUR_VPS_IP
TTL: 3600
```

**Optional - www subdomain:**
```
Type: CNAME
Name: www
Value: yourdomain.com
TTL: 3600
```

### Step 4: Verify Deployment

**Check backend status:**
```bash
pm2 status
pm2 logs cherry-game-backend
```

**Check Nginx:**
```bash
sudo systemctl status nginx
curl http://localhost:4000/api/health
```

**Test in browser:**
- With domain: `https://yourdomain.com`
- Without domain: `http://YOUR_VPS_IP`

## 🔧 Configuration

### Environment Variables

Edit `backend/.env` on your VPS:
```bash
nano /var/www/cherry-game/backend/.env
```

**Required settings:**
```env
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://yourdomain.com
MONGODB_URI=mongodb://localhost:27017/cherry-game
JWT_SECRET=your-secret-key-here
SESSION_SECRET=your-session-secret-here
```

**Optional - Google OAuth:**
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
```

After editing, restart the backend:
```bash
pm2 restart cherry-game-backend
```

### Update Google OAuth Redirect URIs

If using Google OAuth, update your Google Cloud Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services → Credentials
3. Edit your OAuth 2.0 Client ID
4. Add to Authorized redirect URIs:
   - `https://yourdomain.com/api/auth/google/callback`

## 🔒 Security

### SSL Certificate (HTTPS)

The deployment script can set up SSL automatically using Let's Encrypt:

```bash
sudo certbot --nginx -d yourdomain.com -m admin@yourdomain.com --agree-tos
```

**Auto-renewal:**
```bash
sudo certbot renew --dry-run
```

### Firewall

Firewall is configured automatically:
- Port 22 (SSH)
- Port 80 (HTTP)
- Port 443 (HTTPS)

**Check firewall status:**
```bash
sudo ufw status
```

### MongoDB Security

**Create admin user:**
```bash
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "strong-password-here",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})
exit
```

**Enable authentication:**
```bash
sudo nano /etc/mongod.conf
```

Add:
```yaml
security:
  authorization: enabled
```

Restart MongoDB:
```bash
sudo systemctl restart mongod
```

Update `.env`:
```env
MONGODB_URI=mongodb://admin:strong-password-here@localhost:27017/cherry-game?authSource=admin
```

## 📊 Management

### PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs cherry-game-backend

# Restart
pm2 restart cherry-game-backend

# Stop
pm2 stop cherry-game-backend

# Start
pm2 start cherry-game-backend

# Monitor
pm2 monit
```

### Nginx Commands

```bash
# Status
sudo systemctl status nginx

# Restart
sudo systemctl restart nginx

# Reload config
sudo systemctl reload nginx

# Test config
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log

# View access logs
sudo tail -f /var/log/nginx/access.log
```

### MongoDB Commands

```bash
# Status
sudo systemctl status mongod

# Start
sudo systemctl start mongod

# Stop
sudo systemctl stop mongod

# Restart
sudo systemctl restart mongod

# Connect
mongosh

# View databases
mongosh --eval "show dbs"
```

## 🔄 Updates

### Update Your Application

```bash
cd /var/www/cherry-game

# Pull latest changes
git pull origin main

# Update backend dependencies
cd backend
npm install --production

# Restart backend
pm2 restart cherry-game-backend

# Clear nginx cache (if needed)
sudo systemctl reload nginx
```

### Automated Updates (Optional)

Create a update script:
```bash
nano /var/www/cherry-game/update.sh
```

```bash
#!/bin/bash
cd /var/www/cherry-game
git pull origin main
cd backend
npm install --production
pm2 restart cherry-game-backend
echo "✅ Update complete!"
```

```bash
chmod +x update.sh
./update.sh
```

## 🐛 Troubleshooting

### Backend not starting

**Check logs:**
```bash
pm2 logs cherry-game-backend --lines 100
```

**Common issues:**
- Missing `.env` file
- Wrong MongoDB URI
- Port 4000 already in use

**Check port:**
```bash
sudo lsof -i :4000
```

### Nginx 502 Bad Gateway

**Check backend is running:**
```bash
pm2 status
curl http://localhost:4000/api/health
```

**Check Nginx error log:**
```bash
sudo tail -f /var/log/nginx/error.log
```

### MongoDB connection error

**Check MongoDB status:**
```bash
sudo systemctl status mongod
```

**Test connection:**
```bash
mongosh mongodb://localhost:27017/cherry-game
```

### SSL certificate issues

**Check certificate:**
```bash
sudo certbot certificates
```

**Renew manually:**
```bash
sudo certbot renew
```

## 📈 Performance Optimization

### Enable Nginx caching

Edit Nginx config:
```bash
sudo nano /etc/nginx/sites-available/cherry-game
```

Add caching:
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m;

location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    # ... rest of config
}
```

### MongoDB indexing

```bash
mongosh cherry-game
```

```javascript
db.users.createIndex({ username: 1 }, { unique: true })
db.users.createIndex({ email: 1 }, { unique: true })
db.games.createIndex({ userId: 1, createdAt: -1 })
```

## 💾 Backup

### Automated MongoDB Backup

Create backup script:
```bash
sudo nano /usr/local/bin/backup-cherry-game.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/cherry-game"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
mongodump --db cherry-game --out $BACKUP_DIR/mongo_$DATE
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
```

```bash
sudo chmod +x /usr/local/bin/backup-cherry-game.sh
```

**Add to crontab:**
```bash
sudo crontab -e
```

Add:
```
0 2 * * * /usr/local/bin/backup-cherry-game.sh
```

## 🌟 Advanced Features

### Custom Domain for Multiple Environments

**Production:**
```
cherry-game.com → Production
```

**Staging:**
```
staging.cherry-game.com → Staging
```

Deploy both and use different Nginx configs.

### Load Balancing

For high traffic, run multiple backend instances:
```bash
pm2 start backend/server.js -i 4 --name cherry-game-backend
```

### Monitoring

**Install PM2 monitoring:**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
```

## 📞 Support

- Check logs first: `pm2 logs cherry-game-backend`
- Nginx logs: `/var/log/nginx/`
- MongoDB logs: `sudo journalctl -u mongod`

## ✅ Quick Reference

```bash
# Deployment
./deploy-to-vps.sh yourdomain.com admin@yourdomain.com

# Status check
pm2 status && sudo systemctl status nginx && sudo systemctl status mongod

# Restart everything
pm2 restart cherry-game-backend && sudo systemctl reload nginx

# View logs
pm2 logs cherry-game-backend --lines 50

# Update app
git pull && cd backend && npm install && pm2 restart cherry-game-backend
```
