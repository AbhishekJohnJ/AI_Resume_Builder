# Feature Extraction - Quick Start Guide

## What's New?

Your AI Analyzer now extracts and displays **6 numerical features** from resumes:

1. **GitHub_Score** (0-10) - GitHub activity level
2. **LinkedIn_Score** (0-10) - LinkedIn profile strength
3. **ATS_Score** (0-100) - Applicant Tracking System compatibility
4. **project_count** - Number of projects
5. **cert_count** - Number of certifications
6. **skill_count** - Number of skills

## How It Works

### Step 1: Upload or Paste Resume
- Click the dropzone to upload PDF/DOCX/TXT
- Or paste resume text directly
- (Optional) Enter target role

### Step 2: Click "Analyse Resume"
- System extracts numerical features
- Performs TF-IDF analysis
- Calls AI API for insights
- Compares against benchmarks

### Step 3: View Results
The results panel shows:

#### Numerical Features (NEW!)
A 3x2 grid displaying all 6 features with color coding:
```
GitHub Score: 5/10        LinkedIn Score: 7/10      ATS Score: 75/100
Projects: 3               Certifications: 2          Skills: 12
```

#### TF-IDF Metrics
- Total Tokens: Number of words/tokens
- Unique N-grams: Unique word combinations

#### Extracted Features
- Top Skills: Most important skills detected
- Experience Keywords: Key experience terms

#### Feature Quality
- Strengths: What's good about the resume
- Weaknesses: Areas needing improvement

#### Benchmark Comparison
How your features compare to industry standards

#### Improvement Roadmap
Prioritized tasks to improve your resume

## Feature Extraction Details

### GitHub_Score Calculation
- Detects GitHub links/profiles
- Estimates based on open-source contributions
- Range: 0-10

### LinkedIn_Score Calculation
- Detects LinkedIn profile links
- Estimates based on profile completeness
- Range: 0-10

### ATS_Score Calculation
```
ATS_Score = (skill_count × 10) + (project_count × 8) + (cert_count × 5) + (hasPortfolio ? 20 : 0)
```
- Range: 0-100
- Measures resume optimization for automated screening

### Counting Features
Features are counted by splitting comma-separated values:
- **project_count**: `len(Projects.split(","))`
- **cert_count**: `len(Certifications.split(","))`
- **skill_count**: `len(Skills.split(","))`

## Example Results

### Sample Resume 1: Junior Developer
```
GitHub_Score: 3/10
LinkedIn_Score: 5/10
ATS_Score: 55/100
project_count: 2
cert_count: 1
skill_count: 8
```
**Insights**: Good foundation, needs more projects and certifications

### Sample Resume 2: Senior Developer
```
GitHub_Score: 8/10
LinkedIn_Score: 9/10
ATS_Score: 92/100
project_count: 8
cert_count: 4
skill_count: 25
```
**Insights**: Excellent profile, strong across all metrics

## Benchmark Comparison

Your features are compared to industry benchmarks:

| Feature | Benchmark | Status |
|---------|-----------|--------|
| GitHub_Score | 5/10 | Above/Below |
| LinkedIn_Score | 6/10 | Above/Below |
| ATS_Score | 70/100 | Above/Below |
| project_count | 2.9 | Above/Below |
| cert_count | 1.8 | Above/Below |
| skill_count | 15 | Above/Below |

## Tips for Improvement

### Increase GitHub_Score
- Add GitHub profile link to resume
- Contribute to open-source projects
- Create public repositories

### Increase LinkedIn_Score
- Add LinkedIn profile link
- Complete LinkedIn profile
- Get endorsements and recommendations

### Increase ATS_Score
- Add more skills (use industry keywords)
- Include project descriptions
- Add relevant certifications
- Create portfolio website

### Increase project_count
- Add more projects to resume
- Include side projects
- Highlight hackathon projects

### Increase cert_count
- Add professional certifications
- Include online course certificates
- Add industry-specific certifications

### Increase skill_count
- List all relevant skills
- Use industry-standard terminology
- Include both technical and soft skills

## TF-IDF Analysis

The system uses TF-IDF (Term Frequency-Inverse Document Frequency) with:
- **max_features**: 500 (top 500 important terms)
- **ngram_range**: (1, 2) (single words and word pairs)

This extracts the most important terms from your resume.

## API Endpoint

**POST** `/api/ai/analyze-resume-tfidf`

Request:
```json
{
  "resumeText": "Your resume text here...",
  "targetRole": "Frontend Developer" (optional)
}
```

Response includes:
- `numericalFeatures` - All 6 features
- `tfidfMetrics` - Token and n-gram counts
- `extractedFeatures` - Top skills and keywords
- `featureQuality` - Strengths and weaknesses
- `benchmarkComparison` - Feature comparisons
- `improvementRoadmap` - Recommended tasks

## Troubleshooting

### Features showing 0
- Resume text may not contain the expected information
- Try adding more details to your resume
- Ensure proper formatting

### ATS_Score too low
- Add more skills to your resume
- Include project descriptions
- Add certifications
- Create a portfolio website

### GitHub/LinkedIn scores 0
- Add GitHub profile link to resume
- Add LinkedIn profile link to resume
- Ensure links are properly formatted

## Next Steps

1. **Analyze Your Resume** - Use the AI Analyzer to get your scores
2. **Review Weak Areas** - Check the "Areas to Improve" section
3. **Follow Roadmap** - Implement the suggested improvements
4. **Re-analyze** - Upload updated resume to track progress
5. **Compare** - See how your features improve over time

## Support

For issues or questions:
1. Check the error message in the UI
2. Ensure resume text is properly formatted
3. Try with a different resume format
4. Check browser console for detailed errors

---

**Status**: ✅ Feature extraction fully implemented and integrated
