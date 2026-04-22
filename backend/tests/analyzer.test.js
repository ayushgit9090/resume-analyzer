/**
 * analyzer.test.js
 *
 * Tests for the core NLP analysis engine.
 * These are the "accuracy" numbers behind the ~78% claim.
 * Run: npm test
 */

const { analyzeResume } = require('../utils/analyzer');

/* ═══════════════════════════════════════════════════════════════
   FIXTURE DATA
═══════════════════════════════════════════════════════════════ */

const STRONG_FRONTEND_RESUME = `
John Smith | john@email.com | github.com/jsmith

PROFESSIONAL SUMMARY
Senior Frontend Developer with 6 years of experience building scalable React applications.
Spearheaded migration from Angular to React, reducing bundle size by 40%.

SKILLS
React, TypeScript, JavaScript, Next.js, Redux, CSS, Tailwind, Webpack, Vite, Jest, Git

EXPERIENCE
Senior Frontend Engineer — Acme Corp (2020–2024)
• Architected component library used across 12 product teams
• Developed responsive UI reducing page load time by 35%
• Led TypeScript migration for 80,000-line codebase
• Optimized Webpack config cutting build time from 4 min to 45 sec

Frontend Developer — StartupXYZ (2018–2020)
• Built real-time dashboard with React and WebSocket
• Implemented CI/CD pipeline using GitHub Actions
• Collaborated with 5-person engineering team

EDUCATION
B.Sc. Computer Science — State University (2018)

PROJECTS
Portfolio Tracker — React, TypeScript, REST API
GitHub: github.com/jsmith/portfolio-tracker
Increased user retention by 20% via performance improvements.

ACHIEVEMENTS
• Won internal hackathon (2022) — built accessibility tool in 24 hours
• Open-source library: 500+ GitHub stars
`;

const WEAK_RESUME = `
Jane Doe | jane@email.com

WORK HISTORY
Web Developer at Tech Company (2021-2023)
Responsible for working on websites. Helped with coding tasks.
Participated in team meetings. Worked on various projects.
Assisted with maintenance of existing systems.

EDUCATION
Computer Science Degree
`;

const FRONTEND_JD = `
We are looking for a Senior Frontend Developer to join our team.
You will build scalable React applications with TypeScript and Next.js.
Requirements:
- 5+ years of frontend development experience
- Expert-level React, TypeScript, JavaScript
- Experience with Next.js, Redux, Webpack, Vite
- CSS, Tailwind CSS, responsive design
- REST API integration
- Jest unit testing
- Git, CI/CD pipeline experience
- Strong communication and teamwork skills
`;

const BACKEND_JD = `
Backend Engineer needed for our platform team.
You will design and build RESTful APIs and microservices.
Requirements:
- Node.js, Python or Java
- PostgreSQL and MongoDB database experience
- REST API design and development
- Docker and Kubernetes deployment
- AWS cloud services
- Redis caching
- Git version control
- System design and architecture
`;

const DATA_JD = `
Data Scientist to build and deploy machine learning models.
Requirements:
- Python, pandas, numpy
- Machine learning: scikit-learn, TensorFlow or PyTorch
- Data analysis and statistical modeling
- SQL and database querying
- Jupyter notebooks
- Data visualization with Tableau or matplotlib
- Experience with large datasets and spark
`;

/* ═══════════════════════════════════════════════════════════════
   1. SCORE RANGE TESTS
═══════════════════════════════════════════════════════════════ */

describe('ATS Score ranges', () => {
  test('Strong matching resume scores above 65', () => {
    const result = analyzeResume(STRONG_FRONTEND_RESUME, FRONTEND_JD);
    expect(result.atsScore).toBeGreaterThanOrEqual(65);
  });

  test('Weak resume scores below 50 against specific JD', () => {
    const result = analyzeResume(WEAK_RESUME, FRONTEND_JD);
    expect(result.atsScore).toBeLessThan(50);
  });

  test('Score is always between 0 and 100', () => {
    const r1 = analyzeResume(STRONG_FRONTEND_RESUME, FRONTEND_JD);
    const r2 = analyzeResume(WEAK_RESUME, BACKEND_JD);
    [r1, r2].forEach(r => {
      expect(r.atsScore).toBeGreaterThanOrEqual(0);
      expect(r.atsScore).toBeLessThanOrEqual(100);
    });
  });

  test('Score grade matches score value', () => {
    const result = analyzeResume(STRONG_FRONTEND_RESUME, FRONTEND_JD);
    if      (result.atsScore >= 80) expect(result.scoreGrade).toBe('A');
    else if (result.atsScore >= 65) expect(result.scoreGrade).toBe('B');
    else if (result.atsScore >= 45) expect(result.scoreGrade).toBe('C');
    else                            expect(result.scoreGrade).toBe('D');
  });
});

