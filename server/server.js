const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const XLSX = require('xlsx');
const { createWorker } = require('tesseract.js');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Multer: store files in memory
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Extract text from uploaded file buffer
async function extractTextFromFile(file) {
  const { mimetype, originalname, buffer } = file;
  const ext = path.extname(originalname).toLowerCase();

  // PDF
  if (mimetype === 'application/pdf' || ext === '.pdf') {
    const result = await pdfParse(buffer);
    return result.text;
  }

  // Word DOCX
  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === '.docx') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  // Legacy DOC - return filename hint
  if (ext === '.doc') {
    return `[DOC file: ${originalname} - content extraction limited for legacy .doc format]`;
  }

  // Excel XLSX / XLS / CSV
  if (ext === '.xlsx' || ext === '.xls' || ext === '.csv' ||
      mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mimetype === 'application/vnd.ms-excel') {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    let text = '';
    workbook.SheetNames.forEach(name => {
      const sheet = workbook.Sheets[name];
      text += `Sheet: ${name}\n` + XLSX.utils.sheet_to_csv(sheet) + '\n';
    });
    return text;
  }

  // Images - OCR
  if (mimetype.startsWith('image/')) {
    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(buffer);
    await worker.terminate();
    return text;
  }

  // Plain text
  if (mimetype === 'text/plain' || ext === '.txt') {
    return buffer.toString('utf-8');
  }

  return '';
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

// Resume Schema
const resumeSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  templateId: { type: Number, required: true },
  data: { type: Object, required: true },
  themeColor: { type: Object, default: null },
  createdAt: { type: Date, default: Date.now }
});

const Resume = mongoose.model('Resume', resumeSchema);

// Portfolio Schema
const portfolioSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  templateId: { type: Number, required: true },
  data: { type: Object, required: true },
  themeColor: { type: Object, default: null },
  createdAt: { type: Date, default: Date.now }
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Register user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save resume
app.post('/api/resumes', async (req, res) => {
  try {
    const { userId, templateId, data, themeColor } = req.body;
    if (!userId || !templateId || !data) return res.status(400).json({ error: 'Missing fields' });
    const resume = new Resume({ userId, templateId, data, themeColor: themeColor || null });
    await resume.save();
    res.status(201).json(resume);
  } catch (error) {
    console.error('Save resume error:', error);
    res.status(500).json({ error: 'Failed to save resume' });
  }
});

