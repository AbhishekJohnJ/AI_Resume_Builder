/**
 * Local Resume Analysis Service
 * Provides AI-like analysis without requiring external API
 * Uses rule-based analysis and pattern matching
 */

class LocalAnalysisService {
  /**
   * Analyze resume using local rules
   */
  analyzeResume(resumeText, targetRole = '') {
    try {
      console.log('\n📊 [LOCAL ANALYZER] Analyzing resume locally');
      console.log(`   Text length: ${resumeText.length} characters`);
      console.log(`   Target role: ${targetRole || 'Not specified'}`);

      // Extract features from resume
      const features = this._extractFeatures(resumeText);
      
      // Calculate scores
      const resumeScore = this._calculateScore(features);
      const resumeLevel = this._getLevel(resumeScore);
      const atsScore = this._calculateAtsScore(features);
      
      // Generate analysis
      const analysis = {
        resume_score: resumeScore,
        resume_level: resumeLevel,
        summary: this._generateSummary(features, resumeScore),
        strengths: this._identifyStrengths(features),
        weak_areas: this._identifyWeakAreas(features),
        suggestions: this._generateSuggestions(features, targetRole),
        recommended_tasks: this._generateTasks(features),
        skills_identified: features.skills.slice(0, 10),
        experience_level: this._getExperienceLevel(features),
        ats_score: atsScore,
        key_insights: this._generateInsights(features, targetRole)
      };

      console.log(`✅ Analysis complete`);
      console.log(`   Score: ${analysis.resume_score}/100`);
      console.log(`   Level: ${analysis.resume_level}`);

      return analysis;

    } catch (error) {
      console.error('❌ Local analysis error:', error.message);
      throw new Error(`Local analysis failed: ${error.message}`);
    }
  }