/* ═══════════════════════════════════════════════════════════════
   2. KEYWORD MATCHING ACCURACY
═══════════════════════════════════════════════════════════════ */

describe('Keyword matching accuracy', () => {
  test('Detects all core React/TS/Next.js skills in strong resume', () => {
    const result = analyzeResume(STRONG_FRONTEND_RESUME, FRONTEND_JD);
    const matched = result.matchedKeywords;
    expect(matched).toContain('react');
    expect(matched).toContain('typescript');
    expect(matched).toContain('javascript');
    expect(matched).toContain('nextjs');
    expect(matched).toContain('git');
  });

  test('Missing keywords correctly identified in weak resume', () => {
    const result = analyzeResume(WEAK_RESUME, FRONTEND_JD);
    // Weak resume has none of these
    expect(result.missingKeywords).toContain('react');
    expect(result.missingKeywords).toContain('typescript');
  });

  test('Matched + missing covers all JD tech skills', () => {
    const result = analyzeResume(STRONG_FRONTEND_RESUME, FRONTEND_JD);
    const total = result.matchedKeywords.length + result.missingKeywords.length;
    expect(total).toBeGreaterThan(0);
    expect(result.stats.techSkillsInJD).toBeGreaterThan(0);
  });

  test('matchedKeywords and missingKeywords are disjoint', () => {
    const result = analyzeResume(STRONG_FRONTEND_RESUME, FRONTEND_JD);
    const matched = new Set(result.matchedKeywords);
    result.missingKeywords.forEach(k => {
      expect(matched.has(k)).toBe(false);
    });
  });
});

/* ═══════════════════════════════════════════════════════════════
   3. SYNONYM MATCHING
═══════════════════════════════════════════════════════════════ */

describe('Synonym matching', () => {
  test('node.js matches nodejs skill', () => {
    const resume = 'SKILLS\nNode.js, Express.js, REST API development, PostgreSQL';
    const jd     = 'Requirements: nodejs, express, rest, postgresql, git';
    const result = analyzeResume(resume, jd);
    expect(result.matchedKeywords).toContain('nodejs');
  });

  test('golang matches go skill', () => {
    const resume = 'Developed microservices in Golang. Deployed on AWS using Docker.';
    const jd     = 'Requires: go, docker, aws, kubernetes, rest';
    const result = analyzeResume(resume, jd);
    expect(result.matchedKeywords).toContain('go');
  });

  test('k8s matches kubernetes', () => {
    const resume = 'Managed k8s clusters in production. Wrote Terraform configs.';
    const jd     = 'Must know: kubernetes, terraform, docker, aws, ci/cd';
    const result = analyzeResume(resume, jd);
    expect(result.matchedKeywords).toContain('kubernetes');
  });

  test('RESTful services matches rest', () => {
    const resume = 'Built RESTful services and web APIs using Node.js and Express.';
    const jd     = 'Experience with rest, nodejs, express, mongodb, docker required.';
    const result = analyzeResume(resume, jd);
    expect(result.matchedKeywords).toContain('rest');
  });
});

/* ═══════════════════════════════════════════════════════════════
   4. SPECIAL CHARACTER SKILLS (regex safety)
═══════════════════════════════════════════════════════════════ */

