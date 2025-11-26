# 🚀 Deploy Guide - Railway & Vercel

**Repository:** https://github.com/rinaldoamaral9446/memoriaviva

---

## Part 1: Deploy Backend (Railway)

### Step 1: Create railway Project
1. **Go to:** https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize GitHub if needed
5. Select **"rinaldoamaral9446/memoriaviva"**

### Step 2: Configure Root Directory
⚠️ **IMPORTANT:** Railway needs to know where the backend is!
1. Click on the deployed service
2. Go to **"Settings"**
3. Scroll to **"Service"** section
4. Set **"Root Directory"**: `backend`
5. Set **"Build Command"**: `npm install && npx prisma generate`
6. Set **"Start Command"**: `npm start`

### Step 3: Add PostgreSQL Database
1. In your project dashboard, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway automatically creates `DATABASE_URL` variable

### Step 4: Set Environment Variables
Click on your backend service → **"Variables"** tab → Add these:

```
JWT_SECRET=MemViva2025SecretKeyUltraSecure321
GEMINI_API_KEY=AIzaSyAGXxB_S39lY1I5GH2cEmeHN9gJqRNWqgM
NODE_ENV=production
FRONTEND_URL=https://placeholder.vercel.app
```
*(We'll update `FRONTEND_URL` after Vercel deploy)*

### Step 5: Deploy
-   Railway will auto-deploy
-   Wait for build to complete (~2-3 min)
-   Copy your Railway URL: **https://xxxxx.up.railway.app**

### Step 6: Test Backend
-   Visit: `https://your-railway-url.up.railway.app/api/health`
-   Should return: `{"status":"ok","message":"Server is running"}`

---

## Part 2: Deploy Frontend (Vercel)

### Step 1: Import Project
1. **Go to:** https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. Select **"rinaldoamaral9446/memoriaviva"**

### Step 2: Configure Framework
-   **Framework Preset:** Vite
-   **Root Directory:** `frontend`
-   **Build Command:** `npm run build`
-   **Output Directory:** `dist`

### Step 3: Add Environment Variable
Click **"Environment Variables"**:
```
Name: VITE_API_URL
Value: https://YOUR-RAILWAY-URL.up.railway.app
```
*(Replace with your actual Railway URL from Step 5 above)*

### Step 4: Deploy
-   Click **"Deploy"**
-   Wait ~1-2 minutes
-   Copy your Vercel URL: **https://memoriaviva.vercel.app**

---

## Part 3: Final Configuration

### Update Railway CORS
1. Go back to **Railway**
2. Click on backend service → **"Variables"**
3. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://memoriaviva.vercel.app
   ```
4. Service will auto-redeploy

---

## ✅ Verification Checklist

- [ ] Backend health: `https://your-railway.up.railway.app/api/health`
- [ ] Frontend loads at Vercel URL
- [ ] Can create account and login
- [ ] Can create a memory
- [ ] Voice-to-Memory works
- [ ] Agent Marketplace loads
- [ ] Roberto speaks in production

---

## 🎯 Quick Links
-   **GitHub:** https://github.com/rinaldoamaral9446/memoriaviva
-   **Railway:** https://railway.app
-   **Vercel:** https://vercel.com

---

**Total Time:** ~15-20 minutes
**Cost:** $0/month (free tier)
