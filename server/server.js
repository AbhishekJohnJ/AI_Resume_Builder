const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");
const multer = require("multer");
const mammoth = require("mammoth");
const XLSX = require("xlsx");
const { createWorker } = require("tesseract.js");
const groqService = require("./services/groqService");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

async function extractTextFromFile(file) {
  const { mimetype, originalname, buffer } = file;
  const ext = path.extname(originalname).toLowerCase();
  if (mimetype === "application/pdf" || ext === ".pdf") {
    const { PDFParse } = require("pdf-parse");
    const parser = new PDFParse({ data: buffer, verbosity: 0 });
    const result = await parser.getText();
    return (result?.text || "").trim();
  }
  if (mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || ext === ".docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  if (ext === ".xlsx" || ext === ".xls" || ext === ".csv") {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    let text = "";
    workbook.SheetNames.forEach(n => { text += XLSX.utils.sheet_to_csv(workbook.Sheets[n]) + "\n"; });
    return text;
  }
  if (mimetype.startsWith("image/")) {
    const worker = await createWorker("eng");
    const { data: { text } } = await worker.recognize(buffer);
    await worker.terminate();
    return text;
  }
  if (mimetype === "text/plain" || ext === ".txt") return buffer.toString("utf-8");
  return "";
}

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB error:", err));

const userSchema = new mongoose.Schema({ name: { type: String, required: true }, email: { type: String, required: true, unique: true, lowercase: true }, password: { type: String, required: true }, createdAt: { type: Date, default: Date.now } });
const User = mongoose.model("User", userSchema);
const resumeSchema = new mongoose.Schema({ userId: String, templateId: Number, data: Object, themeColor: Object, createdAt: { type: Date, default: Date.now } });
const Resume = mongoose.model("Resume", resumeSchema);
const portfolioSchema = new mongoose.Schema({ userId: String, templateId: Number, data: Object, themeColor: Object, createdAt: { type: Date, default: Date.now } });
const Portfolio = mongoose.model("Portfolio", portfolioSchema);

<<<<<<< HEAD
app.get("/api/health", (req, res) => res.json({ status: "OK" }));
=======
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
>>>>>>> dcb046f94f2f9bcb3eb765c6c0bb6883baa6820e

app.post("/api/auth/register", async (req, res) => {
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

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: "Invalid email or password" });
    res.json({ message: "Login successful", user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) { res.status(500).json({ error: "Server error during login" }); }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (e) { res.status(500).json({ error: "Server error" }); }
});

app.post("/api/resumes", async (req, res) => {
  try {
    const { userId, templateId, data, themeColor } = req.body;
    if (!userId || !templateId || !data) return res.status(400).json({ error: "Missing fields" });
    const resume = new Resume({ userId, templateId, data, themeColor: themeColor || null });
    await resume.save();
    res.status(201).json(resume);
  } catch (e) { res.status(500).json({ error: "Failed to save resume" }); }
});

app.get("/api/resumes/:userId", async (req, res) => {
  try { res.json(await Resume.find({ userId: req.params.userId }).sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ error: "Failed to fetch resumes" }); }
});

app.delete("/api/resumes/:id", async (req, res) => {
  try { await Resume.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); }
  catch (e) { res.status(500).json({ error: "Failed to delete resume" }); }
});

app.post("/api/portfolios", async (req, res) => {
  try {
    const { userId, templateId, data, themeColor } = req.body;
    if (!userId || !templateId || !data) return res.status(400).json({ error: "Missing fields" });
    const portfolio = new Portfolio({ userId, templateId, data, themeColor: themeColor || null });
    await portfolio.save();
    res.status(201).json(portfolio);
  } catch (e) { res.status(500).json({ error: "Failed to save portfolio" }); }
});

app.get("/api/portfolios/:userId", async (req, res) => {
  try { res.json(await Portfolio.find({ userId: req.params.userId }).sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ error: "Failed to fetch portfolios" }); }
});

app.delete("/api/portfolios/:id", async (req, res) => {
  try { await Portfolio.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); }
  catch (e) { res.status(500).json({ error: "Failed to delete portfolio" }); }
});

// ── AI: Chat ──
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message } = req.body;
<<<<<<< HEAD
    if (!message) return res.status(400).json({ error: "Message is required" });
    const reply = await groqService.aiChat(message);
    res.json({ reply });
  } catch (e) { res.status(500).json({ error: "Failed to get AI response" }); }
=======
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
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Career Assistant'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful AI career assistant for a portfolio and resume builder platform. Give concise, actionable advice about resumes, portfolios, LinkedIn, GitHub, and career growth. Keep responses short and friendly.' },
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
>>>>>>> dcb046f94f2f9bcb3eb765c6c0bb6883baa6820e
});

// ── AI: Analyse Resume (text) ──
app.post("/api/ai/analyze-resume-with-dataset", async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;
    if (!resumeText) return res.status(400).json({ error: "Resume text is required" });
    const result = await groqService.analyzeResume(resumeText, targetRole || "");
    res.json(result);
  } catch (e) { res.status(500).json({ error: "Failed to analyse resume: " + e.message }); }
});

// ── AI: Generate Portfolio ──
app.post("/api/ai/generate-portfolio", async (req, res) => {
  try {
    const { prompt, templateId, existingData } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });
    const portfolioData = await groqService.generatePortfolio(prompt, templateId, existingData || null);
    const user = req.body.userId ? { id: req.body.userId } : null;
    if (user?.id) {
      await new Portfolio({ userId: user.id, templateId, data: portfolioData }).save().catch(() => {});
    }
    res.json({ portfolioData });
  } catch (e) { res.status(500).json({ error: "Failed to generate portfolio: " + e.message }); }
});

// ── AI: Generate Resume ──
app.post("/api/ai/generate-resume", upload.array("files", 5), async (req, res) => {
  try {
    const { prompt, templateId } = req.body;
    const existingData = req.body.existingData ? JSON.parse(req.body.existingData) : null;
    const uploadedFiles = req.files || [];
    if (!prompt && uploadedFiles.length === 0) return res.status(400).json({ error: "Prompt or file is required" });

    let extractedContent = "";
    if (uploadedFiles.length > 0) {
      const texts = await Promise.all(uploadedFiles.map(f => extractTextFromFile(f).catch(() => "")));
      extractedContent = texts.filter(Boolean).join("\n\n");
    }

    const fullPrompt = [prompt, extractedContent].filter(Boolean).join("\n\nExtracted from uploaded file:\n");
    const resumeData = await groqService.generateResume(fullPrompt, parseInt(templateId) || 1, existingData);
    res.json({ resumeData, filesProcessed: uploadedFiles.length });
  } catch (e) { res.status(500).json({ error: "Failed to generate resume: " + e.message }); }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("Server running on port " + PORT));
