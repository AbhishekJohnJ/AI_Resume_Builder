const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");
const multer = require("multer");
const mammoth = require("mammoth");
const XLSX = require("xlsx");
const { createWorker } = require("tesseract.js");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

async function extractTextFromFile(file) {
  const { mimetype, originalname, buffer } = file;
  const ext = path.extname(originalname).toLowerCase();
  if (mimetype === "application/pdf" || ext === ".pdf") {
    const pdfParse = require("pdf-parse");
    const result = await pdfParse(buffer);
    return (result && result.text ? result.text : "").trim();
  }
  if (mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || ext === ".docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  if (ext === ".xlsx" || ext === ".xls" || ext === ".csv") {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    let text = "";
    workbook.SheetNames.forEach(function(n) { text += XLSX.utils.sheet_to_csv(workbook.Sheets[n]) + "\n"; });
    return text;
  }
  if (mimetype.startsWith("image/")) {
    const worker = await createWorker("eng");
    const result = await worker.recognize(buffer);
    await worker.terminate();
    return result.data.text;
  }
  if (mimetype === "text/plain" || ext === ".txt") return buffer.toString("utf-8");
  return "";
}

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(function() { console.log("Connected to MongoDB"); })
  .catch(function(err) { console.error("MongoDB error:", err.message); });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model("User", userSchema);

const resumeSchema = new mongoose.Schema({
  userId: String, templateId: Number, data: Object,
  themeColor: Object, createdAt: { type: Date, default: Date.now }
});
const Resume = mongoose.model("Resume", resumeSchema);

const portfolioSchema = new mongoose.Schema({
  userId: String, templateId: Number, data: Object,
  themeColor: Object, createdAt: { type: Date, default: Date.now }
});
const Portfolio = mongoose.model("Portfolio", portfolioSchema);

// Health
app.get("/api/health", function(req, res) { res.json({ status: "OK" }); });

// Test GROQ API
app.get("/api/test-groq", async function(req, res) {
  try {
    const axios = require('axios');
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return res.json({ 
        status: 'error',
        message: 'GROQ_API_KEY not set in .env file'
      });
    }

    console.log('Testing GROQ API...');
    console.log('API Key:', apiKey.substring(0, 20) + '...');

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Say "API is working" if you can read this.' }],
        max_tokens: 50
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      status: 'success',
      message: 'GROQ API is working!',
      response: response.data.choices[0].message.content,
      model: response.data.model
    });
  } catch (e) {
    console.error('GROQ test failed:', e.response?.data || e.message);
    res.json({
      status: 'error',
      message: e.message,
      details: e.response?.data || 'No additional details',
      apiKeyPresent: !!process.env.GROQ_API_KEY
    });
  }
});

// Register
app.post("/api/auth/register", async function(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "All fields are required" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
    if (await User.findOne({ email })) return res.status(400).json({ error: "Email already registered" });
    const user = new User({ name, email, password: await bcrypt.hash(password, 10) });
    await user.save();
    res.status(201).json({ message: "User registered successfully", user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) { res.status(500).json({ error: "Server error during registration" }); }
});

// Login
app.post("/api/auth/login", async function(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: "Invalid email or password" });
    res.json({ message: "Login successful", user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) { res.status(500).json({ error: "Server error during login" }); }
});

// Get user
app.get("/api/users/:id", async function(req, res) {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (e) { res.status(500).json({ error: "Server error" }); }
});

// Resumes
app.post("/api/resumes", async function(req, res) {
  try {
    const { userId, templateId, data, themeColor } = req.body;
    if (!userId || !templateId || !data) return res.status(400).json({ error: "Missing fields" });
    const resume = new Resume({ userId, templateId, data, themeColor: themeColor || null });
    await resume.save();
    res.status(201).json(resume);
  } catch (e) { res.status(500).json({ error: "Failed to save resume" }); }
});

app.get("/api/resumes/:userId", async function(req, res) {
  try { res.json(await Resume.find({ userId: req.params.userId }).sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ error: "Failed to fetch resumes" }); }
});

app.delete("/api/resumes/:id", async function(req, res) {
  try { await Resume.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); }
  catch (e) { res.status(500).json({ error: "Failed to delete resume" }); }
});

// Portfolios
app.post("/api/portfolios", async function(req, res) {
  try {
    const { userId, templateId, data, themeColor } = req.body;
    if (!userId || !templateId || !data) return res.status(400).json({ error: "Missing fields" });
    const portfolio = new Portfolio({ userId, templateId, data, themeColor: themeColor || null });
    await portfolio.save();
    res.status(201).json(portfolio);
  } catch (e) { res.status(500).json({ error: "Failed to save portfolio" }); }
});

app.get("/api/portfolios/:userId", async function(req, res) {
  try { res.json(await Portfolio.find({ userId: req.params.userId }).sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ error: "Failed to fetch portfolios" }); }
});

