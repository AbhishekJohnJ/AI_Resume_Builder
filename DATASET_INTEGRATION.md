# Dataset Integration Guide

## Overview

The AI Analyzer has been enhanced with a comprehensive training dataset of **500 synthetic resume records** from `resume-ai-training-dataset-500.xlsx`. This dataset provides benchmarking, scoring calibration, and intelligent recommendations for resume analysis.

## Dataset Details

### File Location
- **Primary**: `dataset/resume-dataset-metadata.json`
- **Source**: `resume-ai-training-dataset-500.xlsx` (500 synthetic records)

### Dataset Schema (21 Fields)

| Field | Type | Description |
|-------|------|-------------|
| Candidate_ID | String | Unique identifier (RSM0001-RSM0500) |
| Name | String | Candidate name |
| Course | String | Educational background (CSE, ECE, EEE, BCA, MCA, DS, IT, AIML, Cyber Security) |
| Target_Domain | String | Career target domain |
| Skills | String | Semicolon-separated technical skills |
| Projects_Count | Integer | Number of projects completed |
| Projects | String | Comma-separated project names |
| Certifications_Count | Integer | Number of certifications |
| Certifications | String | Comma-separated certification names |
| GitHub_Activity_Score | Integer | 0-10 scale |
| LinkedIn_Activity_Score | Integer | 0-10 scale |
| Internships_Count | Integer | Number of internships |
| Portfolio_Website | String | Yes/No |
| DSA_Score | Integer | 0-10 scale |
| Open_Source_Contributions | Integer | 0-5 scale |
| ATS_Score | Integer | 0-100 scale |
| Resume_Score | Integer | 0-100 scale |
| Resume_Level | String | Needs Improvement \| Average \| Good \| Excellent |
| Weak_Areas | String | Pipe-separated weak areas |
| Suggestions | String | Pipe-separated actionable suggestions |
| Recommended_Tasks | String | Pipe-separated recommended tasks |

### Target Domains (7)
1. Web Development
2. Data Science
3. Cloud/DevOps
4. AI/ML
5. Mobile Development
6. IoT
7. Cyber Security

### Resume Score Calibration

| Level | Score Range | Frequency |
|-------|-------------|-----------|
| Excellent | 90-100 | Most common |
| Good | 70-89 | Common |
| Average | 50-69 | Moderate |
| Needs Improvement | <50 | Less common |

## API Endpoints

### 1. Get Dataset Metadata
```
GET /api/dataset/metadata
```
Returns dataset information and schema.

**Response:**
```json
{
  "name": "AI Resume Analyzer Training Dataset",
  "version": "1.0",
  "records": 500,
  "fields": 21,
  "description": "500 synthetic resume records..."
}
```

### 2. Get Dataset Statistics
```
GET /api/dataset/stats
```
Returns aggregated statistics and common patterns.

**Response:**
```json
{
  "totalRecords": 500,
  "targetDomains": [...],
  "resumeLevels": {...},
  "commonWeakAreas": [...],
  "commonSuggestions": [...]
}
```

### 3. Analyze Resume with Dataset Context
```
POST /api/ai/analyze-resume-with-dataset
```
Analyzes a resume using dataset-informed AI analysis.

**Request:**
```json
{
  "resumeText": "string",
  "targetRole": "string (optional)"
}
```

**Response:**
```json
{
  "resumeScore": 0-100,
  "resumeLevel": "Excellent|Good|Average|Needs Improvement",
  "atsScore": 0-100,
  "weakAreas": ["area1", "area2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "recommendedTasks": ["task1", "task2"],
  "datasetComparison": {
    "percentileRank": "X%",
    "benchmarkScore": 0-100,
    "comparison": "description"
  },
  "improvementRoadmap": [
    {
      "priority": "High|Medium|Low",
      "task": "description",
      "estimatedTime": "X weeks",
      "impact": "High|Medium"
    }
  ],
  "strengths": ["strength1", "strength2"],
  "keyInsights": ["insight1", "insight2"]
}
```

### 4. Compare Resume to Dataset Benchmarks
```
POST /api/ai/compare-to-dataset
```
Compares a resume's metrics against domain-specific benchmarks.

**Request:**
```json
{
  "resumeScore": 0-100,
  "targetDomain": "string",
  "skills": ["skill1", "skill2"],
  "projects": 0-5,
  "certifications": 0-5,
  "internships": 0-5,
  "githubActivity": 0-10,
  "linkedinActivity": 0-10,
  "hasPortfolio": true|false
}
```

**Response:**
```json
{
  "resumeScore": 0-100,
  "targetDomain": "string",
  "benchmarkScore": 0-100,
  "percentileRank": 0-100,
  "scoreGap": -50 to 50,
  "metrics": {
    "projects": { "current": 0, "benchmark": 0 },
    "certifications": { "current": 0, "benchmark": 0 },
    ...
  },
  "analysis": "string",
  "recommendations": ["rec1", "rec2"]
}
```

## Common Weak Areas (from Dataset)

