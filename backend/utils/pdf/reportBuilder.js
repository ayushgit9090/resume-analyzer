/**
 * Report Builder
 * Orchestrates the report by calling components in order.
 * Contains zero drawing logic — only sequencing and page management.
 */

const PDFDocument = require('pdfkit');
const { COLOR }   = require('./design');
const { fillPage, accentBar, pageFooter, divider, ensureSpace } = require('./layout');
const {
  drawHeader,
  drawScoreCard,
  drawSectionScores,
  drawMatchBars,
  drawStrengthsSummary,
  drawKeywords,
  drawVerbAnalysis,
  drawRewrites,
  drawSectionsChecklist,
  drawSuggestions,
  drawInterviewQuestions,
  drawValidationFootnote,
} = require('./components');

function generateReport(results, res) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 0,
    info: { Title: 'ResumeIQ ATS Analysis Report', Author: 'ResumeIQ' },
  });

  doc.pipe(res);

  // ── Page 1 setup ──────────────────────────────────────────────────────
  fillPage(doc);
  accentBar(doc);

  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  // ── Render sections in order ──────────────────────────────────────────
  let y = drawHeader(doc, { detectedRole: results.detectedRole, date });

  y = drawScoreCard(doc, {
    atsScore:       results.atsScore,
    scoreLabel:     results.scoreLabel,
    scoreGrade:     results.scoreGrade,
    confidence:     results.confidence,
    stats:          results.stats,
    stuffingWarning:results.stuffingWarning,
  }, y);

  y = divider(doc, y);
  y = drawSectionScores(doc, {
    sectionScores:  results.sectionScores,
    stats:          results.stats,
    detectedRole:   results.detectedRole,
    activeWeights:  results.stats?.activeWeights,
  }, y);

  y = divider(doc, y);
  y = drawMatchBars(doc, results.stats, y);

  y = divider(doc, y);
  y = drawStrengthsSummary(doc, results.summary ?? { strengths: [], weaknesses: [] }, y);

  y = divider(doc, y);
  y = drawKeywords(doc, {
    matchedKeywords: results.matchedKeywords,
    missingKeywords: results.missingKeywords,
  }, y);

  // Overflow-safe sections (each calls ensureSpace internally or we check here)
  y = ensureSpace(doc, y, 80);
  y = divider(doc, y);
  y = drawVerbAnalysis(doc, results.verbAnalysis, y);

  y = ensureSpace(doc, y, 90);
  y = divider(doc, y);
  y = drawRewrites(doc, results.verbAnalysis?.rewrites, y);

  y = ensureSpace(doc, y, 120);
  y = divider(doc, y);
  y = drawSectionsChecklist(doc, results.sections, y);

  y = ensureSpace(doc, y, 60);
  y = divider(doc, y);
  y = drawSuggestions(doc, {
    suggestions:  results.suggestions,
    detectedRole: results.detectedRole,
    aiPowered:    results.aiPowered,
  }, y);

  // Interview questions — always included if present
  if (results.interviewQuestions?.length) {
    y = ensureSpace(doc, y, 60);
    y = divider(doc, y);
    y = drawInterviewQuestions(doc, {
      questions:  results.interviewQuestions,
      aiPowered:  results.interviewAIPowered,
      detectedRole: results.detectedRole,
    }, y);
  }

  y = ensureSpace(doc, y, 40);
  drawValidationFootnote(doc, y);
  pageFooter(doc);

  doc.end();
}

module.exports = { generateReport };
