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

// AI: Gather Info (dynamic questions based on prompt)
app.post("/api/ai/gather-info", async function(req, res) {
  try {
    const { prompt, type } = req.body;
    if (!prompt) return res.json({ questions: [] });
    const questions = await groqService.gatherMissingInfo(prompt, type || 'resume');
    res.json({ questions });
  } catch (e) {
    console.error('Gather info error:', e.message);
    res.json({ questions: [] }); // fail silently — just generate without questions
  }
});

// AI: Chat
app.post("/api/ai/chat", async function(req, res) {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });
    const reply = await groqService.aiChat(message);
    res.json({ reply });
  } catch (e) { res.status(500).json({ error: "Failed to get AI response" }); }
});

// AI: Analyse Resume
app.post("/api/ai/analyze-resume-with-dataset", async function(req, res) {
  try {
    const { resumeText, targetRole } = req.body;
    if (!resumeText) return res.status(400).json({ error: "Resume text is required" });
    const result = await groqService.analyzeResume(resumeText, targetRole || "");
    res.json(result);
  } catch (e) { res.status(500).json({ error: "Failed to analyse resume: " + e.message }); }
});

// AI: Generate Portfolio
app.post("/api/ai/generate-portfolio", async function(req, res) {
  try {
    const { prompt, templateId, existingData } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });
    const portfolioData = await groqService.generatePortfolio(prompt, parseInt(templateId) || 1, existingData || null);
    res.json({ portfolioData });
  } catch (e) { res.status(500).json({ error: "Failed to generate portfolio: " + e.message }); }
});

// AI: Generate Resume
app.post("/api/ai/generate-resume", upload.array("files", 5), async function(req, res) {
  try {
    const { prompt, templateId } = req.body;
    const existingData = req.body.existingData ? JSON.parse(req.body.existingData) : null;
    const uploadedFiles = req.files || [];
    if (!prompt && uploadedFiles.length === 0) return res.status(400).json({ error: "Prompt or file is required" });

    let extractedContent = "";
    if (uploadedFiles.length > 0) {
      const texts = await Promise.all(uploadedFiles.map(function(f) { return extractTextFromFile(f).catch(function() { return ""; }); }));
      extractedContent = texts.filter(Boolean).join("\n\n");
    }

    const fullPrompt = [prompt, extractedContent].filter(Boolean).join("\n\nExtracted from uploaded file:\n");
    const resumeData = await groqService.generateResume(fullPrompt, parseInt(templateId) || 1, existingData);
    res.json({ resumeData, filesProcessed: uploadedFiles.length });
  } catch (e) { res.status(500).json({ error: "Failed to generate resume: " + e.message }); }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, function() { console.log("Server running on port " + PORT); });
