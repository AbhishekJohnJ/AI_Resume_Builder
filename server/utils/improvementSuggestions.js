/**
 * Improvement Suggestions Generator
 * Generates actionable, domain-specific improvement recommendations based on resume analysis
 */

class ImprovementSuggestionsGenerator {
  constructor() {
    this.domainSkillMap = {
      'Full Stack Developer': {
        frontend: ['React', 'Vue', 'Angular', 'TypeScript', 'CSS', 'Tailwind'],
        backend: ['Node.js', 'Express', 'Django', 'Flask', 'Spring', 'FastAPI'],
        database: ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis'],
        devops: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Jenkins'],
        tools: ['Git', 'GitHub', 'GitLab', 'Jira']
      },
      'Frontend Developer': {
        core: ['React', 'Vue', 'Angular', 'JavaScript', 'TypeScript'],
        styling: ['CSS', 'Tailwind', 'Bootstrap', 'SASS'],
        state: ['Redux', 'Vuex', 'Context API'],
        testing: ['Jest', 'React Testing Library', 'Cypress'],
        tools: ['Webpack', 'Vite', 'Git']
      },
      'Backend Developer': {
        languages: ['Python', 'Java', 'Node.js', 'Go', 'Rust'],
        frameworks: ['Django', 'Flask', 'Spring', 'Express', 'FastAPI'],
        database: ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis'],
        devops: ['Docker', 'Kubernetes', 'AWS', 'Azure'],
        testing: ['Unit Testing', 'Integration Testing', 'API Testing']
      },
      'Data Scientist': {
        languages: ['Python', 'R', 'SQL'],
        libraries: ['Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'PyTorch'],
        visualization: ['Matplotlib', 'Seaborn', 'Plotly', 'Tableau'],
        tools: ['Jupyter', 'Git', 'SQL'],
        ml: ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision']
      },
      'DevOps Engineer': {
        containerization: ['Docker', 'Kubernetes', 'Podman'],
        cloud: ['AWS', 'Azure', 'GCP'],
        cicd: ['Jenkins', 'GitLab CI', 'GitHub Actions', 'CircleCI'],
        infrastructure: ['Terraform', 'Ansible', 'CloudFormation'],
        monitoring: ['Prometheus', 'Grafana', 'ELK Stack']
      }
    };

    this.improvementStrategies = {
      lowSkillCount: {
        priority: 'High',
        task: 'Expand Technical Skills Portfolio',
        description: 'Add 5-10 more relevant technical skills to your resume. Focus on industry-standard tools and frameworks.',
        estimatedTime: '2-3 weeks',
        impact: 'High',
        actionItems: [
          'Learn one new framework or tool per week',
          'Complete online courses (Udemy, Coursera, freeCodeCamp)',
          'Build small projects using new technologies',
          'Document skills with concrete examples'
        ]
      },
      lowProjectCount: {
        priority: 'High',
        task: 'Build Portfolio Projects',
        description: 'Create 2-3 substantial projects showcasing your skills. Include GitHub links and live demos.',
        estimatedTime: '4-6 weeks',
        impact: 'High',
        actionItems: [
          'Build a full-stack application',
          'Create a data science project with visualizations',
          'Contribute to open-source projects',
          'Deploy projects to production (Vercel, Heroku, AWS)'
        ]
      },
      lowCertCount: {
        priority: 'Medium',
        task: 'Earn Industry Certifications',
        description: 'Obtain 2-3 relevant certifications to validate your expertise.',
        estimatedTime: '6-12 weeks',
        impact: 'Medium',
        actionItems: [
          'AWS Certified Solutions Architect',
          'Google Cloud Professional',
          'Kubernetes Administrator (CKA)',
          'Microsoft Azure Fundamentals',
          'Scrum Master Certification'
        ]
      },
      lowGitHubScore: {
        priority: 'High',
        task: 'Increase GitHub Activity',
        description: 'Build a strong GitHub presence with consistent contributions and quality projects.',
        estimatedTime: '8 weeks',
        impact: 'High',
        actionItems: [
          'Push code daily (aim for 20+ commits per month)',
          'Create well-documented repositories',
          'Contribute to 3-5 open-source projects',
          'Maintain a GitHub streak (consecutive days with commits)',
          'Write comprehensive README files'
        ]
      },
      lowLinkedInScore: {
        priority: 'Medium',
        task: 'Strengthen LinkedIn Profile',
        description: 'Optimize your LinkedIn presence to improve professional visibility.',
        estimatedTime: '2-3 weeks',
        impact: 'Medium',
        actionItems: [
          'Post 2-3 technical articles per month',
          'Share project updates and learnings',
          'Engage with industry content',
          'Get recommendations from colleagues',
          'Update profile with recent achievements'
        ]
      },
      lowATSScore: {
        priority: 'High',
        task: 'Optimize for ATS (Applicant Tracking System)',
        description: 'Improve resume formatting and keyword optimization for automated screening.',
        estimatedTime: '1 week',
        impact: 'High',
        actionItems: [
          'Use standard fonts and formatting',
          'Include relevant keywords from job descriptions',
          'Use bullet points for achievements',
          'Quantify accomplishments with metrics',
          'Avoid graphics and complex formatting'
        ]
      },
      weakCommunication: {
        priority: 'High',
        task: 'Improve Project Descriptions',
        description: 'Rewrite project descriptions with clear impact and quantifiable results.',
        estimatedTime: '1-2 weeks',
        impact: 'High',
        actionItems: [
          'Use action verbs (Built, Developed, Designed, Optimized)',
          'Include metrics (30% faster, 50% reduction)',
          'Explain business impact, not just technical details',
          'Use STAR method (Situation, Task, Action, Result)',
          'Add links to live demos and GitHub repos'
        ]
      },
      missingExperience: {
        priority: 'Medium',
        task: 'Gain Practical Experience',
        description: 'Build real-world experience through internships, freelance work, or personal projects.',
        estimatedTime: '3-6 months',
        impact: 'High',
        actionItems: [
          'Apply to 5-10 internships per week',
          'Take on freelance projects on Upwork/Fiverr',
          'Contribute to open-source projects',
          'Build projects that solve real problems',
          'Document your learning journey'
        ]
      },
      missingCertifications: {
        priority: 'Medium',
        task: 'Add Professional Certifications',
        description: 'Earn recognized certifications in your domain.',
        estimatedTime: '8-16 weeks',
        impact: 'Medium',
        actionItems: [
          'Research top certifications in your field',
          'Enroll in certification prep courses',
          'Practice with exam simulators',
          'Schedule and pass certification exams',
          'Add certifications to LinkedIn and resume'
        ]
      }
    };
  }

  /**
   * Generate improvement roadmap based on resume analysis
   */
  generateRoadmap(features, extractedFeatures, resumeScore, targetDomain = 'Full Stack Developer') {
    const roadmap = [];
    const analyzed = new Set();

    // 1. Skill Count Analysis
    if (features.skill_count < 8) {
      roadmap.push({
        priority: 'High',
        task: 'Expand Technical Skills Portfolio',
        description: `You have ${features.skill_count} skills. Industry standard is 10-15. Add domain-specific skills like: ${this.getRecommendedSkills(targetDomain).slice(0, 5).join(', ')}`,
        estimatedTime: '2-3 weeks',
        impact: 'High'
      });
      analyzed.add('skillCount');
    }

    // 2. Project Count Analysis
    if (features.project_count < 3) {
      roadmap.push({
        priority: 'High',
        task: 'Build 2-3 Portfolio Projects',
        description: `You have ${features.project_count} projects. Build full-stack applications, data science projects, or mobile apps. Include GitHub links and live demos.`,
        estimatedTime: '4-6 weeks',
        impact: 'High'
      });
      analyzed.add('projectCount');
    }

    // 3. Certification Count Analysis
    if (features.cert_count < 2) {
      roadmap.push({
        priority: 'Medium',
        task: 'Earn 2-3 Industry Certifications',
        description: `You have ${features.cert_count} certifications. Pursue AWS, Google Cloud, Kubernetes, or Azure certifications to validate expertise.`,
        estimatedTime: '8-12 weeks',
        impact: 'Medium'
      });
      analyzed.add('certCount');
    }

    // 4. GitHub Score Analysis
    if (features.github_score < 5) {
      roadmap.push({
        priority: 'High',
        task: 'Increase GitHub Activity & Contributions',
        description: `Your GitHub score is ${features.github_score}/10. Push code daily, maintain a streak, and contribute to open-source projects. Aim for 20+ commits per month.`,
        estimatedTime: '8 weeks',
        impact: 'High'
      });
      analyzed.add('githubScore');
    }

    // 5. LinkedIn Score Analysis
    if (features.linkedin_score < 6) {
      roadmap.push({
        priority: 'Medium',
        task: 'Strengthen LinkedIn Professional Presence',
        description: `Your LinkedIn score is ${features.linkedin_score}/10. Post technical articles, share project updates, and engage with industry content 2-3 times per week.`,
        estimatedTime: '4 weeks',
        impact: 'Medium'
      });
      analyzed.add('linkedinScore');
    }

    // 6. ATS Score Analysis
    if (features.ats_score < 70) {
      roadmap.push({
        priority: 'High',
        task: 'Optimize Resume for ATS & Recruiters',
        description: `Your ATS score is ${features.ats_score}/100. Use standard formatting, include relevant keywords, quantify achievements, and avoid graphics.`,
        estimatedTime: '1 week',
        impact: 'High'
      });
      analyzed.add('atsScore');
    }

    // 7. TF-IDF Insights
    if (extractedFeatures?.topSkills?.length > 0) {
      const missingSkills = this.getRecommendedSkills(targetDomain).filter(
        skill => !extractedFeatures.topSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
      );
      
      if (missingSkills.length > 0) {
        roadmap.push({
          priority: 'High',
          task: `Learn Missing ${targetDomain} Skills`,
          description: `Add these in-demand skills: ${missingSkills.slice(0, 4).join(', ')}. These are critical for ${targetDomain} roles.`,
          estimatedTime: '3-4 weeks',
          impact: 'High'
        });
        analyzed.add('missingSkills');
      }
    }

    // 8. Resume Score Based Recommendations
    if (resumeScore < 60) {
      roadmap.push({
        priority: 'High',
        task: 'Comprehensive Resume Overhaul',
        description: `Your resume score is ${resumeScore}/100. Rewrite project descriptions with impact metrics, add quantifiable achievements, and improve formatting.`,
        estimatedTime: '2 weeks',
        impact: 'High'
      });
      analyzed.add('resumeScore');
    } else if (resumeScore < 75) {
      roadmap.push({
        priority: 'Medium',
        task: 'Polish Resume Content & Presentation',
        description: `Your resume score is ${resumeScore}/100. Enhance project descriptions with metrics, add more achievements, and improve visual hierarchy.`,
        estimatedTime: '1 week',
        impact: 'Medium'
      });
      analyzed.add('resumeScore');
    }

    // 9. Experience Keywords Analysis
    if (extractedFeatures?.experienceKeywords?.length < 5) {
      roadmap.push({
        priority: 'Medium',
        task: 'Highlight Relevant Experience',
        description: `Add more experience keywords and achievements. Use action verbs like: Built, Developed, Designed, Optimized, Implemented, Managed.`,
        estimatedTime: '1 week',
        impact: 'Medium'
      });
      analyzed.add('experienceKeywords');
    }

    // 10. General Recommendations
    if (roadmap.length < 5) {
      roadmap.push({
        priority: 'Medium',
        task: 'Build Real-World Projects',
        description: `Create projects that solve real problems. Document your learning journey and share on GitHub and LinkedIn.`,
        estimatedTime: '4-8 weeks',
        impact: 'High'
      });
    }

    return roadmap.slice(0, 5); // Return top 5 recommendations
  }

  /**
   * Get recommended skills for a domain
   */
  getRecommendedSkills(domain) {
    const skills = this.domainSkillMap[domain] || this.domainSkillMap['Full Stack Developer'];
    return Object.values(skills).flat();
  }

  /**
   * Generate actionable suggestions based on weak areas
   */
  generateSuggestions(features, extractedFeatures, resumeScore) {
    const suggestions = [];

    // Low skill count
    if (features.skill_count < 8) {
      suggestions.push(`Add ${10 - features.skill_count} more technical skills to reach industry standard`);
    }

    // Low project count
    if (features.project_count < 3) {
      suggestions.push(`Build ${3 - features.project_count} portfolio projects with GitHub links and live demos`);
    }

    // Low GitHub activity
    if (features.github_score < 5) {
      suggestions.push('Push code to GitHub daily - aim for 20+ commits per month to build a strong profile');
    }

    // Low LinkedIn activity
    if (features.linkedin_score < 6) {
      suggestions.push('Post technical articles and project updates on LinkedIn 2-3 times per week');
    }

    // Low ATS score
    if (features.ats_score < 70) {
      suggestions.push('Optimize resume formatting: use standard fonts, include keywords, quantify achievements');
    }

    // Missing certifications
    if (features.cert_count < 2) {
      suggestions.push('Earn 2-3 industry certifications (AWS, Google Cloud, Kubernetes) to validate expertise');
    }

    // Low resume score
    if (resumeScore < 70) {
      suggestions.push('Rewrite project descriptions with quantifiable impact and business value');
    }

    // Missing experience keywords
    if (extractedFeatures?.experienceKeywords?.length < 5) {
      suggestions.push('Use action verbs in descriptions: Built, Developed, Designed, Optimized, Implemented');
    }

    return suggestions.slice(0, 6); // Return top 6 suggestions
  }

  /**
   * Generate key insights based on analysis
   */
  generateKeyInsights(features, extractedFeatures, resumeScore, targetDomain = 'Full Stack Developer') {
    const insights = [];

    // Strengths
    if (features.skill_count >= 10) {
      insights.push(`✅ Strong skill set with ${features.skill_count} technical skills`);
    }
    if (features.project_count >= 3) {
      insights.push(`✅ Good portfolio with ${features.project_count} projects`);
    }
    if (features.github_score >= 7) {
      insights.push(`✅ Active GitHub presence with consistent contributions`);
    }
    if (features.ats_score >= 80) {
      insights.push(`✅ Resume is well-optimized for ATS systems`);
    }

    // Areas for improvement
    if (features.skill_count < 8) {
      insights.push(`⚠️ Skill count (${features.skill_count}) is below industry standard (10-15)`);
    }
    if (features.project_count < 3) {
      insights.push(`⚠️ Limited portfolio projects - build more to showcase expertise`);
    }
    if (features.github_score < 5) {
      insights.push(`⚠️ GitHub activity is low - increase contributions to build credibility`);
    }
    if (resumeScore < 70) {
      insights.push(`⚠️ Resume score (${resumeScore}/100) needs improvement - focus on impact metrics`);
    }

    // Domain-specific insights
    if (extractedFeatures?.topSkills?.length > 0) {
      const topSkill = extractedFeatures.topSkills[0];
      insights.push(`🎯 Your strongest skill: ${topSkill} - leverage this in your job search`);
    }

    // Benchmarking
    if (resumeScore >= 80) {
      insights.push(`🏆 Your resume is in the top tier - you're competitive for senior roles`);
    } else if (resumeScore >= 70) {
      insights.push(`📈 Your resume is competitive - focus on the roadmap to reach top tier`);
    } else {
      insights.push(`🚀 Significant growth potential - follow the improvement roadmap to level up`);
    }

    return insights.slice(0, 6); // Return top 6 insights
  }
}

module.exports = ImprovementSuggestionsGenerator;
