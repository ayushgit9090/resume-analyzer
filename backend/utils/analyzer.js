const natural             = require('natural');
const { removeStopwords } = require('stopword');

const tokenizer = new natural.WordTokenizer();
const stemmer   = natural.PorterStemmer;
const TfIdf     = natural.TfIdf;

/* ══════════════════════════════════════════════════════════════
   REGEX SAFETY  — handles C++, .NET, C#, Node.js, GraphQL etc.
══════════════════════════════════════════════════════════════ */
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function skillRegex(skill) {
  const escaped = escapeRegex(skill);
  if (/[^a-z0-9\s]/i.test(skill)) {
    return new RegExp(`(?<![a-zA-Z0-9])${escaped}(?![a-zA-Z0-9])`, 'i');
  }
  return new RegExp(`\\b${escaped}\\b`, 'i');
}

/* ══════════════════════════════════════════════════════════════
   SYNONYM DICTIONARY  (150+ pairs)
══════════════════════════════════════════════════════════════ */
const SYNONYMS = {
  // JavaScript
  'js':'javascript','es6':'javascript','es2015':'javascript','ecmascript':'javascript','vanilla js':'javascript',
  // TypeScript
  'ts':'typescript',
  // Frameworks
  'reactjs':'react','react.js':'react','vuejs':'vue','vue.js':'vue','angularjs':'angular',
  'next.js':'nextjs','nuxt.js':'nuxtjs','sveltejs':'svelte',
  // Node / Python
  'node':'nodejs','node.js':'nodejs','py':'python',
  // Go
  'golang':'go',
  // REST
  'restful':'rest','rest api':'rest','restful api':'rest','restful services':'rest',
  'http api':'rest','web api':'rest','web services':'rest','api development':'rest',
  // Cloud
  'amazon web services':'aws','google cloud':'gcp','google cloud platform':'gcp',
  'microsoft azure':'azure','azure cloud':'azure',
  // Databases
  'postgres':'postgresql','mongo':'mongodb','nosql':'mongodb',
  'mssql':'sql server','ms sql':'sql server','mariadb':'mysql',
  // CI/CD
  'continuous integration':'ci/cd','continuous delivery':'ci/cd','continuous deployment':'ci/cd',
  'github actions':'ci/cd','gitlab ci':'ci/cd','jenkins pipeline':'ci/cd','travis ci':'ci/cd',
  'circle ci':'ci/cd','bitbucket pipelines':'ci/cd',
  // Testing
  'unit test':'testing','unit testing':'testing','test driven':'tdd',
  'test-driven development':'tdd','e2e testing':'testing',
  'integration test':'testing','automated testing':'testing','qa':'testing',
  // ML/AI
  'machine learning':'ml','deep learning':'dl','artificial intelligence':'ai',
  'large language model':'llm','natural language processing':'nlp',
  'computer vision':'cv','reinforcement learning':'rl',
  // Agile
  'scrum master':'agile','sprint planning':'agile','kanban board':'agile','safe':'agile',
  // Kubernetes / Docker
  'k8s':'kubernetes','container':'docker','containerization':'docker',
  'container orchestration':'kubernetes','docker compose':'docker',
  // CSS
  'styled components':'css','emotion css':'css','css-in-js':'css',
  // Git
  'github':'git','gitlab':'git','bitbucket':'git','version control':'git','source control':'git',
  // .NET
  '.net core':'.net','.net framework':'.net','dotnet':'.net','asp.net':'.net',
  // Mobile
  'react native':'mobile','flutter app':'flutter','swift ios':'swift','android kotlin':'kotlin',
  // Data
  'message queue':'kafka','message broker':'kafka','elastic search':'elasticsearch',
  'elk stack':'elasticsearch','power bi':'powerbi','tableau desktop':'tableau',
  // Patterns
  'object oriented':'oop','object-oriented':'oop','functional programming':'fp',
  'design pattern':'patterns','data structure':'dsa','algorithm':'dsa','data structures':'dsa',
  'microservice':'microservices','micro services':'microservices',
  'serverless':'lambda','aws lambda':'lambda',
  // Security
  'penetration testing':'pentesting','pen test':'pentesting','pen testing':'pentesting',
  'information security':'infosec','cyber security':'cybersecurity',
  // Blockchain
  'smart contract':'solidity','ethereum':'solidity','web3.js':'web3',
  // SAP
  'sap s4':'sap','sap hana':'sap',
  // Salesforce
  'salesforce crm':'salesforce','sfdc':'salesforce',
  // QA
  'quality assurance':'qa','manual testing':'qa','test automation':'testing',
  // Others
  'gql':'graphql','graph ql':'graphql',
  'unix':'linux','ubuntu':'linux','centos':'linux','debian':'linux',
  'unix/linux':'linux','bash scripting':'bash','shell script':'bash',
};

function normalizeTerm(t) {
  const l = t.toLowerCase().trim();
  return SYNONYMS[l] || l;
}

