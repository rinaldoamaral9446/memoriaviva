# Deploy Guide - Memória Cultural Viva

## 🚀 Quick Deploy Guide

### Prerequisites
- ✅ GitHub account
- ✅ Railway account (https://railway.app) - Free tier
- ✅ Vercel account (https://vercel.com) - Free tier
- ✅ Gemini API Key

---

## Part 1: Backend Deploy (Railway)

### Step 1: Push to GitHub
```bash
# If not initialized yet
cd "/Users/rinaldoamaral/Meus projetos/MemViva"
git init
git add .
git commit -m "Initial commit - Memória Cultural Viva"

# Create repo on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/memoriaviva.git
git branch -M main
git push -u origin main
```

### Step 2: Create Railway Project
1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `memoriaviva` repository
5. Select `backend` as root directory

### Step 3: Add PostgreSQL Database
1. In your project dashboard, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway will create `DATABASE_URL` automatically

### Step 4: Configure Environment Variables
Go to backend service → "Variables" tab and add:

```
JWT_SECRET=your-super-secret-key-minimum-32-characters-long
GEMINI_API_KEY=your-actual-gemini-api-key
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app (update after Vercel deploy)
```

### Step 5: Configure Build
1. Go to backend service → "Settings"
2. Build Command: `npm run build`
3. Start Command: `npm start`
4. Click "Deploy"

### Step 6: Verify Deployment
- Check logs for "Server running on port XXXX"
- Copy your Railway URL: `https://xxxxx.railway.app`
- Test: Open `https://xxxxx.railway.app/api/health`
- Should return: `{"status":"ok","message":"Server is running"}`

### Step 7: Run Seed (Optional)
```bash
# Install Railway CLI
npm install -g railway

# Login
railway login

# Link to project
railway link

# Run seed
railway run npm run seed
```

---

## Part 2: Frontend Deploy (Vercel)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login
```bash
vercel login
```

### Step 3: Deploy Frontend
```bash
cd frontend
vercel

# Answer prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name? memoriaviva
# - In which directory is your code? ./
# - Override settings? N
```

### Step 4: Add Environment Variable
```bash
# In Vercel dashboard or CLI:
vercel env add VITE_API_URL

# When prompted, enter:
# Value: https://YOUR-BACKEND.railway.app
# Environment: Production, Preview, Development
```

### Step 5: Production Deploy
```bash
vercel --prod
```

### Step 6: Get Your URL
- Vercel will give you a URL: `https://memoriaviva-xxx.vercel.app`
- Copy this URL

---

## Part 3: Final Configuration

### Update Railway CORS
1. Go back to Railway
2. Backend service → Variables
3. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://memoriaviva-xxx.vercel.app
   ```
4. Redeploy backend

---

## Part 4: Testing

### Test Backend
```bash
curl https://YOUR-BACKEND.railway.app/api/health
# Should return: {"status":"ok","message":"Server is running"}
```

### Test Frontend
1. Open your Vercel URL in browser
2. Click "Criar conta"
3. Register a new user
4. Login
5. Create a memory
6. Upload an image (if working)

---

## Troubleshooting

### Backend won't start
- Check Railway logs
- Verify all environment variables are set
- Check if DATABASE_URL is present

### Frontend can't reach backend
- Verify VITE_API_URL in Vercel environment variables
- Check CORS settings in Railway (FRONTEND_URL)
- Check browser console for errors

### Database connection error
- Verify DATABASE_URL in Railway
- Check if PostgreSQL addon is running
- Try: `railway run npx prisma studio`

### Images not uploading
- Check uploads directory exists
- Railway disk is ephemeral (files deleted on redeploy)
- For production, consider cloud storage (S3, Cloudinary)

---

## Cost Summary

✅ **FREE TIER:**
- Railway: $5/month credit
- Vercel: Unlimited for hobby projects
- Total: $0/month (under limits)

📈 **If you scale:**
- Railway Pro: $20/month
- Vercel Pro: $20/month

---

## Next Steps

After deployment:
1. Add custom domain (optional)
2. Configure email sending (for password reset)
3. Set up monitoring (Sentry, LogRocket)
4. Enable automated backups
5. Add CI/CD pipeline

---

## Support Links

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs

---

**Need help?** Check the implementation_plan.md for detailed troubleshooting!