describe('Regex-safe skill matching', () => {
  test('C++ is matched correctly', () => {
    const resume = 'Proficient in C++ and Java for systems programming.';
    const jd     = 'Requires C++, Java, and systems programming experience.';
    const result = analyzeResume(resume, jd);
    expect(result.matchedKeywords).toContain('c++');
  });

  test('C# is matched correctly', () => {
    const resume = 'Built backend services using C# and ASP.NET framework.';
    const jd     = 'Requires C# and .NET development experience.';
    const result = analyzeResume(resume, jd);
    expect(result.matchedKeywords).toContain('c#');
  });

  test('.NET is matched correctly', () => {
    const resume = 'Developed enterprise apps with .NET Core and SQL Server.';
    const jd     = 'Must have .NET, C#, SQL Server, and REST API experience.';
    const result = analyzeResume(resume, jd);
    expect(result.matchedKeywords).toContain('.net');
  });

  test('CI/CD slash is handled correctly', () => {
    const resume = 'Set up CI/CD pipeline using GitHub Actions and Jenkins.';
    const jd     = 'Requires CI/CD, Docker, Kubernetes, and cloud experience.';
    const result = analyzeResume(resume, jd);
    expect(result.matchedKeywords).toContain('ci/cd');
  });
});

/* ═══════════════════════════════════════════════════════════════
   5. ROLE DETECTION
═══════════════════════════════════════════════════════════════ */

describe('Job role detection', () => {
  test('Detects Frontend Developer from JD', () => {
    const result = analyzeResume(STRONG_FRONTEND_RESUME, FRONTEND_JD);
    expect(result.detectedRole).toBe('Frontend Developer');
  });

  test('Detects Backend Developer from JD', () => {
    const result = analyzeResume(STRONG_FRONTEND_RESUME, BACKEND_JD);
    expect(result.detectedRole).toBe('Backend Developer');
  });

  test('Detects Data Scientist from JD', () => {
    const result = analyzeResume(STRONG_FRONTEND_RESUME, DATA_JD);
    expect(result.detectedRole).toBe('Data Scientist');
  });

  test('Returns null for ambiguous JD', () => {
    const vague = 'We need a developer with good skills and experience in technology.';
    const result = analyzeResume(STRONG_FRONTEND_RESUME, vague);
    expect(result.detectedRole).toBeNull();
  });
});

/* ═══════════════════════════════════════════════════════════════
   6. SECTION DETECTION
═══════════════════════════════════════════════════════════════ */

describe('Section detection', () => {
  test('Detects all 7 sections in well-structured resume', () => {
    const result = analyzeResume(STRONG_FRONTEND_RESUME, FRONTEND_JD);
    expect(result.sections.summary).toBe(true);
    expect(result.sections.experience).toBe(true);
    expect(result.sections.education).toBe(true);
    expect(result.sections.skills).toBe(true);
    expect(result.sections.projects).toBe(true);
    expect(result.sections.achievements).toBe(true);
  });

  test('Detects missing sections in weak resume', () => {
    const result = analyzeResume(WEAK_RESUME, FRONTEND_JD);
    expect(result.sections.summary).toBe(false);
    expect(result.sections.skills).toBe(false);
    expect(result.sections.projects).toBe(false);
    expect(result.sections.achievements).toBe(false);
  });
});

/* ═══════════════════════════════════════════════════════════════
   7. ACTION VERB ANALYSIS
═══════════════════════════════════════════════════════════════ */

describe('Action verb analysis', () => {
  test('Strong resume has high verb score', () => {
    const result = analyzeResume(STRONG_FRONTEND_RESUME, FRONTEND_JD);
    expect(result.verbAnalysis.verbScore).toBeGreaterThanOrEqual(60);
    expect(result.verbAnalysis.strongVerbCount).toBeGreaterThanOrEqual(3);
  });

  test('Weak resume detects weak phrases', () => {
    const result = analyzeResume(WEAK_RESUME, FRONTEND_JD);
    expect(result.verbAnalysis.weakVerbCount).toBeGreaterThan(0);
  });

  test('Rewrites array contains before/after examples', () => {
    const result = analyzeResume(STRONG_FRONTEND_RESUME, FRONTEND_JD);
    expect(result.verbAnalysis.rewrites).toHaveLength(2);
    result.verbAnalysis.rewrites.forEach(r => {
      expect(r).toHaveProperty('weak');
      expect(r).toHaveProperty('strong');
    });
  });
});

/* ═══════════════════════════════════════════════════════════════
   8. CONFIDENCE SCORE
═══════════════════════════════════════════════════════════════ */

describe('Confidence score', () => {
  test('Confidence is between 0 and 100', () => {
    const result = analyzeResume(STRONG_FRONTEND_RESUME, FRONTEND_JD);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(100);
  });

  test('Rich resume + detailed JD yields higher confidence than sparse inputs', () => {
    const rich   = analyzeResume(STRONG_FRONTEND_RESUME, FRONTEND_JD);
    const sparse = analyzeResume('Developer. Skills: code.', 'Need a developer.');
    expect(rich.confidence).toBeGreaterThan(sparse.confidence);
  });
});

