# TF-IDF Integration Guide

## Overview

TF-IDF (Term Frequency-Inverse Document Frequency) vectorization has been integrated into your AI Analyzer for advanced resume feature extraction and analysis.

**Configuration**: `max_features=500, ngram_range=(1,2)`

## What is TF-IDF?

TF-IDF is a numerical statistic that reflects how important a word is to a document in a collection of documents. It helps identify the most relevant terms in a resume.

- **TF (Term Frequency)**: How often a term appears in the document
- **IDF (Inverse Document Frequency)**: How unique/important the term is across all documents
- **N-grams**: Combinations of 1-2 consecutive words (unigrams and bigrams)

## Files Added

### 1. TF-IDF Analyzer Module
**File**: `server/utils/tfidfAnalyzer.js`

A complete JavaScript implementation of TF-IDF vectorization with:
- Tokenization and n-gram generation
- Vocabulary building
- IDF calculation
- Vector transformation
- Feature extraction
- Cosine similarity calculation

### 2. New Backend Endpoint
**File**: `server/server.js`

**Endpoint**: `POST /api/ai/analyze-resume-tfidf`

Analyzes resumes using TF-IDF feature extraction with:
- Feature extraction (max 500 features)
- N-gram analysis (1-2 grams)
- Skill detection
- Experience keyword extraction
- Education and certification identification
- AI-enhanced analysis with TF-IDF insights

### 3. Frontend Service Method
**File**: `src/services/aiService.js`

**Method**: `analyzeResumeWithTFIDF(resumeText, targetRole)`

Calls the TF-IDF analysis endpoint from the frontend.

### 4. Updated AI Analyzer Component
**File**: `src/pages/AIAnalyser.jsx`

Now displays:
- TF-IDF analysis metrics
- Extracted features (skills, experience keywords, education, certifications)
- Feature density information
- Enhanced scoring based on feature analysis

## How It Works

### 1. Resume Input
User uploads or pastes resume text

### 2. TF-IDF Processing
```javascript
const tfidfAnalyzer = new TFIDFAnalyzer(500, [1, 2]);
const tfidfAnalysis = tfidfAnalyzer.analyzeResume(resumeText);
```

### 3. Feature Extraction
- Tokenizes resume text
- Generates 1-grams and 2-grams
- Calculates TF-IDF scores
- Extracts top 500 features
- Categorizes features (skills, experience, education, certifications)

### 4. Analysis
- Calculates feature density
- Scores resume based on feature coverage
- Identifies weak areas
- Generates recommendations

### 5. AI Enhancement
- Sends TF-IDF analysis to AI API
- AI provides context-aware suggestions
- Returns structured analysis

## API Endpoint

### Request
```bash
POST /api/ai/analyze-resume-tfidf
Content-Type: application/json

{
  "resumeText": "Your resume text here...",
  "targetRole": "Frontend Developer" (optional)
}
```

### Response
```json
{
  "resumeScore": 78,
  "resumeLevel": "Good",
  "atsScore": 70,
  "tfidfMetrics": {
    "totalTokens": 450,
    "uniqueNgrams": 320,
    "skillDensity": 12,
    "experienceDensity": 18,
    "educationDensity": 3,
    "certificationDensity": 2
  },
  "extractedFeatures": {
    "topSkills": ["python", "javascript", "react", "node.js", "sql"],
    "experienceKeywords": ["developed", "implemented", "designed", "managed"],
    "education": ["bachelor", "computer science"],
    "certifications": ["aws certified", "scrum master"]
  },
  "weakAreas": ["Limited technical skills mentioned"],
  "suggestions": [
    "Highlight more technical skills and technologies",
    "Use action verbs to describe experience",
    "Include relevant certifications"
  ],
  "recommendedTasks": [
    "Add more specific technical skills",
    "Rewrite experience with quantifiable metrics",
    "Include relevant certifications"
  ],
  "improvementRoadmap": [
    {
      "priority": "High",
      "task": "Expand technical skills section",
      "estimatedTime": "1 week",
      "impact": "High"
    }
  ],
  "strengths": ["Good technical skill coverage"],
  "keyInsights": [
    "Resume contains 450 tokens with 320 unique n-grams",
    "Detected 12 technical skills, 18 experience keywords",
    "Focus on improving feature density for better ATS matching"
  ]
}
```

## TF-IDF Metrics Explained

### Total Tokens
Total number of words in the resume after tokenization.
- **Higher is better**: More content to analyze
- **Typical range**: 200-1000 tokens

### Unique N-grams
Number of unique 1-grams and 2-grams extracted.
- **Higher is better**: More diverse vocabulary
- **Typical range**: 150-500 n-grams

### Skill Density
Number of technical skills detected using TF-IDF.
- **Target**: 8-15 skills
- **Low**: Add more technical skills
- **High**: Good technical coverage

### Experience Density
Number of action verbs and experience keywords detected.
- **Target**: 10-20 keywords
- **Low**: Use more action verbs
- **High**: Good experience description

### Education Density
Number of education-related terms detected.
- **Target**: 2-5 terms
- **Low**: Add education details
- **High**: Good education coverage

### Certification Density
Number of certification-related terms detected.
- **Target**: 1-3 certifications
- **Low**: Add relevant certifications
- **High**: Good certification coverage

