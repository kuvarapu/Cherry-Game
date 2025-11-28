#!/bin/bash
# Deploy Cherry Game to VPS
# Run this script from the project directory on your VPS

set -e

# Load configuration if exists
if [ -f "./deploy-config.sh" ]; then
    source ./deploy-config.sh
fi

APP_DIR="${APP_DIR:-/var/www/cherry-game}"
DOMAIN="${1:-${DOMAIN:-cherrygame.in}}"
EMAIL="${2:-${EMAIL:-admin@cherrygame.in}}"

echo "🍒 Deploying Cherry Game"
echo "========================"
echo "Domain: $DOMAIN"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}1. Installing backend dependencies...${NC}"
cd backend
npm install --production
cd ..
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
echo ""

echo -e "${YELLOW}2. Setting up environment variables...${NC}"
if [ ! -f backend/.env ]; then
    cat > backend/.env << EOF
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://$DOMAIN
MONGODB_URI=mongodb://localhost:27017/cherry-game
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
CORS_ORIGIN=https://$DOMAIN

# Optional: Google OAuth
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
# GOOGLE_CALLBACK_URL=https://$DOMAIN/api/auth/google/callback
EOF
    echo -e "${GREEN}✓ Environment file created${NC}"
else
    echo -e "${BLUE}ℹ .env file already exists${NC}"
fi
echo ""

echo -e "${YELLOW}3. Updating frontend configuration...${NC}"
cat > frontend/public/config.js << EOF
window.CHERRY_GAME_CONFIG = {
  API_URL: 'https://$DOMAIN/api'
};
window.CHERRY_GAME_API_URL = window.CHERRY_GAME_CONFIG.API_URL;
EOF
echo -e "${GREEN}✓ Frontend configured${NC}"
echo ""

echo -e "${YELLOW}4. Setting up PM2 for backend...${NC}"
sudo -u cherryapp pm2 delete cherry-game-backend 2>/dev/null || true
sudo -u cherryapp pm2 start backend/server.js --name cherry-game-backend
sudo -u cherryapp pm2 save
sudo pm2 startup systemd -u cherryapp --hp /home/cherryapp
echo -e "${GREEN}✓ Backend running on PM2${NC}"
echo ""

echo -e "${YELLOW}5. Configuring Nginx...${NC}"
sudo tee /etc/nginx/sites-available/cherry-game > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Frontend
    location / {
        root $APP_DIR/frontend/public;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/cherry-game /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
echo -e "${GREEN}✓ Nginx configured${NC}"
echo ""

echo -e "${YELLOW}6. Setting up SSL with Let's Encrypt...${NC}"
if command -v certbot &> /dev/null; then
    echo "Certbot already installed"
else
    sudo apt install -y certbot python3-certbot-nginx
fi

if [ "$DOMAIN" != "cherrygame.in" ] || [ "$DOMAIN" = "cherrygame.in" ]; then
    echo -e "${BLUE}Run this command to get SSL certificate:${NC}"
    echo "sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m $EMAIL"
    echo ""
    read -p "Install SSL certificate now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m $EMAIL
        echo -e "${GREEN}✓ SSL certificate installed${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Skipping SSL setup${NC}"
    echo "Run manually: sudo certbot --nginx -d $DOMAIN -m $EMAIL"
fi
echo ""

echo -e "${YELLOW}7. Setting up firewall...${NC}"
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
echo -e "${GREEN}✓ Firewall configured${NC}"
echo ""

echo ""
echo -e "${GREEN}=============================="
echo "✅ Deployment Complete!"
echo "==============================${NC}"
echo ""
echo "Your Cherry Game is now running at:"
echo -e "${BLUE}🌐 https://$DOMAIN${NC}"
if [ "$DOMAIN" = "cherrygame.in" ]; then
    echo -e "${BLUE}🌐 https://www.$DOMAIN${NC}"
fi
echo ""
echo "Management commands:"
echo "  pm2 status              - Check backend status"
echo "  pm2 logs cherry-game-backend  - View backend logs"
echo "  pm2 restart cherry-game-backend  - Restart backend"
echo "  sudo systemctl status nginx     - Check Nginx status"
echo "  sudo systemctl reload nginx     - Reload Nginx config"
echo ""
echo "Update deployment:"
echo "  git pull origin main"
echo "  cd backend && npm install"
echo "  pm2 restart cherry-game-backend"
echo ""
