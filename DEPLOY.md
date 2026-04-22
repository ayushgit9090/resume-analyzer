# 🚀 Deployment Guide — ResumeIQ

Full step-by-step: GitHub → Render (backend) → Vercel (frontend).

---

## Step 1 — Create .gitignore

Create this file at the project root (`resumeiq/.gitignore`):

```
node_modules/
.env
backend/.env
frontend/.env
dist/
build/
.DS_Store
Thumbs.db
*.log
coverage/
```

Verify .env is not tracked:
```bash
git status   # .env must NOT appear
```

---

## Step 2 — Push to GitHub

### 2.1 Create repo on GitHub
1. github.com → New repository
2. Name: `resumeiq` · Public · No README/gitignore (you have them)
3. Create repository

### 2.2 Push code
```bash
git init
git add .
git commit -m "feat: initial commit — ResumeIQ v3.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/resumeiq.git
git push -u origin main
```

---

## Step 3 — Deploy Backend → Render

1. render.com → Sign up with GitHub
2. New → Web Service → connect `resumeiq` repo
3. Settings:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free

4. Environment variables:

| Key | Value |
|---|---|
| NODE_ENV | production |
| PORT | 10000 |
| ALLOWED_ORIGIN | https://your-app.vercel.app ← update after Step 4 |
| RATE_LIMIT_MAX | 20 |
| RATE_LIMIT_WINDOW_MINUTES | 15 |
| MAX_FILE_SIZE_MB | 5 |
| OCR_TRIGGER_THRESHOLD | 100 |
| ANTHROPIC_API_KEY | (optional — leave blank) |

5. Deploy → your URL: `https://resumeiq-backend.onrender.com`

---

## Step 4 — Deploy Frontend → Vercel

1. vercel.com → Sign up with GitHub
2. Add New → Project → import `resumeiq`
3. Settings:
   - Framework: Vite
   - Root Directory: `frontend`
4. Environment variable:
   - `VITE_API_URL` = `https://resumeiq-backend.onrender.com/api`
5. Deploy → your URL: `https://resumeiq.vercel.app`

---

## Step 5 — Connect them

Back on Render → Environment → update:
- `ALLOWED_ORIGIN` = `https://resumeiq.vercel.app`

Save → auto-redeploys. Open your Vercel URL and test. Done.

---

## Auto-deploy

Both platforms watch your `main` branch. Every `git push` redeploys both automatically.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| CORS error | `ALLOWED_ORIGIN` on Render must exactly match Vercel URL |
| 429 Too Many Requests | Rate limit — wait 15 min or raise `RATE_LIMIT_MAX` |
| Vercel build fails | Check `VITE_API_URL` is set in Vercel dashboard |
| Render cold start (30s) | Expected on free tier. Upgrade to Starter ($7/mo) for always-on |
