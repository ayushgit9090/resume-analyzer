require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');

const analyzeRouter = require('./routes/analyze');
const reportRouter  = require('./routes/report');

const app  = express();
const PORT = process.env.PORT || 5000;

/* ── Security headers ──────────────────────────────────────── */
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

/* ── CORS ──────────────────────────────────────────────────── */
const allowedOrigins = (process.env.ALLOWED_ORIGIN || 'http://localhost:5173')
  .split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin "${origin}" not allowed`));
  },
  methods: ['GET', 'POST'],
}));

/* ── Rate limiting ─────────────────────────────────────────── */
const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MINUTES || 15) * 60 * 1000;
const max      = Number(process.env.RATE_LIMIT_MAX            || 20);

app.use('/api', rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    error: `Too many requests — limit is ${max} per ${windowMs / 60000} minutes. Try again later.`
  },
}));

/* ── Body parsing ──────────────────────────────────────────── */
app.use(express.json({ limit: '2mb' }));

/* ── Routes ────────────────────────────────────────────────── */
app.use('/api', analyzeRouter);
app.use('/api', reportRouter);

/* ── Health check ──────────────────────────────────────────── */
app.get('/health', (req, res) => res.json({
  status: 'ok',
  version: '2.0.0',
  timestamp: new Date().toISOString(),
}));

/* ── Global error handler ──────────────────────────────────── */
app.use((err, req, res, _next) => {
  const status = err.status || 500;
  const msg    = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : err.message;
  console.error(`[${new Date().toISOString()}] ${status} ${req.method} ${req.path} — ${err.message}`);
  res.status(status).json({ error: msg });
});

app.listen(PORT, () => {
  console.log(`\n🚀 ResumeIQ Backend v2.0  →  http://localhost:${PORT}`);
  console.log(`   CORS origin : ${allowedOrigins.join(', ')}`);
  console.log(`   Rate limit  : ${max} requests / ${windowMs / 60000} min\n`);
});

module.exports = app; // exported for Jest supertest