## Feature Categories

### Skills
Technical skills extracted from resume:
- Programming languages (Python, JavaScript, Java, etc.)
- Frameworks (React, Node.js, Django, etc.)
- Tools (Git, Docker, Kubernetes, etc.)
- Databases (SQL, MongoDB, PostgreSQL, etc.)
- Cloud platforms (AWS, Azure, GCP, etc.)

### Experience Keywords
Action verbs and experience-related terms:
- Developed, Implemented, Designed, Managed
- Created, Built, Deployed, Maintained
- Optimized, Improved, Enhanced, Architected
- Led, Managed, Coordinated, Collaborated

### Education
Education-related terms:
- Bachelor, Master, PhD, Degree
- University, College, School, Institute
- GPA, Honors, Distinction

### Certifications
Certification-related terms:
- AWS, Azure, GCP, Cisco, Oracle
- Scrum, PMP, ITIL, CompTIA
- Coursera, Udacity, Pluralsight

## Scoring Algorithm

```
Base Score: 50

+ Skills (up to 20 points)
  - 3 points per skill detected (max 20)

+ Experience (up to 15 points)
  - 2 points per experience keyword (max 15)

+ Education (up to 10 points)
  - 2 points per education term (max 10)

+ Certifications (up to 5 points)
  - 2 points per certification (max 5)

= Final Score (capped at 100)
```

## Resume Levels

| Score | Level | Description |
|-------|-------|-------------|
| 90-100 | Excellent | Comprehensive feature coverage |
| 70-89 | Good | Strong feature coverage |
| 50-69 | Average | Moderate feature coverage |
| <50 | Needs Improvement | Limited feature coverage |

## Usage Example

### Frontend
```javascript
import { aiService } from '../services/aiService';

const result = await aiService.analyzeResumeWithTFIDF(
  resumeText,
  'Frontend Developer'
);

console.log('TF-IDF Score:', result.resumeScore);
console.log('Extracted Skills:', result.extractedFeatures.topSkills);
console.log('Metrics:', result.tfidfMetrics);
```

### Backend
```javascript
const TFIDFAnalyzer = require('./utils/tfidfAnalyzer');

const analyzer = new TFIDFAnalyzer(500, [1, 2]);
const analysis = analyzer.analyzeResume(resumeText);

console.log('Total Tokens:', analysis.totalTokens);
console.log('Unique N-grams:', analysis.uniqueNgrams);
console.log('Skills:', analysis.categorizedTerms.skills);
```

## Benefits

✅ **Accurate Feature Extraction**: Identifies key terms using statistical methods
✅ **Skill Detection**: Automatically detects technical skills
✅ **Experience Analysis**: Identifies action verbs and experience keywords
✅ **ATS Optimization**: Helps improve resume for Applicant Tracking Systems
✅ **Objective Scoring**: Data-driven scoring based on feature density
✅ **Actionable Insights**: Specific recommendations based on missing features
✅ **Scalable**: Handles resumes of any length
✅ **Fast**: JavaScript implementation runs on server

## Limitations

- Requires English language resumes
- May not detect industry-specific jargon
- Depends on resume formatting and structure
- Works best with well-formatted resumes

## Future Enhancements

1. **Multi-language Support**: Add support for other languages
2. **Custom Vocabulary**: Allow users to define custom skill lists
3. **Comparison**: Compare resume against job descriptions
4. **Trending Skills**: Identify trending skills in the industry
5. **Skill Gap Analysis**: Detailed skill gap analysis
6. **Resume Optimization**: Suggest specific improvements

## Testing

### Test with Sample Resume
```bash
curl -X POST http://localhost:5000/api/ai/analyze-resume-tfidf \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "Senior Frontend Developer with 5 years experience in React, Node.js, and AWS...",
    "targetRole": "Frontend Developer"
  }'
```

### Expected Output
- Score: 75-85 (Good)
- Skills detected: 8-12
- Experience keywords: 12-18
- Extracted features: Relevant skills and keywords

## Configuration

### Modify TF-IDF Parameters

In `server/server.js`:
```javascript
// Change max_features and ngram_range
const tfidfAnalyzer = new TFIDFAnalyzer(500, [1, 2]);
//                                       ^^^  ^^^^^^
//                                    max_features  ngram_range
```

### Adjust Scoring Weights

In `server/server.js`:
```javascript
let tfidfScore = 50; // Base score
tfidfScore += Math.min(skillCount * 3, 20); // Adjust multiplier
tfidfScore += Math.min(experienceCount * 2, 15); // Adjust multiplier
```

## Troubleshooting

### Issue: Low scores for good resumes
- Check if resume has enough technical skills
- Verify resume formatting
- Add more specific keywords

### Issue: Unrecognized skills
- Skills must match the predefined skill list
- Add custom skills to the analyzer
- Use standard skill names

### Issue: Slow analysis
- Large resumes may take longer
- Reduce max_features if needed
- Check server performance

## Support

For issues or questions:
1. Check the TF-IDF analyzer implementation
2. Review extracted features
3. Check server logs for errors
4. Verify resume formatting

---

**TF-IDF Integration Complete!** 🎉

Your AI Analyzer now uses advanced feature extraction for better resume analysis.
