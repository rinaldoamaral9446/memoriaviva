# Memória Cultural Viva - Platform Ready for Deploy! 🚀

## 📊 Project Status: 95% Complete

Plataforma multi-tenant de preservação de memórias culturais com IA integrada.

---

## ✅ Features Implemented

### Core MVP (100%)
- ✅ User authentication (JWT)
- ✅ User registration with organization selector
- ✅ Multi-tenant architecture (4 organizations)
- ✅ Complete CRUD for memories
- ✅ AI memory processing (Gemini)
- ✅ Search & filters
- ✅ Timeline visualization
- ✅ Image upload system
- ✅ Dynamic branding per organization
- ✅ Organization-specific AI prompts

### Production Ready (95%)
- ✅ CORS configuration
- ✅ Environment variables setup
- ✅ Build scripts configured
- ✅ Database migrations ready
- ✅ API endpoints centralized
- ⏸️ Deploy to Railway (manual step)
- ⏸️ Deploy to Vercel (manual step)

---

## 🎯 Quick Start (Local)

### Backend
```bash
cd backend
npm install
npm run dev  # Port 5001
```

### Frontend
```bash
cd frontend
npm install
npm run dev  # Port 5173
```

### Test Credentials
```
Organization: Prefeitura de São Paulo
Email: gestor@sp.gov.br
Password: senha123
```

---

## 🚀 Deploy to Production

**Full guide:** See [DEPLOY.md](./DEPLOY.md)

### Quick Summary:

1. **Push to GitHub**
2. **Deploy Backend (Railway)**
   - Connect GitHub repo
   - Add PostgreSQL
   - Set environment variables
   - Deploy

3. **Deploy Frontend (Vercel)**
   - Connect GitHub repo
   - Add VITE_API_URL
   - Deploy

**Estimated time:** 30-40 minutes  
**Cost:** $0/month (free tier)

---

## 📁 Project Structure

```
MemViva/
├── backend/               # Node.js + Express + Prisma
│   ├── controllers/       # Business logic
│   ├── routes/           # API endpoints
│   ├── middleware/       # Auth, CORS
│   ├── prisma/           # Database schema & migrations
│   ├── config/           # Multer, etc
│   └── uploads/          # User-uploaded files
│
├── frontend/             # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route pages
│   │   ├── context/     # React Context (Auth, Org)
│   │   ├── layouts/     # Layout wrappers
│   │   └── config/      # API endpoints
│   └── public/
│
├── DEPLOY.md            # Deployment guide
└── README.md            # This file
```

---

## 🔑 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
GEMINI_API_KEY="your-gemini-key"
FRONTEND_URL="https://your-frontend.vercel.app"
```

### Frontend (.env)
```env
VITE_API_URL="https://your-backend.railway.app"
```

---

## 🎨 Tech Stack

**Frontend:**
- ⚛️ React 18
- ⚡ Vite
- 🎨 Tailwind CSS v3
- 🧭 React Router
- 🔐 JWT Authentication

**Backend:**
- 🟢 Node.js + Express
- 🗄️ PostgreSQL + Prisma ORM
- 🔐 bcryptjs + JWT
- 🤖 Google Gemini AI
- 📁 Multer (file uploads)

**Deploy:**
- 🚂 Railway (backend + DB)
- ▲ Vercel (frontend)

---

## 📊 Database Schema

```
User
  - id, name, email, password
  - role (user/admin)
  - organizationId → Organization

Organization
  - id, name, slug
  - primaryColor, secondaryColor
  - logo, domain
  - config (JSON - AI prompts, features)

Memory
  - id, title, description, content
  - eventDate, location, category
  - mediaUrl, tags
  - userId → User
  - organizationId → Organization
```

---

## 🧪 Testing

### Test Organizations
1. **Organização Demo** (demo)
2. **Prefeitura de São Paulo** (sp)
3. **Prefeitura do Rio** (rio)
4. **Empresa ABC** (empresa-abc)

Each has custom branding (colors, logo) and AI prompts.

---

## 📝 Next Steps (Post-Deploy)

### Phase 13 - Enhancements (Optional)
- [ ] Password recovery (with SMTP)
- [ ] Email verification
- [ ] Landing page
- [ ] User dashboard with charts
- [ ] Admin panel
- [ ] Cloud storage for uploads (S3/Cloudinary)
- [ ] Custom domains
- [ ] Rate limiting
- [ ] Analytics

---

## 📞 Support

- **Deploy Guide:** [DEPLOY.md](./DEPLOY.md)

---

## ⚖️ License

Private project - All rights reserved

---

**Ready to deploy!** Follow DEPLOY.md for step-by-step instructions. 🎉
