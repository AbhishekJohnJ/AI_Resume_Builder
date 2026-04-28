/**
 * Groq AI Service
 */
const Groq = require('groq-sdk');

let _groq = null;
function getGroq() {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
}
const MODEL = 'llama-3.1-8b-instant';

async function chat(systemPrompt, userMessage, maxTokens = 2048) {
  const res = await getGroq().chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userMessage  },
    ],
    temperature: 0.7,
    max_tokens: maxTokens,
  });
  return res.choices[0]?.message?.content || '';
}

function extractJSON(raw) {
  let str = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  if (!str.startsWith('{') && !str.startsWith('[')) {
    const m = str.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (m) str = m[0];
    else throw new Error('AI did not return valid JSON. Try rephrasing your prompt.');
  }
  return JSON.parse(str);
}

/* ─────────────────────────────────────────
   1. RESUME ANALYSER
───────────────────────────────────────── */
async function analyzeResume(resumeText, targetRole = '') {
  const system = `You are an expert resume analyst and career coach with deep knowledge of current hiring trends, ATS systems, and in-demand skills across all industries.

Analyze the resume thoroughly and return ONLY a valid JSON object — no markdown, no explanation outside JSON.

Return this exact structure:
{
  "resume_score": <number 0-100>,
  "resume_level": "<Beginner|Intermediate|Professional|Expert>",
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "weak_areas": ["<specific weakness 1>", "<specific weakness 2>", "<specific weakness 3>"],
  "suggestions": [
    "<actionable improvement 1>",
    "<actionable improvement 2>",
    "<actionable improvement 3>",
    "<actionable improvement 4>"
  ],
  "skills_to_add": ["<in-demand skill 1>", "<in-demand skill 2>", "<in-demand skill 3>", "<in-demand skill 4>"],
  "market_insights": "<2-3 sentences about current market demand for this profile>",
  "ats_score": <number 0-100>,
  "experience_level": "<Entry|Junior|Mid|Senior|Lead>",
  "recommended_roles": ["<role 1>", "<role 2>", "<role 3>"],
  "improvement_roadmap": [
    { "task": "<task>", "priority": "High", "impact": "High", "estimated_time": "<time>" },
    { "task": "<task>", "priority": "Medium", "impact": "Medium", "estimated_time": "<time>" },
    { "task": "<task>", "priority": "Low", "impact": "Medium", "estimated_time": "<time>" }
  ],
  "key_insights": ["<insight 1>", "<insight 2>", "<insight 3>"]
}`;

  const user = `${targetRole ? `Target Role: ${targetRole}\n\n` : ''}Resume:\n${resumeText}`;
  const raw = await chat(system, user, 1500);
  return extractJSON(raw);
}

/* ─────────────────────────────────────────
   2. RESUME GENERATOR
───────────────────────────────────────── */
const TEMPLATE_HINTS = {
  1:  'Modern Minimalist — clean, blue accent, sidebar layout. Use concise professional language.',
  2:  'Professional Modern — dark header, two-column. Use formal corporate tone.',
  3:  'Simple Student CV — teal sidebar. Use academic, entry-level tone.',
  4:  'Orange Graphic Designer — creative, bold. Use creative industry language.',
  5:  'Clean Two-Column — grey accent. Use balanced professional tone.',
  6:  'Bold Teal Header — student focused. Use academic achievement tone.',
  7:  'Dark Executive — gold accents. Use senior executive, achievement-focused language.',
  8:  'Purple Creative — bold sidebar. Use creative, innovative language.',
  9:  'Minimal White — clean tags. Use concise, modern tech language.',
  10: 'Red Accent — vibrant sidebar. Use energetic, results-driven language.',
  11: 'Green Nature — eco/fresh. Use warm, collaborative language.',
  12: 'Navy Classic — formal. Use traditional professional language.',
  13: 'Cyan Tech — tech focused. Use technical, skills-forward language.',
  14: 'Coral Modern — modern warm. Use friendly professional language.',
  15: 'Indigo Professional — premium sidebar. Use polished executive language.',
};

