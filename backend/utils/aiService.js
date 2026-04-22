/**
 * AI Enhancement Service
 *
 * Optionally enriches analysis results with AI-generated content.
 * Set AI_API_KEY in your .env file to activate. Runs without it.
 *
 * Three capabilities when enabled:
 *   1. Personalised improvement suggestions from actual resume content
 *   2. Bullet rewrite examples using real resume sentences
 *   3. Interview question prediction from skill gap + role
 *
 * All three run in parallel and fail silently if the API is unavailable.
 * The caller always gets a usable result — AI just makes it better.
 */

const SUPPORTED_SDK = (() => {
  try { return require('@anthropic-ai/sdk'); } catch { return null; }
})();

const AI_API_KEY  = process.env.AI_API_KEY || '';
const MAX_TOKENS  = Number(process.env.AI_MAX_TOKENS || 900);
const MODEL       = 'claude-haiku-4-5-20251001';
const TIMEOUT_MS  = 12_000;

// Client is only initialised when a valid key is present
const client = (SUPPORTED_SDK && AI_API_KEY)
  ? new SUPPORTED_SDK({ apiKey: AI_API_KEY })
  : null;

function isAvailable() {
  return Boolean(client);
}

/**
 * Call the AI API with strict JSON-only output.
 * Returns parsed JSON or null on any failure.
 */
async function callAI(userPrompt, systemPrompt) {
  if (!client) return null;

  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const msg = await client.messages.create({
      model:      MODEL,
      max_tokens: MAX_TOKENS,
      system:     systemPrompt,
      messages:   [{ role: 'user', content: userPrompt }],
    }, { signal: controller.signal });

    clearTimeout(timer);

    const raw   = msg.content?.[0]?.text || '';
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    clearTimeout(timer);
    if (err.name !== 'AbortError') {
      console.warn(`[AI] API call failed: ${err.message}`);
    }
    return null;
  }
}

/* ── 1. Personalised suggestions ─────────────────────────── */
async function generateAISuggestions({ resumeText, jobDescription, missingKeywords, detectedRole, sectionScores }) {
  if (!client) return null;

  const system = `You are an expert resume coach and ATS specialist.
Respond ONLY with a JSON array of exactly 6 strings.
Each string is one specific, actionable improvement suggestion tailored to this exact resume.
No preamble. No markdown. No explanation outside the JSON array.`;

  const prompt = `
Analyse this resume against the job description. Provide 6 specific, actionable improvements.

DETECTED ROLE: ${detectedRole || 'not specified'}
MISSING SKILLS: ${missingKeywords.slice(0, 6).join(', ') || 'none'}
SKILLS SCORE: ${sectionScores.skills}% | EXPERIENCE: ${sectionScores.experience}% | FORMATTING: ${sectionScores.formatting}%

JOB DESCRIPTION (first 600 chars):
${jobDescription.slice(0, 600)}

RESUME EXCERPT (first 800 chars):
${resumeText.slice(0, 800)}

Generate 6 suggestions that:
- Reference this specific resume and JD (not generic advice)
- Tell exactly what to add/change/remove
- Are ordered by impact on ATS match score
- Cover varied aspects: keywords, formatting, experience framing, quantification
`.trim();

  return callAI(prompt, system);
}

/* ── 2. Bullet rewrite examples ──────────────────────────── */
async function generateAIRewrites({ resumeText, jobDescription, detectedRole }) {
  if (!client) return null;

  const system = `You are an expert resume writer.
Respond ONLY with a JSON array of exactly 2 objects.
Each object: {"weak": "original text max 80 chars", "strong": "improved version max 120 chars"}
No preamble. No markdown. No text outside the JSON array.`;

  const prompt = `
Find 2 weak bullets in this resume and rewrite them as strong ATS-optimised bullets.
Use skills from the job description in the rewrites.

ROLE: ${detectedRole || 'software engineer'}
JD (first 400 chars): ${jobDescription.slice(0, 400)}
RESUME (first 1000 chars): ${resumeText.slice(0, 1000)}

Rewrite rules:
- Start with a strong action verb (Developed, Engineered, Optimised, etc.)
- Include a specific technology or tool from the JD
- Add a plausible quantified outcome (%, x faster, users served)
- Keep "weak" as close to actual resume text as possible
`.trim();

  return callAI(prompt, system);
}

/* ── 3. Interview question prediction ────────────────────── */
async function generateInterviewQuestions({ jobDescription, missingKeywords, detectedRole, matchedKeywords }) {
  const role    = detectedRole || 'software engineer';
  const missing = missingKeywords.slice(0, 5).join(', ') || 'general skills';
  const matched = matchedKeywords.slice(0, 5).join(', ') || 'various skills';

  if (client) {
    const system = `You are a technical interviewer.
Respond ONLY with a JSON array of exactly 5 objects.
Each object: {"question": "string", "tip": "one-sentence guidance max 100 chars"}
No preamble. No markdown. No text outside the JSON array.`;

    const prompt = `
Generate 5 likely interview questions for a ${role} role.

JD SUMMARY: ${jobDescription.slice(0, 400)}
SKILLS CANDIDATE HAS: ${matched}
SKILLS CANDIDATE IS MISSING: ${missing}

Include:
- 2 technical questions on skills they claim to have (validate depth)
- 2 questions targeting skill gaps (probe weaknesses)
- 1 behavioural/situational question relevant to the role
`.trim();

    const aiResult = await callAI(prompt, system);
    if (aiResult) return { questions: aiResult };
  }

  // Rule-based fallback — always works without AI key
  return { questions: buildRuleBasedQuestions(role, missingKeywords, matchedKeywords) };
}

