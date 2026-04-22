/**
 * aiService.test.js
 *
 * Tests for the AI service layer.
 * These run without an API key — they validate the fallback
 * (rule-based) path which always works in any environment.
 */

// Ensure no API key is present during tests
process.env.ANTHROPIC_API_KEY = '';

const aiService = require('../utils/aiService');

describe('AI Service availability', () => {
  test('isAvailable() returns false when no API key is set', () => {
    expect(aiService.isAvailable()).toBe(false);
  });
});

describe('Interview question generator (rule-based fallback)', () => {
  const baseArgs = {
    jobDescription:  'Senior Frontend Developer with React, TypeScript, and Next.js experience.',
    missingKeywords: ['typescript', 'nextjs', 'redux'],
    matchedKeywords: ['react', 'javascript', 'css'],
    detectedRole:    'Frontend Developer',
  };

  test('Returns exactly 5 questions', async () => {
    const result = await aiService.generateInterviewQuestions(baseArgs);
    expect(result.questions).toHaveLength(5);
  });

  test('aiPowered flag is false without API key', async () => {
    const result = await aiService.generateInterviewQuestions(baseArgs);
    expect(result.aiPowered).toBe(false);
  });

  test('Each question has a question string and tip string', async () => {
    const result = await aiService.generateInterviewQuestions(baseArgs);
    result.questions.forEach(q => {
      expect(typeof q.question).toBe('string');
      expect(q.question.length).toBeGreaterThan(10);
      expect(typeof q.tip).toBe('string');
      expect(q.tip.length).toBeGreaterThan(5);
    });
  });

  test('Gap questions reference missing keywords', async () => {
    const result = await aiService.generateInterviewQuestions(baseArgs);
    const allText = result.questions.map(q => q.question).join(' ').toLowerCase();
    // At least one question should mention a missing skill
    const mentionsGap = baseArgs.missingKeywords.some(k => allText.includes(k));
    expect(mentionsGap).toBe(true);
  });

  test('Works for Backend Developer role', async () => {
    const result = await aiService.generateInterviewQuestions({
      ...baseArgs,
      detectedRole:    'Backend Developer',
      missingKeywords: ['kubernetes', 'kafka'],
      matchedKeywords: ['nodejs', 'postgresql', 'docker'],
    });
    expect(result.questions).toHaveLength(5);
    expect(result.aiPowered).toBe(false);
  });

  test('Works for Data Scientist role', async () => {
    const result = await aiService.generateInterviewQuestions({
      ...baseArgs,
      detectedRole:    'Data Scientist',
      missingKeywords: ['pytorch', 'spark'],
      matchedKeywords: ['python', 'pandas', 'scikit-learn'],
    });
    expect(result.questions).toHaveLength(5);
  });

  test('Works when detectedRole is null (generic fallback)', async () => {
    const result = await aiService.generateInterviewQuestions({
      ...baseArgs,
      detectedRole: null,
    });
    expect(result.questions).toHaveLength(5);
    expect(result.aiPowered).toBe(false);
  });

  test('Works with empty missing keywords', async () => {
    const result = await aiService.generateInterviewQuestions({
      ...baseArgs,
      missingKeywords: [],
    });
    expect(result.questions).toHaveLength(5);
  });
});

describe('AI functions return null without API key', () => {
  const mockArgs = {
    resumeText:      'Senior developer with React and Node.js experience.',
    jobDescription:  'Looking for a React developer.',
    missingKeywords: ['typescript'],
    matchedKeywords: ['react'],
    detectedRole:    'Frontend Developer',
    sectionScores:   { skills: 70, experience: 60, formatting: 75 },
  };

  test('generateAISuggestions returns null without API key', async () => {
    const result = await aiService.generateAISuggestions(mockArgs);
    expect(result).toBeNull();
  });

  test('generateAIRewrites returns null without API key', async () => {
    const result = await aiService.generateAIRewrites(mockArgs);
    expect(result).toBeNull();
  });
});
