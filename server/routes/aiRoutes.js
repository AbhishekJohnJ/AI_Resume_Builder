/**
 * AI Resume Analyzer Routes
 * Handles PDF upload and resume text analysis using OpenRouter API
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const openrouterService = require('../services/openrouterService');
const PDFExtractor = require('../utils/pdfExtractor');

const router = express.Router();

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

/**
 * POST /api/ai/upload-and-predict
 * Upload PDF and get prediction using OpenRouter
 */
router.post('/upload-and-predict', upload.single('file'), async (req, res) => {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('📄 [AI ROUTE] PDF Upload and Predict');
    console.log('='.repeat(70));

    // Validate file upload
    if (!req.file) {
      console.error('❌ [AI ROUTE] No file uploaded');
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a PDF file'
      });
    }

    console.log(`📋 [AI ROUTE] Filename: ${req.file.originalname}`);
    console.log(`📦 [AI ROUTE] File size: ${req.file.size} bytes`);
    console.log(`📝 [AI ROUTE] MIME type: ${req.file.mimetype}`);

    // Extract text from PDF
    console.log('\n📥 [AI ROUTE] Extracting text from PDF...');
    let resumeText;
    let extractionDetails;
    
    try {
      extractionDetails = await PDFExtractor.extractText(req.file);
      resumeText = extractionDetails.text;
      console.log(`✅ [AI ROUTE] Extraction successful`);
      console.log(`   Text length: ${resumeText.length} characters`);
      console.log(`   Pages: ${extractionDetails.pages}`);
    } catch (extractError) {
      console.error('❌ [AI ROUTE] PDF extraction failed');
      console.error(`   Error: ${extractError.message}`);
      return res.status(400).json({
        error: 'PDF extraction failed',
        message: extractError.message,
        details: 'Could not extract text from the PDF file. Please ensure it is a valid PDF.'
      });
    }

    // Validate extracted text
    if (!resumeText || resumeText.length < 50) {
      console.error('❌ [AI ROUTE] Insufficient text extracted');
      console.error(`   Text length: ${resumeText?.length || 0} characters`);
      return res.status(400).json({
        error: 'Insufficient text',
        message: 'Could not extract enough text from PDF',
        details: `Extracted only ${resumeText?.length || 0} characters. Please ensure the PDF contains readable text.`
      });
    }

    // Analyze with OpenRouter
    console.log('\n🤖 [AI ROUTE] Analyzing with OpenRouter API...');
    const analysis = await openrouterService.analyzeResume(resumeText);

    console.log(`✅ [AI ROUTE] Analysis complete`);
    console.log(`   Score: ${analysis.resume_score}/100`);
    console.log(`   Level: ${analysis.resume_level}`);

    res.json(analysis);

  } catch (error) {
    console.error('❌ [AI ROUTE] Unexpected error:', error.message);
    console.error(`   Stack: ${error.stack}`);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message,
      details: 'An unexpected error occurred during analysis'
    });
  }
});

/**
 * POST /api/ai/predict-resume
 * Analyze resume text using OpenRouter
 */
router.post('/predict-resume', async (req, res) => {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('📝 [AI ROUTE] Text Analysis');
    console.log('='.repeat(70));

    const { resumeText, targetRole } = req.body;

    // Validate input
    if (!resumeText || !resumeText.trim()) {
      console.error('❌ [AI ROUTE] No resume text provided');
      return res.status(400).json({
        error: 'No resume text',
        message: 'Please provide resume text'
      });
    }

    const trimmedText = resumeText.trim();
    
    if (trimmedText.length < 50) {
      console.error('❌ [AI ROUTE] Insufficient text provided');
      console.error(`   Text length: ${trimmedText.length} characters`);
      return res.status(400).json({
        error: 'Insufficient text',
        message: 'Resume text must be at least 50 characters',
        details: `Provided ${trimmedText.length} characters`
      });
    }

    console.log(`📏 [AI ROUTE] Text length: ${trimmedText.length} characters`);
    console.log(`🎯 [AI ROUTE] Target role: ${targetRole || 'Not specified'}`);

    // Analyze with OpenRouter
    console.log('\n🤖 [AI ROUTE] Analyzing with OpenRouter API...');
    const analysis = await openrouterService.analyzeResume(trimmedText, targetRole);

    console.log(`✅ [AI ROUTE] Analysis complete`);
    console.log(`   Score: ${analysis.resume_score}/100`);
    console.log(`   Level: ${analysis.resume_level}`);

    res.json(analysis);

  } catch (error) {
    console.error('❌ [AI ROUTE] Error:', error.message);
    console.error(`   Stack: ${error.stack}`);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message,
      details: 'An unexpected error occurred during analysis'
    });
  }
});

/**
 * GET /api/ai/health
 * Check if AI module is ready
 */
router.get('/health', (req, res) => {
  const isConfigured = openrouterService.isConfigured();

  res.json({
    status: isConfigured ? 'ready' : 'not_ready',
    api_configured: isConfigured,
    service: 'OpenRouter',
    message: isConfigured ? 'AI module ready for predictions' : 'OpenRouter API key not configured'
  });
});

/**
 * GET /api/ai/cache/stats
 * Get cache statistics
 */
router.get('/cache/stats', (req, res) => {
  const stats = openrouterService.getCacheStats();
  res.json({
    status: 'success',
    cache: stats,
    message: `Cache contains ${stats.size} analyses`
  });
});

/**
 * POST /api/ai/cache/clear
 * Clear all cached analyses
 */
router.post('/cache/clear', (req, res) => {
  openrouterService.clearCache();
  res.json({
    status: 'success',
    message: 'Cache cleared successfully'
  });
});

module.exports = router;
