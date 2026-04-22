<div align="center">

# ⚡ ResumeIQ

### AI-Powered ATS Resume Analyzer

**Instantly score your resume against any job description using NLP, keyword matching, and semantic similarity analysis.**

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev)
[![Tests](https://img.shields.io/badge/tests-54%20passing-brightgreen.svg)](#testing)

[Live Demo](#) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## 📸 Features

| Feature | Description |
|---|---|
| **ATS Score (0–100)** | Weighted formula: tech match × semantic similarity × formatting |
| **Keyword Gap Analysis** | Matched vs missing skills with synonym-aware detection |
| **20 Job Role Profiles** | Dynamic scoring weights per detected role |
| **200+ Skills Dictionary** | Covers Frontend, Backend, Data, DevOps, Security, Mobile, Blockchain & more |
| **TF-IDF Semantic Matching** | Cosine similarity on document vectors — not just keyword counting |
| **Radar Chart** | 5-axis spider chart showing your profile vs JD target |
| **Action Verb Analysis** | Detects weak phrases, counts strong verbs, suggests rewrites |
| **Before → After Rewrites** | Side-by-side bullet improvement examples |
| **OCR Fallback** | Automatically extracts text from scanned PDFs via Tesseract.js |
| **PDF Report Download** | Full analysis exported as a styled dark-theme PDF |
| **Interview Question Generator** | 5 role-specific questions based on your skill gap |
| **AI Enhancement (optional)** | Add `AI_API_KEY` to generate personalised suggestions |

---

## 🧠 How Scoring Works

```
ATS Score = Tech×W₁ + Semantic×W₂ + Skills×W₃ + Experience×W₄ + Formatting×W₅ − Penalty
```

**Weights shift dynamically based on the detected job role:**

| Role | Tech | Semantic | Skills | Experience | Formatting |
|---|---|---|---|---|---|
| Frontend Developer | 0.50 | 0.20 | 0.14 | 0.10 | 0.06 |
| Data Scientist | 0.40 | 0.30 | 0.12 | 0.12 | 0.06 |
| Product Manager | 0.25 | 0.30 | 0.10 | 0.25 | 0.10 |
| ML Engineer | 0.45 | 0.28 | 0.12 | 0.10 | 0.05 |
| Default | 0.45 | 0.25 | 0.10 | 0.12 | 0.08 |

**Why these weights?**
- **Tech match (45%)** — ATS systems are primarily keyword scanners
- **Semantic similarity (25%)** — contextual relevance via TF-IDF cosine
- **Experience (12%)** — JD-relevant tech appearing in experience bullets
- **Skills section (10%)** — dedicated skills sections score reliably in ATS
- **Formatting (8%)** — structure, action verbs, and metrics as a tie-breaker

---

## 🛠 Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, pure SVG charts (no chart library)

**Backend:** Node.js, Express, Multer, pdf-parse, Tesseract.js, natural (NLP), pdfkit

**NLP:** TF-IDF cosine similarity, Porter Stemmer, 150+ synonym pairs, 200+ skill dictionary

---

## 🚀 Quick Start (Windows 11 / macOS / Linux)

### Prerequisites
- **Node.js v18+** → https://nodejs.org (choose LTS)
- Verify: `node -v` and `npm -v`

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/resume-analyzer.git
cd resume-analyzer
```

### 2. Setup the backend
```bash
cd backend
cp .env.example .env        # Windows: copy .env.example .env
npm install
npm run dev
```
✅ You should see: `🚀 ResumeIQ Backend → http://localhost:5000`

### 3. Setup the frontend (new terminal)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
✅ Open **http://localhost:5173**

---

## ✅ Running Tests

```bash
cd backend
npm test
```

```
PASS tests/analyzer.test.js
  ATS Score ranges            ✓ 4 tests
  Keyword matching accuracy   ✓ 4 tests
  Synonym matching            ✓ 4 tests
  Regex-safe skills (C++/.NET)✓ 4 tests
  Job role detection          ✓ 4 tests
  Section detection           ✓ 2 tests
  Action verb analysis        ✓ 3 tests
  Confidence score            ✓ 2 tests
  Section-wise scores         ✓ 3 tests
  Strengths / Weaknesses      ✓ 3 tests
  Radar chart data            ✓ 2 tests
  Keyword stuffing            ✓ 2 tests

PASS tests/aiService.test.js
  AI Service availability     ✓ 1 test
  Interview questions         ✓ 7 tests
  AI null without key         ✓ 2 tests

Tests: 54 passed, 0 failed
```

---

## 🌍 Deployment

### Backend → Render.com (free)

1. Push your repo to GitHub
2. Go to [render.com](https://render.com) → **New** → **Web Service**
3. Connect your GitHub repo → select the **`backend`** folder
4. Render detects `render.yaml` automatically — all settings are pre-configured
5. Add environment variables in Render dashboard:
   - `ALLOWED_ORIGIN` = your Vercel URL (after Step 2 below)
6. Click **Deploy** → copy your Render service URL

### Frontend → Vercel (free)

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo → select the **`frontend`** folder
3. Add environment variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`
4. Click **Deploy** → copy your Vercel URL

### Connect them
In Render dashboard, update:
- `ALLOWED_ORIGIN` = `https://your-app.vercel.app`

Redeploy backend. Done ✅

### Optional: Enable AI-powered suggestions
Add to your Render environment variables:
```
AI_API_KEY=your_api_key_here
```
The system works without this — AI just makes suggestions more personalised.

---

## 📁 Project Structure

```
resume-analyzer/
├── backend/
│   ├── server.js              ← Express + Helmet + Rate limiting + CORS
│   ├── .env.example           ← All config variables documented
│   ├── render.yaml            ← Render.com one-click deploy config
│   ├── routes/
│   │   ├── analyze.js         ← PDF upload → OCR extraction → analysis
│   │   └── report.js          ← PDF report generation endpoint
│   ├── utils/
│   │   ├── analyzer.js        ← Core NLP engine (TF-IDF, 20 roles, 200+ skills)
│   │   ├── aiService.js       ← Optional AI enhancement layer
│   │   ├── pdfExtractor.js    ← pdf-parse + Tesseract.js OCR fallback
│   │   └── pdf/
│   │       ├── design.js      ← PAGE, SP, FONT, COLOR design system constants
│   │       ├── layout.js      ← Geometric drawing primitives (no magic numbers)
│   │       ├── components.js  ← Self-contained PDF report blocks
│   │       └── reportBuilder.js ← Orchestration only — zero drawing logic
│   └── tests/
│       ├── analyzer.test.js   ← 41-test NLP engine suite
│       └── aiService.test.js  ← 13-test AI service suite
└── frontend/
    ├── vercel.json            ← Vercel SPA routing config
    ├── .env.example           ← VITE_API_URL template
    └── src/
        ├── App.jsx
        └── components/
            ├── UploadZone.jsx      ← Drag-and-drop PDF uploader
            ├── JobDescInput.jsx    ← JD textarea with character counter
            ├── ScoreGauge.jsx      ← Animated SVG circular gauge
            ├── RadarChart.jsx      ← Pure SVG 5-axis radar chart
            └── ResultsDashboard.jsx← Full results UI (all panels)
```

---

## 🔒 Security Features

- **`helmet`** — sets 11 HTTP security headers automatically
- **Rate limiting** — 20 requests / 15 min per IP (configurable via `.env`)
- **CORS** — restricted to `ALLOWED_ORIGIN` env variable only
- **File validation** — PDF MIME type check + multer size enforcement
- **Stateless** — no user data stored, all processing is per-request

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m 'feat: add your feature'
git push origin feature/your-feature-name
# Open a Pull Request
```

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">
Built with ❤️ · Give it a ⭐ if it helped your job search!
</div>
