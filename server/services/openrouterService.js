/**
 * OpenRouter Service for Resume Analysis
 * Uses OpenRouter API with fallback to local analysis
 */
const axios = require('axios');
const localAnalyzer = require('./localAnalysisService');
const cacheService = require('./cacheService');

class OpenRouterService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    
    if (!this.apiKey) {
      console.warn('⚠️  OPENROUTER_API_KEY not set - using local analyzer');
    } else {
      console.log('✅ OpenRouter API key configured');
    }
  }

  /**
   * Analyze resume using OpenRouter or fallback to local analyzer
   */
  async analyzeResume(resumeText, targetRole = '') {
    try {
      console.log('\n📊 [ANALYZER] Analyzing resume');
      console.log(`   Text length: ${resumeText.length} characters`);
      console.log(`   Target role: ${targetRole || 'Not specified'}`);
      
      // Check cache first
      console.log('\n🔍 [ANALYZER] Checking cache...');
      const cachedResult = cacheService.get(resumeText, targetRole);
      if (cachedResult) {
        return cachedResult;
      }
      
      // If no API key, use local analyzer
      if (!this.apiKey) {
        console.log('   Using local analyzer (no API key)');
        return localAnalyzer.analyzeResume(resumeText, targetRole);
      }
      
      // Try OpenRouter API
      try {
        const result = await this._analyzeWithOpenRouter(resumeText, targetRole);
        
        // Store in cache for future use
        console.log('\n💾 [ANALYZER] Storing result in cache...');
        cacheService.set(resumeText, targetRole, result);
        
        return result;
      } catch (apiError) {
        console.warn('⚠️  OpenRouter API failed, falling back to local analyzer');
        console.warn(`   Error: ${apiError.message}`);
        return localAnalyzer.analyzeResume(resumeText, targetRole);
      }
      
    } catch (error) {
      console.error('❌ Analysis error:', error.message);
      throw new Error(`Resume analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze resume using OpenRouter API
   */
  async _analyzeWithOpenRouter(resumeText, targetRole = '') {
    console.log('🤖 [OPENROUTER] Calling OpenRouter API');
    
    const prompt = this._buildAnalysisPrompt(resumeText, targetRole);
    
    const response = await axios.post(
      this.apiUrl,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume analyst. Analyze resumes and provide detailed feedback in JSON format. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Resume Analyzer'
        }
      }
    );

    console.log('✅ OpenRouter response received');
    
    const content = response.data.choices[0].message.content;
    const analysis = this._parseResponse(content);
    
    console.log(`✅ Analysis complete (OpenRouter)`);
    console.log(`   Score: ${analysis.resume_score}/100`);
    console.log(`   Level: ${analysis.resume_level}`);
    
    return analysis;
  }

  /**
   * Build analysis prompt
   */
  _buildAnalysisPrompt(resumeText, targetRole) {
    return `You are an expert resume analyst specializing in helping students build professional resumes that match industry standards.

Analyze this student resume and provide detailed feedback comparing it to professional standards.

Resume:
${resumeText}

${targetRole ? `Target Role: ${targetRole}` : ''}

IMPORTANT INSTRUCTIONS:
1. Score the resume by comparing it to PROFESSIONAL STANDARDS (0-100)
   - 0-30: Far from professional standards
   - 31-50: Below professional standards
   - 51-70: Approaching professional standards
   - 71-85: Meets professional standards
   - 86-100: Exceeds professional standards

2. Analyze LinkedIn Profile (if mentioned):
   - Check if LinkedIn URL is present
   - Suggest what should be on LinkedIn profile
   - Recommend profile optimization tips
   - Suggest content to add

3. Analyze GitHub Profile (if mentioned):
   - Check if GitHub URL is present
   - Suggest portfolio projects to showcase
   - Recommend repository organization
   - Suggest documentation improvements

4. Analyze Other Profiles/Sites (if mentioned):
   - Portfolio website suggestions
   - Personal blog recommendations
   - Medium/Dev.to articles
   - Other professional platforms

5. Professional Resume Standards for Students:
   - Should have clear contact information
   - Should have a professional summary (2-3 lines)
   - Should list education with GPA (if 3.5+)
   - Should have 2-3 internships or projects
   - Should list 8-12 technical skills
   - Should have 3-5 certifications or courses
   - Should include GitHub/LinkedIn links
   - Should have quantifiable achievements
   - Should use action verbs
   - Should be ATS-optimized

6. For Students Specifically:
   - Highlight academic projects
   - Include relevant coursework
   - Mention hackathons or competitions
   - Include internship experience
   - Show leadership in clubs/organizations
   - Include volunteer work
   - Mention scholarships or awards

7. IDENTIFY THE STUDENT'S FIELD OF EDUCATION:
   - Analyze the resume to determine their field (e.g., Computer Science, Mechanical Engineering, Business, Data Science, Web Development, etc.)
   - Look at: education, skills, projects, coursework, certifications
   - Determine their specialization/focus area

8. PROVIDE FIELD-SPECIFIC RESUME PREPARATION GUIDE:
   - Based on their identified field, provide specific recommendations
   - Include field-specific skills they should add
   - Suggest field-specific projects they should build
   - Recommend field-specific certifications
   - Suggest field-specific platforms (GitHub for tech, Behance for design, etc.)
   - Include field-specific keywords and terminology
   - Recommend field-specific internships or experiences

Respond with ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "resume_score": <number 0-100>,
  "resume_level": "<Excellent|Good|Average|Needs Improvement>",
  "professional_comparison": "<How this resume compares to professional standards>",
  "summary": "<brief summary of the resume>",
  "identified_field": "<Identified field of education/specialization>",
  
  "score_explanation": {
    "why_this_score": "<2-3 sentences explaining the main reasons for this specific score. Focus on key factors that contributed to the score.>",
    "unique_aspects": [
      "<unique aspect 1 - something that stands out positively in this resume>",
      "<unique aspect 2 - something distinctive about their experience or skills>",
      "<unique aspect 3 - something that makes them stand out from other students>"
    ]
  },
  
  "linkedin_profile": {
    "has_linkedin": <true/false>,
    "current_status": "<What's currently on LinkedIn or missing>",
    "suggestions": [
      "<suggestion 1>",
      "<suggestion 2>",
      "<suggestion 3>"
    ],
    "optimization_tips": [
      "<tip 1>",
      "<tip 2>",
      "<tip 3>"
    ]
  },
  
  "github_profile": {
    "has_github": <true/false>,
    "current_status": "<What's currently on GitHub or missing>",
    "project_suggestions": [
      "<project idea 1>",
      "<project idea 2>",
      "<project idea 3>"
    ],
    "portfolio_tips": [
      "<tip 1>",
      "<tip 2>",
      "<tip 3>"
    ]
  },
  
  "other_profiles": {
    "mentioned_sites": ["<site 1>", "<site 2>"],
    "recommendations": [
      "<recommendation 1>",
      "<recommendation 2>",
      "<recommendation 3>"
    ]
  },
  
  "professional_standards": {
    "contact_info": "<Assessment of contact information>",
    "summary": "<Assessment of professional summary>",
    "education": "<Assessment of education section>",
    "experience": "<Assessment of experience/projects>",
    "skills": "<Assessment of skills section>",
    "certifications": "<Assessment of certifications>",
    "online_presence": "<Assessment of online profiles>",
    "formatting": "<Assessment of formatting and ATS compatibility>"
  },
  
  "student_specific": {
    "academic_projects": "<Assessment of academic projects>",
    "internships": "<Assessment of internship experience>",
    "leadership": "<Assessment of leadership/activities>",
    "awards": "<Assessment of awards/scholarships>",
    "recommendations": [
      "<recommendation 1>",
      "<recommendation 2>",
      "<recommendation 3>"
    ]
  },
  
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weak_areas": ["<area 1>", "<area 2>", "<area 3>"],
  
  "suggestions": [
    "<suggestion 1>",
    "<suggestion 2>",
    "<suggestion 3>",
    "<suggestion 4>",
    "<suggestion 5>"
  ],
  
  "recommended_tasks": [
    "<task 1>",
    "<task 2>",
    "<task 3>",
    "<task 4>",
    "<task 5>"
  ],
  
  "skills_identified": ["<skill 1>", "<skill 2>", "<skill 3>"],
  "experience_level": "<Fresher|Junior|Mid-level|Senior>",
  "ats_score": <number 0-100>,
  
  "key_insights": [
    "<insight 1>",
    "<insight 2>",
    "<insight 3>",
    "<insight 4>"
  ],
  
  "how_to_prepare_resume": {
    "field_specific_skills": [
      "<skill 1 specific to their field>",
      "<skill 2 specific to their field>",
      "<skill 3 specific to their field>",
      "<skill 4 specific to their field>",
      "<skill 5 specific to their field>"
    ],
    "field_specific_projects": [
      "<project idea 1 for their field>",
      "<project idea 2 for their field>",
      "<project idea 3 for their field>",
      "<project idea 4 for their field>",
      "<project idea 5 for their field>"
    ],
    "field_specific_certifications": [
      "<certification 1 for their field>",
      "<certification 2 for their field>",
      "<certification 3 for their field>",
      "<certification 4 for their field>"
    ],
    "field_specific_platforms": [
      "<platform 1 for their field with description>",
      "<platform 2 for their field with description>",
      "<platform 3 for their field with description>"
    ],
    "field_specific_keywords": [
      "<keyword 1 for their field>",
      "<keyword 2 for their field>",
      "<keyword 3 for their field>",
      "<keyword 4 for their field>",
      "<keyword 5 for their field>"
    ],
    "field_specific_experiences": [
      "<experience type 1 for their field>",
      "<experience type 2 for their field>",
      "<experience type 3 for their field>",
      "<experience type 4 for their field>"
    ],
    "formatting_tips": [
      "Use clear section headers",
      "Use consistent formatting",
      "Use bullet points for readability",
      "Keep margins 0.5-1 inch",
      "Use professional font (Arial, Calibri, etc.)",
      "Use 10-12pt font size",
      "Avoid colors and graphics",
      "Save as PDF to preserve formatting",
      "Use ATS-friendly format",
      "Proofread for spelling and grammar"
    ],
    "content_tips": [
      "Tailor resume to job description",
      "Use keywords from job posting",
      "Quantify achievements with numbers",
      "Use action verbs at start of bullets",
      "Focus on impact, not just duties",
      "Include relevant skills only",
      "Add metrics and results",
      "Show progression and growth",
      "Highlight unique projects",
      "Include relevant certifications"
    ]
  }
}`;
  }

  /**
   * Parse OpenRouter response
   */
  _parseResponse(content) {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ No JSON found in response:', content.substring(0, 200));
        throw new Error('No JSON found in response');
      }
      
      const analysis = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!analysis.resume_score || !analysis.resume_level) {
        throw new Error('Missing required fields in response');
      }
      
      return analysis;
      
    } catch (error) {
      console.error('❌ Parse error:', error.message);
      throw new Error(`Failed to parse OpenRouter response: ${error.message}`);
    }
  }

  /**
   * Generate improvement suggestions
   */
  async generateSuggestions(resumeText, weakAreas) {
    try {
      console.log('\n💡 [OPENROUTER] Generating improvement suggestions');
      
      const prompt = `Based on this resume and weak areas, provide specific improvement suggestions.

Resume:
${resumeText}

Weak Areas:
${weakAreas.join('\n')}

Respond with ONLY a valid JSON array of strings (no markdown, no extra text):
["<suggestion 1>", "<suggestion 2>", "<suggestion 3>", "<suggestion 4>", "<suggestion 5>"]`;

      const response = await axios.post(
        this.apiUrl,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Resume Analyzer'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      const suggestions = this._parseSuggestions(content);
      
      console.log(`✅ Suggestions generated: ${suggestions.length}`);
      
      return suggestions;
      
    } catch (error) {
      console.error('❌ Suggestion generation error:', error.message);
      throw error;
    }
  }

  /**
   * Parse suggestions response
   */
  _parseSuggestions(content) {
    try {
      const arrayMatch = content.match(/\[[\s\S]*\]/);
      if (!arrayMatch) {
        throw new Error('No array found in response');
      }
      
      return JSON.parse(arrayMatch[0]);
      
    } catch (error) {
      console.error('❌ Parse error:', error.message);
      return [];
    }
  }

  /**
   * Check if API key is configured
   */
  isConfigured() {
    return !!this.apiKey;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return cacheService.getStats();
  }

  /**
   * Clear cache
   */
  clearCache() {
    cacheService.clear();
  }
}

module.exports = new OpenRouterService();