/* ══════════════════════════════════════════════════════════════
   TECH SKILL DICTIONARY  (200+ skills across all domains)
══════════════════════════════════════════════════════════════ */
const TECH_SKILLS = [
  /* ── Languages ─────────────────── */
  'javascript','typescript','python','java','c++','c#','.net',
  'ruby','go','rust','php','swift','kotlin','scala','r','matlab',
  'perl','bash','powershell','groovy','haskell','elixir','erlang',
  'clojure','lua','dart','solidity','cobol','fortran','assembly',

  /* ── Frontend ───────────────────── */
  'react','angular','vue','svelte','nextjs','nuxtjs','gatsby','astro',
  'html','css','sass','scss','tailwind','bootstrap','material ui',
  'chakra ui','ant design','webpack','vite','parcel','rollup',
  'redux','zustand','mobx','recoil','jotai','graphql','apollo',
  'storybook','figma','sketch','invision','webgl','three.js','d3',

  /* ── Backend ─────────────────────── */
  'nodejs','express','fastapi','django','flask','fastify',
  'spring','spring boot','laravel','rails','nestjs','grpc',
  'rest','microservices','websocket','lambda','serverless',
  'hapi','koa','phoenix','gin','fiber','echo','actix',

  /* ── Databases ───────────────────── */
  'mysql','postgresql','mongodb','redis','elasticsearch',
  'dynamodb','sqlite','oracle','cassandra','firebase',
  'supabase','prisma','sequelize','typeorm','mongoose',
  'neo4j','couchdb','influxdb','snowflake','bigquery',
  'redshift','cockroachdb','planetscale','neon',

  /* ── Cloud & DevOps ─────────────── */
  'aws','azure','gcp','docker','kubernetes','terraform',
  'ansible','pulumi','vagrant','ci/cd','devops','linux',
  'nginx','apache','cloudflare','vercel','netlify',
  'heroku','render','fly.io','github actions',

  /* ── Data Engineering ────────────── */
  'kafka','spark','hadoop','airflow','dbt','flink',
  'luigi','prefect','dagster','nifi','beam','hive',
  'pig','presto','trino','databricks','glue',

  /* ── Data Science / ML ───────────── */
  'ml','dl','nlp','cv','rl','tensorflow','pytorch','keras',
  'scikit-learn','pandas','numpy','scipy','matplotlib',
  'seaborn','plotly','xgboost','lightgbm','catboost',
  'hugging face','langchain','llm','rag','openai api',
  'jupyter','colab','mlflow','kubeflow','wandb','optuna',

  /* ── Analytics & BI ──────────────── */
  'powerbi','tableau','looker','metabase','superset',
  'google analytics','mixpanel','segment','amplitude',
  'dax','power query','excel','google sheets',

  /* ── Mobile ──────────────────────── */
  'mobile','flutter','react native','swift','kotlin',
  'xcode','android studio','ionic','capacitor','expo',

  /* ── Security ────────────────────── */
  'cybersecurity','infosec','pentesting','owasp','siem',
  'soc','ids','ips','firewall','vpn','ssl','tls','oauth',
  'jwt','saml','ldap','iam','kali linux','burp suite',
  'metasploit','wireshark','nmap','splunk','sentinel',

  /* ── Blockchain / Web3 ───────────── */
  'solidity','web3','ethereum','hardhat','truffle',
  'wagmi','nft','defi','smart contracts',

  /* ── Testing ─────────────────────── */
  'testing','tdd','jest','cypress','playwright','selenium',
  'mocha','chai','vitest','supertest','junit','pytest',
  'testng','appium','postman','k6','locust','jmeter',

  /* ── Architecture & Patterns ──────── */
  'microservices','oop','dsa','patterns','ddd','cqrs',
  'event sourcing','api gateway','service mesh','istio',
  'graphql','grpc','websocket','message queue',

  /* ── Collaboration & Management ───── */
  'git','agile','scrum','kanban','jira','confluence',
  'notion','asana','trello','linear','slack','github',
  'figma','postman','swagger','openapi',

  /* ── Soft Skills ─────────────────── */
  'leadership','communication','teamwork','collaboration',
  'mentoring','problem solving','critical thinking',
  'project management','stakeholder management',
];