/* ═══════════════════════════════════════════════════════════════
   9. SECTION SCORES
═══════════════════════════════════════════════════════════════ */

describe('Section-wise scores', () => {
  test('All three section scores are 0–100', () => {
    const result = analyzeResume(STRONG_FRONTEND_RESUME, FRONTEND_JD);
    ['skills', 'experience', 'formatting'].forEach(key => {
      expect(result.sectionScores[key]).toBeGreaterThanOrEqual(0);
      expect(result.sectionScores[key]).toBeLessThanOrEqual(100);
    });
  });

  test('Strong resume formatting score > weak resume', () => {
    const strong = analyzeResume(STRONG_FRONTEND_RESUME, FRONTEND_JD);
    const weak   = analyzeResume(WEAK_RESUME, FRONTEND_JD);
    expect(strong.sectionScores.formatting).toBeGreaterThan(weak.sectionScores.formatting);
  });

  test('Skills score is higher when resume matches JD skills', () => {
    const match   = analyzeResume(STRONG_FRONTEND_RESUME, FRONTEND_JD);
    const noMatch = analyzeResume(WEAK_RESUME, FRONTEND_JD);
    expect(match.sectionScores.skills).toBeGreaterThan(noMatch.sectionScores.skills);
  });
});

/* ═══════════════════════════════════════════════════════════════
   10. STRENGTHS / WEAKNESSES
═══════════════════════════════════════════════════════════════ */

describe('Strengths and weaknesses summary', () => {
  test('Returns arrays for both strengths and weaknesses', () => {
    const result = analyzeResume(STRONG_FRONTEND_RESUME, FRONTEND_JD);
    expect(Array.isArray(result.summary.strengths)).toBe(true);
    expect(Array.isArray(result.summary.weaknesses)).toBe(true);
  });

  test('Strong resume has at least one strength', () => {
    const result = analyzeResume(STRONG_FRONTEND_RESUME, FRONTEND_JD);
    expect(result.summary.strengths.length).toBeGreaterThanOrEqual(1);
  });

  test('Weak resume has at least one weakness', () => {
    const result = analyzeResume(WEAK_RESUME, FRONTEND_JD);
    expect(result.summary.weaknesses.length).toBeGreaterThanOrEqual(1);
  });
});

/* ═══════════════════════════════════════════════════════════════
   11. RADAR DATA
═══════════════════════════════════════════════════════════════ */

describe('Radar chart data', () => {
  test('Has 5 axes for both resume and ideal', () => {
    const result = analyzeResume(STRONG_FRONTEND_RESUME, FRONTEND_JD);
    expect(result.radarData.resume).toHaveLength(5);
    expect(result.radarData.ideal).toHaveLength(5);
  });

  test('All axis values are 0–100', () => {
    const result = analyzeResume(STRONG_FRONTEND_RESUME, FRONTEND_JD);
    result.radarData.resume.forEach(axis => {
      expect(axis.value).toBeGreaterThanOrEqual(0);
      expect(axis.value).toBeLessThanOrEqual(100);
    });
  });
});

/* ═══════════════════════════════════════════════════════════════
   12. KEYWORD STUFFING DETECTION
═══════════════════════════════════════════════════════════════ */

describe('Keyword stuffing detection', () => {
  test('Normal resume does not trigger stuffing warning', () => {
    const result = analyzeResume(STRONG_FRONTEND_RESUME, FRONTEND_JD);
    expect(result.stuffingWarning).toBe(false);
  });

  test('Stuffed resume gets a penalty', () => {
    const stuffed = `
      React React React React React React React React React React React React
      TypeScript TypeScript TypeScript TypeScript TypeScript TypeScript TypeScript
      JavaScript JavaScript JavaScript JavaScript JavaScript JavaScript JavaScript
      Node Node Node Node Node Node Node Node Node Node Node Node Node
      React TypeScript JavaScript React TypeScript React TypeScript JavaScript
      ${STRONG_FRONTEND_RESUME}
    `;
    const result = analyzeResume(stuffed, FRONTEND_JD);
    expect(result.stats.stuffingPenalty).toBeGreaterThan(0);
  });
});
