const express        = require('express');
const router         = express.Router();
const multer         = require('multer');
const { extractText }     = require('../utils/pdfExtractor');
const { analyzeResume }   = require('../utils/analyzer');
const aiService           = require('../utils/aiService');

const MAX_MB = Number(process.env.MAX_FILE_SIZE_MB || 5);

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: MAX_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    file.mimetype === 'application/pdf'
      ? cb(null, true)
      : cb(Object.assign(new Error('Only PDF files are accepted.'), { status: 415 }));
  },
});

router.post('/analyze', upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume PDF uploaded.' });
    }
    const jobDescription = (req.body.jobDescription || '').trim();
    if (jobDescription.length < 50) {
      return res.status(400).json({ error: 'Job description must be at least 50 characters.' });
    }

    const { text: resumeText, method: extractionMethod } = await extractText(req.file.buffer);

    if (resumeText.split(/\s+/).length < 40) {
      return res.status(422).json({
        error: 'Resume contains too little text to analyse. Use a text-based PDF, not a scanned image.',
      });
    }

    // Rule-based analysis always runs first
    const result = analyzeResume(resumeText, jobDescription);
    result.extractionMethod = extractionMethod;
    result.aiPowered        = false;

    // AI enrichment runs in parallel if API key is present
    if (aiService.isAvailable()) {
      const [aiSuggestions, aiRewrites, interviewData] = await Promise.allSettled([
        aiService.generateAISuggestions({
          resumeText, jobDescription,
          missingKeywords: result.missingKeywords,
          detectedRole:    result.detectedRole,
          sectionScores:   result.sectionScores,
        }),
        aiService.generateAIRewrites({
          resumeText, jobDescription,
          detectedRole: result.detectedRole,
        }),
        aiService.generateInterviewQuestions({
          jobDescription,
          missingKeywords: result.missingKeywords,
          detectedRole:    result.detectedRole,
          matchedKeywords: result.matchedKeywords,
        }),
      ]);

      if (aiSuggestions.status === 'fulfilled' && Array.isArray(aiSuggestions.value)) {
        result.suggestions = aiSuggestions.value;
        result.aiPowered   = true;
      }
      if (aiRewrites.status === 'fulfilled' && Array.isArray(aiRewrites.value)) {
        result.verbAnalysis.rewrites = aiRewrites.value;
      }
      if (interviewData.status === 'fulfilled' && interviewData.value) {
        result.interviewQuestions = interviewData.value.questions;
        result.interviewAIPowered = interviewData.value.aiPowered;
      }
    } else {
      const interviewData = await aiService.generateInterviewQuestions({
        jobDescription,
        missingKeywords: result.missingKeywords,
        detectedRole:    result.detectedRole,
        matchedKeywords: result.matchedKeywords,
      });
      result.interviewQuestions = interviewData.questions;
      result.interviewAIPowered = false;
    }

    res.json(result);
  } catch (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: `File too large. Maximum is ${MAX_MB} MB.` });
    }
    next(err);
  }
});

module.exports = router;
