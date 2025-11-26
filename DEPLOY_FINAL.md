# 🚀 Deploy Guide - Render & Vercel

**Repository:** https://github.com/rinaldoamaral9446/memoriaviva

---

## Part 1: Deploy Backend (Render)

### Step 1: Create Web Service
1. **Go to:** https://render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your repo: **rinaldoamaral9446/memoriaviva**

### Step 2: Configure Service
Fill in the fields:
```
Name: memoriaviva-backend
Region: Oregon (US West) - or closest to you
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install && npx prisma generate
Start Command: npm start
```

### Step 3: Environment Variables
Click **"Advanced"** or **"Environment"** tab and add:
```
GEMINI_API_KEY=your-gemini-api-key
JWT_SECRET=your-secure-jwt-secret
NODE_ENV=production
```
*(Do not add DATABASE_URL yet)*

### Step 4: Create Database (PostgreSQL)
1. Dashboard → **"New +"** → **"PostgreSQL"**
2. Name: `memoriaviva-db`
3. Plan: **Free**
4. Click **"Create Database"**
5. Copy **"Internal Database URL"**

### Step 5: Connect Database
1. Go back to **memoriaviva-backend** service
2. Environment Variables → Add:
   ```
   DATABASE_URL=<paste-internal-database-url>
   ```
3. Save Changes (Render will auto-redeploy)

> [!WARNING]
> **Ephemeral Storage**: Render's free tier disk is ephemeral. Images uploaded locally will be lost when the server restarts or redeploys. For production, use AWS S3 or Cloudinary.

---

## Part 2: Deploy Frontend (Vercel)

### Step 1: Import Project
1. **Go to:** https://vercel.com
2. **"Add New..."** → **"Project"**
3. Select **"rinaldoamaral9446/memoriaviva"**

### Step 2: Configure
- **Framework Preset:** Vite
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Step 3: Environment Variable
Add variable:
```
Name: VITE_API_URL
Value: https://memoriaviva-backend.onrender.com
```
*(Replace with your actual Render backend URL)*

### Step 4: Deploy
- Click **"Deploy"**

---

## Part 3: Final Configuration

### Update Backend CORS
1. Go to Render → **memoriaviva-backend** → **Environment**
2. Add/Update:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Save (auto-redeploy)

---

## ✅ Verification Checklist

- [ ] Backend health: `https://your-backend.onrender.com/api/health`
- [ ] Frontend loads at Vercel URL
- [ ] Can create account and login
- [ ] Can create a memory
- [ ] Voice-to-Memory works

---

## 🎯 Quick Links
- **Render:** https://render.com
- **Vercel:** https://vercel.com