  /**
   * Extract features from resume text
   */
  _extractFeatures(text) {
    const lowerText = text.toLowerCase();
    
    // Extract skills
    const skillKeywords = [
      'javascript', 'python', 'java', 'c++', 'c#', 'typescript', 'react', 'node.js', 'angular', 'vue',
      'html', 'css', 'sql', 'mongodb', 'postgresql', 'mysql', 'aws', 'azure', 'docker', 'kubernetes',
      'git', 'linux', 'windows', 'rest api', 'graphql', 'webpack', 'npm', 'yarn', 'express', 'django',
      'flask', 'spring', 'hibernate', 'junit', 'jest', 'mocha', 'selenium', 'jenkins', 'ci/cd',
      'agile', 'scrum', 'jira', 'confluence', 'figma', 'photoshop', 'illustrator', 'blender',
      'machine learning', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'nlp',
      'data analysis', 'excel', 'tableau', 'power bi', 'salesforce', 'sap', 'oracle'
    ];
    
    const skills = skillKeywords.filter(skill => lowerText.includes(skill));
    
    // Count experience indicators
    const yearsMatch = text.match(/(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/gi);
    const yearsOfExperience = yearsMatch ? Math.max(...yearsMatch.map(m => parseInt(m))) : 0;
    
    // Count projects
    const projectKeywords = ['project', 'developed', 'built', 'created', 'implemented', 'designed'];
    const projectCount = projectKeywords.reduce((count, keyword) => {
      const regex = new RegExp(keyword, 'gi');
      return count + (text.match(regex) || []).length;
    }, 0);
    
    // Check for certifications
    const certKeywords = ['certified', 'certification', 'certificate', 'aws certified', 'gcp', 'azure certified'];
    const hasCertifications = certKeywords.some(cert => lowerText.includes(cert));
    const certCount = hasCertifications ? Math.ceil(projectCount / 5) : 0;
    
    // Check for GitHub/LinkedIn
    const hasGithub = lowerText.includes('github');
    const hasLinkedin = lowerText.includes('linkedin');
    const hasPortfolio = lowerText.includes('portfolio') || lowerText.includes('website');
    
    // Check for education
    const educationKeywords = ['bachelor', 'master', 'phd', 'degree', 'university', 'college', 'b.tech', 'b.s', 'm.s'];
    const hasEducation = educationKeywords.some(edu => lowerText.includes(edu));
    
    // Check for achievements
    const achievementKeywords = ['award', 'achievement', 'recognition', 'promoted', 'led', 'managed', 'increased', 'improved', 'reduced'];
    const achievementCount = achievementKeywords.reduce((count, keyword) => {
      const regex = new RegExp(keyword, 'gi');
      return count + (text.match(regex) || []).length;
    }, 0);
    
    // Check for quantifiable results
    const quantifiableMatch = text.match(/(\d+)%|(\d+)x|(\d+)\s*(?:million|thousand|hundred)/gi);
    const hasQuantifiableResults = !!quantifiableMatch;
    
    return {
      skills,
      yearsOfExperience,
      projectCount: Math.min(projectCount, 20),
      certCount,
      hasGithub,
      hasLinkedin,
      hasPortfolio,
      hasEducation,
      achievementCount,
      hasQuantifiableResults,
      textLength: text.length
    };
  }

  /**
   * Calculate resume score (0-100)
   */
  _calculateScore(features) {
    let score = 50; // Base score
    
    // Skills (max +20)
    score += Math.min(features.skills.length * 2, 20);
    
    // Experience (max +15)
    score += Math.min(features.yearsOfExperience * 2, 15);
    
    // Projects (max +10)
    score += Math.min(features.projectCount, 10);
    
    // Certifications (max +5)
    score += Math.min(features.certCount * 2, 5);
    
    // GitHub/LinkedIn/Portfolio (max +10)
    let profileScore = 0;
    if (features.hasGithub) profileScore += 3;
    if (features.hasLinkedin) profileScore += 3;
    if (features.hasPortfolio) profileScore += 4;
    score += profileScore;
    
    // Education (max +5)
    if (features.hasEducation) score += 5;
    
    // Achievements (max +10)
    score += Math.min(features.achievementCount, 10);
    
    // Quantifiable results (max +5)
    if (features.hasQuantifiableResults) score += 5;
    
    // Cap at 100
    return Math.min(Math.round(score), 100);
  }

  /**
   * Get resume level based on score
   */
  _getLevel(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Good';
    if (score >= 50) return 'Average';
    return 'Needs Improvement';
  }

  /**
   * Calculate ATS score
   */
  _calculateAtsScore(features) {
    let atsScore = 60;
    
    // Skills presence
    atsScore += Math.min(features.skills.length, 10);
    
    // Experience
    atsScore += Math.min(features.yearsOfExperience * 2, 15);
    
    // Education
    if (features.hasEducation) atsScore += 5;
    
    // Quantifiable results
    if (features.hasQuantifiableResults) atsScore += 5;
    
    return Math.min(Math.round(atsScore), 100);
  }

  /**
   * Get experience level
   */
  _getExperienceLevel(features) {
    if (features.yearsOfExperience >= 8) return 'Senior';
    if (features.yearsOfExperience >= 3) return 'Mid-level';
    return 'Junior';
  }

  /**
   * Generate summary
   */
  _generateSummary(features, score) {
    const level = this._getLevel(score);
    const expLevel = this._getExperienceLevel(features);
    
    if (score >= 80) {
      return `${expLevel} professional with strong technical skills (${features.skills.length} identified). Demonstrates solid experience and good online presence.`;
    } else if (score >= 65) {
      return `${expLevel} professional with ${features.yearsOfExperience} years of experience. Has relevant skills and some professional presence.`;
    } else if (score >= 50) {
      return `Professional with basic qualifications. Could benefit from adding more skills, projects, and professional presence.`;
    } else {
      return `Resume needs significant improvements in skills, experience documentation, and professional presence.`;
    }
  }

  /**
   * Identify strengths
   */
  _identifyStrengths(features) {
    const strengths = [];
    
    if (features.skills.length >= 10) {
      strengths.push(`Strong technical skill set with ${features.skills.length} identified technologies`);
    }
    
    if (features.yearsOfExperience >= 5) {
      strengths.push(`${features.yearsOfExperience}+ years of professional experience`);
    }
    
    if (features.hasGithub && features.hasLinkedin) {
      strengths.push('Active professional presence on GitHub and LinkedIn');
    }
    
    if (features.hasEducation) {
      strengths.push('Formal education background documented');
    }
    
    if (features.achievementCount >= 5) {
      strengths.push('Multiple achievements and accomplishments highlighted');
    }
    
    if (features.hasQuantifiableResults) {
      strengths.push('Includes quantifiable results and metrics');
    }
    
    if (strengths.length === 0) {
      strengths.push('Resume is well-structured and readable');
    }
    
    return strengths.slice(0, 5);
  }

  /**
   * Identify weak areas
   */
  _identifyWeakAreas(features) {
    const weakAreas = [];
    
    if (features.skills.length < 5) {
      weakAreas.push('Limited number of technical skills listed');
    }
    
    if (features.yearsOfExperience < 2) {
      weakAreas.push('Limited professional experience');
    }
    
    if (!features.hasGithub && !features.hasPortfolio) {
      weakAreas.push('No GitHub or portfolio link provided');
    }
    
    if (!features.hasLinkedin) {
      weakAreas.push('LinkedIn profile not mentioned');
    }
    
    if (features.projectCount < 3) {
      weakAreas.push('Few projects or accomplishments mentioned');
    }
    
    if (!features.hasQuantifiableResults) {
      weakAreas.push('Missing quantifiable metrics and results');
    }
    
    if (features.certCount === 0) {
      weakAreas.push('No certifications mentioned');
    }
    
    return weakAreas.slice(0, 5);
  }

  /**
   * Generate suggestions
   */
  _generateSuggestions(features, targetRole) {
    const suggestions = [];
    
    if (features.skills.length < 10) {
      suggestions.push('Add more technical skills relevant to your target role');
    }
    
    if (!features.hasGithub) {
      suggestions.push('Include your GitHub profile link to showcase projects');
    }
    
    if (!features.hasPortfolio) {
      suggestions.push('Create and link a portfolio website to demonstrate your work');
    }
    
    if (features.projectCount < 5) {
      suggestions.push('Highlight more projects with specific technologies used');
    }
    
    if (!features.hasQuantifiableResults) {
      suggestions.push('Add metrics and quantifiable results to your achievements');
    }
    
    if (targetRole && !features.skills.some(s => targetRole.toLowerCase().includes(s))) {
      suggestions.push(`Emphasize skills relevant to ${targetRole} role`);
    }
    
    if (features.achievementCount < 5) {
      suggestions.push('Include more specific achievements and accomplishments');
    }
    
    if (!features.hasEducation) {
      suggestions.push('Add your educational background and degrees');
    }
    
    return suggestions.slice(0, 6);
  }

  /**
   * Generate recommended tasks
   */
  _generateTasks(features) {
    const tasks = [];
    
    if (features.skills.length < 10) {
      tasks.push('Research and add 5-10 more relevant technical skills');
    }
    
    if (!features.hasGithub) {
      tasks.push('Create GitHub account and upload 2-3 portfolio projects');
    }
    
    if (!features.hasPortfolio) {
      tasks.push('Build a personal portfolio website showcasing your work');
    }
    
    if (features.projectCount < 5) {
      tasks.push('Document and add 3-5 significant projects with descriptions');
    }
    
    if (features.certCount === 0) {
      tasks.push('Pursue 1-2 relevant industry certifications');
    }
    
    if (!features.hasLinkedin) {
      tasks.push('Create and optimize your LinkedIn profile');
    }
    
    return tasks.slice(0, 6);
  }

  /**
   * Generate key insights
   */
  _generateInsights(features, targetRole) {
    const insights = [];
    
    const expLevel = this._getExperienceLevel(features);
    insights.push(`You are at ${expLevel} level with ${features.yearsOfExperience} years of experience`);
    
    if (features.skills.length > 0) {
      insights.push(`Your top skills include: ${features.skills.slice(0, 3).join(', ')}`);
    }
    
    if (features.hasGithub || features.hasLinkedin || features.hasPortfolio) {
      const profiles = [];
      if (features.hasGithub) profiles.push('GitHub');
      if (features.hasLinkedin) profiles.push('LinkedIn');
      if (features.hasPortfolio) profiles.push('Portfolio');
      insights.push(`You have active presence on: ${profiles.join(', ')}`);
    }
    
    if (targetRole) {
      insights.push(`For ${targetRole} role, focus on relevant skills and projects`);
    }
    
    return insights.slice(0, 5);
  }
}

module.exports = new LocalAnalysisService();