1. **No internships** (30% of candidates)
2. **Weak LinkedIn profile** (25% of candidates)
3. **Low GitHub activity** (28% of candidates)
4. **Poor resume keywords/ATS optimization** (20% of candidates)
5. **Weak DSA skills** (15% of candidates)
6. **No portfolio website** (18% of candidates)
7. **Weak communication section** (12% of candidates)
8. **Few projects** (14% of candidates)
9. **No certifications** (10% of candidates)
10. **No open-source contributions** (8% of candidates)

## Common Suggestions (from Dataset)

1. Apply to 5 internships
2. Post 2 technical updates on LinkedIn
3. Push 20 commits this month
4. Optimize resume for ATS keywords
5. Solve 100 DSA problems
6. Create personal portfolio website
7. Rewrite project descriptions with impact
8. Build 2 new projects
9. Complete 1 certification
10. Make 1 open-source contribution

## Scoring Patterns from Dataset

- **4+ projects**: Average resume score 92
- **Portfolio website**: Average resume score 88
- **3+ certifications**: Average resume score 85
- **GitHub activity >5**: Average resume score 84
- **With internships**: Average resume score 86

## Domain-Specific Benchmarks

| Domain | Avg Score | Avg Projects | Avg Certs | Avg Internships |
|--------|-----------|--------------|-----------|-----------------|
| Web Development | 88 | 3.2 | 1.8 | 1.2 |
| Data Science | 86 | 2.8 | 1.5 | 1.1 |
| Cloud/DevOps | 87 | 2.9 | 2.1 | 1.0 |
| AI/ML | 89 | 3.1 | 1.9 | 1.3 |
| Mobile Development | 87 | 3.0 | 1.7 | 1.2 |
| IoT | 85 | 2.7 | 1.6 | 0.9 |
| Cyber Security | 86 | 2.6 | 1.8 | 1.0 |

## Frontend Integration

### Using the AI Service

```javascript
import { aiService } from '../services/aiService';

// Get dataset metadata
const metadata = await aiService.getDatasetMetadata();

// Get dataset statistics
const stats = await aiService.getDatasetStats();

// Analyze resume with dataset context
const analysis = await aiService.analyzeResumeWithDataset(
  resumeText,
  targetRole
);

// Compare to dataset benchmarks
const comparison = await aiService.compareToDataset(
  resumeScore,
  targetDomain,
  skills,
  projects,
  certifications,
  internships,
  githubActivity,
  linkedinActivity,
  hasPortfolio
);
```

### AI Analyzer Component

The `AIAnalyser.jsx` component now:
- Uses the dataset-aware analysis endpoint
- Displays dataset-calibrated scores
- Shows percentile rankings
- Provides domain-specific recommendations
- Compares metrics against benchmarks

## Implementation Details

### Backend (server/server.js)

Three new endpoints added:
1. `GET /api/dataset/metadata` - Dataset information
2. `GET /api/dataset/stats` - Aggregated statistics
3. `POST /api/ai/analyze-resume-with-dataset` - Dataset-informed analysis
4. `POST /api/ai/compare-to-dataset` - Benchmark comparison

### Frontend (src/services/aiService.js)

Four new service methods added:
1. `getDatasetMetadata()` - Fetch dataset info
2. `getDatasetStats()` - Fetch statistics
3. `analyzeResumeWithDataset()` - Analyze with dataset context
4. `compareToDataset()` - Compare to benchmarks

### AI Analyzer (src/pages/AIAnalyser.jsx)

Updated to:
- Use the new dataset-aware endpoint
- Display dataset-calibrated scores
- Show improvement roadmaps
- Provide percentile rankings

## Usage Example

```javascript
// User uploads resume
const resumeText = "...resume content...";
const targetRole = "Senior Frontend Developer";

// Analyze with dataset context
const result = await aiService.analyzeResumeWithDataset(
  resumeText,
  targetRole
);

// Result includes:
// - resumeScore: 78
// - resumeLevel: "Good"
// - atsScore: 72
// - weakAreas: ["No internships", "Low GitHub activity"]
// - suggestions: ["Apply to 5 internships", "Push 20 commits this month"]
// - datasetComparison: { percentileRank: "65%", benchmarkScore: 88 }
// - improvementRoadmap: [...]
```

## Future Enhancements

1. **Real Dataset Integration**: Replace synthetic data with real resume dataset
2. **Advanced Analytics**: Add more granular metrics and insights
3. **Personalized Learning Paths**: Generate custom improvement plans
4. **Skill Gap Analysis**: Detailed skill-by-skill comparison
5. **Industry Trends**: Track emerging skills and technologies
6. **Peer Comparison**: Anonymous benchmarking against similar candidates

## Notes

- Dataset contains 500 synthetic records for training and benchmarking
- All scores are calibrated against this dataset
- Recommendations are based on patterns identified in the dataset
- Domain-specific benchmarks help contextualize scores
- The AI uses dataset patterns to provide more accurate and relevant suggestions

## Support

For questions or issues related to dataset integration, refer to:
- `AI_INTEGRATION.md` - General AI integration guide
- `AI_STATUS.md` - Current implementation status
- Backend API documentation in `server/server.js`