async function generateResume(prompt, templateId, existingData = null) {
  const hint = TEMPLATE_HINTS[templateId] || 'Professional resume template.';
  const isEnhancement = !!existingData;

  const system = `You are a world-class resume writer who has helped thousands of candidates land jobs at Google, Amazon, Microsoft, Apple, Meta, NVIDIA, and Fortune 500 companies. You have deep knowledge of:
- What hiring managers and HR directors look for in 2024-2025
- ATS (Applicant Tracking System) optimization techniques
- Industry-specific keywords and power phrases
- How to quantify achievements to maximize impact
- Current market trends and in-demand skills for every field

Template: ${hint}

YOUR MISSION: Create a resume so impressive that any HR manager who reads it will immediately want to schedule an interview.

MANDATORY REQUIREMENTS:
1. PROFESSIONAL SUMMARY: 3-4 sentences. Must include: years of experience, key technical expertise, biggest achievement with metric, and unique value proposition. Use power words like "Spearheaded", "Architected", "Pioneered", "Transformed".

2. WORK EXPERIENCE: Each role MUST have 5-6 bullet points with:
   - Strong action verbs (Engineered, Optimized, Delivered, Scaled, Automated, Reduced, Increased)
   - Quantified results: "Reduced latency by 40%", "Served 2M+ users", "Saved $500K annually"
   - Technologies used in context
   - Business impact, not just tasks

3. SKILLS: 12-15 skills. Mix technical skills (tools, languages, frameworks) with domain skills. Order by relevance to the role.

4. EDUCATION: Include GPA if strong, relevant coursework, academic achievements.

5. AWARDS/CERTIFICATIONS: Industry-recognized certifications, hackathon wins, publications, patents.

6. Use industry-standard keywords that ATS systems scan for.

7. Every bullet point must demonstrate VALUE, not just responsibility.

BAD: "Worked on backend development"
GOOD: "Engineered high-performance REST APIs using Node.js and Redis, reducing response time by 65% and supporting 500K daily requests"

Return ONLY valid JSON — no markdown, no explanation:
{
  "name": "Full Name",
  "title": "Specific Senior Job Title",
  "email": "email@example.com",
  "phone": "+1 (555) 000-0000",
  "location": "City, Country",
  "linkedin": "linkedin.com/in/username",
  "website": "portfolio.dev",
  "summary": "4-sentence executive summary packed with keywords, metrics, and value proposition that makes HR stop scrolling",
  "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6", "Skill 7", "Skill 8", "Skill 9", "Skill 10", "Skill 11", "Skill 12"],
  "experience": [
    {
      "role": "Senior/Lead Job Title",
      "company": "Company Name",
      "period": "2022 – Present",
      "desc": "Brief role context",
      "bullets": [
        "Architected and deployed X system using Y technology, achieving Z% improvement in performance and saving $N annually",
        "Led cross-functional team of N engineers to deliver mission-critical project 3 weeks ahead of schedule",
        "Optimized database queries and caching strategy, reducing API response time by 60% for 1M+ daily users",
        "Implemented automated CI/CD pipeline reducing deployment time from 2 hours to 8 minutes",
        "Mentored 4 junior developers, improving team code quality score by 35% and reducing bug rate by 40%",
        "Collaborated with product team to define technical roadmap, shipping 15+ features per quarter"
      ]
    },
    {
      "role": "Previous Job Title",
      "company": "Previous Company",
      "period": "2020 – 2022",
      "desc": "Brief role context",
      "bullets": [
        "Built scalable microservices architecture handling 500K+ daily transactions with 99.9% uptime",
        "Reduced infrastructure costs by 30% through cloud optimization and resource right-sizing",
        "Developed real-time data processing pipeline processing 10GB+ daily with sub-second latency",
        "Contributed to open-source projects with 500+ GitHub stars, establishing technical credibility"
      ]
    }
  ],
  "education": [
    {
      "degree": "Bachelor/Master of Technology in [Field]",
      "school": "University Name",
      "year": "2020",
      "details": "GPA: 3.8/4.0 | Relevant: Algorithms, OS, Networks, ML"
    }
  ],
  "languages": ["English – Fluent", "Hindi – Native"],
  "awards": [
    "AWS Certified Solutions Architect – Professional (2023)",
    "Best Innovation Award – Company Hackathon 2022 (1st of 150 teams)",
    "Dean's List – All 4 semesters"
  ],
  "sectionStyle": { "skills": "bars", "experience": "default" },
  "designStyle": { "button": "default", "card": "default", "background": "solid" }
}`;

  const user = isEnhancement
    ? `Current resume:\n${JSON.stringify(existingData, null, 2)}\n\nApply this change: ${prompt}`
    : `Create a world-class, HR-approved resume for this person: ${prompt}\n\nMake every bullet point quantified and impactful. Use industry-standard keywords. This resume must stand out from 500 other applicants.`;

  const raw = await chat(system, user, 3500);
  return extractJSON(raw);
}

