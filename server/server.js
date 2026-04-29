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
const groqService = require('./services/groqService');
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
  .then(() => console.log('âœ… Connected to MongoDB'))
  .catch((err) => {
    console.error('âŒ MongoDB connection error:', err.message);
    console.log('\nâš ï¸  MongoDB Connection Failed!');
    console.log('ðŸ“‹ Possible solutions:');
    console.log('   1. Add your IP address to MongoDB Atlas whitelist');
    console.log('   2. Go to: https://cloud.mongodb.com/');
    console.log('   3. Navigate to: Network Access â†’ Add IP Address');
    console.log('   4. Click "Add Current IP Address" or "Allow Access from Anywhere (0.0.0.0/0)"\n');
    console.log('âš ï¸  Server will continue running, but database features will not work.\n');
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

// â”€â”€ Gamification API Endpoints â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
  console.log(`ðŸš€ Server running on port ${PORT}`);
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

// AI Chat â€” powered by Groq
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    const reply = await groqService.aiChat(message);
    res.json({ reply });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.json({ reply: 'Sorry, I could not get a response. Please try again.' });
  }
});

// AI: Gather Info (domain-aware questions)
app.post('/api/ai/gather-info', async (req, res) => {
  try {
    const { prompt, type } = req.body;
    if (!prompt) return res.json({ questions: [] });
    const questions = await groqService.gatherMissingInfo(prompt, type || 'resume');
    res.json({ questions });
  } catch (e) {
    res.json({ questions: [] });
  }
});

// Full Resume Analysis
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

// Generate portfolio — powered by Groq
app.post('/api/ai/generate-portfolio', async (req, res) => {
  try {
    const { prompt, templateId, existingData } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
    const portfolioData = await groqService.generatePortfolio(prompt, parseInt(templateId) || 1, existingData || null);
    res.json({ portfolioData });
  } catch (error) {
    console.error('Generate portfolio error:', error);
    res.status(500).json({ error: 'Failed to generate portfolio: ' + error.message });
  }
});