/* ══════════════════════════════════════════════════════════════
   ROLE PROFILES  — 20 roles with weighted keyword detection
══════════════════════════════════════════════════════════════ */
const ROLE_PROFILES = {
  'Frontend Developer': {
    keywords: [
      {term:'frontend',w:3},{term:'front-end',w:3},{term:'ui developer',w:3},
      {term:'react',w:2},{term:'angular',w:2},{term:'vue',w:2},
      {term:'html',w:1},{term:'css',w:1},{term:'responsive',w:1},{term:'component',w:1},
    ],
    threshold: 4,
    skills: ['react','angular','vue','javascript','typescript','css','html','nextjs','redux','webpack','vite','tailwind'],
    tip: 'Highlight interactive UI projects, component libraries, Core Web Vitals, and performance improvements.',
    weights: {tech:0.50,semantic:0.20,skills:0.14,experience:0.10,formatting:0.06},
  },
  'Backend Developer': {
    keywords: [
      {term:'backend',w:3},{term:'back-end',w:3},{term:'server-side',w:3},
      {term:'api',w:2},{term:'microservices',w:2},{term:'database',w:1},
      {term:'node',w:1},{term:'django',w:1},{term:'spring',w:1},{term:'flask',w:1},
    ],
    threshold: 4,
    skills: ['nodejs','python','java','rest','postgresql','mongodb','redis','docker','aws','kafka'],
    tip: 'Emphasise system design, API throughput, database optimisation, and scalability metrics.',
    weights: {tech:0.48,semantic:0.22,skills:0.12,experience:0.12,formatting:0.06},
  },
  'Full Stack Developer': {
    keywords: [
      {term:'full stack',w:4},{term:'fullstack',w:4},{term:'full-stack',w:4},
      {term:'end-to-end',w:2},{term:'frontend and backend',w:3},{term:'mern',w:3},{term:'mean',w:2},
    ],
    threshold: 4,
    skills: ['react','nodejs','postgresql','rest','docker','git','typescript'],
    tip: 'Show projects where you owned the full feature lifecycle from DB schema to production UI.',
    weights: {tech:0.45,semantic:0.25,skills:0.10,experience:0.13,formatting:0.07},
  },
  'Data Scientist': {
    keywords: [
      {term:'data science',w:4},{term:'machine learning',w:3},{term:'ml engineer',w:3},
      {term:'model',w:1},{term:'prediction',w:2},{term:'jupyter',w:2},
      {term:'sklearn',w:2},{term:'pandas',w:2},{term:'statistical',w:2},
    ],
    threshold: 4,
    skills: ['python','pandas','numpy','scikit-learn','tensorflow','pytorch','sql','spark','tableau','jupyter'],
    tip: 'Include model accuracy, dataset size, and measurable business impact of your models.',
    weights: {tech:0.40,semantic:0.30,skills:0.12,experience:0.12,formatting:0.06},
  },
  'ML Engineer': {
    keywords: [
      {term:'machine learning engineer',w:5},{term:'ml engineer',w:5},{term:'mlops',w:4},
      {term:'model deployment',w:3},{term:'model training',w:2},{term:'inference',w:2},
      {term:'pipeline',w:1},{term:'feature engineering',w:3},
    ],
    threshold: 4,
    skills: ['python','tensorflow','pytorch','mlflow','kubeflow','docker','kubernetes','aws','spark'],
    tip: 'Quantify model performance (accuracy, latency, throughput) and deployment scale.',
    weights: {tech:0.45,semantic:0.28,skills:0.12,experience:0.10,formatting:0.05},
  },
  'Data Engineer': {
    keywords: [
      {term:'data engineer',w:5},{term:'etl',w:3},{term:'data pipeline',w:3},
      {term:'warehouse',w:2},{term:'dbt',w:3},{term:'airflow',w:3},
      {term:'bigquery',w:2},{term:'snowflake',w:2},{term:'spark',w:2},
    ],
    threshold: 4,
    skills: ['python','sql','spark','airflow','aws','kafka','postgresql','dbt','snowflake'],
    tip: 'Highlight pipeline scale (records/day), latency improvements, and data reliability SLAs.',
    weights: {tech:0.45,semantic:0.25,skills:0.12,experience:0.12,formatting:0.06},
  },
  'Data Analyst': {
    keywords: [
      {term:'data analyst',w:5},{term:'business intelligence',w:4},{term:'bi analyst',w:4},
      {term:'reporting',w:2},{term:'dashboard',w:2},{term:'sql',w:2},
      {term:'excel',w:1},{term:'tableau',w:2},{term:'powerbi',w:2},{term:'analytics',w:1},
    ],
    threshold: 4,
    skills: ['sql','python','tableau','powerbi','excel','looker','google analytics','pandas'],
    tip: 'Show dashboards, KPIs you tracked, and decisions influenced by your analysis.',
    weights: {tech:0.35,semantic:0.30,skills:0.12,experience:0.15,formatting:0.08},
  },
  'DevOps Engineer': {
    keywords: [
      {term:'devops',w:4},{term:'ci/cd',w:3},{term:'infrastructure',w:2},
      {term:'kubernetes',w:3},{term:'terraform',w:3},{term:'sre',w:3},
      {term:'platform engineer',w:3},{term:'deployment',w:1},{term:'ansible',w:2},
    ],
    threshold: 4,
    skills: ['docker','kubernetes','aws','terraform','ci/cd','linux','ansible','git','python'],
    tip: 'Quantify uptime improvements (nines), deployment frequency, and MTTR reductions.',
    weights: {tech:0.48,semantic:0.22,skills:0.12,experience:0.12,formatting:0.06},
  },
  'Cloud Architect': {
    keywords: [
      {term:'cloud architect',w:5},{term:'solutions architect',w:5},{term:'cloud infrastructure',w:3},
      {term:'aws architect',w:4},{term:'azure architect',w:4},{term:'gcp architect',w:4},
      {term:'cloud migration',w:3},{term:'multi-cloud',w:3},
    ],
    threshold: 4,
    skills: ['aws','azure','gcp','terraform','kubernetes','docker','networking','iam','cloudformation'],
    tip: 'Highlight cloud cost optimisation ($saved), migration scale, and architecture diagrams.',
    weights: {tech:0.45,semantic:0.25,skills:0.12,experience:0.12,formatting:0.06},
  },
  'Security Engineer': {
    keywords: [
      {term:'security engineer',w:5},{term:'cybersecurity',w:4},{term:'information security',w:4},
      {term:'penetration testing',w:3},{term:'soc analyst',w:4},{term:'devsecops',w:4},
      {term:'vulnerability',w:2},{term:'threat',w:2},{term:'owasp',w:2},
    ],
    threshold: 4,
    skills: ['cybersecurity','pentesting','owasp','siem','splunk','aws','python','bash','docker'],
    tip: 'Include CVEs found, tools used, compliance frameworks (SOC2, ISO27001), and incidents resolved.',
    weights: {tech:0.45,semantic:0.28,skills:0.12,experience:0.10,formatting:0.05},
  },
  'Mobile Developer': {
    keywords: [
      {term:'mobile',w:3},{term:'ios developer',w:4},{term:'android developer',w:4},
      {term:'swift',w:2},{term:'kotlin',w:2},{term:'react native',w:3},{term:'flutter',w:3},
      {term:'app store',w:2},{term:'play store',w:2},
    ],
    threshold: 4,
    skills: ['swift','kotlin','react native','flutter','firebase','mobile','xcode','android studio'],
    tip: 'Include app store ratings, download counts, crash rate reductions, and performance metrics.',
    weights: {tech:0.50,semantic:0.20,skills:0.12,experience:0.12,formatting:0.06},
  },
  'Product Manager': {
    keywords: [
      {term:'product manager',w:5},{term:'product owner',w:5},{term:'program manager',w:4},
      {term:'roadmap',w:2},{term:'stakeholder',w:2},{term:'user story',w:2},
      {term:'backlog',w:2},{term:'go-to-market',w:2},{term:'product strategy',w:3},
    ],
    threshold: 4,
    skills: ['agile','jira','figma','confluence','analytics','sql','notion'],
    tip: 'Quantify product impact: DAU/MAU growth, revenue influenced, NPS improvements, churn reduction.',
    weights: {tech:0.25,semantic:0.30,skills:0.10,experience:0.25,formatting:0.10},
  },
  'UX/UI Designer': {
    keywords: [
      {term:'ux designer',w:5},{term:'ui designer',w:5},{term:'product designer',w:4},
      {term:'user experience',w:3},{term:'user interface',w:3},{term:'wireframe',w:3},
      {term:'prototyping',w:2},{term:'figma',w:2},{term:'usability',w:2},
    ],
    threshold: 4,
    skills: ['figma','sketch','invision','adobe xd','html','css','user research','prototyping'],
    tip: 'Include portfolio link, usability metrics, A/B test results, and design system contributions.',
    weights: {tech:0.30,semantic:0.30,skills:0.15,experience:0.18,formatting:0.07},
  },
  'QA Engineer': {
    keywords: [
      {term:'qa engineer',w:5},{term:'quality assurance',w:5},{term:'test engineer',w:4},
      {term:'automation engineer',w:4},{term:'sdet',w:4},{term:'testing',w:2},
      {term:'selenium',w:2},{term:'cypress',w:2},{term:'playwright',w:2},
    ],
    threshold: 4,
    skills: ['testing','selenium','cypress','playwright','jest','pytest','postman','jira','sql'],
    tip: 'Quantify test coverage %, bugs caught, regression time saved, and release confidence improved.',
    weights: {tech:0.45,semantic:0.25,skills:0.12,experience:0.12,formatting:0.06},
  },
  'Blockchain Developer': {
    keywords: [
      {term:'blockchain',w:4},{term:'smart contract',w:4},{term:'solidity',w:4},
      {term:'web3',w:3},{term:'ethereum',w:3},{term:'defi',w:3},{term:'nft',w:2},{term:'dapp',w:3},
    ],
    threshold: 4,
    skills: ['solidity','web3','ethereum','hardhat','truffle','javascript','python','docker'],
    tip: 'Include TVL (total value locked), gas optimisation savings, audit results, and protocol links.',
    weights: {tech:0.50,semantic:0.25,skills:0.12,experience:0.10,formatting:0.03},
  },
  'Embedded / Systems Engineer': {
    keywords: [
      {term:'embedded',w:4},{term:'firmware',w:4},{term:'rtos',w:4},{term:'iot',w:3},
      {term:'microcontroller',w:3},{term:'fpga',w:3},{term:'c++',w:2},{term:'bare metal',w:3},
    ],
    threshold: 4,
    skills: ['c++','c','python','linux','rtos','embedded','mqtt','modbus','can bus'],
    tip: 'Include hardware platforms (STM32, Raspberry Pi), boot time improvements, and memory footprint reductions.',
    weights: {tech:0.52,semantic:0.20,skills:0.12,experience:0.12,formatting:0.04},
  },
  'Site Reliability Engineer': {
    keywords: [
      {term:'sre',w:5},{term:'site reliability',w:5},{term:'platform engineering',w:4},
      {term:'slo',w:3},{term:'sla',w:2},{term:'incident',w:2},{term:'on-call',w:2},
      {term:'observability',w:3},{term:'chaos engineering',w:3},
    ],
    threshold: 4,
    skills: ['kubernetes','prometheus','grafana','terraform','python','go','aws','linux','ci/cd'],
    tip: 'Lead with reliability metrics: uptime (nines), MTTR, MTTD, error budget burn rate.',
    weights: {tech:0.48,semantic:0.22,skills:0.12,experience:0.12,formatting:0.06},
  },
  'Salesforce Developer': {
    keywords: [
      {term:'salesforce',w:5},{term:'sfdc',w:4},{term:'apex',w:4},{term:'lightning',w:3},
      {term:'lwc',w:3},{term:'visualforce',w:3},{term:'soql',w:3},{term:'crm',w:2},
    ],
    threshold: 4,
    skills: ['salesforce','apex','lightning','lwc','soql','rest','javascript','git'],
    tip: 'Include Salesforce certifications, automation built, and business process improvements.',
    weights: {tech:0.50,semantic:0.22,skills:0.12,experience:0.11,formatting:0.05},
  },
  'SAP Consultant': {
    keywords: [
      {term:'sap',w:5},{term:'s/4hana',w:4},{term:'sap hana',w:4},{term:'abap',w:4},
      {term:'sap mm',w:3},{term:'sap fi',w:3},{term:'sap sd',w:3},{term:'sap basis',w:3},
    ],
    threshold: 4,
    skills: ['sap','abap','sql','python','rest','git','linux'],
    tip: 'Include SAP module expertise, implementation project size (users, countries), and certifications.',
    weights: {tech:0.48,semantic:0.22,skills:0.12,experience:0.13,formatting:0.05},
  },
  'Technical Writer': {
    keywords: [
      {term:'technical writer',w:5},{term:'documentation',w:4},{term:'api documentation',w:4},
      {term:'content strategist',w:3},{term:'developer advocate',w:3},{term:'devrel',w:3},
    ],
    threshold: 4,
    skills: ['markdown','git','rest','swagger','postman','confluence','notion','html'],
    tip: 'Include docs page views, developer NPS improvement, and tools/frameworks documented.',
    weights: {tech:0.25,semantic:0.35,skills:0.10,experience:0.20,formatting:0.10},
  },
};

