#!/bin/bash
# Cherry Game VPS Deployment Script for Ubuntu 20.04/22.04
# Run this script on your VPS as root or with sudo

set -e

echo "🍒 Cherry Game VPS Deployment"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root or with sudo" 
   exit 1
fi

echo -e "${YELLOW}1. Updating system packages...${NC}"
apt update
apt upgrade -y

echo -e "${GREEN}✓ System updated${NC}"
echo ""

echo -e "${YELLOW}2. Installing Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
node --version
npm --version
echo -e "${GREEN}✓ Node.js installed${NC}"
echo ""

echo -e "${YELLOW}3. Installing MongoDB...${NC}"
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod
echo -e "${GREEN}✓ MongoDB installed and started${NC}"
echo ""

echo -e "${YELLOW}4. Installing Nginx...${NC}"
apt install -y nginx
systemctl start nginx
systemctl enable nginx
echo -e "${GREEN}✓ Nginx installed${NC}"
echo ""

echo -e "${YELLOW}5. Installing PM2 (Process Manager)...${NC}"
npm install -g pm2
echo -e "${GREEN}✓ PM2 installed${NC}"
echo ""

echo -e "${YELLOW}6. Installing Git...${NC}"
apt install -y git
echo -e "${GREEN}✓ Git installed${NC}"
echo ""

echo -e "${YELLOW}7. Creating application user...${NC}"
if ! id -u cherryapp > /dev/null 2>&1; then
    useradd -m -s /bin/bash cherryapp
    echo -e "${GREEN}✓ User 'cherryapp' created${NC}"
else
    echo -e "${GREEN}✓ User 'cherryapp' already exists${NC}"
fi
echo ""

echo -e "${YELLOW}8. Setting up application directory...${NC}"
APP_DIR="/var/www/cherry-game"
mkdir -p $APP_DIR
chown -R cherryapp:cherryapp $APP_DIR
echo -e "${GREEN}✓ Application directory created at $APP_DIR${NC}"
echo ""

echo ""
echo -e "${GREEN}=============================="
echo "✅ VPS Setup Complete!"
echo "==============================${NC}"
echo ""
echo "Next steps:"
echo "1. Clone your repository to $APP_DIR"
echo "2. Run the deploy script: ./deploy-to-vps.sh"
echo ""
echo "Example commands:"
echo "  cd $APP_DIR"
echo "  git clone https://github.com/kuvarapu/Cherry-Game.git ."
echo "  chown -R cherryapp:cherryapp ."
echo ""
