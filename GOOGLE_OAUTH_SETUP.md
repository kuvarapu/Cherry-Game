# Google OAuth Setup Guide for Cherry Game

## 🎯 Overview
Google OAuth has been integrated into Cherry Game! Users can now sign in with their Google account.

## 📋 Prerequisites
You need to create a Google Cloud Project and get OAuth credentials.

## 🔧 Setup Steps

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Create Project"** or select an existing project
3. Give your project a name (e.g., "Cherry Game")
4. Click **"Create"**

### Step 2: Enable Google+ API

1. In the Google Cloud Console, go to **"APIs & Services"** > **"Library"**
2. Search for **"Google+ API"** or **"Google Identity"**
3. Click on it and press **"Enable"**

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** > **"OAuth consent screen"**
2. Choose **"External"** user type (unless you have Google Workspace)
3. Click **"Create"**
4. Fill in the required fields:
   - **App name**: Cherry Game
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **"Save and Continue"**
6. On the **Scopes** page, click **"Add or Remove Scopes"**
7. Add these scopes:
   - `userinfo.email`
   - `userinfo.profile`
8. Click **"Save and Continue"**
9. Add test users (your email) if app is in testing mode
10. Click **"Save and Continue"**

### Step 4: Create OAuth Credentials

1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"Create Credentials"** > **"OAuth client ID"**
3. Choose **"Web application"**
4. Fill in the details:
   - **Name**: Cherry Game Web Client
   - **Authorized JavaScript origins**: 
     - `http://localhost:8080`
     - `http://localhost:4000`
   - **Authorized redirect URIs**: 
     - `http://localhost:4000/api/auth/google/callback`
5. Click **"Create"**
6. **Copy the Client ID and Client Secret** - you'll need these!

### Step 5: Update Backend Configuration

1. Open `backend/config.js`
2. Replace the placeholder values:

```javascript
GOOGLE_CLIENT_ID: 'YOUR_ACTUAL_CLIENT_ID_HERE',
GOOGLE_CLIENT_SECRET: 'YOUR_ACTUAL_CLIENT_SECRET_HERE',
```

**OR** (Better for production):

Create a `.env` file in the `backend` folder:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

### Step 6: Restart Backend Server

```bash
cd backend
node server.js
```

## 🎮 How to Use

### For Users:
1. Go to the login page: `http://localhost:8080`
2. Click the **"Sign in with Google"** button
3. Choose your Google account
4. Grant permissions
5. You'll be automatically logged in and redirected to the game menu!

### Features:
- ✅ One-click Google Sign-In
- ✅ Automatic account creation for new users
- ✅ Links Google account to existing email users
- ✅ Secure JWT token generation
- ✅ Profile data synced with your Google account

## 🔐 Security Notes

- Never commit your `.env` file or actual credentials to Git
- Add `.env` to your `.gitignore` file
- For production, use environment variables
- Always use HTTPS in production
- Set `cookie: { secure: true }` in session config for production

## 🐛 Troubleshooting

### "Google authentication failed"
- Check that your Client ID and Secret are correct
- Verify redirect URI matches exactly: `http://localhost:4000/api/auth/google/callback`
- Make sure Google+ API is enabled

### "Redirect URI mismatch"
- Go to Google Cloud Console > Credentials
- Add the exact redirect URI to authorized redirect URIs
- Don't forget the protocol (`http://`)

### "App is not verified"
- This is normal for development
- Click "Advanced" > "Go to Cherry Game (unsafe)" to continue
- For production, submit your app for verification

## 📝 API Endpoints

- **GET** `/api/auth/google` - Initiates Google OAuth flow
- **GET** `/api/auth/google/callback` - Handles OAuth callback
- **POST** `/api/login` - Traditional username/password login
- **POST** `/api/register` - Traditional registration

## 🎨 User Experience Flow

```
User clicks "Sign in with Google"
        ↓
Redirects to Google login page
        ↓
User selects Google account & grants permissions
        ↓
Google redirects to /api/auth/google/callback
        ↓
Backend creates/finds user & generates JWT token
        ↓
Redirects to frontend with token
        ↓
User is logged in automatically! 🎉
```

## 📦 Dependencies Added

- `passport` - Authentication middleware
- `passport-google-oauth20` - Google OAuth 2.0 strategy
- `express-session` - Session management

## 🚀 Production Deployment

For production deployment:

1. Update redirect URIs in Google Cloud Console to your production domain
2. Set environment variables on your hosting platform
3. Enable HTTPS
4. Update `GOOGLE_CALLBACK_URL` in config
5. Set `cookie: { secure: true }` in session config
6. Consider publishing your OAuth consent screen

---

**Enjoy seamless Google Sign-In! 🍒**
