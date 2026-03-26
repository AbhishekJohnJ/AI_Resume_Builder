# PyMuPDF Quick Start

## What Changed?
- ❌ Removed: Node.js `pdf-parse` library
- ✅ Added: Python `PyMuPDF (fitz)` for better PDF extraction

## Installation (2 Steps)

### Step 1: Install Python Package
```bash
pip install pymupdf
```

### Step 2: Install Node Dependencies
```bash
cd server
npm install
```

## Verify Installation

### Check Python
```bash
python -c "import fitz; print('PyMuPDF installed ✅')"
```

### Check Node
```bash
cd server
npm list | grep pdf
# Should NOT show pdf-parse
```

## Start Server
```bash
cd server
npm run dev
```

## Test It
1. Go to AI Analyser page
2. Upload a PDF resume
3. Check server terminal for logs
4. Should see: `✅ [PDF EXTRACTOR] Success`

## Files Created/Updated

| File | Status | Purpose |
|------|--------|---------|
| `ai/pdf_extractor.py` | ✨ NEW | Python PDF extraction |
| `server/utils/pdfExtractor.js` | 🔄 UPDATED | Node.js wrapper |
| `server/routes/aiRoutes.js` | 🔄 UPDATED | Better error handling |
| `server/package.json` | 🔄 UPDATED | Removed pdf-parse |
| `server/server.js` | 🔄 UPDATED | Removed pdf-parse import |

## How It Works

```
PDF Upload
    ↓
Node.js Backend
    ↓
Create Temp File
    ↓
Spawn Python Process
    ↓
PyMuPDF Extracts Text
    ↓
Return JSON
    ↓
Clean Up Temp File
    ↓
Send to OpenRouter API
    ↓
Resume Analysis
```

## Debug Output

When you upload a PDF, server terminal shows:

```
📄 [PDF EXTRACTOR] Processing: resume.pdf
   Buffer size: 125000 bytes
🐍 [PDF EXTRACTOR] Running Python extraction
   [PYTHON] 📖 [PDF EXTRACTOR] Pages: 2
   [PYTHON] ✅ [PDF EXTRACTOR] Success
   [PYTHON]    Total text: 3500 characters
✅ [PDF EXTRACTOR] Success
   Pages: 2
   Text length: 3500 characters
```

## Troubleshooting

| Error | Solution |
|-------|----------|
| `python: command not found` | Install Python or use `python3` |
| `ModuleNotFoundError: fitz` | Run `pip install pymupdf` |
| `No text extracted` | PDF might be image-based or corrupted |
| `Temp file not found` | Check disk space and permissions |

## API Endpoints

### Upload PDF
```bash
POST /api/ai/upload-and-predict
Content-Type: multipart/form-data

file: <PDF file>
```

### Analyze Text
```bash
POST /api/ai/predict-resume
Content-Type: application/json

{
  "resumeText": "John Doe...",
  "targetRole": "Frontend Developer"
}
```

### Health Check
```bash
GET /api/ai/health
```

## Status
✅ Ready to use
✅ All dependencies installed
✅ PDF extraction working
✅ Error handling complete
