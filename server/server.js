const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://abhishekjohnj411_db_user:<db_password>@cluster4.usw81tp.mongodb.net/portfolio_builder?retryWrites=true&w=majority';

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
  createdAt: { type: Date, default: Date.now }
});

const Resume = mongoose.model('Resume', resumeSchema);

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
    const { userId, templateId, data } = req.body;
    if (!userId || !templateId || !data) return res.status(400).json({ error: 'Missing fields' });
    const resume = new Resume({ userId, templateId, data });
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

// Generate portfolio data from prompt
app.post('/api/ai/generate-portfolio', async (req, res) => {
  try {
    const { prompt, templateId } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const apiKey = process.env.AI_API_KEY;
    const url = 'https://openrouter.ai/api/v1/chat/completions';

    const systemPrompt = `You are a professional portfolio writer. Based on the user's description, extract and generate structured portfolio data as a JSON object.
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
    { "name": "Project Name", "desc": "Short description of the project.", "tech": ["Tech1", "Tech2", "Tech3"], "link": "#" },
    { "name": "Project Name 2", "desc": "Short description.", "tech": ["Tech1", "Tech2"], "link": "#" },
    { "name": "Project Name 3", "desc": "Short description.", "tech": ["Tech1", "Tech2"], "link": "#" }
  ],
  "experience": [
    { "role": "Job Title", "company": "Company Name", "period": "2021 – Present", "desc": "Achievement-focused description." },
    { "role": "Job Title 2", "company": "Company 2", "period": "2019 – 2021", "desc": "Description." }
  ]
}
If any field is not mentioned, make a reasonable professional inference. Always return valid JSON only.`;

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
          { role: 'user', content: `User description: ${prompt}` }
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'AI API error');

    const raw = data.choices?.[0]?.message?.content || '';
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const portfolioData = JSON.parse(cleaned);

    res.json({ portfolioData });
  } catch (error) {
    console.error('Generate portfolio error:', error);
    res.status(500).json({ error: 'Failed to generate portfolio: ' + error.message });
  }
});

// Generate resume data from prompt
app.post('/api/ai/generate-resume', async (req, res) => {
  try {
    const { prompt, templateId } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const apiKey = process.env.AI_API_KEY;
    const url = 'https://openrouter.ai/api/v1/chat/completions';

    const systemPrompt = `You are a professional resume writer. Based on the user's description, extract and generate structured resume data as a JSON object. 
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
    { "role": "Job Title", "company": "Company Name", "period": "2020 – 2024", "desc": "Achievement-focused description." }
  ],
  "education": [
    { "degree": "Degree Name", "school": "University Name", "year": "2020" }
  ],
  "languages": ["English – Native", "Spanish – Intermediate"],
  "awards": ["Award 1", "Award 2"]
}
If any field is not mentioned, make a reasonable professional inference. Always return valid JSON only.`;

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
          { role: 'user', content: `User description: ${prompt}` }
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'AI API error');

    const raw = data.choices?.[0]?.message?.content || '';
    // Strip markdown code fences if present
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const resumeData = JSON.parse(cleaned);

    res.json({ resumeData });
  } catch (error) {
    console.error('Generate resume error:', error);
    res.status(500).json({ error: 'Failed to generate resume: ' + error.message });
  }
});
