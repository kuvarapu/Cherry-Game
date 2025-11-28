#!/bin/bash

# Cherry Game Deployment Test Script
# This script tests if your deployment is ready

echo "🍒 Cherry Game - Deployment Readiness Check"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 1. Check Node.js
echo "1️⃣  Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    check_pass "Node.js installed: $NODE_VERSION"
    if [[ "$NODE_VERSION" > "v18" ]]; then
        check_pass "Node.js version is 18 or higher"
    else
        check_warn "Node.js version should be 18 or higher"
    fi
else
    check_fail "Node.js is not installed"
fi
echo ""

# 2. Check npm
echo "2️⃣  Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    check_pass "npm installed: $NPM_VERSION"
else
    check_fail "npm is not installed"
fi
echo ""

# 3. Check backend dependencies
echo "3️⃣  Checking backend..."
if [ -f "backend/package.json" ]; then
    check_pass "Backend package.json found"
    if [ -d "backend/node_modules" ]; then
        check_pass "Backend dependencies installed"
    else
        check_warn "Backend dependencies not installed. Run: cd backend && npm install"
    fi
    
    if [ -f "backend/.env" ]; then
        check_pass "Backend .env file exists"
    else
        check_warn "Backend .env file not found. Copy .env.example to .env"
    fi
else
    check_fail "Backend package.json not found"
fi
echo ""

# 4. Check frontend
echo "4️⃣  Checking frontend..."
if [ -d "frontend/public" ]; then
    check_pass "Frontend public directory found"
    if [ -f "frontend/public/index.html" ]; then
        check_pass "Frontend index.html found"
    else
        check_fail "Frontend index.html not found"
    fi
    if [ -f "frontend/public/config.js" ]; then
        check_pass "Frontend config.js found"
    else
        check_warn "Frontend config.js not found"
    fi
else
    check_fail "Frontend public directory not found"
fi
echo ""

# 5. Check Docker
echo "5️⃣  Checking Docker..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    check_pass "Docker installed: $DOCKER_VERSION"
    
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version)
        check_pass "Docker Compose installed: $COMPOSE_VERSION"
    else
        check_warn "Docker Compose not installed (optional)"
    fi
else
    check_warn "Docker not installed (optional for deployment)"
fi
echo ""

# 6. Check environment variables
echo "6️⃣  Checking environment configuration..."
if [ -f "backend/.env" ]; then
    if grep -q "JWT_SECRET=" backend/.env; then
        check_pass "JWT_SECRET configured"
    else
        check_warn "JWT_SECRET not set in .env"
    fi
    
    if grep -q "MONGODB_URI=" backend/.env; then
        check_pass "MONGODB_URI configured"
    else
        check_warn "MONGODB_URI not set (using in-memory storage)"
    fi
    
    if grep -q "GOOGLE_CLIENT_ID=" backend/.env; then
        if grep -q "YOUR_GOOGLE_CLIENT_ID" backend/.env; then
            check_warn "Google OAuth not configured (optional)"
        else
            check_pass "Google OAuth configured"
        fi
    fi
fi
echo ""

# 7. Check Git
echo "7️⃣  Checking Git..."
if command -v git &> /dev/null; then
    check_pass "Git installed"
    if [ -d ".git" ]; then
        check_pass "Git repository initialized"
        CURRENT_BRANCH=$(git branch --show-current)
        check_pass "Current branch: $CURRENT_BRANCH"
    else
        check_warn "Not a Git repository"
    fi
else
    check_warn "Git not installed (needed for deployment)"
fi
echo ""

# 8. Summary
echo "=========================================="
echo "📊 Summary"
echo "=========================================="
echo ""
echo "✅ Core Requirements:"
echo "   • Node.js 18+ and npm"
echo "   • Backend dependencies"
echo "   • Frontend files"
echo ""
echo "🔧 Optional:"
echo "   • Docker for containerized deployment"
echo "   • MongoDB URI for persistent storage"
echo "   • Google OAuth for social login"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "Local Development:"
echo "  cd backend && npm install && node server.js"
echo "  cd frontend/public && python -m http.server 8080"
echo ""
echo "Docker Deployment:"
echo "  docker-compose up -d"
echo ""
echo "Production Deployment:"
echo "  See QUICK_DEPLOY.md for platform-specific guides"
echo ""