/* ─────────────────────────────────────────
   3. PORTFOLIO GENERATOR
───────────────────────────────────────── */
const PORTFOLIO_HINTS = {
  1:  'Dark Hacker — terminal/code aesthetic. Use developer-focused, technical language.',
  2:  'Clean Minimal Light — sidebar layout. Use clean professional language.',
  3:  'Vibrant Gradient Creative — colorful hero. Use creative, energetic language.',
  4:  'Navy Executive — corporate header. Use formal executive language.',
  5:  'Sunset Bold — orange/warm tones. Use bold, confident language.',
  6:  'Glass Dark — glassmorphism. Use modern, sleek language.',
  7:  'Rose Minimal — elegant pink. Use refined, elegant language.',
  8:  'Emerald Split — green sidebar. Use fresh, professional language.',
  9:  'Amber Warm — warm tones. Use friendly, approachable language.',
  10: 'Slate Professional — dark nav. Use polished professional language.',
  11: 'Neon Cyberpunk — neon on dark. Use futuristic, tech-forward language.',
};

async function generatePortfolio(prompt, templateId, existingData = null) {
  const hint = PORTFOLIO_HINTS[templateId] || 'Professional portfolio template.';
  const isEnhancement = !!existingData;

  const system = `You are a world-class portfolio designer and content strategist who has built portfolios for engineers at Google, designers at Apple, and developers at top startups. You know exactly what makes a portfolio stand out to recruiters and clients.

Template: ${hint}

YOUR MISSION: Create a portfolio so compelling that any recruiter or client will immediately want to reach out.

REQUIREMENTS:
1. TAGLINE: Punchy, memorable, 6-10 words. Capture personality + expertise.
   BAD: "I build websites"  GOOD: "Turning complex problems into elegant digital experiences"

2. ABOUT: 3 sentences. Who you are + years of experience. What you specialize in + key achievement. What drives you.

3. PROJECTS: Each project MUST have a compelling name, 2-3 sentence description with tech used and impact/scale, real tech stack, quantified impact where possible.

4. EXPERIENCE: Achievement-focused with metrics.

5. SKILLS: 8-10 most relevant, market-demanded skills.

Return ONLY valid JSON — no markdown, no explanation:
{
  "name": "Full Name",
  "initials": "AB",
  "title": "Specific Professional Title",
  "tagline": "Punchy memorable tagline that captures expertise",
  "email": "email@example.com",
  "phone": "+1 (555) 000-0000",
  "location": "City, Country",
  "github": "github.com/username",
  "linkedin": "linkedin.com/in/username",
  "website": "www.portfolio.dev",
  "about": "3-sentence compelling bio with experience, specialization, achievement, and passion",
  "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6", "Skill 7", "Skill 8"],
  "projects": [
    { "name": "Project Name", "desc": "2-3 sentence description with impact metrics and tech context.", "tech": ["Tech1", "Tech2", "Tech3"], "link": "#" },
    { "name": "Project 2", "desc": "Compelling description with impact metrics.", "tech": ["Tech1", "Tech2"], "link": "#" },
    { "name": "Project 3", "desc": "Compelling description with impact metrics.", "tech": ["Tech1", "Tech2"], "link": "#" }
  ],
  "experience": [
    { "role": "Job Title", "company": "Company", "period": "2022 – Present", "desc": "Achievement-focused: Led X, built Y, resulting in Z% improvement." }
  ],
  "designStyle": { "button": "default", "card": "default", "background": "solid" }
}`;

  const user = isEnhancement
    ? `Current portfolio:\n${JSON.stringify(existingData, null, 2)}\n\nApply this change: ${prompt}`
    : `Create a world-class portfolio for: ${prompt}\n\nMake the tagline memorable, projects impactful, and bio compelling. This portfolio must make recruiters want to reach out immediately.`;

  const raw = await chat(system, user, 2500);
  return extractJSON(raw);
}

