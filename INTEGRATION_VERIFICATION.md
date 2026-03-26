# OpenRouter Integration - Verification Checklist

## Pre-Integration Verification

### API Key Configuration
- [ ] `server/.env` contains `OPENROUTER_API_KEY`
- [ ] API key starts with `sk-or-v1-`
- [ ] API key is not empty
- [ ] API key is valid (test with curl)

### Server Setup
- [ ] Node.js installed (v14+)
- [ ] Python installed (v3.7+)
- [ ] PyMuPDF installed: `pip install pymupdf`
- [ ] Dependencies installed: `cd server && npm install`

### File Structure
- [ ] `server/server.js` exists
- [ ] `server/routes/aiRoutes.js` exists
- [ ] `server/.env` exists
- [ ] `ai/pdf_extractor.py` exists
- [ ] `server/utils/pdfExtractor.js` exists

## Integration Verification

### Code Changes
- [ ] `server/server.js` line ~508: `const apiKey = process.env.OPENROUTER_API_KEY;`
- [ ] `server/server.js` line ~633: `model: 'gpt-3.5-turbo'`
- [ ] `server/server.js` line ~685: `const apiKey = process.env.OPENROUTER_API_KEY;`
- [ ] `server/server.js` line ~857: `model: 'gpt-3.5-turbo'`
- [ ] API key validation added to both endpoints
- [ ] OpenRouter headers added (HTTP-Referer, X-Title)

### Verify Changes
```bash
# Check for OPENROUTER_API_KEY usage
grep -n "OPENROUTER_API_KEY" server/server.js
# Should show 2 results (generate-resume and generate-portfolio)

# Check for gpt-3.5-turbo model
grep -n "gpt-3.5-turbo" server/server.js
# Should show 2 results (generate-resume and generate-portfolio)
```

## Runtime Verification

### Start Server
```bash
cd server
npm run dev
```

### Check Server Startup
- [ ] No errors during startup
- [ ] Server listening on port 5000
- [ ] No "API key not configured" errors
- [ ] No "ModuleNotFoundError" errors

### Test Health Endpoint
```bash
curl http://localhost:5000/api/health
```
- [ ] Returns: `{"status":"OK",...}`
- [ ] No errors

### Test AI Health Endpoint
```bash
curl http://localhost:5000/api/ai/health
```
- [ ] Returns: `{"status":"ready",...}`
- [ ] Shows: `"api_configured": true`

## Functional Verification

### Resume Builder Test
1. Open http://localhost:3000/resume-builder
2. Select a template
3. Enter prompt: "Full Stack Developer with 5 years experience"
4. Click "Generate Resume"
5. Verify:
   - [ ] No errors in browser console
   - [ ] No errors in server logs
   - [ ] Resume generates in 2-5 seconds
   - [ ] Resume contains name, title, experience, skills
   - [ ] Can download as PDF
   - [ ] Can save to database

### Portfolio Builder Test
1. Open http://localhost:3000/portfolio
2. Enter prompt: "Full Stack Developer with 3 projects"
3. Click "Generate Portfolio"
4. Verify:
   - [ ] No errors in browser console
   - [ ] No errors in server logs
   - [ ] Portfolio generates in 2-5 seconds
   - [ ] Portfolio contains name, projects, experience
   - [ ] Can export code
   - [ ] Can save to database

### AI Resume Analyzer Test
1. Open http://localhost:3000/ai-analyser
2. Test PDF upload:
   - [ ] Upload a PDF resume
   - [ ] No errors in browser console
   - [ ] No errors in server logs
   - [ ] Analysis completes in 1-3 seconds
   - [ ] Shows score, level, suggestions
3. Test text input:
   - [ ] Paste resume text
   - [ ] No errors in browser console
   - [ ] No errors in server logs
   - [ ] Analysis completes in 1-3 seconds
   - [ ] Shows score, level, suggestions

## Error Handling Verification

### Test Missing API Key
1. Temporarily remove `OPENROUTER_API_KEY` from `.env`
2. Restart server
3. Try to generate resume
4. Verify:
   - [ ] Shows error: "OpenRouter API key not configured"
   - [ ] No crash
   - [ ] Graceful error handling

### Test Invalid Prompt
1. Try to generate resume with empty prompt
2. Verify:
   - [ ] Shows error: "Prompt or at least one file is required"
   - [ ] No crash

### Test Invalid PDF
1. Try to upload invalid/corrupted PDF
2. Verify:
   - [ ] Shows error message
   - [ ] No crash
   - [ ] Server continues working