const DEFAULT_WEIGHTS = {tech:0.45,semantic:0.25,skills:0.10,experience:0.12,formatting:0.08};

function detectJobRole(jd) {
  const lower = jd.toLowerCase();
  let best = null, bestScore = 0;
  for (const [role, profile] of Object.entries(ROLE_PROFILES)) {
    const score = profile.keywords.reduce((acc, {term, w}) =>
      acc + (lower.includes(term) ? w : 0), 0);
    if (score > bestScore && score >= profile.threshold) { bestScore = score; best = role; }
  }
  return best;
}

/* ══════════════════════════════════════════════════════════════
   ACTION VERB ANALYSIS
══════════════════════════════════════════════════════════════ */
const WEAK_VERBS = [
  'responsible for','worked on','helped with','assisted with',
  'participated in','involved in','contributed to','part of',
  'duties included','tasked with','worked with',
];
const STRONG_VERBS = [
  'Developed','Architected','Engineered','Built','Designed','Implemented',
  'Led','Spearheaded','Launched','Delivered','Deployed','Automated',
  'Optimised','Reduced','Improved','Increased','Accelerated','Streamlined',
  'Managed','Mentored','Integrated','Migrated','Refactored','Established',
  'Transformed','Scaled','Generated','Created','Achieved','Orchestrated',
  'Pioneered','Championed','Negotiated','Overhauled','Revamped','Secured',
];
const REWRITE_EXAMPLES = [
  { weak:'Responsible for frontend development',
    strong:'Engineered responsive React UI components, reducing page load time by 35%' },
  { weak:'Worked on API development',
    strong:'Architected 12 RESTful API endpoints serving 50K+ daily requests' },
  { weak:'Helped with database management',
    strong:'Optimised PostgreSQL queries improving response time by 60%' },
  { weak:'Participated in agile development',
    strong:'Led daily standups and sprint retrospectives for a 6-person engineering team' },
  { weak:'Worked on machine learning models',
    strong:'Built and deployed a Random Forest model with 91% accuracy on customer churn prediction' },
  { weak:'Involved in CI/CD pipeline',
    strong:'Automated CI/CD with GitHub Actions, cutting deployment time from 2 hours to 8 minutes' },
];