/* ─────────────────────────────────────────
   4. AI CHAT
───────────────────────────────────────── */
async function aiChat(message) {
  const system = `You are a helpful AI career assistant for ResumeCraft — a resume and portfolio builder platform.
Give concise, actionable advice about resumes, portfolios, LinkedIn, GitHub, and career growth.
Keep responses short, friendly, and practical. Use bullet points when listing multiple items.`;

  return await chat(system, message, 400);
}

/* ─────────────────────────────────────────
   5. GATHER MISSING INFO (dynamic, domain-aware)
───────────────────────────────────────── */
async function gatherMissingInfo(prompt, type) {
  const system = `You are an expert career coach AI. Analyze the user's prompt and identify ONLY the information that is genuinely missing.

CRITICAL RULES:
- Read the prompt carefully. If name is mentioned, do NOT ask for name.
- If role/title is mentioned, do NOT ask for role.
- If experience years are mentioned, do NOT ask for experience.
- ONLY ask about information that is completely absent.
- Be DOMAIN-AWARE: questions must match the user's field.

DOMAIN EXAMPLES:
- Software/Tech: ask about programming languages, frameworks, GitHub, tech stack, projects
- Doctor/Medical: ask about specialization, hospital/clinic, medical certifications, patient volume, research
- Designer: ask about design tools (Figma, Adobe), portfolio link, design specialization, clients
- Finance/Banking: ask about certifications (CFA, CPA), financial tools, assets managed
- Teacher/Education: ask about subjects taught, grade levels, curriculum, student count
- Marketing: ask about campaigns, tools (Google Ads, SEO), metrics, budget managed
- Fresher/Student: ask about projects, internships, academic achievements, certifications

For a ${type}, key fields are:
- ALWAYS check: full name, job title/role
- Domain-specific: skills, tools, certifications, achievements, education details
- Contact: email, location (optional)

Return ONLY a JSON array. Each object:
{
  "key": "unique_key",
  "question": "Natural conversational question",
  "placeholder": "Example answer",
  "required": true/false,
  "hint": "Short tip or null",
  "label": "Short label for prompt building"
}

Return [] if the prompt already has enough info to build a great ${type}.
Return ONLY valid JSON array — no markdown, no text outside.`;

  const user = `User's prompt: "${prompt}"\n\nWhat key information is missing? Return JSON array of questions only for what's missing.`;

  try {
    const raw = await chat(system, user, 700);
    const str = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const start = str.indexOf('[');
    const end = str.lastIndexOf(']');
    if (start === -1 || end === -1) return [];
    const parsed = JSON.parse(str.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed.slice(0, 6) : [];
  } catch {
    return [];
  }
}

module.exports = { analyzeResume, generateResume, generatePortfolio, aiChat, gatherMissingInfo };