## Performance Verification

### Resume Generation
- [ ] Generates in 2-5 seconds
- [ ] No memory leaks
- [ ] Server remains responsive

### Portfolio Generation
- [ ] Generates in 2-5 seconds
- [ ] No memory leaks
- [ ] Server remains responsive

### Resume Analysis
- [ ] Analyzes in 1-3 seconds
- [ ] PDF extraction < 2 seconds
- [ ] No memory leaks
- [ ] Server remains responsive

## Security Verification

### API Key Security
- [ ] API key not exposed in frontend
- [ ] API key not logged in console
- [ ] API key only in `.env` file
- [ ] `.env` file in `.gitignore`

### Input Validation
- [ ] Prompts validated
- [ ] File uploads validated
- [ ] File size limited to 10MB
- [ ] Only PDF files accepted for analyzer

### Error Messages
- [ ] Error messages don't expose sensitive info
- [ ] Error messages are user-friendly
- [ ] Stack traces not shown to users

## Database Verification

### Resume Saving
- [ ] Generated resume saves to database
- [ ] Can retrieve saved resume
- [ ] Can delete saved resume

### Portfolio Saving
- [ ] Generated portfolio saves to database
- [ ] Can retrieve saved portfolio
- [ ] Can delete saved portfolio

## Browser Console Verification

### No Errors
- [ ] Open DevTools (F12)
- [ ] Go to Console tab
- [ ] Generate resume/portfolio
- [ ] Verify: No red errors
- [ ] Verify: No warnings about API

### Network Tab
- [ ] Open DevTools (F12)
- [ ] Go to Network tab
- [ ] Generate resume/portfolio
- [ ] Verify: Request to `/api/ai/generate-resume` or `/api/ai/generate-portfolio`
- [ ] Verify: Response status 200
- [ ] Verify: Response contains valid JSON

## Server Logs Verification

### Resume Builder Logs
```
POST /api/ai/generate-resume
✅ Resume generated successfully
```

### Portfolio Builder Logs
```
POST /api/ai/generate-portfolio
✅ Portfolio generated successfully
```

### AI Analyzer Logs
```
POST /api/ai/upload-and-predict
✅ [PDF EXTRACTOR] Success
✅ [AI ROUTE] Analysis complete
```

## Final Checklist

### All Tests Passed?
- [ ] API key configured
- [ ] Server starts without errors
- [ ] Health endpoints work
- [ ] Resume Builder generates resume
- [ ] Portfolio Builder generates portfolio
- [ ] AI Analyzer accepts PDF
- [ ] AI Analyzer accepts text
- [ ] All show results without errors
- [ ] No errors in browser console
- [ ] No errors in server logs
- [ ] Performance acceptable
- [ ] Error handling works
- [ ] Security verified
- [ ] Database saving works

## Status

### If All Checks Pass ✅
- Integration is complete
- Ready for production
- Ready for user testing
- Ready to deploy

### If Some Checks Fail ❌
1. Review the failed check
2. Check server logs for errors
3. Check browser console for errors
4. Review troubleshooting section
5. Restart server
6. Try again

## Troubleshooting

### Common Issues

| Issue | Check |
|-------|-------|
| "API key not configured" | Verify `OPENROUTER_API_KEY` in `.env` |
| "Failed to generate" | Check server logs, try simpler prompt |
| "Failed to extract PDF" | Check PDF is valid, try text instead |
| Blank page | Check browser console, check server logs |
| Slow response | Check network, check server load |
| No results | Check API key, check server logs |

### Debug Commands

```bash
# Check API key
cat server/.env | grep OPENROUTER_API_KEY

# Check server logs
npm run dev 2>&1 | grep -i error

# Test API directly
curl http://localhost:5000/api/ai/health

# Check Python
python -c "import fitz; print('OK')"
```

## Sign-Off

- [ ] All verification checks completed
- [ ] All tests passed
- [ ] Integration verified
- [ ] Ready for production
- [ ] Date: ___________
- [ ] Verified by: ___________

## Next Steps

1. ✅ Complete all verification checks
2. ✅ Fix any failing checks
3. ✅ Deploy to production
4. ✅ Monitor in production
5. ✅ Gather user feedback
6. ✅ Optimize if needed

## Support

For issues during verification:
1. Check this checklist
2. Review troubleshooting section
3. Check server logs
4. Check browser console
5. Review documentation files
6. Restart server and try again
