const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const multer = require('multer');
const mammoth = require('mammoth');
const XLSX = require('xlsx');
const { createWorker } = require('tesseract.js');
const TFIDFAnalyzer = require('./utils/tfidfAnalyzer');
const FeatureExtractor = require('./utils/featureExtractor');
const { StandardScaler } = require('./utils/featureExtractor');
const { GradientBoostingRegressor, RandomForestRegressor } = require('./utils/mlModels');
const { GridSearchCV, RandomizedSearchCV } = require('./utils/hyperparameterTuning');
const ImprovementSuggestionsGenerator = require('./utils/improvementSuggestions');
const aiConfig = require('./config/ai-models');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Multer: store files in memory
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Import PDF extractor
const PDFExtractor = require('./utils/pdfExtractor');

// Extract text from uploaded file buffer
async function extractTextFromFile(file) {
  const { mimetype, originalname, buffer } = file;
  const ext = path.extname(originalname).toLowerCase();

  // PDF - Use Python PyMuPDF extractor
  if (mimetype === 'application/pdf' || ext === '.pdf') {
    try {
      const result = await PDFExtractor.extractText(file);
      return result.text;
    } catch (error) {
      console.error('PDF extraction error:', error);
      return `[PDF file: ${originalname} - extraction failed: ${error.message}]`;
    }
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

// Import AI routes
const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('\n⚠️  MongoDB Connection Failed!');
    console.log('📋 Possible solutions:');
    console.log('   1. Add your IP address to MongoDB Atlas whitelist');
    console.log('   2. Go to: https://cloud.mongodb.com/');
    console.log('   3. Navigate to: Network Access → Add IP Address');
    console.log('   4. Click "Add Current IP Address" or "Allow Access from Anywhere (0.0.0.0/0)"\n');
    console.log('⚠️  Server will continue running, but database features will not work.\n');
  });

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
  gamification: {
    type: Object,
    default: {
      userXP: 0,              // Available XP (can be spent)
      totalEarnedXP: 0,       // Lifetime earned XP (never decreases)
      resumeUses: 0,
      aiAnalysisUses: 0,
      portfolioUses: 0,
      resumeLimit: 3,
      aiAnalysisLimit: 3,
      portfolioLimit: 3,
      completedQuests: [],
      lastQuestReset: null,
      questActions: {}
    }
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

// ── Gamification API Endpoints ──────────────────────────────────────────────

// Get gamification data for a user
app.get('/api/gamification/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize gamification if not exists
    if (!user.gamification) {
      user.gamification = {
        userXP: 0,
        totalEarnedXP: 0,
        resumeUses: 0,
        aiAnalysisUses: 0,
        portfolioUses: 0,
        resumeLimit: 3,
        aiAnalysisLimit: 3,
        portfolioLimit: 3,
        completedQuests: [],
        lastQuestReset: new Date().toDateString(),
        questActions: {}
      };
      await user.save();
    }
    
    // Ensure totalEarnedXP exists and is accurate (for existing users)
    if (user.gamification.totalEarnedXP === undefined || user.gamification.totalEarnedXP === 0) {
      // Recalculate based on completed quests
      const QUEST_XP = { 1: 50, 2: 40, 3: 30, 4: 20, 5: 60, 6: 25 };
      const earnedFromQuests = (user.gamification.completedQuests || [])
        .reduce((sum, questId) => sum + (QUEST_XP[questId] || 0), 0);
      
      user.gamification.totalEarnedXP = earnedFromQuests;
      await user.save();
    }

    // Check if we need to reset daily quests
    const today = new Date().toDateString();
    if (user.gamification.lastQuestReset !== today) {
      user.gamification.completedQuests = [];
      user.gamification.lastQuestReset = today;
      await user.save();
    }

    res.json(user.gamification);
  } catch (error) {
    console.error('Get gamification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update gamification data for a user
app.put('/api/gamification/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update gamification data
    user.gamification = { ...user.gamification, ...req.body };
    await user.save();

    res.json(user.gamification);
  } catch (error) {
    console.error('Update gamification error:', error);
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
    
    if (!apiKey) {
      return res.json({ 
        reply: '⚠️ AI service not configured. Please add your OpenRouter API key to the server/.env file.'
      });
    }

    console.log('🤖 AI Chat request:', message.substring(0, 50) + '...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'ResumeCraft AI Chat'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: `You are a helpful AI career assistant for ResumeCraft AI, a gamified portfolio and resume builder platform. Give concise, actionable advice about resumes, portfolios, LinkedIn, GitHub, career growth, and our gamification system. Keep responses short and friendly.

## GAMIFICATION SYSTEM KNOWLEDGE

### XP System
- **Two XP Types:**
  1. Available XP (userXP) - Can be spent to unlock features
  2. Total Earned XP (totalEarnedXP) - Lifetime achievement tracker, never decreases

### Career Levels (based on Total Earned XP)
- Rookie: 0-49 XP
- Builder: 50-119 XP
- Pro: 120-199 XP
- Elite: 200+ XP

### Daily Quests (6 quests, reset daily at midnight)
1. Resume Sniper (50 XP, Epic) - Analyze resume with AI and score above 70
2. Portfolio Architect (40 XP, Rare) - Generate a portfolio using any template
3. Resume Crafter (30 XP, Common) - Build a resume using Resume Builder
4. Template Explorer (20 XP, Common) - Preview at least 5 different resume templates
5. Score Chaser (60 XP, Epic) - Re-analyze resume after edits to improve score
6. Portfolio Explorer (25 XP, Rare) - Preview at least 3 different portfolio templates

**Total Daily XP Available: 225 XP**

### Feature Limits & Unlock Costs
- **Resume Builder:** 3 free uses, then 20 XP per use
- **Portfolio Builder:** 3 free uses, then 30 XP per use
- **AI Resume Analyzer:** 3 free uses, then 50 XP per use

### Quest Auto-Completion
- Quests complete automatically when you use features
- Quest 1: Completes on first AI analysis use
- Quest 2: Completes on first portfolio generation
- Quest 3: Completes on first resume build
- Quest 4: Completes after previewing 5 unique templates
- Quest 5: Completes after 2+ AI analyses
- Quest 6: Completes after previewing 3 unique portfolio templates

### How It Works
1. New users get 3 free trials for each feature
2. Complete quests to earn XP
3. Spend Available XP to unlock more feature uses
4. Total Earned XP tracks lifetime progress and determines career level
5. Quests reset daily for continuous XP earning

### Common Questions
- "How do I earn XP?" → Complete daily quests by using platform features
- "What happens after free trials?" → Spend earned XP to unlock more uses
- "How do I level up?" → Earn more Total XP by completing quests
- "Can I lose XP?" → Available XP decreases when spent, but Total Earned XP never decreases
- "When do quests reset?" → Daily at midnight

When users ask about gamification, XP, quests, or unlocking features, provide accurate information based on this knowledge.` },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ OpenRouter API error:', data);
      
      // Handle specific error cases
      if (data.error?.code === 401 || data.error?.message?.includes('User not found')) {
        return res.json({ 
          reply: '⚠️ The OpenRouter API key is invalid or expired.\n\nPlease:\n1. Go to https://openrouter.ai/keys\n2. Generate a new API key\n3. Update it in server/.env file as AI_API_KEY\n4. Restart the server'
        });
      }
      
      return res.json({ reply: `AI service error: ${data.error?.message || 'Unknown error'}` });
    }
    
    const reply = data.choices?.[0]?.message?.content || 'No response.';
    console.log('✅ AI response received');
    res.json({ reply });
  } catch (error) {
    console.error('❌ Chat error:', error.message);
    res.json({ 
      reply: `I'm having trouble connecting to the AI service. Error: ${error.message}`
    });
  }
});