function analyzeActionVerbs(resumeText) {
  const sentences = resumeText.split(/[.•\n]/);
  const weakFound = [];
  sentences.forEach(s => {
    const t = s.trim().toLowerCase();
    for (const wv of WEAK_VERBS) {
      if (t.startsWith(wv) || t.includes(` ${wv} `)) { weakFound.push(s.trim().slice(0,80)); break; }
    }
  });
  const strongVerbsFound = STRONG_VERBS.filter(v => skillRegex(v).test(resumeText));
  const verbScore = Math.max(0, Math.min(100, 60 + strongVerbsFound.length * 5 - weakFound.length * 10));
  return {
    weakFound:        weakFound.slice(0,3),
    strongVerbCount:  strongVerbsFound.length,
    weakVerbCount:    weakFound.length,
    verbScore,
    rewrites:         REWRITE_EXAMPLES.slice(0,2),
    strongVerbsFound: strongVerbsFound.slice(0,6),
  };
}

/* ══════════════════════════════════════════════════════════════
   KEYWORD EXTRACTION
══════════════════════════════════════════════════════════════ */
const STOP = new Set([
  'the','and','for','with','this','that','have','from','are','will',
  'our','you','your','they','we','all','any','can','may','job','role',
  'work','team','company','looking','required','must','need','year',
  'years','experience','strong','good','great','excellent','plus',
  'able','knowledge','understanding','familiar','proficient','various',
  'including','using','etc','such','also','well','when','where','which',
  'what','how','like','make','help','take','give','come','just',
]);

