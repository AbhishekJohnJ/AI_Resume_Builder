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

  const system = `You are a world-class resume writer, career strategist, and HR consultant with 15+ years of experience helping candidates land jobs at top companies like Google, Amazon, Microsoft, and Fortune 500 firms.

Your task: Generate a COMPLETE, HIGHLY DETAILED, ATS-optimized resume that will make any HR manager immediately want to interview the candidate.

Template: ${hint}

STRICT REQUIREMENTS — every resume MUST have:
1. NAME: Use the actual name from the prompt. If no name given, use "Alex Johnson" as placeholder but note it.
2. SUMMARY: 3-4 powerful sentences with keywords, years of experience, key achievements, and value proposition.
3. EXPERIENCE: Minimum 2-3 roles. Each role MUST have:
   - 4-6 bullet points (not just 2-3)
   - Quantified achievements: "Increased X by Y%", "Reduced Z by N hours", "Led team of N"
   - Strong action verbs: Architected, Spearheaded, Engineered, Optimized, Delivered, Scaled
   - Technologies and tools used
4. SKILLS: 10-12 skills minimum, mix of technical and soft skills
5. EDUCATION: Full details with GPA if mentioned, relevant coursework
6. AWARDS/CERTIFICATIONS: At least 2-3 relevant certifications or achievements
7. LANGUAGES: Include if mentioned, default English Native

ATS OPTIMIZATION:
- Include industry-specific keywords throughout
- Use standard section headings
- Quantify every achievement possible
- Match skills to current market demand for the role

If the user only gave a job title or company (like "I work at NVIDIA as CUDA developer"), INFER and CREATE:
- A compelling professional summary
- Realistic, detailed work experience with metrics
- Relevant technical skills for that role
- Appropriate education
- Industry certifications

Return ONLY valid JSON — no markdown, no explanation:
{
  "name": "Full Name (use real name from prompt or Alex Johnson if not given)",
  "title": "Specific Job Title",
  "email": "email@example.com",
  "phone": "+1 (555) 000-0000",
  "location": "City, Country",
  "linkedin": "linkedin.com/in/username",
  "website": "www.portfolio.com",
  "summary": "4-sentence powerful summary with keywords, experience years, key achievements, and unique value proposition that makes HR want to read more",
  "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6", "Skill 7", "Skill 8", "Skill 9", "Skill 10", "Skill 11", "Skill 12"],
  "experience": [
    {
      "role": "Senior Job Title",
      "company": "Company Name",
      "period": "2021 – Present",
      "desc": "One-line role overview",
      "bullets": [
        "Spearheaded development of X system, reducing processing time by 40% and saving $200K annually",
        "Architected and deployed Y solution serving 2M+ users with 99.9% uptime",
        "Led cross-functional team of 8 engineers to deliver Z project 2 weeks ahead of schedule",
        "Optimized database queries resulting in 60% performance improvement",
        "Mentored 3 junior developers, improving team velocity by 25%",
        "Collaborated with product and design teams to ship 12 features per quarter"
      ]
    },
    {
      "role": "Previous Job Title",
      "company": "Previous Company",
      "period": "2019 – 2021",
      "desc": "One-line role overview",
      "bullets": [
        "Built and maintained X application used by 500+ daily active users",
        "Reduced bug count by 35% through implementation of comprehensive testing strategy",
        "Integrated third-party APIs reducing manual work by 15 hours/week",
        "Contributed to open-source projects with 200+ GitHub stars"
      ]
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Technology in Computer Science",
      "school": "University Name",
      "year": "2019",
      "details": "GPA: 3.8/4.0 | Relevant: Data Structures, Algorithms, OS, Networks"
    }
  ],
  "languages": ["English – Native/Fluent", "Hindi – Native"],
  "awards": [
    "AWS Certified Solutions Architect – Professional (2023)",
    "Employee of the Quarter – Q3 2022",
    "Hackathon Winner – TechFest 2021 (1st place out of 200 teams)"
  ],
  "sectionStyle": { "skills": "bars", "experience": "default" },
  "designStyle": { "button": "default", "card": "default", "background": "solid" }
}`;

  const user = isEnhancement
    ? `Current resume:\n${JSON.stringify(existingData, null, 2)}\n\nApply this change: ${prompt}`
    : `Create a top-tier resume for: ${prompt}\n\nMake it detailed, quantified, and impressive enough that any HR manager would immediately want to interview this person.`;

  const raw = await chat(system, user, 3000);
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

  const system = `You are an expert portfolio designer and content writer.

Template selected: ${hint}
Tailor the content tone, tagline style, and project descriptions to match this template's personality.

Return ONLY valid JSON with this exact structure (no markdown, no extra text):
{
  "name": "Full Name",
  "initials": "AB",
  "title": "Job Title",
  "tagline": "A short inspiring tagline that fits the template style",
  "email": "email@example.com",
  "phone": "+1 (555) 000-0000",
  "location": "City, Country",
  "github": "github.com/username",
  "linkedin": "linkedin.com/in/username",
  "website": "www.website.com",
  "about": "2-3 sentence compelling personal bio",
  "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6", "Skill 7", "Skill 8"],
  "projects": [
    {
      "name": "Project Name",
      "desc": "Detailed description highlighting impact, tech used, and outcomes.",
      "tech": ["Tech1", "Tech2", "Tech3"],
      "link": "#"
    }
  ],
  "experience": [
    {
      "role": "Job Title",
      "company": "Company Name",
      "period": "2021 – Present",
      "desc": "Achievement-focused description."
    }
  ],
  "designStyle": { "button": "default", "card": "default", "background": "solid" }
}`;

  const user = isEnhancement
    ? `Current portfolio:\n${JSON.stringify(existingData, null, 2)}\n\nApply this change: ${prompt}`
    : `Build a portfolio for: ${prompt}`;

  const raw = await chat(system, user, 2048);
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

module.exports = { analyzeResume, generateResume, generatePortfolio, aiChat };