// Generate resume — powered by Groq
app.post('/api/ai/generate-resume', upload.array('files', 5), async (req, res) => {
  try {
    const { prompt, templateId } = req.body;
    const existingData = req.body.existingData ? JSON.parse(req.body.existingData) : null;
    const uploadedFiles = req.files || [];
    if (!prompt && uploadedFiles.length === 0) return res.status(400).json({ error: 'Prompt or file is required' });

    let extractedContent = '';
    if (uploadedFiles.length > 0) {
      const texts = await Promise.all(uploadedFiles.map(f => extractTextFromFile(f).catch(() => '')));
      extractedContent = texts.filter(Boolean).join('\n\n');
    }

    const fullPrompt = [prompt, extractedContent].filter(Boolean).join('\n\nExtracted from uploaded file:\n');
    const resumeData = await groqService.generateResume(fullPrompt, parseInt(templateId) || 1, existingData);
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

// Enhanced Resume Analysis — powered by Groq
app.post('/api/ai/analyze-resume-with-dataset', async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;
    if (!resumeText) return res.status(400).json({ error: 'Resume text is required' });
    const result = await groqService.analyzeResume(resumeText, targetRole || '');
    res.json(result);
  } catch (error) {
    console.error('Resume analysis error:', error);
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
    if (skillCount < 8) weakAreas.push('ðŸ”§ You\'ve got ' + skillCount + ' skills right now - let\'s bump that up! Try picking up 2-3 more like React, Python, or AWS. It\'ll make you way more competitive.');
    if (projectCount < 2) weakAreas.push('ðŸ“ Your project portfolio is a bit light. Build 1-2 more projects and throw them on GitHub - employers love seeing what you can actually build!');
    if (certCount < 1) weakAreas.push('ðŸŽ“ No certs yet? Getting one (AWS, Google Cloud, etc.) would seriously boost your credibility and show you\'re serious about your skills.');
    if (githubScore < 3) weakAreas.push('ðŸ’» Your GitHub is pretty quiet. Start pushing code regularly - even small projects count. Aim for 20+ commits a month to show you\'re active.');
    if (linkedinScore < 3) weakAreas.push('ðŸ¤ Your LinkedIn could use some love. Post about what you\'re learning, share wins, and engage with your network. It really helps!');
    if (atsScore < 70) weakAreas.push('ðŸ“„ Your resume might get filtered out by automated systems. Use clear formatting, add keywords from job postings, and keep it clean and simple.');

    // Identify strengths
    const strengths = [];
    if (skillCount >= 10) strengths.push('ðŸŽ¯ Awesome! You\'ve got ' + skillCount + ' solid technical skills - that\'s a great foundation!');
    if (projectCount >= 3) strengths.push('ðŸš€ Nice! You\'ve got ' + projectCount + ' real projects - that\'s exactly what employers want to see!');
    if (certCount >= 2) strengths.push('ðŸ† You\'ve got ' + certCount + ' certifications - that shows real commitment and expertise!');
    if (githubScore >= 6) strengths.push('ðŸ’ª Your GitHub is active and employers love that - keep pushing code!');
    if (linkedinScore >= 6) strengths.push('â­ Your LinkedIn game is strong - you\'re building a great professional presence!');
    if (atsScore >= 80) strengths.push('âœ¨ Your resume is clean and well-formatted - it\'ll pass through automated systems no problem!');

    // Generate suggestions
    const suggestions = [];
    if (skillCount < 10) suggestions.push('ðŸŽ“ Pick up ' + (10 - skillCount) + ' more skills - React, Python, AWS, Docker, or whatever fits your goals. Even one new skill makes a difference!');
    if (projectCount < 3) suggestions.push('ðŸ› ï¸ Build ' + (3 - projectCount) + ' more projects and put them on GitHub with a live demo. Real projects beat theory every time!');
    if (certCount < 2) suggestions.push('ðŸ“œ Grab ' + (2 - certCount) + ' certifications - AWS, Google Cloud, or Azure are all solid choices that employers recognize.');
    if (githubScore < 5) suggestions.push('ðŸ“¤ Push code to GitHub regularly - aim for at least 20 commits a month. Consistency matters more than perfection!');
    if (linkedinScore < 5) suggestions.push('ðŸ“¢ Share your learning journey on LinkedIn 2-3 times a week. People love seeing your growth!');
    if (atsScore < 75) suggestions.push('ðŸŽ¨ Make your resume shine - use clean fonts, add keywords from job postings, and organize with bullet points. Simple is better!');

    // Generate key insights
    const keyInsights = [];
    keyInsights.push('ðŸ“ Your resume is ' + tfidfAnalysis.totalTokens + ' words - perfect length!');
    keyInsights.push('ðŸ” We spotted ' + skillCount + ' skills, ' + projectCount + ' projects, and ' + certCount + ' certifications in your resume.');
    keyInsights.push('ðŸ“Š Scores: GitHub ' + githubScore + '/10 | LinkedIn ' + linkedinScore + '/10 | Resume Quality ' + atsScore + '/100');
    
    if (resumeScore >= 80) {
      keyInsights.push('ðŸ† Wow! Your resume is really strong - you\'re totally ready for senior roles and leadership positions!');
    } else if (resumeScore >= 70) {
      keyInsights.push('ðŸ“ˆ Your resume is solid! Follow the tips below and you\'ll be crushing it in no time.');
    } else if (resumeScore >= 60) {
      keyInsights.push('ðŸš€ You\'re on the right track! Focus on the suggestions below and you\'ll level up fast.');
    } else {
      keyInsights.push('ðŸ’ª This is your moment to shine! Start with the top suggestions and watch your resume transform.');
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
        { priority: 'High', task: 'ðŸ› ï¸ Build 2-3 real projects and put them on GitHub with live demos', estimatedTime: '4-6 weeks', impact: 'High' },
        { priority: 'High', task: 'ðŸŽ“ Learn 3-5 new technologies that match your target role', estimatedTime: '2-3 weeks', impact: 'High' },
        { priority: 'High', task: 'ðŸ“¤ Start pushing code to GitHub daily - consistency is key!', estimatedTime: '8 weeks', impact: 'High' },
        { priority: 'Medium', task: 'ðŸ“œ Get 1-2 professional certifications (AWS, Google Cloud, Azure)', estimatedTime: '8-12 weeks', impact: 'Medium' },
        { priority: 'Medium', task: 'ðŸ“¢ Post about your learning journey on LinkedIn 2-3 times a week', estimatedTime: '2-3 weeks', impact: 'Medium' }
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