function extractKeywords(text) {
  let normalized = text.toLowerCase();
  for (const [phrase, canon] of Object.entries(SYNONYMS)) {
    if (phrase.includes(' ')) {
      normalized = normalized.replace(new RegExp(escapeRegex(phrase), 'g'), canon);
    }
  }
  const techSkills = TECH_SKILLS.filter(skill => skillRegex(skill).test(normalized));
  const tokens     = tokenizer.tokenize(normalized) || [];
  const filtered   = removeStopwords(tokens)
    .map(normalizeTerm)
    .filter(w => w.length > 3 && !STOP.has(w) && /^[a-z][a-z0-9]*$/.test(w));
  const freq = {};
  filtered.forEach(w => { const s = stemmer.stem(w); freq[s] = (freq[s]||0)+1; });
  const topStems = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,60).map(([stem,count])=>({stem,count}));
  return { techSkills:[...new Set(techSkills)], topStems };
}

/* ══════════════════════════════════════════════════════════════
   TF-IDF COSINE SIMILARITY
══════════════════════════════════════════════════════════════ */
function tfidfCosine(textA, textB) {
  const tfidf = new TfIdf();
  tfidf.addDocument(textA); tfidf.addDocument(textB);
  const terms = new Set([
    ...tfidf.listTerms(0).map(t=>t.term),
    ...tfidf.listTerms(1).map(t=>t.term),
  ]);
  const vA=[], vB=[];
  for (const term of terms) { vA.push(tfidf.tfidf(term,0)); vB.push(tfidf.tfidf(term,1)); }
  let dot=0, mA=0, mB=0;
  for (let i=0;i<vA.length;i++) { dot+=vA[i]*vB[i]; mA+=vA[i]**2; mB+=vB[i]**2; }
  if (!mA||!mB) return 0;
  return dot/(Math.sqrt(mA)*Math.sqrt(mB));
}

/* ══════════════════════════════════════════════════════════════
   SECTION DETECTION
══════════════════════════════════════════════════════════════ */
function detectSections(text) {
  const t = text.toLowerCase();
  return {
    summary:        /\b(summary|objective|profile|about me)\b/i.test(t),
    experience:     /\b(experience|employment|work history|professional history)\b/i.test(t),
    education:      /\b(education|degree|university|college|bachelor|master|phd)\b/i.test(t),
    skills:         /\b(skills|technologies|tech stack|competencies|expertise)\b/i.test(t),
    projects:       /\b(projects|portfolio|contributions|github)\b/i.test(t),
    certifications: /\b(certif|certification|license|credential)\b/i.test(t),
    achievements:   /\b(achievement|award|honor|recognition|accomplishment)\b/i.test(t),
  };
}

/* ══════════════════════════════════════════════════════════════
   SECTION-WISE SCORING
══════════════════════════════════════════════════════════════ */
function scoreSections(resumeText, jdData, resumeData, sections) {
  const skillsRaw = jdData.techSkills.length > 0
    ? (resumeData.techSkills.filter(s=>jdData.techSkills.includes(s)).length/jdData.techSkills.length)*100 : 55;

  const expMatch = /experience[\s\S]{0,2500}/i.exec(resumeText);
  const expText  = (expMatch?expMatch[0]:resumeText).toLowerCase();
  const expHits  = jdData.techSkills.length > 0
    ? jdData.techSkills.filter(s=>skillRegex(s).test(expText)).length/jdData.techSkills.length : 0.4;
  const hasNumbers  = /\d+/.test(expText);
  const hasPercents = /\d+%/.test(expText);
  const hasYears    = /\d+\s*year/i.test(expText);
  const hasSeniority= /\b(senior|lead|principal|staff|architect|manager|director)\b/i.test(expText);
  const experienceRaw = Math.min(100,
    Math.sqrt(expHits)*60 + (hasNumbers?12:0) + (hasPercents?10:0) + (hasYears?8:0) + (hasSeniority?10:0));

  const sectionPct = Object.keys(sections).filter(k=>sections[k]).length/Object.keys(sections).length;
  const hasQuantified = /\d+%|\d+x|\$\d+|\d+ (million|thousand|users|customers|engineers)/i.test(resumeText);
  const hasActionVerbs= /\b(developed|built|led|designed|implemented|architected|optimized|delivered|reduced|increased|launched|managed|created|improved|spearheaded|engineered|automated|scaled)\b/i.test(resumeText);
  const hasBullets    = (resumeText.match(/[•\-\*]\s+\w/g)||[]).length > 3;
  const hasLinks      = /github\.com|linkedin\.com|portfolio/i.test(resumeText);
  const formattingRaw = Math.min(100,
    sectionPct*50 + (hasQuantified?18:0) + (hasActionVerbs?16:0) + (hasBullets?10:0) + (hasLinks?6:0));

  return {
    skills:     Math.round(skillsRaw),
    experience: Math.round(experienceRaw),
    formatting: Math.round(formattingRaw),
  };
}