app.delete("/api/portfolios/:id", async function(req, res) {
  try { await Portfolio.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); }
  catch (e) { res.status(500).json({ error: "Failed to delete portfolio" }); }
});

// AI Routes
const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);

// AI Chat endpoint
app.post('/api/ai/chat', async function(req, res) {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    
    const prompt = `You are a friendly career advisor assistant. The user asked: "${message}". 
Provide a helpful, concise response (2-3 sentences) about career advice, resume tips, or portfolio building.`;

    const axios = require('axios');
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return res.json({ 
        reply: "I'm here to help with career advice! However, the AI service isn't configured yet. Please check the server configuration." 
      });
    }

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 200
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (e) {
    console.error('Chat error:', e.response?.data || e.message);
    res.json({ reply: "I'm having trouble connecting right now. Please try again in a moment." });
  }
});

// AI Generate Resume endpoint
app.post('/api/ai/generate-resume', upload.array('files'), async function(req, res) {
  try {
    const { prompt, templateId, existingData } = req.body;
    const files = req.files || [];
    
    let context = prompt || '';
    
    // Extract text from uploaded files
    for (const file of files) {
      const text = await extractTextFromFile(file);
      context += '\n\n' + text;
    }
    
    if (!context.trim()) {
      return res.status(400).json({ error: 'Please provide a prompt or upload files' });
    }

    const axios = require('axios');
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    const aiPrompt = `Generate resume data in JSON format based on this information:
${context}

Return ONLY valid JSON (no markdown, no extra text) with this structure:
{
  "name": "Full Name",
  "title": "Professional Title",
  "email": "email@example.com",
  "phone": "+1234567890",
  "location": "City, Country",
  "summary": "Professional summary",
  "experience": [{"company": "Company", "position": "Position", "duration": "2020-2023", "description": "Description"}],
  "education": [{"institution": "University", "degree": "Degree", "year": "2020", "gpa": "3.8"}],
  "skills": ["Skill1", "Skill2"],
  "projects": [{"name": "Project", "description": "Description", "technologies": ["Tech1"]}],
  "certifications": ["Cert1"],
  "languages": ["English"]
}`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: aiPrompt }],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const resumeData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    
    res.json({ resumeData });
  } catch (e) {
    console.error('Resume generation error:', e.response?.data || e.message);
    res.status(500).json({ error: 'Failed to generate resume', message: e.message });
  }
});

// AI Generate Portfolio endpoint
app.post('/api/ai/generate-portfolio', async function(req, res) {
  try {
    const { prompt, templateId, existingData } = req.body;
    
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Please provide a description' });
    }

    const axios = require('axios');
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    const aiPrompt = `Generate portfolio data in JSON format based on this description:
${prompt}

IMPORTANT: Return ONLY valid JSON (no markdown, no code blocks, no extra text) with this EXACT structure:
{
  "name": "Full Name",
  "initials": "FN",
  "title": "Professional Title",
  "tagline": "A catchy tagline",
  "bio": "Short bio",
  "email": "email@example.com",
  "phone": "+1234567890",
  "location": "City, Country",
  "github": "github.com/username",
  "linkedin": "linkedin.com/in/username",
  "website": "website.com",
  "about": "Detailed about section (2-3 sentences)",
  "skills": ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5"],
  "projects": [
    {
      "name": "Project Name",
      "desc": "Project description",
      "tech": ["Tech1", "Tech2"],
      "link": "#",
      "github": "#"
    }
  ],
  "experience": [
    {
      "role": "Job Title",
      "company": "Company Name",
      "period": "2020 - 2023",
      "desc": "Job description"
    }
  ]
}

Make sure to include at least 3 projects and 2 experiences. Use realistic data based on the prompt.`;

    console.log('Calling GROQ API for portfolio generation...');
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a portfolio data generator. Always respond with ONLY valid JSON, no markdown, no code blocks, no explanations.'
          },
          {
            role: 'user',
            content: aiPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    console.log('GROQ Response:', content.substring(0, 200));
    
    // Remove markdown code blocks if present
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response');
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }
    
    const portfolioData = JSON.parse(jsonMatch[0]);
    
    // Ensure required fields exist
    if (!portfolioData.name || !portfolioData.skills || !portfolioData.projects) {
      console.error('Missing required fields in portfolio data');
      return res.status(500).json({ error: 'Invalid portfolio data structure' });
    }
    
    // Add initials if missing
    if (!portfolioData.initials && portfolioData.name) {
      portfolioData.initials = portfolioData.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    }
    
    console.log('Portfolio data generated successfully');
    res.json({ portfolioData });
  } catch (e) {
    console.error('Portfolio generation error:', e.response?.data || e.message);
    res.status(500).json({ 
      error: 'Failed to generate portfolio', 
      message: e.message,
      details: e.response?.data?.error?.message || 'Unknown error'
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, function() { console.log("Server running on port " + PORT); });

