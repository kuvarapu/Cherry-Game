# Cherry Game Deployment Test Script (PowerShell)
# This script tests if your deployment is ready

Write-Host "`n🍒 Cherry Game - Deployment Readiness Check" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

function Write-PassCheck {
    param($message)
    Write-Host "✓ " -ForegroundColor Green -NoNewline
    Write-Host $message
}

function Write-FailCheck {
    param($message)
    Write-Host "✗ " -ForegroundColor Red -NoNewline
    Write-Host $message
}

function Write-WarnCheck {
    param($message)
    Write-Host "⚠ " -ForegroundColor Yellow -NoNewline
    Write-Host $message
}

# 1. Check Node.js
Write-Host "1️⃣  Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    Write-PassCheck "Node.js installed: $nodeVersion"
    if ([version]($nodeVersion -replace 'v','') -ge [version]"18.0") {
        Write-PassCheck "Node.js version is 18 or higher"
    } else {
        Write-WarnCheck "Node.js version should be 18 or higher"
    }
} catch {
    Write-FailCheck "Node.js is not installed"
}
Write-Host ""

# 2. Check npm
Write-Host "2️⃣  Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm -v
    Write-PassCheck "npm installed: $npmVersion"
} catch {
    Write-FailCheck "npm is not installed"
}
Write-Host ""

# 3. Check backend
Write-Host "3️⃣  Checking backend..." -ForegroundColor Yellow
if (Test-Path "backend\package.json") {
    Write-PassCheck "Backend package.json found"
    if (Test-Path "backend\node_modules") {
        Write-PassCheck "Backend dependencies installed"
    } else {
        Write-WarnCheck "Backend dependencies not installed. Run: cd backend; npm install"
    }
    
    if (Test-Path "backend\.env") {
        Write-PassCheck "Backend .env file exists"
    } else {
        Write-WarnCheck "Backend .env file not found. Copy .env.example to .env"
    }
} else {
    Write-FailCheck "Backend package.json not found"
}
Write-Host ""

# 4. Check frontend
Write-Host "4️⃣  Checking frontend..." -ForegroundColor Yellow
if (Test-Path "frontend\public") {
    Write-PassCheck "Frontend public directory found"
    if (Test-Path "frontend\public\index.html") {
        Write-PassCheck "Frontend index.html found"
    } else {
        Write-FailCheck "Frontend index.html not found"
    }
    if (Test-Path "frontend\public\config.js") {
        Write-PassCheck "Frontend config.js found"
    } else {
        Write-WarnCheck "Frontend config.js not found"
    }
} else {
    Write-FailCheck "Frontend public directory not found"
}
Write-Host ""

# 5. Check Docker
Write-Host "5️⃣  Checking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-PassCheck "Docker installed: $dockerVersion"
    
    try {
        $composeVersion = docker-compose --version
        Write-PassCheck "Docker Compose installed: $composeVersion"
    } catch {
        Write-WarnCheck "Docker Compose not installed (optional)"
    }
} catch {
    Write-WarnCheck "Docker not installed (optional for deployment)"
}
Write-Host ""

# 6. Check environment variables
Write-Host "6️⃣  Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path "backend\.env") {
    $envContent = Get-Content "backend\.env" -Raw
    
    if ($envContent -match "JWT_SECRET=") {
        Write-PassCheck "JWT_SECRET configured"
    } else {
        Write-WarnCheck "JWT_SECRET not set in .env"
    }
    
    if ($envContent -match "MONGODB_URI=") {
        Write-PassCheck "MONGODB_URI configured"
    } else {
        Write-WarnCheck "MONGODB_URI not set (using in-memory storage)"
    }
    
    if ($envContent -match "GOOGLE_CLIENT_ID=") {
        if ($envContent -match "YOUR_GOOGLE_CLIENT_ID") {
            Write-WarnCheck "Google OAuth not configured (optional)"
        } else {
            Write-PassCheck "Google OAuth configured"
        }
    }
}
Write-Host ""

# 7. Check Git
Write-Host "7️⃣  Checking Git..." -ForegroundColor Yellow
try {
    git --version | Out-Null
    Write-PassCheck "Git installed"
    if (Test-Path ".git") {
        Write-PassCheck "Git repository initialized"
        $currentBranch = git branch --show-current
        Write-PassCheck "Current branch: $currentBranch"
    } else {
        Write-WarnCheck "Not a Git repository"
    }
} catch {
    Write-WarnCheck "Git not installed (needed for deployment)"
}
Write-Host ""

# 8. Summary
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📊 Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Core Requirements:" -ForegroundColor Green
Write-Host "   • Node.js 18+ and npm"
Write-Host "   • Backend dependencies"
Write-Host "   • Frontend files"
Write-Host ""
Write-Host "🔧 Optional:" -ForegroundColor Yellow
Write-Host "   • Docker for containerized deployment"
Write-Host "   • MongoDB URI for persistent storage"
Write-Host "   • Google OAuth for social login"
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Local Development:" -ForegroundColor White
Write-Host "  cd backend; npm install; node server.js"
Write-Host "  cd frontend\public; python -m http.server 8080"
Write-Host ""
Write-Host "Docker Deployment:" -ForegroundColor White
Write-Host "  docker-compose up -d"
Write-Host ""
Write-Host "Production Deployment:" -ForegroundColor White
Write-Host "  See QUICK_DEPLOY.md for platform-specific guides"
Write-Host ""
