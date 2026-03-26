# PyMuPDF Setup Checklist

## Before You Start
- [ ] Python 3.7+ installed
- [ ] Node.js 14+ installed
- [ ] Internet connection (for pip install)
- [ ] Disk space available (at least 500MB)

## Step 1: Install Python PyMuPDF
```bash
pip install pymupdf
```
- [ ] Command runs without errors
- [ ] Verify: `python -c "import fitz; print('OK')"`

## Step 2: Install Node Dependencies
```bash
cd server
npm install
```
- [ ] Command runs without errors
- [ ] Check: `npm list | grep pdf` (should be empty)

## Step 3: Verify Files
- [ ] `ai/pdf_extractor.py` exists
- [ ] `server/utils/pdfExtractor.js` exists
- [ ] `server/routes/aiRoutes.js` updated
- [ ] `server/package.json` updated (no pdf-parse)
- [ ] `server/server.js` updated (no pdf-parse import)

## Step 4: Start Server
```bash
cd server
npm run dev
```
- [ ] Server starts without errors
- [ ] No "pdf-parse" errors in logs
- [ ] No "ModuleNotFoundError: fitz" errors

## Step 5: Test Health Endpoint
```bash
curl http://localhost:5000/api/ai/health
```
- [ ] Returns: `{"status":"ready",...}`
- [ ] No errors in response

## Step 6: Test PDF Upload
1. Go to http://localhost:3000/ai-analyser
2. Upload a PDF resume
3. Check server terminal for logs
- [ ] See: `📄 [PDF EXTRACTOR] Processing`
- [ ] See: `✅ [PDF EXTRACTOR] Success`
- [ ] See: `✅ [AI ROUTE] Analysis complete`
- [ ] Results displayed in browser

## Step 7: Verify Temp Files Cleaned Up
```bash
# Linux/Mac
ls /tmp/resume_* 2>/dev/null | wc -l

# Windows
dir %TEMP%\resume_* 2>nul | find /c "resume_"
```
- [ ] Should return 0 (no orphaned files)

## Step 8: Test Error Handling
1. Upload invalid/corrupted PDF
- [ ] See error message in browser
- [ ] See error in server logs
- [ ] No crash or hang

2. Paste text directly
- [ ] Works without PDF
- [ ] Returns analysis

## Step 9: Monitor Performance
Upload a 2-page resume
- [ ] Extraction time: < 2 seconds
- [ ] No memory leaks
- [ ] Temp file cleaned up

## Step 10: Final Verification
- [ ] All tests passed
- [ ] No errors in server logs
- [ ] No errors in browser console
- [ ] PDF extraction working
- [ ] Analysis results correct
- [ ] Temp files cleaned up

## Troubleshooting

### If Python not found
```bash
# Check installation
python --version

# Or use python3
python3 -c "import fitz; print('OK')"
```

### If PyMuPDF not installed
```bash
pip install pymupdf
pip list | grep -i pymupdf
```

### If Node dependencies fail
```bash
cd server
rm -rf node_modules package-lock.json
npm install
```

### If server won't start
```bash
# Check for port conflicts
lsof -i :5000  # Linux/Mac
netstat -ano | findstr :5000  # Windows

# Check logs for errors
npm run dev 2>&1 | head -50
```

### If PDF extraction fails
1. Check server logs for specific error
2. Verify PDF is valid (open in Adobe Reader)
3. Check temp directory exists and is writable
4. Check disk space: `df -h` (Linux/Mac)

## Success Indicators

✅ All checks passed
✅ Server running without errors
✅ PDF uploads work
✅ Analysis results displayed
✅ Temp files cleaned up
✅ No errors in logs
✅ Performance acceptable

## Next Steps

1. Deploy to production
2. Monitor logs for errors
3. Test with various PDFs
4. Gather user feedback
5. Optimize if needed

## Support

If issues persist:
1. Check all documentation files
2. Review server terminal logs carefully
3. Verify all installation steps
4. Check file permissions
5. Check disk space
6. Try with different PDF files