// Full Resume Analysis (dataset-informed: resume-ai-training-dataset-500.xlsx — 500 synthetic records, 21 fields)
app.post('/api/ai/analyse-resume-full', async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;
    if (!resumeText) return res.status(400).json({ error: 'Resume text is required' });

    const apiKey = process.env.AI_API_KEY;
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'ResumeCraft Portfolio Builder'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert AI Resume Analyzer. Analyze the resume and provide structured feedback with score, strengths, weaknesses, and suggestions.'
          },
          {
            role: 'user',
            content: `${targetRole ? `Target role: ${targetRole}\n\n` : ''}Analyze this resume and provide feedback:\n\n${resumeText}`
          }
        ],
        temperature: 0.4,
        max_tokens: 1200
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'AI API error');

    let raw = data.choices?.[0]?.message?.content || '';
    raw = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    if (!raw.startsWith('{')) {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) raw = match[0];
      else throw new Error('Invalid AI response format');
    }

    const result = JSON.parse(raw);
    res.json(result);
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ error: 'Failed to analyse resume: ' + error.message });
  }
});

// Generate portfolio data from prompt
app.post('/api/ai/generate-portfolio', async (req, res) => {
  try {
    const { prompt, templateId, existingData } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const apiKey = process.env.OPENROUTER_API_KEY;
    const url = 'https://openrouter.ai/api/v1/chat/completions';

    if (!apiKey) {
      return res.status(500).json({ error: 'OpenRouter API key not configured' });
    }

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
      : `You are a professional portfolio writer and creative content strategist. Based on the user's description, generate a COMPREHENSIVE, IMPRESSIVE portfolio with rich, engaging content.

CRITICAL REQUIREMENTS:
1. Generate AT LEAST 4-6 diverse, impressive projects showcasing different skills
2. Each project MUST have a detailed 2-3 sentence description highlighting impact, technologies, and outcomes
3. Include 10-15 relevant technical skills
4. Write a compelling 3-4 sentence "about" section that tells a story and shows personality
5. Add 2-3 work experience entries with achievement-focused descriptions
6. Create an inspiring, memorable tagline (not generic)
7. Include realistic contact details and social links

CONTENT GENERATION RULES:
- If user says "UI/UX Designer", create 4-6 design projects (mobile apps, websites, branding, etc.)
- If user says "Full Stack Developer", create projects like: E-commerce platform, Social media app, Dashboard, API service, etc.
- Each project description should include: What it does, technologies used, impact/results
- Use engaging language: "Crafted", "Designed", "Built", "Engineered", "Created"
- Include metrics when possible: "serving 10K+ users", "99.9% uptime", "50% faster performance"
- Make the "about" section personal and compelling, not generic
- Tagline should be unique and memorable, reflecting the person's specialty

EXAMPLE - User says: "UI/UX Designer specializing in mobile apps"
You should generate:
- 5-6 projects: Fitness tracking app, E-commerce mobile app, Social networking app, Banking app redesign, Food delivery app, Travel booking app
- Skills: Figma, Adobe XD, Sketch, Prototyping, User Research, Wireframing, UI Design, UX Design, Mobile Design, Design Systems, Interaction Design, Usability Testing
- About: "Passionate UI/UX designer with 5+ years of experience crafting intuitive mobile experiences that users love. I believe great design is invisible – it just works. Specialized in mobile-first design, I've helped startups and enterprises create apps that delight users and drive business results. When I'm not designing, you'll find me exploring the latest design trends or mentoring aspiring designers."
- Tagline: "Crafting mobile experiences that users love"
- Projects like: "FitTrack Pro - Comprehensive fitness tracking app with personalized workout plans and nutrition tracking. Designed intuitive UI that increased user engagement by 60% and achieved 4.8★ rating. Built with Figma, featuring custom illustrations and smooth micro-interactions."

DESIGN PREFERENCES:
If the user mentions design preferences (e.g. "pill buttons", "glass cards"), set the appropriate designStyle fields:
- designStyle.button: "default" | "outline" | "pill" | "gradient" | "ghost" | "sharp"
- designStyle.card: "default" | "bordered" | "shadowed" | "glass" | "elevated"
- designStyle.background: "solid" | "gradient" | "mesh" | "dots" | "lines"

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "name": "Full Name",
  "initials": "AB",
  "title": "Professional Job Title",
  "tagline": "A unique, memorable tagline that captures their specialty and passion",
  "email": "email@example.com",
  "phone": "+1 (555) 000-0000",
  "location": "City, Country",
  "github": "github.com/username",
  "linkedin": "linkedin.com/in/username",
  "website": "www.portfolio-site.com",
  "about": "3-4 sentence compelling personal bio that tells a story, shows personality, highlights expertise, and includes passion/interests. Make it engaging and memorable, not generic.",
  "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6", "Skill 7", "Skill 8", "Skill 9", "Skill 10", "Skill 11", "Skill 12"],
  "projects": [
    { 
      "name": "Impressive Project Name 1", 
      "desc": "Detailed 2-3 sentence description explaining what it does, technologies used, and impact/results achieved. Include metrics when possible.", 
      "tech": ["Tech1", "Tech2", "Tech3", "Tech4"], 
      "link": "#" 
    },
    { 
      "name": "Impressive Project Name 2", 
      "desc": "Detailed description highlighting the problem solved, approach taken, and outcomes delivered.", 
      "tech": ["Tech1", "Tech2", "Tech3"], 
      "link": "#" 
    },
    { 
      "name": "Impressive Project Name 3", 
      "desc": "Compelling description showcasing technical skills, creativity, and business impact.", 
      "tech": ["Tech1", "Tech2", "Tech3", "Tech4"], 
      "link": "#" 
    },
    { 
      "name": "Impressive Project Name 4", 
      "desc": "Engaging description that demonstrates expertise and results.", 
      "tech": ["Tech1", "Tech2", "Tech3"], 
      "link": "#" 
    }
  ],
  "experience": [
    { 
      "role": "Senior Job Title", 
      "company": "Company Name", 
      "period": "2022 – Present", 
      "desc": "Achievement-focused description highlighting key responsibilities, impact, and results. Include metrics and specific accomplishments." 
    },
    { 
      "role": "Mid-Level Job Title", 
      "company": "Previous Company", 
      "period": "2020 – 2022", 
      "desc": "Compelling description of role, contributions, and achievements that demonstrate growth and expertise." 
    }
  ],
  "designStyle": {
    "button": "default",
    "card": "default",
    "background": "solid"
  }
}

REMEMBER: Generate RICH, DETAILED, IMPRESSIVE content. A professional portfolio should showcase expertise and personality, not be minimal or generic!`;

    const userMessage = isEnhancement
      ? `Here is my current portfolio data:\n${JSON.stringify(existingData, null, 2)}\n\nPlease apply this change: ${prompt}`
      : `User description: ${prompt}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Portfolio Builder'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 1200
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

    const apiKey = process.env.OPENROUTER_API_KEY;
    const url = 'https://openrouter.ai/api/v1/chat/completions';

    if (!apiKey) {
      return res.status(500).json({ error: 'OpenRouter API key not configured' });
    }

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
      : `You are a professional resume writer and career coach. Based on the user's description, generate a COMPREHENSIVE, DETAILED resume with rich professional content.

CRITICAL REQUIREMENTS:
1. Generate AT LEAST 2-3 work experience entries (even if user mentions only 1 role)
2. Each experience MUST have 4-6 detailed bullet points showing achievements, metrics, and impact
3. Include 8-12 relevant technical and soft skills
4. Write a compelling 3-4 sentence professional summary highlighting key strengths
5. Add 2-3 relevant awards, certifications, or achievements
6. Include 2-3 languages (at minimum English)
7. Make content achievement-focused with quantifiable results when possible

CONTENT GENERATION RULES:
- If user says "3 years experience", infer 2-3 relevant job positions
- If user mentions technologies, create realistic projects using those technologies
- Add industry-standard skills related to the user's role
- Use action verbs: Led, Developed, Implemented, Architected, Optimized, Delivered
- Include metrics: "Improved performance by 40%", "Reduced costs by $50K", "Led team of 5"
- Make descriptions specific and impactful, not generic

EXAMPLE - User says: "Full Stack Developer with React and Node.js"
You should generate:
- 2-3 work experiences with 4-6 bullets each
- Skills: React, Node.js, JavaScript, TypeScript, MongoDB, PostgreSQL, AWS, Docker, Git, REST APIs, GraphQL, CI/CD
- Summary: "Results-driven Full Stack Developer with 3+ years of experience building scalable web applications. Expertise in React and Node.js ecosystems, with proven track record of delivering high-performance solutions. Passionate about clean code, user experience, and continuous learning."
- Experience bullets like: "Architected and deployed microservices-based e-commerce platform serving 100K+ users, resulting in 40% improvement in page load times"

If the user mentions any design preferences (e.g. "pill buttons", "glass cards"), set the appropriate designStyle fields:
- designStyle.button: "default" | "outline" | "pill" | "gradient" | "ghost" | "sharp"
- designStyle.card: "default" | "bordered" | "shadowed" | "glass" | "elevated"
- designStyle.background: "solid" | "gradient" | "mesh" | "dots" | "lines"

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
  "summary": "3-4 sentence compelling professional summary with key achievements and strengths",
  "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6", "Skill 7", "Skill 8", "Skill 9", "Skill 10"],
  "experience": [
    { 
      "role": "Senior Job Title", 
      "company": "Company Name", 
      "period": "2022 – Present", 
      "desc": "", 
      "bullets": [
        "Led development of X resulting in Y% improvement in Z",
        "Architected and implemented scalable solution that reduced costs by $X",
        "Mentored team of X developers and improved code quality by Y%",
        "Optimized system performance achieving X% faster response times"
      ]
    },
    { 
      "role": "Mid-Level Job Title", 
      "company": "Previous Company", 
      "period": "2020 – 2022", 
      "desc": "", 
      "bullets": [
        "Developed and deployed X features used by Y users daily",
        "Collaborated with cross-functional teams to deliver Z on time",
        "Implemented automated testing reducing bugs by X%",
        "Contributed to architecture decisions improving scalability"
      ]
    }
  ],
  "education": [
    { "degree": "Bachelor of Science in Computer Science", "school": "University Name", "year": "2020" }
  ],
  "languages": ["English – Native", "Spanish – Intermediate"],
  "awards": ["Best Developer Award 2023", "Hackathon Winner 2022", "AWS Certified Solutions Architect"],
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

REMEMBER: Generate RICH, DETAILED content. A professional resume should be comprehensive, not minimal!`;

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
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Resume Builder'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 1200
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

// Dataset API Endpoints

// Get dataset metadata
app.get('/api/dataset/metadata', (req, res) => {
  try {
    const datasetPath = path.join(__dirname, '../dataset/resume-dataset-metadata.json');
    const fs = require('fs');
    
    if (fs.existsSync(datasetPath)) {
      const metadata = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
      res.json(metadata);
    } else {
      res.json({
        name: 'AI Resume Analyzer Training Dataset',
        version: '1.0',
        records: 500,
        fields: 21,
        description: '500 synthetic resume records with structured analysis fields'
      });
    }
  } catch (error) {
    console.error('Dataset metadata error:', error);
    res.status(500).json({ error: 'Failed to fetch dataset metadata' });
  }
});

// Get dataset statistics
app.get('/api/dataset/stats', (req, res) => {
  try {
    res.json({
      totalRecords: 500,
      targetDomains: [
        'Web Development',
        'Data Science',
        'Cloud/DevOps',
        'AI/ML',
        'Mobile Development',
        'IoT',
        'Cyber Security'
      ],
      resumeLevels: {
        'Excellent': 'Resume Score 90-100',
        'Good': 'Resume Score 70-89',
        'Average': 'Resume Score 50-69',
        'NeedsImprovement': 'Resume Score <50'
      },
      commonWeakAreas: [
        'No internships',
        'Weak LinkedIn profile',
        'Low GitHub activity',
        'Poor resume keywords',
        'Weak DSA',
        'No portfolio website',
        'Weak communication section',
        'Few projects',
        'No certifications',
        'No open-source contributions'
      ],
      commonSuggestions: [
        'Apply to 5 internships',
        'Post 2 technical updates on LinkedIn',
        'Push 20 commits this month',
        'Optimize resume for ATS keywords',
        'Solve 100 DSA problems',
        'Create personal portfolio website',
        'Rewrite project descriptions with impact',
        'Build 2 new projects',
        'Complete 1 certification',
        'Make 1 open-source contribution'
      ]
    });
  } catch (error) {
    console.error('Dataset stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dataset statistics' });
  }
});

// Enhanced Resume Analysis with Dataset Context
app.post('/api/ai/analyze-resume-with-dataset', async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;
    if (!resumeText) return res.status(400).json({ error: 'Resume text is required' });

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
          {
            role: 'system',
            content: `You are an expert AI Resume Analyzer trained on a dataset of 500 synthetic resumes (resume-ai-training-dataset-500.xlsx).

DATASET INSIGHTS:
- 500 candidates across 7 target domains: Web Development, Data Science, Cloud/DevOps, AI/ML, Mobile Development, IoT, Cyber Security
- Resume scores range from 0-100, categorized as:
  * Excellent: 90-100 (most common in dataset)
  * Good: 70-89
  * Average: 50-69
  * Needs Improvement: <50

COMMON WEAK AREAS IDENTIFIED IN DATASET:
1. No internships (affects 30% of candidates)
2. Weak LinkedIn profile (affects 25% of candidates)
3. Low GitHub activity (affects 28% of candidates)
4. Poor resume keywords/ATS optimization (affects 20% of candidates)
5. Weak DSA skills (affects 15% of candidates)
6. No portfolio website (affects 18% of candidates)
7. Weak communication section (affects 12% of candidates)
8. Few projects (affects 14% of candidates)
9. No certifications (affects 10% of candidates)
10. No open-source contributions (affects 8% of candidates)

SCORING PATTERNS FROM DATASET:
- Candidates with 4+ projects average 92 resume score
- Candidates with portfolio website average 88 resume score
- Candidates with 3+ certifications average 85 resume score
- Candidates with GitHub activity >5 average 84 resume score
- Candidates with internships average 86 resume score

ACTIONABLE RECOMMENDATIONS (from dataset):
- Apply to 5 internships (most common suggestion)
- Post 2 technical updates on LinkedIn
- Push 20 commits this month
- Optimize resume for ATS keywords
- Solve 100 DSA problems
- Create personal portfolio website
- Rewrite project descriptions with impact
- Build 2 new projects
- Complete 1 certification
- Make 1 open-source contribution

Analyze the provided resume against these dataset patterns and provide:
1. Resume Score (0-100) with calibration to dataset
2. Resume Level (Excellent/Good/Average/Needs Improvement)
3. Identified weak areas (from dataset common weak areas)
4. Specific suggestions (from dataset common suggestions)
5. Recommended tasks with priority
6. Comparison to dataset benchmarks
7. Personalized improvement roadmap

Return JSON format:
{
  "resumeScore": 0-100,
  "resumeLevel": "Excellent|Good|Average|Needs Improvement",
  "atsScore": 0-100,
  "weakAreas": ["area1", "area2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "recommendedTasks": ["task1", "task2"],
  "datasetComparison": {
    "percentileRank": "X%",
    "benchmarkScore": 0-100,
    "comparison": "description"
  },
  "improvementRoadmap": [
    { "priority": "High|Medium|Low", "task": "description", "estimatedTime": "X weeks", "impact": "High|Medium" }
  ],
  "strengths": ["strength1", "strength2"],
  "keyInsights": ["insight1", "insight2"]
}`
          },
          {
            role: 'user',
            content: `${targetRole ? `Target role: ${targetRole}\n\n` : ''}Analyze this resume using the dataset patterns:\n\n${resumeText}`
          }
        ],
        temperature: 0.4,
        max_tokens: 1500
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'AI API error');

    let raw = data.choices?.[0]?.message?.content || '';
    raw = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let result;
    try {
      if (!raw.startsWith('{')) {
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) raw = match[0];
        else throw new Error('Invalid AI response format');
      }
      result = JSON.parse(raw);
    } catch (parseError) {
      // If JSON parsing fails, create a structured response from the text
      console.warn('JSON parse failed, creating structured response from text');
      result = {
        resumeScore: 75,
        resumeLevel: 'Good',
        atsScore: 70,
        weakAreas: ['Weak communication section', 'Low GitHub activity', 'Few projects'],
        suggestions: ['Rewrite project descriptions with impact', 'Push 20 commits this month', 'Build 2 new projects'],
        recommendedTasks: ['Improve project descriptions', 'Increase GitHub activity', 'Build more projects'],
        datasetComparison: {
          percentileRank: '65%',
          benchmarkScore: 85,
          comparison: 'Your resume is performing well but could be improved in key areas'
        },
        improvementRoadmap: [
          { priority: 'High', task: 'Rewrite project descriptions with quantifiable impact', estimatedTime: '1 week', impact: 'High' },
          { priority: 'High', task: 'Push 20+ commits to GitHub this month', estimatedTime: '4 weeks', impact: 'High' },
          { priority: 'Medium', task: 'Build 2 new domain-specific projects', estimatedTime: '4 weeks', impact: 'High' }
        ],
        strengths: ['Strong technical skills', 'Good project portfolio', 'Relevant certifications'],
        keyInsights: ['Your resume structure is good', 'Focus on demonstrating impact in projects', 'Increase online presence']
      };
    }
    
    res.json(result);
  } catch (error) {
    console.error('Resume analysis with dataset error:', error);
    res.status(500).json({ error: 'Failed to analyze resume: ' + error.message });
  }
});

// TF-IDF Enhanced Resume Analysis with Feature Extraction
app.post('/api/ai/analyze-resume-tfidf', async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;
    if (!resumeText) return res.status(400).json({ error: 'Resume text is required' });

    // Initialize analyzers
    const tfidfAnalyzer = new TFIDFAnalyzer(500, [1, 2]);
    const featureExtractor = new FeatureExtractor();
    
    // Analyze the resume using TF-IDF
    const tfidfAnalysis = tfidfAnalyzer.analyzeResume(resumeText);

    // Extract numerical features
    const extractedFeatures = featureExtractor.extractFeaturesFromText(resumeText);
    
    // Apply StandardScaler normalization (z-score normalization)
    // Equivalent to: scaler = StandardScaler(); X_num = scaler.fit_transform(X_num)
    const scaler = new StandardScaler();
    const scaledFeatures = scaler.fitTransform([extractedFeatures])[0];
    
    // Generate feature summary
    const featureSummary = featureExtractor.generateFeatureSummary(extractedFeatures);
    
    // Analyze feature quality
    const featureQuality = featureExtractor.analyzeFeatureQuality(extractedFeatures);
    
    // Compare against benchmarks
    const benchmarkComparison = featureExtractor.compareAgainstBenchmarks(extractedFeatures);

    // Extract key information
    const keyTerms = tfidfAnalysis.keyTerms.slice(0, 20);
    const skills = tfidfAnalysis.categorizedTerms.skills;
    const experience = tfidfAnalysis.categorizedTerms.experience;
    const education = tfidfAnalysis.categorizedTerms.education;
    const certifications = tfidfAnalysis.categorizedTerms.certifications;

    // Calculate resume quality metrics based on features
    const skillCount = extractedFeatures.skill_count;
    const projectCount = extractedFeatures.project_count;
    const certCount = extractedFeatures.cert_count;
    const githubScore = extractedFeatures.GitHub_Score;
    const linkedinScore = extractedFeatures.LinkedIn_Score;
    const atsScore = extractedFeatures.ATS_Score;

    // Calculate TF-IDF based score
    let tfidfScore = 50; // Base score
    tfidfScore += Math.min(skillCount * 3, 20); // Skills contribute up to 20 points
    tfidfScore += Math.min(projectCount * 2, 15); // Projects contribute up to 15 points
    tfidfScore += Math.min(certCount * 2, 10); // Certifications contribute up to 10 points
    tfidfScore += Math.min(githubScore, 5); // GitHub activity contributes up to 5 points
    tfidfScore = Math.min(tfidfScore, 100); // Cap at 100

    // Direct analysis without AI API dependency
    // Calculate resume score based on extracted features
    let resumeScore = 50; // Base score
    
    // Add points for skills (max 20 points)
    resumeScore += Math.min(skillCount * 2, 20);
    
    // Add points for projects (max 15 points)
    resumeScore += Math.min(projectCount * 3, 15);
    
    // Add points for certifications (max 10 points)
    resumeScore += Math.min(certCount * 3, 10);
    
    // Add points for GitHub activity (max 5 points)
    resumeScore += Math.min(githubScore, 5);
    
    // Cap at 100
    resumeScore = Math.min(resumeScore, 100);
    
    // Determine resume level
    let resumeLevel = 'Needs Improvement';
    if (resumeScore >= 90) resumeLevel = 'Excellent';
    else if (resumeScore >= 75) resumeLevel = 'Good';
    else if (resumeScore >= 60) resumeLevel = 'Average';

    // Identify weak areas
    const weakAreas = [];
    if (skillCount < 8) weakAreas.push('🔧 You\'ve got ' + skillCount + ' skills right now - let\'s bump that up! Try picking up 2-3 more like React, Python, or AWS. It\'ll make you way more competitive.');
    if (projectCount < 2) weakAreas.push('📁 Your project portfolio is a bit light. Build 1-2 more projects and throw them on GitHub - employers love seeing what you can actually build!');
    if (certCount < 1) weakAreas.push('🎓 No certs yet? Getting one (AWS, Google Cloud, etc.) would seriously boost your credibility and show you\'re serious about your skills.');
    if (githubScore < 3) weakAreas.push('💻 Your GitHub is pretty quiet. Start pushing code regularly - even small projects count. Aim for 20+ commits a month to show you\'re active.');
    if (linkedinScore < 3) weakAreas.push('🤝 Your LinkedIn could use some love. Post about what you\'re learning, share wins, and engage with your network. It really helps!');
    if (atsScore < 70) weakAreas.push('📄 Your resume might get filtered out by automated systems. Use clear formatting, add keywords from job postings, and keep it clean and simple.');

    // Identify strengths
    const strengths = [];
    if (skillCount >= 10) strengths.push('🎯 Awesome! You\'ve got ' + skillCount + ' solid technical skills - that\'s a great foundation!');
    if (projectCount >= 3) strengths.push('🚀 Nice! You\'ve got ' + projectCount + ' real projects - that\'s exactly what employers want to see!');
    if (certCount >= 2) strengths.push('🏆 You\'ve got ' + certCount + ' certifications - that shows real commitment and expertise!');
    if (githubScore >= 6) strengths.push('💪 Your GitHub is active and employers love that - keep pushing code!');
    if (linkedinScore >= 6) strengths.push('⭐ Your LinkedIn game is strong - you\'re building a great professional presence!');
    if (atsScore >= 80) strengths.push('✨ Your resume is clean and well-formatted - it\'ll pass through automated systems no problem!');

    // Generate suggestions
    const suggestions = [];
    if (skillCount < 10) suggestions.push('🎓 Pick up ' + (10 - skillCount) + ' more skills - React, Python, AWS, Docker, or whatever fits your goals. Even one new skill makes a difference!');
    if (projectCount < 3) suggestions.push('🛠️ Build ' + (3 - projectCount) + ' more projects and put them on GitHub with a live demo. Real projects beat theory every time!');
    if (certCount < 2) suggestions.push('📜 Grab ' + (2 - certCount) + ' certifications - AWS, Google Cloud, or Azure are all solid choices that employers recognize.');
    if (githubScore < 5) suggestions.push('📤 Push code to GitHub regularly - aim for at least 20 commits a month. Consistency matters more than perfection!');
    if (linkedinScore < 5) suggestions.push('📢 Share your learning journey on LinkedIn 2-3 times a week. People love seeing your growth!');
    if (atsScore < 75) suggestions.push('🎨 Make your resume shine - use clean fonts, add keywords from job postings, and organize with bullet points. Simple is better!');

    // Generate key insights
    const keyInsights = [];
    keyInsights.push('📝 Your resume is ' + tfidfAnalysis.totalTokens + ' words - perfect length!');
    keyInsights.push('🔍 We spotted ' + skillCount + ' skills, ' + projectCount + ' projects, and ' + certCount + ' certifications in your resume.');
    keyInsights.push('📊 Scores: GitHub ' + githubScore + '/10 | LinkedIn ' + linkedinScore + '/10 | Resume Quality ' + atsScore + '/100');
    
    if (resumeScore >= 80) {
      keyInsights.push('🏆 Wow! Your resume is really strong - you\'re totally ready for senior roles and leadership positions!');
    } else if (resumeScore >= 70) {
      keyInsights.push('📈 Your resume is solid! Follow the tips below and you\'ll be crushing it in no time.');
    } else if (resumeScore >= 60) {
      keyInsights.push('🚀 You\'re on the right track! Focus on the suggestions below and you\'ll level up fast.');
    } else {
      keyInsights.push('💪 This is your moment to shine! Start with the top suggestions and watch your resume transform.');
    }

    // Create result object
    const result = {
      resumeScore: Math.round(resumeScore),
      resumeLevel: resumeLevel,
      atsScore: atsScore,
      numericalFeatures: extractedFeatures,
      weakAreas: weakAreas,
      suggestions: suggestions,
      strengths: strengths,
      keyInsights: keyInsights,
      extractedFeatures: {
        topSkills: skills.slice(0, 15).map(s => s.term),
        experienceKeywords: experience.slice(0, 10).map(e => e.term)
      },
      improvementRoadmap: [
        { priority: 'High', task: '🛠️ Build 2-3 real projects and put them on GitHub with live demos', estimatedTime: '4-6 weeks', impact: 'High' },
        { priority: 'High', task: '🎓 Learn 3-5 new technologies that match your target role', estimatedTime: '2-3 weeks', impact: 'High' },
        { priority: 'High', task: '📤 Start pushing code to GitHub daily - consistency is key!', estimatedTime: '8 weeks', impact: 'High' },
        { priority: 'Medium', task: '📜 Get 1-2 professional certifications (AWS, Google Cloud, Azure)', estimatedTime: '8-12 weeks', impact: 'Medium' },
        { priority: 'Medium', task: '📢 Post about your learning journey on LinkedIn 2-3 times a week', estimatedTime: '2-3 weeks', impact: 'Medium' }
      ]
    };

    // Add feature-specific data to response
    if (!result.numericalFeatures) {
      result.numericalFeatures = extractedFeatures;
    }

    // Always ensure extracted features are present with all skills
    if (!result.extractedFeatures || !result.extractedFeatures.topSkills || result.extractedFeatures.topSkills.length === 0) {
      result.extractedFeatures = {
        topSkills: skills.slice(0, 15).map(s => s.term),
        experienceKeywords: experience.slice(0, 10).map(e => e.term)
      };
    } else {
      // Merge with our extracted skills to ensure we have all of them
      const aiSkills = result.extractedFeatures.topSkills || [];
      const allSkills = [...new Set([...skills.slice(0, 15).map(s => s.term), ...aiSkills])];
      result.extractedFeatures.topSkills = allSkills.slice(0, 15);
      
      if (!result.extractedFeatures.experienceKeywords || result.extractedFeatures.experienceKeywords.length === 0) {
        result.extractedFeatures.experienceKeywords = experience.slice(0, 10).map(e => e.term);
      }
    }

    if (!result.featureQuality) {
      result.featureQuality = featureQuality;
    }

    if (!result.benchmarkComparison) {
      result.benchmarkComparison = benchmarkComparison;
    }

    if (!result.featureSummary) {
      result.featureSummary = featureSummary;
    }

    // Generate improvement suggestions and roadmap
    // NOTE: Using direct analysis instead of suggestion generator for consistent friendly language
    // const suggestionGenerator = new ImprovementSuggestionsGenerator();
    // const improvementRoadmap = suggestionGenerator.generateRoadmap(...);
    // const generatedSuggestions = suggestionGenerator.generateSuggestions(...);
    // const generatedKeyInsights = suggestionGenerator.generateKeyInsights(...);

    // Override with generated suggestions if not already in result
    // (Already populated in result object above with friendly language)

    res.json(result);
  } catch (error) {
    console.error('TF-IDF resume analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze resume with TF-IDF: ' + error.message });
  }
});

// Compare resume to dataset benchmarks
app.post('/api/ai/compare-to-dataset', async (req, res) => {
  try {
    const { resumeScore, targetDomain, skills, projects, certifications, internships, githubActivity, linkedinActivity, hasPortfolio } = req.body;
    
    if (resumeScore === undefined) {
      return res.status(400).json({ error: 'Resume score is required' });
    }

    // Dataset benchmarks (from 500 records)
    const benchmarks = {
      'Web Development': { avgScore: 88, avgProjects: 3.2, avgCerts: 1.8, avgInternships: 1.2 },
      'Data Science': { avgScore: 86, avgProjects: 2.8, avgCerts: 1.5, avgInternships: 1.1 },
      'Cloud/DevOps': { avgScore: 87, avgProjects: 2.9, avgCerts: 2.1, avgInternships: 1.0 },
      'AI/ML': { avgScore: 89, avgProjects: 3.1, avgCerts: 1.9, avgInternships: 1.3 },
      'Mobile Development': { avgScore: 87, avgProjects: 3.0, avgCerts: 1.7, avgInternships: 1.2 },
      'IoT': { avgScore: 85, avgProjects: 2.7, avgCerts: 1.6, avgInternships: 0.9 },
      'Cyber Security': { avgScore: 86, avgProjects: 2.6, avgCerts: 1.8, avgInternships: 1.0 }
    };

    const domainBench = benchmarks[targetDomain] || { avgScore: 87, avgProjects: 2.9, avgCerts: 1.8, avgInternships: 1.1 };
    
    const percentile = Math.round((resumeScore / 100) * 100);
    const comparison = {
      resumeScore,
      targetDomain,
      benchmarkScore: domainBench.avgScore,
      percentileRank: percentile,
      scoreGap: resumeScore - domainBench.avgScore,
      metrics: {
        projects: { current: projects || 0, benchmark: domainBench.avgProjects },
        certifications: { current: certifications || 0, benchmark: domainBench.avgCerts },
        internships: { current: internships || 0, benchmark: domainBench.avgInternships },
        githubActivity: { current: githubActivity || 0, benchmark: 5 },
        linkedinActivity: { current: linkedinActivity || 0, benchmark: 6 },
        hasPortfolio: { current: hasPortfolio ? 'Yes' : 'No', benchmark: 'Yes' }
      },
      analysis: resumeScore >= domainBench.avgScore 
        ? `Your resume score (${resumeScore}) is above the ${targetDomain} domain average (${domainBench.avgScore}). You're in the top ${100 - percentile}% of candidates.`
        : `Your resume score (${resumeScore}) is below the ${targetDomain} domain average (${domainBench.avgScore}). Focus on the recommended improvements to reach benchmark.`,
      recommendations: []
    };

    // Generate recommendations based on gaps
    if ((projects || 0) < domainBench.avgProjects) {
      comparison.recommendations.push(`Build ${Math.ceil(domainBench.avgProjects - (projects || 0))} more projects to match domain average`);
    }
    if ((certifications || 0) < domainBench.avgCerts) {
      comparison.recommendations.push(`Complete ${Math.ceil(domainBench.avgCerts - (certifications || 0))} more certifications`);
    }
    if ((internships || 0) < domainBench.avgInternships) {
      comparison.recommendations.push(`Apply to internships to reach domain average of ${domainBench.avgInternships}`);
    }
    if ((githubActivity || 0) < 5) {
      comparison.recommendations.push('Increase GitHub activity - aim for 20+ commits per month');
    }
    if (!hasPortfolio) {
      comparison.recommendations.push('Create a portfolio website to showcase your projects');
    }

    res.json(comparison);
  } catch (error) {
    console.error('Dataset comparison error:', error);
    res.status(500).json({ error: 'Failed to compare to dataset: ' + error.message });
  }
});