/* ══════════════════════════════════════════════════════════════
   STUFFING DETECTION
══════════════════════════════════════════════════════════════ */
function detectStuffing(resumeText, matchedSkills) {
  if (!matchedSkills.length) return {stuffed:false,penalty:0};
  const lower = resumeText.toLowerCase();
  const wordCnt = (lower.match(/\b\w+\b/g)||[]).length;
  const totalHits = matchedSkills.reduce((acc,s)=>acc+(lower.match(skillRegex(s))||[]).length,0);
  const density = totalHits/wordCnt;
  const stuffed = density>0.08;
  return {stuffed, penalty:stuffed?Math.min(Math.round((density-0.08)*400),15):0};
}

/* ══════════════════════════════════════════════════════════════
   CONFIDENCE SCORE
══════════════════════════════════════════════════════════════ */
function computeConfidence(techSkillsInJD, cosine, sectionHits, wordCount) {
  const raw = (
    Math.min(1,techSkillsInJD/8)  * 0.35 +
    Math.min(1,cosine*4)           * 0.30 +
    Math.min(1,wordCount/400)      * 0.20 +
    (sectionHits/7)                * 0.15
  ) * 100;
  return Math.round(Math.min(97,Math.max(42,raw)));
}

/* ══════════════════════════════════════════════════════════════
   STRENGTHS / WEAKNESSES
══════════════════════════════════════════════════════════════ */
function buildStrengthsSummary(sectionScores, sections, matchedKeywords, verbAnalysis, atsScore) {
  const strengths=[], weaknesses=[];
  if (sectionScores.formatting>=70) strengths.push('Strong formatting with action verbs and quantified results');
  if (sectionScores.skills>=70)     strengths.push(`Good technical skill alignment (${matchedKeywords.length} matched skills)`);
  if (sectionScores.experience>=65) strengths.push('JD-relevant tech mentioned throughout experience section');
  if (sections.projects)            strengths.push('Projects section adds credibility and hands-on proof');
  if (sections.certifications)      strengths.push('Certifications signal validated, employer-recognised expertise');
  if (verbAnalysis.strongVerbCount>=4) strengths.push(`${verbAnalysis.strongVerbCount} strong action verbs (${verbAnalysis.strongVerbsFound.slice(0,3).join(', ')}…)`);
  if (sections.achievements)        strengths.push('Achievements section differentiates you from keyword-only resumes');

  if (sectionScores.skills<50)      weaknesses.push('Low tech skill match — most JD requirements are missing');
  if (sectionScores.experience<50)  weaknesses.push('Experience section lacks JD-relevant technologies');
  if (sectionScores.formatting<55)  weaknesses.push('Formatting score low — add bullets, action verbs, and metrics');
  if (!sections.summary)            weaknesses.push('Missing Professional Summary — first section ATS scanners read');
  if (!sections.projects)           weaknesses.push('No Projects section — hard to validate claimed technical skills');
  if (!sections.skills)             weaknesses.push('No dedicated Skills section — ATS cannot locate your technologies');
  if (verbAnalysis.weakVerbCount>2) weaknesses.push(`${verbAnalysis.weakVerbCount} weak phrases detected ("responsible for", "worked on"…)`);
  if (atsScore<45)                  weaknesses.push('Overall ATS match is poor — tailor this resume to the specific JD');
  return {strengths:strengths.slice(0,4), weaknesses:weaknesses.slice(0,4)};
}

/* ══════════════════════════════════════════════════════════════
   SUGGESTIONS
══════════════════════════════════════════════════════════════ */
function generateSuggestions(missing, sections, sectionScores, stuffing, detectedRole, verbAnalysis) {
  const tips=[];
  if (detectedRole && ROLE_PROFILES[detectedRole]) {
    const p=ROLE_PROFILES[detectedRole];
    tips.push(`Detected role: ${detectedRole} — ${p.tip}`);
    const roleGap=p.skills.filter(s=>missing.includes(s)).slice(0,3);
    if (roleGap.length) tips.push(`Priority skills for ${detectedRole}: add ${roleGap.map(s=>`"${s}"`).join(', ')} with concrete project context`);
  }
  if (missing.length) tips.push(`Add missing keywords naturally: ${missing.slice(0,4).map(k=>`"${k}"`).join(', ')} — demonstrate usage in bullets, not just a list`);
  if (verbAnalysis.weakVerbCount>0) tips.push('Replace "responsible for" / "worked on" with strong verbs: Engineered, Architected, Automated, Spearheaded');
  if (sectionScores.skills<60)    tips.push('Expand Skills section — use exact tech names from JD ("PostgreSQL" not "databases")');
  if (sectionScores.experience<55)tips.push('Rewrite experience bullets: each = one specific tool + one measurable outcome');
  if (sectionScores.formatting<65)tips.push('Add quantified achievements: "reduced API latency by 40%", "led team of 5", "served 100K daily users"');
  if (!sections.summary)          tips.push('Add a 3-sentence Professional Summary: [Role] with [X years] of [top 3 JD skills]. [One achievement]');
  if (!sections.projects)         tips.push('Add Projects: 2–3 using JD-relevant tech, with links and outcome metrics');
  if (!sections.achievements)     tips.push('Add Achievements: "Increased deployment frequency 4× via CI/CD automation" beats any skill list');
  if (stuffing.stuffed)           tips.push('Keyword density too high — integrate skills organically in sentences, not bulk-listed');
  tips.push('Mirror JD phrasing exactly — if JD says "RESTful APIs", use that phrase, not "REST services"');
  tips.push('Export as plain PDF with no text boxes, tables, or columns — these break ATS parsers');
  return tips;
}