/* ── Rule-based interview questions (no AI needed) ───────── */
function buildRuleBasedQuestions(role, missingKeywords, matchedKeywords) {
  const r = (role || '').toLowerCase();

  const ROLE_Q = {
    'frontend developer': [
      { question: 'Walk me through how you optimise a React app\'s rendering performance.', tip: 'Mention useMemo, useCallback, React.memo, and code splitting.' },
      { question: 'How do you approach accessibility (a11y) in your UI components?', tip: 'Reference WCAG guidelines, ARIA roles, and screen reader testing.' },
    ],
    'backend developer': [
      { question: 'How do you design a REST API for high-traffic scenarios?', tip: 'Discuss rate limiting, caching with Redis, and pagination strategies.' },
      { question: 'Describe a time you optimised a slow database query.', tip: 'Use a concrete example with indexes, EXPLAIN plans, and measured improvement.' },
    ],
    'full stack developer': [
      { question: 'How do you decide what logic belongs on the frontend vs backend?', tip: 'Cover security, performance, and user experience trade-offs.' },
      { question: 'Walk me through your approach to state management in a full-stack app.', tip: 'Discuss client state, server state, caching, and tools like React Query.' },
    ],
    'data scientist': [
      { question: 'How do you handle class imbalance in a classification problem?', tip: 'Mention SMOTE, class weights, and evaluation metrics like F1 vs accuracy.' },
      { question: 'Walk me through your model validation and deployment process.', tip: 'Cover train/val/test splits, cross-validation, and avoiding data leakage.' },
    ],
    'devops engineer': [
      { question: 'How do you design a zero-downtime deployment pipeline?', tip: 'Discuss blue-green deployments, canary releases, and rollback strategies.' },
      { question: 'Walk me through how you\'d debug a production incident.', tip: 'Cover observability (logs/metrics/traces), runbooks, and post-mortems.' },
    ],
    'mobile developer': [
      { question: 'How do you optimise mobile app startup time?', tip: 'Mention lazy loading, reducing bundle size, and deferred initialisation.' },
      { question: 'How do you handle offline functionality in a mobile app?', tip: 'Cover local storage strategies, sync mechanisms, and conflict resolution.' },
    ],
    'data engineer': [
      { question: 'How do you design a fault-tolerant data pipeline?', tip: 'Discuss idempotency, dead-letter queues, retries, and monitoring.' },
      { question: 'Walk me through your approach to data quality validation.', tip: 'Cover schema validation, anomaly detection, and alerting strategies.' },
    ],
    'ml engineer': [
      { question: 'How do you monitor a model in production for drift?', tip: 'Discuss data drift vs concept drift, metrics, and retraining triggers.' },
      { question: 'Walk me through how you\'d serve an ML model at scale.', tip: 'Cover model serving frameworks, batching, caching, and latency trade-offs.' },
    ],
    'security engineer': [
      { question: 'How do you approach threat modelling for a new application?', tip: 'Reference STRIDE, OWASP Top 10, and data flow diagrams.' },
      { question: 'Walk me through a penetration test you\'ve conducted.', tip: 'Use PTES methodology and document findings with CVSS scoring.' },
    ],
    'product manager': [
      { question: 'How do you prioritise features when everything is urgent?', tip: 'Discuss RICE, MoSCoW, and how you align stakeholders on trade-offs.' },
      { question: 'Tell me about a product decision you made with incomplete data.', tip: 'Focus on your reasoning process, assumptions made, and how you validated them.' },
    ],
  };

  const roleKey   = Object.keys(ROLE_Q).find(k => r.includes(k));
  const specific  = roleKey ? ROLE_Q[roleKey] : [];

  const gapQuestions = missingKeywords.slice(0, 2).map(skill => ({
    question: `You don't appear to have experience with ${skill}. How would you approach getting up to speed?`,
    tip: 'Be honest, reference adjacent skills, and outline a concrete 30-day learning plan.',
  }));

  const strengthQ = matchedKeywords[0]
    ? { question: `Tell me about a project where you used ${matchedKeywords[0]} to solve a real business problem.`, tip: 'Use STAR method: Situation, Task, Action, measurable Result.' }
    : { question: 'Tell me about your most impactful technical project.', tip: 'Quantify the outcome: users impacted, performance gained, or cost saved.' };

  const behavioural = {
    question: 'Describe a time you had to learn a new technology quickly under deadline pressure.',
    tip: 'Focus on your systematic learning approach and the concrete outcome you delivered.',
  };

  return [...specific, ...gapQuestions, strengthQ, behavioural].slice(0, 5);
}

module.exports = { isAvailable, generateAISuggestions, generateAIRewrites, generateInterviewQuestions };
