<div align="center">

# ⚡ ResumeIQ — AI Resume Analyzer

### AI-powered ATS Resume Analyzer

**Analyze your resume against job descriptions using NLP, TF-IDF semantic matching, and keyword gap detection.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://resume-analyzer-ten-black.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-API-green?style=for-the-badge)](https://resume-analyzer-gon9.onrender.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev)

</div>

---

## 🚀 Live Application

* 🌐 **Frontend:** https://resume-analyzer-ten-black.vercel.app
* ⚙️ **Backend API:** https://resume-analyzer-gon9.onrender.com

---

## 🧠 Overview

ResumeIQ simulates how modern Applicant Tracking Systems (ATS) evaluate resumes.

Upload a resume and compare it with a job description to get:

* ✅ ATS Score (0–100)
* 🔍 Keyword gap analysis
* 📊 Skill match insights
* ✍️ Resume improvement suggestions
* 📄 Downloadable PDF report

---

## ✨ Key Features

* 🎯 **ATS Scoring Engine**
  Weighted scoring using skills, semantic similarity, experience, and formatting

* 🔍 **Keyword Gap Analysis**
  Detects missing and matched skills using synonym-aware matching

* 🧠 **Semantic Matching (TF-IDF)**
  Uses cosine similarity for contextual relevance

* 📊 **Interactive Dashboard**
  Radar charts, score breakdown, and visual insights

* ✍️ **Action Verb Analysis**
  Detects weak phrases and suggests stronger alternatives

* 📄 **PDF Report Generator**
  Generates structured, shareable analysis reports

* 🤖 **AI Suggestions (Optional)**
  Personalized improvements using AI

---

## 🧮 Scoring Formula

```
ATS Score = Tech + Semantic + Skills + Experience + Formatting
```

### Example (Frontend Role)

| Factor     | Weight |
| ---------- | ------ |
| Tech Match | 50%    |
| Semantic   | 20%    |
| Skills     | 14%    |
| Experience | 10%    |
| Formatting | 6%     |

---

## 🛠 Tech Stack

**Frontend**

* React (Vite)
* Tailwind CSS
* SVG Charts

**Backend**

* Node.js
* Express
* Multer
* pdf-parse
* Tesseract.js (OCR)
* Natural (NLP)

---

## 📁 Project Structure

```
resume-analyzer/
├── backend/
├── frontend/
```

---

## ⚙️ Local Setup

### 1. Clone repository

```
git clone https://github.com/ayushgit9090/resume-analyzer.git
cd resume-analyzer
```

---

### 2. Start backend

```
cd backend
npm install
npm run dev
```

---

### 3. Start frontend

```
cd frontend
npm install
npm run dev
```

👉 Open: http://localhost:5173

---

## 🌍 Deployment

**Frontend:** Vercel
**Backend:** Render

### Environment Variables

Frontend:

```
VITE_API_URL=https://resume-analyzer-gon9.onrender.com/api
```

Backend:

```
ALLOWED_ORIGIN=https://resume-analyzer-ten-black.vercel.app
```

---

## 🔒 Security

* Helmet (secure headers)
* Rate limiting (20 req / 15 min)
* CORS protection
* File validation (PDF only)

---

## 🧪 Testing

```
cd backend
npm test
```

✔ 50+ test cases covering NLP accuracy, scoring, and matching

---

## 🎯 Use Cases

* Students improving resumes
* Job seekers optimizing ATS score
* Recruiters evaluating candidates

---

## 📄 License

MIT License

---

## 💡 How to Explain This Project

> Built an AI-powered resume analyzer that evaluates resumes against job descriptions using NLP and semantic similarity, providing ATS scores and actionable feedback.

---

<div align="center">

⭐ Star this repo if it helped you!

</div>
