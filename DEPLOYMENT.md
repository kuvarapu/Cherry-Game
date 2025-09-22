# Cherry Game — Deployment Guide

This guide explains how to deploy the backend (Node/Express) and the frontend (React) using free services.

## Prerequisites
- GitHub repository connected (this repo)
- Node.js 18+
- MongoDB Atlas account (or keep in-memory mode for dev only)

## Backend — Render
1. Push your code to GitHub (main branch).
2. Go to https://dashboard.render.com and create a New Web Service.
3. Connect this GitHub repo.
4. In settings:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Environment:
     - `PORT`: leave blank (Render sets `PORT` automatically)
     - `MONGODB_URI`: your Atlas connection string
     - `JWT_SECRET`: any strong random string
     - `CORS_ORIGIN`: your frontend URL (e.g., `https://your-site.netlify.app`)
5. Deploy. Note the service URL, e.g. `https://cherry-game-backend.onrender.com`.

## Frontend — Netlify
1. In `frontend/netlify.toml`, set your backend URL in the first redirect (replace `YOUR_BACKEND_ON_RENDER`).
2. Push to GitHub.
3. Go to https://app.netlify.com, New site from Git.
4. Select this repo and set:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/build`
   - Environment variable: `REACT_APP_API_BASE` = `https://<backend>.onrender.com/api`
5. Deploy. Your site will be available at `https://<your-site>.netlify.app`.

## Local development
- Backend:
  ```powershell
  cd backend
  npm install
  node server.js
  ```
- Frontend:
  ```powershell
  cd frontend
  npm install
  npm start
  ```

## Troubleshooting
- Registration failing locally? Backend uses in-memory users for dev; for prod, set `MONGODB_URI` to a valid Atlas URI.
- CORS errors? Set `CORS_ORIGIN` on the backend to your frontend origin.
- API base wrong? Set `REACT_APP_API_BASE` on the frontend to `https://<backend>/api`.
