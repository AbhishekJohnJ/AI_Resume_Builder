/**
 * OpenAI Service for Resume Analysis
 * Uses OpenAI API for intelligent resume analysis
 */
const axios = require('axios');

class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    
    if (!this.apiKey) {
      console.warn('⚠️  OPENAI_API_KEY not set in environment');
    }
  }

  /**
   * Analyze resume using OpenAI
   */
  async analyzeResume(resumeText, targetRole = '') {
    try {
      console.log('\n📊 [OPENAI] Analyzing resume with OpenAI API');
      console.log(`   Text length: ${resumeText.length} characters`);
      
      const prompt = this._buildPrompt(resumeText, targetRole);
      
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert resume analyst. Analyze resumes and provide detailed feedback in JSON format.'
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
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ OpenAI response received');
      
      const content = response.data.choices[0].message.content;
      const analysis = this._parseResponse(content);
      
      return analysis;
      
    } catch (error) {
      console.error('❌ OpenAI error:', error.message);
      throw new Error(`OpenAI analysis failed: ${error.message}`);
    }
  }

  /**
   * Build analysis prompt
   */
  _buildPrompt(resumeText, targetRole) {
    return `Analyze this resume and provide detailed feedback in JSON format.

Resume:
${resumeText}

${targetRole ? `Target Role: ${targetRole}` : ''}

Provide analysis in this exact JSON format:
{
  "resume_score": <number 0-100>,
  "resume_level": "<Excellent|Good|Average|Needs Improvement>",
  "summary": "<brief summary>",
  "strengths": [<list of 3-5 strengths>],
  "weak_areas": [<list of 3-5 areas to improve>],
  "suggestions": [<list of 4 actionable suggestions>],
  "recommended_tasks": [<list of 4 recommended tasks>],
  "skills_identified": [<list of skills found>],
  "experience_level": "<Junior|Mid-level|Senior>",
  "ats_score": <number 0-100>,
  "key_insights": [<list of 3-5 key insights>]
}`;
  }

  /**
   * Parse OpenAI response
   */
  _parseResponse(content) {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const analysis = JSON.parse(jsonMatch[0]);
      
      console.log(`✅ Analysis parsed`);
      console.log(`   Score: ${analysis.resume_score}/100`);
      console.log(`   Level: ${analysis.resume_level}`);
      
      return analysis;
      
    } catch (error) {
      console.error('❌ Parse error:', error.message);
      throw new Error(`Failed to parse OpenAI response: ${error.message}`);
    }
  }

  /**
   * Generate improvement suggestions
   */
  async generateSuggestions(resumeText, weakAreas) {
    try {
      console.log('\n💡 [OPENAI] Generating improvement suggestions');
      
      const prompt = `Based on this resume and weak areas, provide specific improvement suggestions.

Resume:
${resumeText}

Weak Areas:
${weakAreas.join('\n')}

Provide 5 specific, actionable suggestions to improve this resume. Format as JSON array of strings.`;

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
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      const suggestions = this._parseSuggestions(content);
      
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
}

module.exports = new OpenAIService();
