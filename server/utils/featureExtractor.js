/**
 * Feature Extractor for Resume Analysis
 * Extracts numerical features from resume data
 * Features: GitHub_Score, LinkedIn_Score, ATS_Score, project_count, cert_count, skill_count
 */

class FeatureExtractor {
  constructor() {
    this.features = {};
    this.featureNames = [
      'GitHub_Score',
      'LinkedIn_Score',
      'ATS_Score',
      'project_count',
      'cert_count',
      'skill_count'
    ];
  }

  /**
   * Count items in comma-separated string
   */
  countItems(str) {
    if (!str || str === 'None' || str === 'none' || str.trim() === '') {
      return 0;
    }
    return str.split(',').filter(item => item.trim().length > 0).length;
  }

  /**
   * Extract project count from Projects field
   */
  extractProjectCount(projectsStr) {
    return this.countItems(projectsStr);
  }

  /**
   * Extract certification count from Certifications field
   */
  extractCertCount(certificationsStr) {
    return this.countItems(certificationsStr);
  }

  /**
   * Extract skill count from Skills field
   */
  extractSkillCount(skillsStr) {
    return this.countItems(skillsStr);
  }

  /**
   * Calculate GitHub Score (0-10 scale)
   * Based on activity and contributions
   */
  calculateGitHubScore(githubActivity, openSourceContributions) {
    let score = 0;
    
    // GitHub activity (0-10)
    score += Math.min(githubActivity || 0, 10);
    
    // Open source contributions (0-5) scaled to 0-10
    const osScore = Math.min((openSourceContributions || 0) * 2, 10);
    
    // Average the two
    return Math.round((score + osScore) / 2);
  }

  /**
   * Calculate LinkedIn Score (0-10 scale)
   * Based on activity and profile strength
   */
  calculateLinkedInScore(linkedinActivity, internships) {
    let score = 0;
    
    // LinkedIn activity (0-10)
    score += Math.min(linkedinActivity || 0, 10);
    
    // Internships (0-5) scaled to 0-10
    const internshipScore = Math.min((internships || 0) * 2, 10);
    
    // Average the two
    return Math.round((score + internshipScore) / 2);
  }

  /**
   * Calculate ATS Score (0-100 scale)
   * Based on keyword optimization and structure
   */
  calculateATSScore(skillCount, projectCount, certCount, hasPortfolio) {
    let score = 50; // Base score
    
    // Skills contribute to ATS score
    score += Math.min(skillCount * 3, 20);
    
    // Projects contribute
    score += Math.min(projectCount * 2, 15);
    
    // Certifications contribute
    score += Math.min(certCount * 2, 10);
    
    // Portfolio website
    if (hasPortfolio) {
      score += 5;
    }
    
    return Math.min(score, 100);
  }

  /**
   * Extract all numerical features from resume data
   */
  extractFeatures(resumeData) {
    const features = {};

    // Extract counts from string fields
    const projectCount = this.extractProjectCount(resumeData.projects || '');
    const certCount = this.extractCertCount(resumeData.certifications || '');
    const skillCount = this.extractSkillCount(resumeData.skills || '');

    // Calculate scores
    const githubScore = this.calculateGitHubScore(
      resumeData.githubActivity || 0,
      resumeData.openSourceContributions || 0
    );

    const linkedinScore = this.calculateLinkedInScore(
      resumeData.linkedinActivity || 0,
      resumeData.internships || 0
    );

    const atsScore = this.calculateATSScore(
      skillCount,
      projectCount,
      certCount,
      resumeData.hasPortfolio || false
    );

    // Store features
    features.GitHub_Score = githubScore;
    features.LinkedIn_Score = linkedinScore;
    features.ATS_Score = atsScore;
    features.project_count = projectCount;
    features.cert_count = certCount;
    features.skill_count = skillCount;

    return features;
  }

