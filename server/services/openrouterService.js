/**
 * OpenRouter Service for Resume Analysis
 * Uses OpenRouter API with multiple AI models
 */
const axios = require('axios');

class OpenRouterService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    
    if (!this.apiKey) {
      console.warn('⚠️  OPENROUTER_API_KEY not set in environment');
    } else {
      console.log('✅ OpenRouter API key configured');
    }
  }

  /**
   * Analyze resume using OpenRouter
   */
  async analyzeResume(resumeText, targetRole = '') {
    try {
      console.log('\n📊 [OPENROUTER] Analyzing resume with OpenRouter API');
      console.log(`   Text length: ${resumeText.length} characters`);
      console.log(`   Target role: ${targetRole || 'Not specified'}`);
      
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
      
      console.log(`✅ Analysis complete`);
      console.log(`   Score: ${analysis.resume_score}/100`);
      console.log(`   Level: ${analysis.resume_level}`);
      
      return analysis;
      
    } catch (error) {
      console.error('❌ OpenRouter error:', error.message);
      if (error.response?.data) {
        console.error('   Response:', error.response.data);
      }
      throw new Error(`OpenRouter analysis failed: ${error.message}`);
    }
  }

  /**
   * Build analysis prompt
   */
  _buildAnalysisPrompt(resumeText, targetRole) {
    return `Analyze this resume and provide detailed feedback in JSON format.

Resume:
${resumeText}

${targetRole ? `Target Role: ${targetRole}` : ''}

Respond with ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "resume_score": <number 0-100>,
  "resume_level": "<Excellent|Good|Average|Needs Improvement>",
  "summary": "<brief summary>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weak_areas": ["<area 1>", "<area 2>", "<area 3>"],
  "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>", "<suggestion 4>"],
  "recommended_tasks": ["<task 1>", "<task 2>", "<task 3>", "<task 4>"],
  "skills_identified": ["<skill 1>", "<skill 2>", "<skill 3>"],
  "experience_level": "<Junior|Mid-level|Senior>",
  "ats_score": <number 0-100>,
  "key_insights": ["<insight 1>", "<insight 2>", "<insight 3>"]
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
}

module.exports = new OpenRouterService();
