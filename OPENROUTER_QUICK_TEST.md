# OpenRouter Integration - Quick Test Guide

## Setup (1 Minute)

### 1. Verify API Key
```bash
cat server/.env | grep OPENROUTER_API_KEY
# Should show: OPENROUTER_API_KEY=sk-or-v1-...
```

### 2. Start Server
```bash
cd server
npm run dev
```

### 3. Verify Server Running
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"OK",...}
```

## Test 1: Resume Builder (2 Minutes)

### Steps
1. Open http://localhost:3000/resume-builder
2. Select a template
3. Enter prompt: `Full Stack Developer with 5 years experience in React, Node.js, and MongoDB. Worked at 2 startups. Have 3 GitHub projects.`
4. Click "Generate Resume"
5. Wait 2-5 seconds
6. Should see generated resume

### Expected Result
✅ Resume generated with:
- Name, title, email, phone
- Professional summary
- Experience section
- Skills list
- Education

### If It Fails
- Check server logs for errors
- Verify API key in .env
- Try simpler prompt
- Check browser console for errors

## Test 2: Portfolio Builder (2 Minutes)

### Steps
1. Open http://localhost:3000/portfolio
2. Enter prompt: `I'm a full stack developer with 3 projects: E-commerce platform, AI chat app, and DevOps dashboard. 5 years experience.`
3. Click "Generate Portfolio"
4. Wait 2-5 seconds
5. Should see generated portfolio

### Expected Result
✅ Portfolio generated with:
- Name, title, tagline
- About section
- Skills list
- Projects section
- Experience section

### If It Fails
- Check server logs for errors
- Verify API key in .env
- Try simpler prompt
- Check browser console for errors

## Test 3: AI Resume Analyzer (2 Minutes)

### Steps
1. Open http://localhost:3000/ai-analyser
2. Option A: Upload a PDF resume
   - Click upload
   - Select a PDF file
   - Wait 1-3 seconds
3. Option B: Paste text
   - Paste resume text
   - Click "Analyse Resume"
   - Wait 1-3 seconds
4. Should see analysis results

### Expected Result
✅ Analysis shows:
- Resume score (0-100)
- Resume level (Excellent/Good/Average/Needs Improvement)
- Strengths (3-5 items)
- Weak areas (3-5 items)
- Suggestions (4+ items)
- Recommended tasks (4+ items)
- Skills identified
- ATS score
- Key insights

### If It Fails
- Check server logs for errors
- Verify API key in .env
- Check PDF is valid (not image-based)
- Try pasting text instead
- Check browser console for errors

## Server Logs to Check

### Resume Builder Success
```
POST /api/ai/generate-resume
✅ Resume generated successfully
```

### Portfolio Builder Success
```
POST /api/ai/generate-portfolio
✅ Portfolio generated successfully
```

### AI Analyzer Success
```
POST /api/ai/upload-and-predict
✅ [PDF EXTRACTOR] Success
✅ [AI ROUTE] Analysis complete
```

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "OpenRouter API key not configured" | Check `server/.env` has OPENROUTER_API_KEY |
| "Failed to generate resume" | Try simpler prompt, check server logs |
| "Failed to generate portfolio" | Try simpler prompt, check server logs |
| "Failed to extract PDF" | Check PDF is valid, try pasting text instead |
| "AI did not return valid JSON" | Try rephrasing prompt, use simpler language |
| Blank page after clicking generate | Check browser console for errors |
| Server not responding | Restart: `npm run dev` |

## Performance Expectations

| Operation | Time |
|-----------|------|
| Generate resume | 2-5 seconds |
| Generate portfolio | 2-5 seconds |
| Analyze resume (PDF) | 1-3 seconds |
| Analyze resume (text) | 1-3 seconds |

## Success Checklist

- [ ] Resume Builder generates resume
- [ ] Portfolio Builder generates portfolio
- [ ] AI Analyzer accepts PDF upload
- [ ] AI Analyzer accepts text input
- [ ] All show results without errors
- [ ] Server logs show success messages
- [ ] No errors in browser console

## Next Steps

1. ✅ All tests passed → Ready for production
2. ❌ Some tests failed → Check troubleshooting section
3. ❌ All tests failed → Check API key and server logs

## Debug Commands

### Check API Key
```bash
echo $OPENROUTER_API_KEY
# Or
cat server/.env | grep OPENROUTER
```

### Check Server Logs
```bash
cd server
npm run dev 2>&1 | grep -i error
```

### Test API Directly
```bash
curl -X POST http://localhost:5000/api/ai/health
```

### Check Network Requests
1. Open browser DevTools (F12)
2. Go to Network tab
3. Generate resume/portfolio
4. Check request/response in Network tab
5. Look for errors in response

## Support

If tests fail:
1. Check server logs carefully
2. Verify API key is set
3. Try with simpler prompts
4. Check file formats
5. Restart server
6. Check browser console
7. Review error messages

## Status

After all tests pass:
✅ OpenRouter AI fully integrated
✅ Resume Builder working
✅ Portfolio Builder working
✅ AI Resume Analyzer working
✅ Ready for users