  /**
   * Extract features from resume text
   * Analyzes text to estimate scores
   */
  extractFeaturesFromText(resumeText) {
    const features = {};

    // Count projects - look for project-related keywords and descriptions
    const projectKeywords = ['project', 'built', 'developed', 'created', 'designed', 'implemented', 'deployed', 'launched', 'application', 'website', 'system', 'platform', 'tool', 'feature', 'module', 'component'];
    const projectMatches = resumeText.match(new RegExp(projectKeywords.join('|'), 'gi')) || [];
    // More generous counting - each mention could be a project
    const projectCount = Math.min(Math.max(Math.ceil(projectMatches.length / 3), 1), 15);

    // Count certifications - look for certification keywords
    const certKeywords = ['certified', 'certification', 'certificate', 'aws', 'azure', 'gcp', 'scrum', 'pmp', 'ccna', 'cissp', 'comptia', 'oracle', 'microsoft', 'google', 'coursera', 'udacity', 'pluralsight', 'edx', 'datacamp', 'codecademy'];
    const certMatches = resumeText.match(new RegExp(certKeywords.join('|'), 'gi')) || [];
    // More generous counting
    const certCount = Math.min(Math.max(Math.ceil(certMatches.length / 2), 0), 15);

    // Count skills - extract ALL mentioned skills
    const skillKeywords = [
      'python', 'javascript', 'java', 'c\\+\\+', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala',
      'react', 'angular', 'vue', 'node', 'django', 'flask', 'spring', 'express', 'fastapi', 'laravel', 'rails',
      'sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'cassandra', 'dynamodb', 'firestore',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git', 'jenkins', 'ci/cd', 'gitlab', 'github', 'bitbucket',
      'typescript', 'r', 'matlab', 'tensorflow', 'pytorch', 'scikit', 'keras', 'pandas', 'numpy', 'spark', 'hadoop', 'kafka',
      'firebase', 'graphql', 'rest', 'soap', 'microservices', 'devops', 'linux', 'windows', 'macos', 'ios', 'android',
      'flutter', 'react native', 'machine learning', 'deep learning', 'nlp', 'computer vision', 'data science', 'analytics',
      'tableau', 'power bi', 'excel', 'salesforce', 'sap', 'erp', 'crm', 'blockchain', 'solidity', 'web3',
      'heroku', 'netlify', 'vercel', 'api', 'json', 'xml', 'html', 'css', 'html5', 'es6', 'webpack', 'babel',
      'npm', 'yarn', 'svn', 'jira', 'confluence', 'slack', 'figma', 'sketch', 'photoshop', 'illustrator', 'xd',
      'ui', 'ux', 'design', 'testing', 'jest', 'mocha', 'cypress', 'selenium', 'junit', 'pytest', 'rspec',
      'agile', 'scrum', 'kanban', 'waterfall', 'lean', 'six sigma', 'project management', 'leadership', 'communication'
    ];
    const skillMatches = resumeText.toLowerCase().match(new RegExp(skillKeywords.join('|'), 'gi')) || [];
    const uniqueSkills = new Set(skillMatches.map(s => s.toLowerCase()));
    const skillCount = Math.min(Math.max(uniqueSkills.size, 1), 50);

    // Estimate GitHub score based on mentions
    const githubMatches = resumeText.match(/github|git|commit|repository|open source|contribution|pull request/gi) || [];
    const githubScore = Math.min(Math.ceil(githubMatches.length / 1.5), 10);

    // Estimate LinkedIn score based on mentions
    const linkedinMatches = resumeText.match(/linkedin|professional|network|connection|endorsement|recommendation/gi) || [];
    const linkedinScore = Math.min(Math.ceil(linkedinMatches.length / 1.5), 10);

    // Calculate ATS score
    const atsScore = this.calculateATSScore(skillCount, projectCount, certCount, false);

    // Store features
    features.GitHub_Score = githubScore;
    features.LinkedIn_Score = linkedinScore;
    features.ATS_Score = atsScore;
    features.project_count = projectCount;
    features.cert_count = certCount;
    features.skill_count = skillCount;

    return features;
  }

  /**
   * Get feature vector as array
   */
  getFeatureVector(features) {
    return this.featureNames.map(name => features[name] || 0);
  }

  /**
   * Get feature names
   */
  getFeatureNames() {
    return this.featureNames;
  }

  /**
   * Normalize features to 0-1 scale
   */
  normalizeFeatures(features) {
    // StandardScaler normalization (z-score): (x - mean) / std
    // Using industry benchmarks as reference for mean and std
    
    const normalized = {};
    
    // Define mean and standard deviation for each feature based on industry benchmarks
    const scaler = {
      GitHub_Score: { mean: 5, std: 2.5 },      // Mean 5/10, std 2.5
      LinkedIn_Score: { mean: 6, std: 2.0 },    // Mean 6/10, std 2.0
      ATS_Score: { mean: 70, std: 15 },         // Mean 70/100, std 15
      project_count: { mean: 2.9, std: 1.2 },   // Mean 2.9, std 1.2
      cert_count: { mean: 1.8, std: 0.8 },      // Mean 1.8, std 0.8
      skill_count: { mean: 15, std: 5 }         // Mean 15, std 5
    };

    this.featureNames.forEach(name => {
      const value = features[name] || 0;
      const { mean, std } = scaler[name] || { mean: 0, std: 1 };
      
      // Z-score normalization: (x - mean) / std
      normalized[name] = (value - mean) / std;
    });

    return normalized;
  }

  /**
   * Calculate feature importance scores
   */
  calculateFeatureImportance(features) {
    const importance = {};
    const total = Object.values(features).reduce((a, b) => a + b, 0);

    this.featureNames.forEach(name => {
      const value = features[name] || 0;
      importance[name] = total > 0 ? (value / total * 100).toFixed(2) : 0;
    });

    return importance;
  }

  /**
   * Generate feature summary
   */
  generateFeatureSummary(features) {
    const summary = {
      features: features,
      normalized: this.normalizeFeatures(features),
      importance: this.calculateFeatureImportance(features),
      total: Object.values(features).reduce((a, b) => a + b, 0),
      average: Object.values(features).reduce((a, b) => a + b, 0) / this.featureNames.length
    };

    return summary;
  }

