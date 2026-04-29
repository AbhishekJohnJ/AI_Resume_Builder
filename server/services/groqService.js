/**
 * Groq AI Service — handles all AI generation and analysis
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
  "suggestions": ["<actionable improvement 1>", "<actionable improvement 2>", "<actionable improvement 3>", "<actionable improvement 4>"],
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
async function generateResume(prompt, templateId, existingData = null) {
  const isEnhancement = !!existingData;

  const system = isEnhancement
    ? `You are an expert resume writer. Apply the user's requested changes to the existing resume and return the FULL updated resume JSON.
You can modify content, add/remove sections, improve language, add quantified achievements.
Return ONLY valid JSON — no markdown, no explanation.`
    : `You are a world-class resume writer who has helped thousands of candidates land jobs at Google, Amazon, Microsoft, NVIDIA, and Fortune 500 companies.

YOUR MISSION: Create a resume so impressive that any HR manager will immediately want to interview the candidate.

MANDATORY REQUIREMENTS:
1. SUMMARY: 3-4 powerful sentences with keywords, years of experience, key achievements, and value proposition.
2. EXPERIENCE: Each role MUST have 5-6 bullet points with:
   - Strong action verbs (Engineered, Optimized, Delivered, Scaled, Automated)
   - Quantified results: "Reduced latency by 40%", "Served 2M+ users", "Saved $500K annually"
   - Technologies used in context
3. SKILLS: 12-15 skills mixing technical and domain skills
4. EDUCATION: Full details with GPA if mentioned
5. AWARDS/CERTIFICATIONS: Industry-recognized certifications

Return ONLY valid JSON:
{
  "name": "Full Name",
  "title": "Specific Job Title",
  "email": "email@example.com",
  "phone": "+1 (555) 000-0000",
  "location": "City, Country",
  "linkedin": "linkedin.com/in/username",
  "website": "portfolio.dev",
  "summary": "4-sentence executive summary packed with keywords and metrics",
  "skills": ["Skill 1","Skill 2","Skill 3","Skill 4","Skill 5","Skill 6","Skill 7","Skill 8","Skill 9","Skill 10","Skill 11","Skill 12"],
  "experience": [
    {
      "role": "Senior Job Title",
      "company": "Company Name",
      "period": "2022 – Present",
      "desc": "Brief role context",
      "bullets": [
        "Architected X system using Y, achieving Z% improvement and saving $N annually",
        "Led team of N engineers to deliver project 3 weeks ahead of schedule",
        "Optimized database queries reducing API response time by 60% for 1M+ daily users",
        "Implemented CI/CD pipeline reducing deployment time from 2 hours to 8 minutes",
        "Mentored 4 junior developers improving team code quality by 35%"
      ]
    }
  ],
  "education": [{ "degree": "Degree", "school": "University", "year": "2020", "details": "GPA: 3.8/4.0" }],
  "languages": ["English – Fluent"],
  "awards": ["AWS Certified Solutions Architect (2023)", "Hackathon Winner 2022"],
  "sectionStyle": { "skills": "bars", "experience": "default" },
  "designStyle": { "button": "default", "card": "default", "background": "solid" }
}`;

  const user = isEnhancement
    ? `Current resume:\n${JSON.stringify(existingData, null, 2)}\n\nApply this change: ${prompt}`
    : `Create a world-class resume for: ${prompt}\n\nMake every bullet point quantified and impactful. This resume must stand out from 500 other applicants.`;

  const raw = await chat(system, user, 3000);
  return extractJSON(raw);
}

/* ─────────────────────────────────────────
   3. PORTFOLIO GENERATOR
───────────────────────────────────────── */
async function generatePortfolio(prompt, templateId, existingData = null) {
  const isEnhancement = !!existingData;

  const system = isEnhancement
    ? `You are an expert portfolio designer. Apply the user's requested changes to the existing portfolio and return the FULL updated portfolio JSON.
Return ONLY valid JSON — no markdown, no explanation.`
    : `You are a world-class portfolio designer and content strategist.

YOUR MISSION: Create a portfolio so compelling that any recruiter will immediately want to reach out.

REQUIREMENTS:
1. TAGLINE: Punchy, memorable, 6-10 words. Capture personality + expertise.
2. ABOUT: 3 sentences. Who you are + years of experience. What you specialize in + key achievement. What drives you.
3. PROJECTS: 3-4 projects each with compelling name, 2-3 sentence description with tech and impact metrics.
4. SKILLS: 8-10 most relevant, market-demanded skills.

Return ONLY valid JSON:
{
  "name": "Full Name",
  "initials": "AB",
  "title": "Specific Professional Title",
  "tagline": "Punchy memorable tagline",
  "email": "email@example.com",
  "phone": "+1 (555) 000-0000",
  "location": "City, Country",
  "github": "github.com/username",
  "linkedin": "linkedin.com/in/username",
  "website": "www.portfolio.dev",
  "about": "3-sentence compelling bio with experience, specialization, and passion",
  "skills": ["Skill 1","Skill 2","Skill 3","Skill 4","Skill 5","Skill 6","Skill 7","Skill 8"],
  "projects": [
    { "name": "Project Name", "desc": "2-3 sentence description with impact metrics.", "tech": ["Tech1","Tech2","Tech3"], "link": "#" },
    { "name": "Project 2", "desc": "Compelling description with impact.", "tech": ["Tech1","Tech2"], "link": "#" },
    { "name": "Project 3", "desc": "Compelling description with impact.", "tech": ["Tech1","Tech2"], "link": "#" }
  ],
  "experience": [
    { "role": "Job Title", "company": "Company", "period": "2022 – Present", "desc": "Achievement-focused description with metrics." }
  ],
  "designStyle": { "button": "default", "card": "default", "background": "solid" }
}`;

  const user = isEnhancement
    ? `Current portfolio:\n${JSON.stringify(existingData, null, 2)}\n\nApply this change: ${prompt}`
    : `Create a world-class portfolio for: ${prompt}\n\nMake the tagline memorable, projects impactful, and bio compelling.`;

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
   5. GATHER MISSING INFO (domain-aware consultant)
───────────────────────────────────────── */
async function gatherMissingInfo(prompt, type) {
  const system = `You are an expert AI Resume & Portfolio Consultant trained to create ATS-optimized, recruiter-ready resumes and modern portfolios.

Your role is to behave like a smart consultant who identifies missing or weak information from the user's input.

BEHAVIOR RULES:
- NEVER assume missing details
- Analyze the prompt carefully and identify what is ALREADY provided vs what is MISSING
- If name is in the prompt → do NOT ask for name
- If role/title is in the prompt → do NOT ask for role
- If experience is mentioned → do NOT ask for experience
- Only ask about information that is COMPLETELY ABSENT

For a RESUME, critical missing info to check:
- Full name (if not mentioned)
- Job title / target role (if not mentioned)  
- Years of experience (if not mentioned)
- Key technical skills / programming languages (ALWAYS ask if not mentioned — very important for ATS)
- Projects with tech stack and impact (if not mentioned)
- Education degree + university (if not mentioned)
- Contact: email, LinkedIn, GitHub (optional but valuable)

For a PORTFOLIO, critical missing info:
- Full name (if not mentioned)
- Specialty / role (if not mentioned)
- Top 2-3 projects with descriptions (if not mentioned)
- Key skills (if not mentioned)
- Short bio / about (if not mentioned)

DOMAIN-AWARE QUESTIONS:
- Software/Tech developer → ask about: programming languages, frameworks, GitHub projects, tech stack
- Doctor/Medical → ask about: specialization, hospital/clinic, certifications, patient volume, research
- Designer (UI/UX) → ask about: design tools (Figma, Adobe XD), portfolio link, design specialization, clients
- Data Scientist/ML → ask about: ML frameworks, datasets worked on, model accuracy achieved
- Finance/Banking → ask about: CFA/CPA certifications, financial tools, assets managed
- Marketing → ask about: campaigns run, tools (Google Ads, SEO), metrics achieved, budget managed
- Fresher/Student → ask about: academic projects, internships, certifications, CGPA

QUESTION FORMAT:
Return a JSON array of question objects. Each object:
{
  "key": "unique_snake_case_key",
  "question": "Conversational, friendly question text",
  "placeholder": "Example answer to guide the user",
  "required": true or false,
  "hint": "Brief tip explaining why this matters (or null)",
  "label": "Short label used when building the final prompt"
}

RULES:
- Maximum 5 questions
- Ask the MOST IMPORTANT missing detail first
- If the prompt already has enough info to build a great ${type}, return []
- Return ONLY valid JSON array — no markdown, no text outside the array`;

  const user = `User's prompt: "${prompt}"\nType: ${type}\n\nAnalyze what is missing and return questions as JSON array. Only ask about what is genuinely absent.`;

  try {
    const raw = await chat(system, user, 800);
    const str = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const start = str.indexOf('[');
    const end = str.lastIndexOf(']');
    if (start === -1 || end === -1) return [];
    const parsed = JSON.parse(str.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
  } catch {
    return [];
  }
}

module.exports = { analyzeResume, generateResume, generatePortfolio, aiChat, gatherMissingInfo };