/* ══════════════════════════════════════════════════════════════
   RADAR DATA
══════════════════════════════════════════════════════════════ */
function buildRadarData(sectionScores, stats, verbAnalysis) {
  return {
    resume:[
      {label:'Technical Skills',value:stats.techMatchPercent},
      {label:'Experience Fit',  value:sectionScores.experience},
      {label:'Formatting',      value:sectionScores.formatting},
      {label:'Semantic Match',  value:stats.semanticSimilarity},
      {label:'Action Verbs',    value:verbAnalysis.verbScore},
    ],
    ideal:[
      {label:'Technical Skills',value:100},
      {label:'Experience Fit',  value:90},
      {label:'Formatting',      value:85},
      {label:'Semantic Match',  value:80},
      {label:'Action Verbs',    value:80},
    ],
  };
}

/* ══════════════════════════════════════════════════════════════
   MAIN FUNCTION
══════════════════════════════════════════════════════════════ */
function analyzeResume(resumeText, jobDescription) {
  const resumeData = extractKeywords(resumeText);
  const jdData     = extractKeywords(jobDescription);
  const resumeLow  = resumeText.toLowerCase();

  const matchedTech = jdData.techSkills.filter(s=>skillRegex(s).test(resumeLow));
  const missingTech = jdData.techSkills.filter(s=>!matchedTech.includes(s));
  const techScore   = jdData.techSkills.length>0?(matchedTech.length/jdData.techSkills.length)*100:55;

  const cosine        = tfidfCosine(resumeText, jobDescription);
  const semanticScore = Math.min(100, cosine*250);

  const sections      = detectSections(resumeText);
  const sectionScores = scoreSections(resumeText, jdData, resumeData, sections);
  const sectionHits   = Object.values(sections).filter(Boolean).length;
  const stuffing      = detectStuffing(resumeText, matchedTech);
  const detectedRole  = detectJobRole(jobDescription);
  const W = detectedRole && ROLE_PROFILES[detectedRole]?.weights
    ? ROLE_PROFILES[detectedRole].weights : DEFAULT_WEIGHTS;

  const verbAnalysis  = analyzeActionVerbs(resumeText);

  const raw =
    techScore                * W.tech        +
    semanticScore            * W.semantic    +
    sectionScores.skills     * W.skills      +
    sectionScores.experience * W.experience  +
    sectionScores.formatting * W.formatting  -
    stuffing.penalty;

  const atsScore = Math.min(100,Math.max(5,Math.round(raw)));

  let scoreLabel, scoreGrade;
  if      (atsScore>=80) {scoreLabel='Excellent Match';   scoreGrade='A';}
  else if (atsScore>=65) {scoreLabel='Good Match';        scoreGrade='B';}
  else if (atsScore>=45) {scoreLabel='Needs Improvement'; scoreGrade='C';}
  else                   {scoreLabel='Poor Match';        scoreGrade='D';}

  const wordCount  = resumeText.split(/\s+/).length;
  const confidence = computeConfidence(jdData.techSkills.length, cosine, sectionHits, wordCount);
  const summary    = buildStrengthsSummary(sectionScores, sections, matchedTech, verbAnalysis, atsScore);
  const suggestions= generateSuggestions(missingTech, sections, sectionScores, stuffing, detectedRole, verbAnalysis);
  const radarData  = buildRadarData(sectionScores, {techMatchPercent:Math.round(techScore),semanticSimilarity:Math.round(semanticScore)}, verbAnalysis);

  return {
    atsScore, scoreLabel, scoreGrade, confidence, detectedRole,
    matchedKeywords: matchedTech.slice(0,14),
    missingKeywords: missingTech.slice(0,14),
    sections, sectionScores, summary,
    verbAnalysis:{
      weakFound:        verbAnalysis.weakFound,
      strongVerbCount:  verbAnalysis.strongVerbCount,
      weakVerbCount:    verbAnalysis.weakVerbCount,
      verbScore:        verbAnalysis.verbScore,
      rewrites:         verbAnalysis.rewrites,
      strongVerbsFound: verbAnalysis.strongVerbsFound,
    },
    suggestions, stuffingWarning:stuffing.stuffed, radarData,
    stats:{
      techSkillsInJD:      jdData.techSkills.length,
      techSkillsMatched:   matchedTech.length,
      techMatchPercent:    Math.round(techScore),
      semanticSimilarity:  Math.round(semanticScore),
      keywordMatchPercent: Math.round(semanticScore),
      skillsScore:         sectionScores.skills,
      experienceScore:     sectionScores.experience,
      formattingScore:     sectionScores.formatting,
      resumeWordCount:     wordCount,
      stuffingPenalty:     stuffing.penalty,
      verbScore:           verbAnalysis.verbScore,
      activeWeights:       W,
    },
  };
}

module.exports = { analyzeResume };