// Get resumes by user
app.get('/api/resumes/:userId', async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

// Delete resume
app.delete('/api/resumes/:id', async (req, res) => {
  try {
    await Resume.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

// Save portfolio
app.post('/api/portfolios', async (req, res) => {
  try {
    const { userId, templateId, data, themeColor } = req.body;
    if (!userId || !templateId || !data) return res.status(400).json({ error: 'Missing fields' });
    const portfolio = new Portfolio({ userId, templateId, data, themeColor: themeColor || null });
    await portfolio.save();
    res.status(201).json(portfolio);
  } catch (error) {
    console.error('Save portfolio error:', error);
    res.status(500).json({ error: 'Failed to save portfolio' });
  }
});

// Get portfolios by user
app.get('/api/portfolios/:userId', async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(portfolios);
  } catch (error) {
    console.error('Get portfolios error:', error);
    res.status(500).json({ error: 'Failed to fetch portfolios' });
  }
});

// Delete portfolio
app.delete('/api/portfolios/:id', async (req, res) => {
  try {
    await Portfolio.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete portfolio' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


// AI Routes

// Analyze resume
app.post('/api/ai/analyze-resume', async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    // TODO: Integrate with Google AI API using process.env.AI_API_KEY
    // For now, return mock data
    const analysis = {
      score: 78,
      strengths: ['React', 'Node.js', 'Git'],
      weakAreas: ['System Design', 'Testing'],
      suggestions: [
        'Add more quantifiable achievements',
        'Include relevant certifications',
        'Improve technical skills section'
      ]
    };

    res.json(analysis);
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
});

// Generate suggestions
app.post('/api/ai/generate-suggestions', async (req, res) => {
  try {
    const { userProfile } = req.body;

    if (!userProfile) {
      return res.status(400).json({ error: 'User profile is required' });
    }

    // TODO: Integrate with Google AI API using process.env.AI_API_KEY
    const suggestions = {
      careerPath: 'Senior Full Stack Developer',
      skillsToLearn: ['Docker', 'Kubernetes', 'AWS'],
      projectIdeas: [
        'Build a microservices architecture',
        'Create a CI/CD pipeline',
        'Develop a scalable API'
      ]
    };

    res.json(suggestions);
  } catch (error) {
    console.error('AI suggestions error:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

// Improve content
app.post('/api/ai/improve-content', async (req, res) => {
  try {
    const { content, section } = req.body;

    if (!content || !section) {
      return res.status(400).json({ error: 'Content and section are required' });
    }

    // TODO: Integrate with Google AI API using process.env.AI_API_KEY
    const improvedContent = {
      original: content,
      improved: `Enhanced version of: ${content}`,
      changes: ['Made more concise', 'Added action verbs', 'Quantified results']
    };

    res.json(improvedContent);
  } catch (error) {
    console.error('AI improve content error:', error);
    res.status(500).json({ error: 'Failed to improve content' });
  }
});

// Analyze skills
app.post('/api/ai/analyze-skills', async (req, res) => {
  try {
    const { currentSkills, targetRole } = req.body;

    if (!currentSkills || !targetRole) {
      return res.status(400).json({ error: 'Current skills and target role are required' });
    }

    // TODO: Integrate with Google AI API using process.env.AI_API_KEY
    const analysis = {
      matchPercentage: 75,
      missingSkills: ['Docker', 'Kubernetes', 'System Design'],
      strongSkills: ['React', 'Node.js', 'MongoDB'],
      learningPath: [
        { skill: 'Docker', priority: 'High', estimatedTime: '2 weeks' },
        { skill: 'Kubernetes', priority: 'Medium', estimatedTime: '3 weeks' },
        { skill: 'System Design', priority: 'High', estimatedTime: '4 weeks' }
      ]
    };

    res.json(analysis);
  } catch (error) {
    console.error('AI skills analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze skills' });
  }
});

// AI Chat
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const apiKey = process.env.AI_API_KEY;
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a helpful AI career assistant for a portfolio and resume builder platform. Give concise, actionable advice about resumes, portfolios, LinkedIn, GitHub, and career growth. Keep responses short and friendly.' },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'AI API error');
    const reply = data.choices?.[0]?.message?.content || 'No response.';
    res.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

// Generate portfolio data from prompt
app.post('/api/ai/generate-portfolio', async (req, res) => {
  try {
    const { prompt, templateId, existingData } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const apiKey = process.env.AI_API_KEY;
    const url = 'https://openrouter.ai/api/v1/chat/completions';

    const isEnhancement = !!existingData;

    const systemPrompt = isEnhancement
      ? `You are an expert portfolio designer and content writer. The user already has a generated portfolio and wants to enhance or modify it.

Your job is to apply the user's requested changes to the existing portfolio data and return the FULL updated portfolio JSON.

You can:
- Rewrite or improve any text field (name, title, tagline, about, project descriptions, experience descriptions)
- Add, remove, or reorder projects or experience entries
- Update skills list
- Change contact details if requested
- Make the content more professional, bold, creative, minimal, etc. based on user's style request
- Expand or shorten sections as requested

You can also change VISUAL DESIGN via the "designStyle" field:
- designStyle.button: "default" | "outline" | "pill" | "gradient" | "ghost" | "sharp"
- designStyle.card: "default" | "bordered" | "shadowed" | "glass" | "elevated"
- designStyle.background: "solid" | "gradient" | "mesh" | "dots" | "lines"

DESIGN KEYWORD MAPPING:
- "pill buttons / rounded buttons / capsule" → designStyle.button = "pill"
- "outlined / border buttons" → designStyle.button = "outline"
- "gradient buttons" → designStyle.button = "gradient"
- "ghost / minimal buttons" → designStyle.button = "ghost"
- "sharp / square buttons" → designStyle.button = "sharp"
- "bordered cards / card borders" → designStyle.card = "bordered"
- "shadow / elevated cards" → designStyle.card = "shadowed" or "elevated"
- "glass / glassmorphism / frosted cards" → designStyle.card = "glass"
- "gradient background" → designStyle.background = "gradient"
- "mesh / blob background" → designStyle.background = "mesh"
- "dotted / dots background" → designStyle.background = "dots"
- "lines / line pattern background" → designStyle.background = "lines"

IMPORTANT: Return the COMPLETE updated portfolio JSON — not just the changed parts.
Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "name": "Full Name",
  "initials": "AB",
  "title": "Job Title",
  "tagline": "A short inspiring tagline",
  "email": "email@example.com",
  "phone": "+1 (555) 000-0000",
  "location": "City, Country",
  "github": "github.com/username",
  "linkedin": "linkedin.com/in/username",
  "website": "www.website.com",
  "about": "2-3 sentence personal bio",
  "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6", "Skill 7", "Skill 8"],
  "projects": [
    { "name": "Project Name", "desc": "Short description.", "tech": ["Tech1", "Tech2", "Tech3"], "link": "#" }
  ],
  "experience": [
    { "role": "Job Title", "company": "Company Name", "period": "2021 – Present", "desc": "Achievement-focused description." }
  ],
  "designStyle": {
    "button": "default",
    "card": "default",
    "background": "solid"
  }
}`
      : `You are a professional portfolio writer. Based on the user's description, extract and generate structured portfolio data as a JSON object.

The user may include both their profile information AND specific instructions in the same message (e.g. "I am a developer... make project descriptions very detailed and impactful").
You MUST follow ALL such instructions when generating the portfolio — apply them to the relevant sections.

For project descriptions: if the user asks for detailed/defined points, write rich, specific descriptions that highlight impact, technologies used, and outcomes.
For experience descriptions: if the user asks for detailed points, write achievement-focused, quantified descriptions.

If the user mentions any design preferences (e.g. "pill buttons", "glass cards", "gradient background"), set the appropriate designStyle fields:
- designStyle.button: "default" | "outline" | "pill" | "gradient" | "ghost" | "sharp"
- designStyle.card: "default" | "bordered" | "shadowed" | "glass" | "elevated"
- designStyle.background: "solid" | "gradient" | "mesh" | "dots" | "lines"

Return ONLY valid JSON with this exact structure (no markdown, no explanation, no extra text):
{
  "name": "Full Name",
  "initials": "AB",
  "title": "Job Title",
  "tagline": "A short inspiring tagline",
  "email": "email@example.com",
  "phone": "+1 (555) 000-0000",
  "location": "City, Country",
  "github": "github.com/username",
  "linkedin": "linkedin.com/in/username",
  "website": "www.website.com",
  "about": "2-3 sentence personal bio",
  "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6", "Skill 7", "Skill 8"],
  "projects": [
    { "name": "Project Name", "desc": "Short description of the project.", "tech": ["Tech1", "Tech2", "Tech3"], "link": "#" },
    { "name": "Project Name 2", "desc": "Short description.", "tech": ["Tech1", "Tech2"], "link": "#" },
    { "name": "Project Name 3", "desc": "Short description.", "tech": ["Tech1", "Tech2"], "link": "#" }
  ],
  "experience": [
    { "role": "Job Title", "company": "Company Name", "period": "2021 – Present", "desc": "Achievement-focused description." },
    { "role": "Job Title 2", "company": "Company 2", "period": "2019 – 2021", "desc": "Description." }
  ],
  "designStyle": {
    "button": "default",
    "card": "default",
    "background": "solid"
  }
}
If any field is not mentioned, make a reasonable professional inference. Always return valid JSON only — never include explanatory text outside the JSON.`;

    const userMessage = isEnhancement
      ? `Here is my current portfolio data:\n${JSON.stringify(existingData, null, 2)}\n\nPlease apply this change: ${prompt}`
      : `User description: ${prompt}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'AI API error');

    const raw = data.choices?.[0]?.message?.content || '';

    // Robust JSON extraction
    let jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    if (!jsonStr.startsWith('{')) {
      const match = jsonStr.match(/\{[\s\S]*\}/);
      if (match) jsonStr = match[0];
      else throw new Error('AI did not return valid JSON. Try rephrasing your prompt.');
    }

    const portfolioData = JSON.parse(jsonStr);

    res.json({ portfolioData });
  } catch (error) {
    console.error('Generate portfolio error:', error);
    res.status(500).json({ error: 'Failed to generate portfolio: ' + error.message });
  }
});

// Generate resume data from prompt (supports file attachments)
app.post('/api/ai/generate-resume', upload.array('files', 5), async (req, res) => {
  try {
    const { prompt, templateId } = req.body;
    const existingData = req.body.existingData ? JSON.parse(req.body.existingData) : null;
    const uploadedFiles = req.files || [];

    if (!prompt && uploadedFiles.length === 0) {
      return res.status(400).json({ error: 'Prompt or at least one file is required' });
    }

    // Extract text from all uploaded files
    let extractedContent = '';
    if (uploadedFiles.length > 0) {
      const extractions = await Promise.all(uploadedFiles.map(f => extractTextFromFile(f)));
      extractedContent = extractions.filter(Boolean).join('\n\n');
    }

    const isEnhancement = !!existingData && !extractedContent;

    const apiKey = process.env.AI_API_KEY;
    const url = 'https://openrouter.ai/api/v1/chat/completions';

    const systemPrompt = isEnhancement
      ? `You are an expert resume writer, career coach, and UI designer. The user already has a generated resume and wants to enhance, modify, or redesign sections of it.

Your job is to apply the user's requested changes to the existing resume data and return the FULL updated resume JSON.

You can change CONTENT:
- Rewrite or improve any text field (summary, job descriptions, education details)
- Add, remove, or reorder experience, education, skills, awards, languages
- Make content more professional, concise, impactful, or creative
- Add quantifiable achievements, action verbs, or industry keywords

You can change SECTION DESIGN via the "sectionStyle" field:
- sectionStyle.skills controls how skills are displayed:
    "bars"     → progress bar for each skill (default)
    "badges"   → pill/tag badges
    "dots"     → bullet dot list
    "numbered" → numbered list
- sectionStyle.experience controls how experience is displayed:
    "default"  → dot + vertical list (default)
    "timeline" → connected timeline with dots and lines
    "card"     → each job in a bordered card
    "compact"  → condensed single-line header per job

For experience entries, you can also add a "bullets" array to any experience item for bullet-point descriptions:
  { "role": "...", "company": "...", "period": "...", "desc": "...", "bullets": ["Did X", "Achieved Y"] }
If bullets are present, they are shown instead of desc.

You can change VISUAL DESIGN via the "designStyle" field:
- designStyle.button controls button appearance:
    "default"   → solid filled button (default)
    "outline"   → transparent with border
    "pill"      → fully rounded pill shape
    "gradient"  → gradient background
    "ghost"     → minimal, no border, subtle hover
    "sharp"     → square corners, bold
- designStyle.card controls card/section appearance:
    "default"   → flat, no border (default)
    "bordered"  → thin border around cards
    "shadowed"  → drop shadow on cards
    "glass"     → frosted glass effect
    "elevated"  → raised card with strong shadow
- designStyle.background controls the page background style:
    "solid"     → plain solid color (default)
    "gradient"  → subtle gradient background
    "mesh"      → soft mesh/blob gradient
    "dots"      → dotted pattern overlay
    "lines"     → subtle line pattern

DESIGN KEYWORD MAPPING — when user says:
- "badge tags / pill tags / chips" for skills → sectionStyle.skills = "badges"
- "progress bars / skill bars" → sectionStyle.skills = "bars"
- "dot list / bullet list" for skills → sectionStyle.skills = "dots"
- "numbered / numbered list" for skills → sectionStyle.skills = "numbered"
- "timeline / timeline style" for experience → sectionStyle.experience = "timeline"
- "cards / card style" for experience → sectionStyle.experience = "card"
- "compact / condensed" for experience → sectionStyle.experience = "compact"
- "bullet points / bullets" for experience → keep existing style, add bullets array to each experience item
- "pill buttons / rounded buttons / capsule buttons" → designStyle.button = "pill"
- "outlined buttons / border buttons" → designStyle.button = "outline"
- "gradient buttons" → designStyle.button = "gradient"
- "ghost buttons / minimal buttons" → designStyle.button = "ghost"
- "sharp buttons / square buttons" → designStyle.button = "sharp"
- "bordered cards / card borders" → designStyle.card = "bordered"
- "shadow cards / card shadows / elevated cards" → designStyle.card = "shadowed" or "elevated"
- "glass cards / glassmorphism / frosted" → designStyle.card = "glass"
- "gradient background / gradient bg" → designStyle.background = "gradient"
- "mesh background / blob background" → designStyle.background = "mesh"
- "dotted background / dots pattern" → designStyle.background = "dots"
- "lines background / line pattern" → designStyle.background = "lines"

IMPORTANT: Always preserve the existing sectionStyle and designStyle values for things the user did NOT ask to change.
Return the COMPLETE updated resume JSON — not just the changed parts.
Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "name": "Full Name",
  "initials": "AB",
  "title": "Job Title",
  "email": "email@example.com",
  "phone": "+1 (555) 000-0000",
  "location": "City, Country",
  "linkedin": "linkedin.com/in/username",
  "website": "www.website.com",
  "summary": "2-3 sentence professional summary",
  "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6"],
  "experience": [
    { "role": "Job Title", "company": "Company Name", "period": "2020 – 2024", "desc": "Achievement-focused description.", "bullets": [] }
  ],
  "education": [
    { "degree": "Degree Name", "school": "University Name", "year": "2020" }
  ],
  "languages": ["English – Native", "Spanish – Intermediate"],
  "awards": ["Award 1", "Award 2"],
  "sectionStyle": {
    "skills": "bars",
    "experience": "default"
  },
  "designStyle": {
    "button": "default",
    "card": "default",
    "background": "solid"
  }
}`
      : `You are a professional resume writer. Based on the user's description, extract and generate structured resume data as a JSON object.

The user may include both their profile information AND specific instructions in the same message (e.g. "I am a developer with 3 years experience... in work experience, make every point very detailed and defined").
You MUST follow ALL such instructions when generating the resume — apply them to the relevant sections.

For experience descriptions: if the user asks for detailed/defined points, write 3-5 specific, achievement-focused bullet-style sentences in the "desc" field, or populate the "bullets" array with detailed points.

If the user mentions any design preferences (e.g. "pill buttons", "glass cards", "gradient background", "bordered cards"), set the appropriate designStyle fields:
- designStyle.button: "default" | "outline" | "pill" | "gradient" | "ghost" | "sharp"
- designStyle.card: "default" | "bordered" | "shadowed" | "glass" | "elevated"
- designStyle.background: "solid" | "gradient" | "mesh" | "dots" | "lines"

Return ONLY valid JSON with this exact structure (no markdown, no explanation, no extra text):
{
  "name": "Full Name",
  "initials": "AB",
  "title": "Job Title",
  "email": "email@example.com",
  "phone": "+1 (555) 000-0000",
  "location": "City, Country",
  "linkedin": "linkedin.com/in/username",
  "website": "www.website.com",
  "summary": "2-3 sentence professional summary",
  "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6"],
  "experience": [
    { "role": "Job Title", "company": "Company Name", "period": "2020 – 2024", "desc": "Achievement-focused description.", "bullets": ["Point 1", "Point 2"] }
  ],
  "education": [
    { "degree": "Degree Name", "school": "University Name", "year": "2020" }
  ],
  "languages": ["English – Native", "Spanish – Intermediate"],
  "awards": ["Award 1", "Award 2"],
  "sectionStyle": {
    "skills": "bars",
    "experience": "default"
  },
  "designStyle": {
    "button": "default",
    "card": "default",
    "background": "solid"
  }
}
If any field is not mentioned, make a reasonable professional inference. Always return valid JSON only — never include explanatory text outside the JSON.`;

    // Build user message
    let userMessage = '';
    if (isEnhancement) {
      userMessage = `Here is my current resume data:\n${JSON.stringify(existingData, null, 2)}\n\nPlease apply this change: ${prompt}`;
    } else {
      if (prompt) userMessage += `User description: ${prompt}\n\n`;
      if (extractedContent) userMessage += `Extracted content from uploaded file(s):\n${extractedContent}`;
      userMessage = userMessage.trim();
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'AI API error');

    const raw = data.choices?.[0]?.message?.content || '';

    // Try to extract JSON robustly — handles markdown fences and mixed text responses
    let jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // If the response isn't pure JSON, extract the first {...} block
    if (!jsonStr.startsWith('{')) {
      const match = jsonStr.match(/\{[\s\S]*\}/);
      if (match) {
        jsonStr = match[0];
      } else {
        throw new Error('AI did not return valid JSON. Try rephrasing your prompt.');
      }
    }

    const resumeData = JSON.parse(jsonStr);

    res.json({ resumeData, filesProcessed: uploadedFiles.length });
  } catch (error) {
    console.error('Generate resume error:', error);
    res.status(500).json({ error: 'Failed to generate resume: ' + error.message });
  }
});
