# 🚀 Deploy no Render.com - Guia Rápido (15 min)

**Repositório:** https://github.com/rinaldoamaral9446/memoriaviva

---

## Passo 1: Criar Conta no Render
1. Acesse: https://render.com
2. Clique em **"Get Started for Free"**
3. **Conecte com GitHub** (mais rápido)
4. Autorize o Render a acessar seus repositórios

---

## Passo 2: Deploy do Backend

### 2.1 Criar Web Service
1. No dashboard Render, clique **"New +"** → **"Web Service"**
2. Conecte seu repositório: **rinaldoamaral9446/memoriaviva**
3. Clique em **"Connect"**

### 2.2 Configurar o Service
Preencha os campos:

```
Name: memoriaviva-backend
Region: Oregon (US West) - mais próximo
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install && npx prisma generate
Start Command: npm start
```

### 2.3 Plano
- Selecione: **Free** ($0/mês)

### 2.4 Variáveis de Ambiente
Clique em **"Advanced"** e adicione:

```
GEMINI_API_KEY=AIzaSyAGXxB_S39lY1I5GH2cEmeHN9gJqRNWqgM
JWT_SECRET=MemViva2025SecretKeyUltraSecure321
NODE_ENV=production
```

**NÃO adicione DATABASE_URL ainda** - vamos fazer isso depois do PostgreSQL!

### 2.5 Criar Service
- Clique em **"Create Web Service"**
- ⏳ Aguarde (~2-3 min)

---

## Passo 3: Adicionar PostgreSQL

### 3.1 Criar Database
1. No dashboard Render, clique **"New +"** → **"PostgreSQL"**
2. Preencha:
   ```
   Name: memoriaviva-db
   Region: Oregon (mesmo do backend!)
   PostgreSQL Version: 16
   ```
3. Selecione plano: **Free**
4. Clique **"Create Database"**

### 3.2 Conectar ao Backend
1. Abra o banco de dados **memoriaviva-db**
2. Na página, você verá **"Internal Database URL"** - copie!
3. Volte ao serviço **memoriaviva-backend**
4. Vá em **"Environment"** (menu lateral)
5. Adicione nova variável:
   ```
   DATABASE_URL=<cole a Internal Database URL aqui>
   ```
6. Clique **"Save Changes"**

### 3.3 Rodar Migrations
Render vai fazer **redeploy automático**. Os logs vão mostrar:
```
✓ Prisma Client generated
✓ Migrations deployed
```

---

## Passo 4: Testar Backend

Após o deploy (status verde):

1. Copie a URL do backend: `https://memoriaviva-backend.onrender.com`
2. Teste: `https://memoriaviva-backend.onrender.com/api/health`
3. Deve retornar: `{"status":"ok"}`

---

## Passo 5: Deploy Frontend (Vercel)

### 5.1 Já tem conta Vercel
1. Va para vercel.com
2. Clique **"Add New"** → **"Project"**
3. Importe: **rinaldoamaral9446/memoriaviva**

### 5.2 Configurar
```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

### 5.3 Variável de Ambiente
```
VITE_API_URL=https://memoriaviva-backend.onrender.com
```

### 5.4 Deploy
- Clique **"Deploy"**
- Aguarde ~1-2 min

---

## Passo 6: Atualizar CORS no Backend

1. Volte ao Render → **memoriaviva-backend** → **Environment**
2. Adicione:
   ```
   FRONTEND_URL=https://seu-app.vercel.app
   ```
3. Salve (vai redeploy)

---

## ✅ Pronto!

**Backend:** https://memoriaviva-backend.onrender.com
**Frontend:** https://seu-app.vercel.app

**Custo total:** $0/mês

---

**Dica:** Render pode "dormir" após 15 min sem uso (tier gratuito). O primeiro acesso após isso leva ~30 seg para "acordar".
