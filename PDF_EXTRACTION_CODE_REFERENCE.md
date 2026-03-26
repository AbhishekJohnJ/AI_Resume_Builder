# PDF Extraction - Code Reference

## Corrected Backend Code

### 1. PDF Extractor Module (`server/utils/pdfExtractor.js`)

```javascript
/**
 * PDF Text Extractor
 * Extracts text from PDF files using pdf-parse
 */
const pdfParseModule = require('pdf-parse');

// Handle both default export and direct function export
const pdfParse = pdfParseModule.default || pdfParseModule;

console.log('📦 [PDF EXTRACTOR] Module loaded');
console.log(`   typeof pdfParse: ${typeof pdfParse}`);

class PDFExtractor {
  /**
   * Extract text from PDF buffer
   */
  static async extractText(file) {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      const { buffer, originalname } = file;
      
      if (!buffer) {
        throw new Error('No file buffer provided');
      }

      console.log(`\n📄 [PDF EXTRACTOR] Processing: ${originalname}`);
      console.log(`   Buffer size: ${buffer.length} bytes`);
      console.log(`   typeof pdfParse: ${typeof pdfParse}`);
      
      if (typeof pdfParse !== 'function') {
        throw new Error(`pdfParse is not a function, got: ${typeof pdfParse}`);
      }

      // Call pdfParse with buffer
      const result = await pdfParse(buffer);
      
      if (!result || !result.text) {
        throw new Error('No text extracted from PDF');
      }

      const text = result.text.trim();
      
      if (!text || text.length === 0) {
        throw new Error('Extracted text is empty');
      }

      console.log(`✅ [PDF EXTRACTOR] Success`);
      console.log(`   Pages: ${result.numpages}`);
      console.log(`   Text length: ${text.length} characters`);
      console.log(`   Preview: ${text.substring(0, 100)}...`);
      
      return {
        text: text,
        filename: originalname,
        pages: result.numpages || 0,
        length: text.length,
        preview: text.substring(0, 300)
      };
      
    } catch (error) {
      console.error(`❌ [PDF EXTRACTOR] Error: ${error.message}`);
      console.error(`   Stack: ${error.stack}`);
      throw new Error(`Failed to extract PDF: ${error.message}`);
    }
  }
}

module.exports = PDFExtractor;
```

**Key Points:**
- ✅ Handles both default and direct function exports
- ✅ Type checks pdfParse before calling
- ✅ Validates file and buffer existence
- ✅ Trims and validates extracted text
- ✅ Returns detailed extraction info
- ✅ Comprehensive error logging with stack traces

### 2. PDF Upload Route (`server/routes/aiRoutes.js`)

```javascript
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
```

**Key Points:**
- ✅ Validates file upload
- ✅ Logs file details (name, size, MIME type)
- ✅ Catches extraction errors with detailed messages
- ✅ Validates minimum text length (50 chars)
- ✅ Returns detailed error responses
- ✅ Logs stack traces for debugging

### 3. Text Analysis Route (`server/routes/aiRoutes.js`)

```javascript
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
```

**Key Points:**
- ✅ Validates text input
- ✅ Checks minimum text length
- ✅ Logs text length and target role
- ✅ Returns detailed error responses
- ✅ Logs stack traces for debugging

## Error Response Examples

### Success Response
```json
{
  "resume_score": 85,
  "resume_level": "Good",
  "summary": "Strong resume with good experience...",
  "strengths": ["..."],
  "weak_areas": ["..."],
  "suggestions": ["..."],
  "recommended_tasks": ["..."],
  "skills_identified": ["..."],
  "experience_level": "Mid-level",
  "ats_score": 82,
  "key_insights": ["..."]
}
```

### Error Response (No File)
```json
{
  "error": "No file uploaded",
  "message": "Please select a PDF file"
}
```

### Error Response (Extraction Failed)
```json
{
  "error": "PDF extraction failed",
  "message": "Failed to extract PDF: No text extracted from PDF",
  "details": "Could not extract text from the PDF file. Please ensure it is a valid PDF."
}
```

### Error Response (Insufficient Text)
```json
{
  "error": "Insufficient text",
  "message": "Could not extract enough text from PDF",
  "details": "Extracted only 25 characters. Please ensure the PDF contains readable text."
}
```

## Debugging Checklist

1. **Check pdf-parse is installed:**
   ```bash
   cd server
   npm list pdf-parse
   ```
   Should show: `pdf-parse@2.4.5`

2. **Check server logs for:**
   - `📦 [PDF EXTRACTOR] Module loaded` - Module loaded correctly
   - `typeof pdfParse: function` - pdfParse is callable
   - `✅ [PDF EXTRACTOR] Success` - Extraction worked

3. **If extraction fails:**
   - Check error message in server logs
   - Check PDF is valid and contains text
   - Check file size is under 10MB

4. **If API analysis fails:**
   - Check OpenRouter API key in .env
   - Check server logs for API error details
   - Check network tab in browser for response

## Status
✅ All PDF extraction issues fixed
✅ Comprehensive error handling implemented
✅ Debug logging added throughout
✅ Ready for production