  /**
   * Analyze feature quality
   */
  analyzeFeatureQuality(features) {
    const analysis = {
      strengths: [],
      weaknesses: [],
      recommendations: []
    };

    // GitHub Score analysis
    if (features.GitHub_Score >= 7) {
      analysis.strengths.push('Strong GitHub presence');
    } else if (features.GitHub_Score < 3) {
      analysis.weaknesses.push('Low GitHub activity');
      analysis.recommendations.push('Push 20+ commits this month');
    }

    // LinkedIn Score analysis
    if (features.LinkedIn_Score >= 7) {
      analysis.strengths.push('Strong LinkedIn profile');
    } else if (features.LinkedIn_Score < 3) {
      analysis.weaknesses.push('Weak LinkedIn presence');
      analysis.recommendations.push('Post 2 technical updates on LinkedIn');
    }

    // ATS Score analysis
    if (features.ATS_Score >= 80) {
      analysis.strengths.push('Excellent ATS optimization');
    } else if (features.ATS_Score < 50) {
      analysis.weaknesses.push('Poor ATS optimization');
      analysis.recommendations.push('Optimize resume for ATS keywords');
    }

    // Project count analysis
    if (features.project_count >= 4) {
      analysis.strengths.push('Good project portfolio');
    } else if (features.project_count < 2) {
      analysis.weaknesses.push('Few projects');
      analysis.recommendations.push('Build 2 new projects');
    }

    // Certification count analysis
    if (features.cert_count >= 2) {
      analysis.strengths.push('Multiple certifications');
    } else if (features.cert_count === 0) {
      analysis.weaknesses.push('No certifications');
      analysis.recommendations.push('Complete 1 certification');
    }

    // Skill count analysis
    if (features.skill_count >= 8) {
      analysis.strengths.push('Diverse skill set');
    } else if (features.skill_count < 3) {
      analysis.weaknesses.push('Limited skills listed');
      analysis.recommendations.push('Add more technical skills');
    }

    return analysis;
  }

  /**
   * Compare features against benchmarks
   */
  compareAgainstBenchmarks(features, benchmarks = null) {
    // Default benchmarks (from dataset analysis)
    const defaultBenchmarks = {
      GitHub_Score: 5,
      LinkedIn_Score: 6,
      ATS_Score: 75,
      project_count: 3,
      cert_count: 2,
      skill_count: 8
    };

    const benchmarkValues = benchmarks || defaultBenchmarks;
    const comparison = {};

    this.featureNames.forEach(name => {
      const actual = features[name] || 0;
      const benchmark = benchmarkValues[name] || 0;
      const difference = actual - benchmark;
      const percentageDifference = benchmark > 0 ? (difference / benchmark * 100).toFixed(2) : 0;

      comparison[name] = {
        actual: actual,
        benchmark: benchmark,
        difference: difference,
        percentageDifference: percentageDifference,
        status: difference >= 0 ? 'above' : 'below'
      };
    });

    return comparison;
  }
}

/**
 * StandardScaler - Normalize features using z-score normalization
 * Equivalent to sklearn.preprocessing.StandardScaler
 * Transforms features to have mean 0 and standard deviation 1
 */
class StandardScaler {
  constructor() {
    this.mean = {};
    this.std = {};
    this.isFitted = false;
  }

  /**
   * Fit the scaler on data
   * Calculates mean and standard deviation for each feature
   */
  fit(data) {
    const featureNames = Object.keys(data[0] || {});
    
    featureNames.forEach(feature => {
      const values = data.map(d => d[feature] || 0);
      
      // Calculate mean
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      
      // Calculate standard deviation
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const std = Math.sqrt(variance);
      
      this.mean[feature] = mean;
      this.std[feature] = std || 1; // Avoid division by zero
    });
    
    this.isFitted = true;
    return this;
  }

  /**
   * Transform data using fitted mean and std
   * Formula: (x - mean) / std
   */
  transform(data) {
    if (!this.isFitted) {
      throw new Error('StandardScaler must be fitted before transform');
    }

    return data.map(sample => {
      const transformed = {};
      Object.keys(sample).forEach(feature => {
        const value = sample[feature] || 0;
        const mean = this.mean[feature] || 0;
        const std = this.std[feature] || 1;
        
        // Z-score normalization
        transformed[feature] = (value - mean) / std;
      });
      return transformed;
    });
  }

  /**
   * Fit and transform in one step
   * Equivalent to sklearn's fit_transform()
   */
  fitTransform(data) {
    this.fit(data);
    return this.transform(data);
  }

  /**
   * Get the fitted parameters
   */
  getParams() {
    return {
      mean: this.mean,
      std: this.std,
      isFitted: this.isFitted
    };
  }

  /**
   * Set parameters (for loading pre-fitted scaler)
   */
  setParams(mean, std) {
    this.mean = mean;
    this.std = std;
    this.isFitted = true;
    return this;
  }
}

module.exports = FeatureExtractor;
module.exports.StandardScaler = StandardScaler;
