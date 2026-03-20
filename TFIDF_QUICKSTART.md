# TF-IDF Quick Start Guide

## What's New?

Your AI Analyzer now uses **TF-IDF (Term Frequency-Inverse Document Frequency)** vectorization for advanced resume analysis.

**Configuration**: `max_features=500, ngram_range=(1,2)`

## Key Features

✅ **Automatic Skill Detection** - Identifies technical skills using TF-IDF
✅ **Experience Analysis** - Extracts action verbs and experience keywords
✅ **Feature Metrics** - Shows detailed analysis metrics
✅ **Better Scoring** - Data-driven scoring based on feature density
✅ **Actionable Insights** - Specific recommendations based on analysis

## How to Use

### 1. Start the Application
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
npm run dev
```

### 2. Go to AI Analyzer
- Open http://localhost:5173
- Click "AI Analyser"

### 3. Upload Resume
- Upload PDF, DOCX, or TXT
- Or paste resume text
- Click "Analyse Resume"

### 4. View TF-IDF Analysis

You'll see:

#### TF-IDF Analysis Metrics
```
Total Tokens: 450
Unique N-grams: 320
Skills Detected: 12
Experience Keywords: 18
```

#### Extracted Features
```
Top Skills:
- python
- javascript
- react
- node.js
- sql

Experience Keywords:
- developed
- implemented
- designed
- managed
```

#### Score & Recommendations
```
Score: 78 / 100
Resume Level: Good
ATS Score: 70

Weak Areas:
- Limited technical skills mentioned

Suggestions:
- Highlight more technical skills
- Use action verbs to describe experience
- Include relevant certifications

Improvement Roadmap:
1. [High] Expand technical skills section (1 week)
2. [High] Add quantifiable achievements (1 week)
3. [Medium] Include relevant certifications (2 weeks)
```

## Understanding the Metrics

### Total Tokens
Number of words in your resume
- **Good**: 300-800 tokens
- **Too low**: Add more content
- **Too high**: Consider condensing

### Unique N-grams
Number of unique word combinations
- **Good**: 200-400 n-grams
- **Low**: Use more varied vocabulary
- **High**: Good vocabulary diversity

### Skills Detected
Number of technical skills found
- **Target**: 8-15 skills
- **Low**: Add more technical skills
- **High**: Good technical coverage

### Experience Keywords
Number of action verbs found
- **Target**: 10-20 keywords
- **Low**: Use more action verbs
- **High**: Good experience description

## Example Analysis

### Before TF-IDF
```
Score: / 100
Generic suggestions
No feature analysis
```

### After TF-IDF
```
Score: 78 / 100
Resume Level: Good
ATS Score: 70

TF-IDF Metrics:
- Total Tokens: 450
- Unique N-grams: 320
- Skills: 12
- Experience: 18

Extracted Features:
- Top Skills: python, javascript, react, node.js, sql
- Experience: developed, implemented, designed, managed

Recommendations:
- Expand technical skills section
- Add quantifiable achievements
- Include relevant certifications
```

## Tips for Better Scores

### 1. Add More Technical Skills
```
❌ "Experienced in web development"
✅ "Proficient in Python, JavaScript, React, Node.js, SQL, AWS"
```

### 2. Use Action Verbs
```
❌ "Responsible for project management"
✅ "Led cross-functional team of 5 developers"
```

### 3. Include Certifications
```
❌ "Have some certifications"
✅ "AWS Certified Solutions Architect, Scrum Master Certified"
```

### 4. Quantify Achievements
```
❌ "Improved performance"
✅ "Improved API response time by 40%, reducing load time from 2s to 1.2s"
```

### 5. Use Industry Keywords
```
❌ "Good at programming"
✅ "Expert in microservices architecture, CI/CD pipelines, Docker, Kubernetes"
```

## Skill Categories Detected

### Programming Languages
Python, JavaScript, Java, C++, C#, Go, Rust, Ruby, PHP, Swift, Kotlin, Scala, R, MATLAB

### Frameworks & Libraries
React, Node.js, Django, Flask, Angular, Vue, Express, Spring, Laravel, Rails

### Databases
SQL, MongoDB, PostgreSQL, MySQL, Oracle, Firebase, Redis, Elasticsearch

### Cloud & DevOps
AWS, Azure, GCP, Docker, Kubernetes, CI/CD, Jenkins, GitLab, GitHub

### Tools & Platforms
Git, Jira, Agile, Scrum, Linux, Windows, macOS, iOS, Android

## Scoring Breakdown

```
Base Score: 50 points

+ Skills (up to 20 points)
  Example: 12 skills × 3 = 36 → capped at 20

+ Experience (up to 15 points)
  Example: 18 keywords × 2 = 36 → capped at 15

+ Education (up to 10 points)
  Example: 3 terms × 2 = 6

+ Certifications (up to 5 points)
  Example: 2 certs × 2 = 4

= Final Score: 50 + 20 + 15 + 6 + 4 = 95 (Excellent)
```

## Resume Levels

| Score | Level | What It Means |
|-------|-------|--------------|
| 90-100 | Excellent | Comprehensive feature coverage |
| 70-89 | Good | Strong feature coverage |
| 50-69 | Average | Moderate feature coverage |
| <50 | Needs Improvement | Limited feature coverage |

## Common Issues & Solutions

### Issue: Low score despite good resume
**Solution**: 
- Add more specific technical skills
- Use standard skill names (e.g., "React" not "ReactJS")
- Include action verbs in experience descriptions

### Issue: Skills not detected
**Solution**:
- Use exact skill names (e.g., "Python" not "python programming")
- Add skills in a dedicated skills section
- Use industry-standard terminology

### Issue: Experience keywords not found
**Solution**:
- Use action verbs (developed, implemented, designed, etc.)
- Describe achievements with specific metrics
- Use past tense for previous roles

## API Usage

### JavaScript/Frontend
```javascript
const result = await aiService.analyzeResumeWithTFIDF(
  resumeText,
  'Frontend Developer'
);

console.log('Score:', result.resumeScore);
console.log('Skills:', result.extractedFeatures.topSkills);
console.log('Metrics:', result.tfidfMetrics);
```

### cURL
```bash
curl -X POST http://localhost:5000/api/ai/analyze-resume-tfidf \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "Your resume text...",
    "targetRole": "Frontend Developer"
  }'
```

## Next Steps

1. **Test with your resume** - Upload and see the analysis
2. **Follow recommendations** - Implement suggested improvements
3. **Re-analyze** - Upload updated resume to track progress
4. **Share feedback** - Let us know how it helps!

## Files Added

- `server/utils/tfidfAnalyzer.js` - TF-IDF implementation
- `server/server.js` - New `/api/ai/analyze-resume-tfidf` endpoint
- `src/services/aiService.js` - Frontend service method
- `src/pages/AIAnalyser.jsx` - Updated UI with TF-IDF metrics

## Documentation

- `TFIDF_INTEGRATION.md` - Complete technical documentation
- `TFIDF_QUICKSTART.md` - This guide

---

**Ready to analyze your resume with TF-IDF!** 🚀

Go to AI Analyser and upload your resume to see the advanced analysis in action.
