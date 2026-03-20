/**
 * TF-IDF Analyzer for Resume Analysis
 * Extracts key features from resumes using TF-IDF vectorization
 * max_features=500, ngram_range=(1,2)
 */

class TFIDFAnalyzer {
  constructor(maxFeatures = 500, ngramRange = [1, 2]) {
    this.maxFeatures = maxFeatures;
    this.ngramRange = ngramRange;
    this.vocabulary = new Map();
    this.idf = new Map();
    this.documents = [];
  }

  /**
   * Tokenize text into words
   */
  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  /**
   * Generate n-grams from tokens
   */
  generateNgrams(tokens, ngramRange) {
    const ngrams = [];
    const [minN, maxN] = ngramRange;

    for (let n = minN; n <= maxN; n++) {
      for (let i = 0; i <= tokens.length - n; i++) {
        const ngram = tokens.slice(i, i + n).join(' ');
        ngrams.push(ngram);
      }
    }

    return ngrams;
  }

  /**
   * Fit the vectorizer on documents
   */
  fit(documents) {
    this.documents = documents;
    const documentFrequency = new Map();
    const allNgrams = new Set();

    // Calculate document frequency
    documents.forEach(doc => {
      const tokens = this.tokenize(doc);
      const ngrams = this.generateNgrams(tokens, this.ngramRange);
      const uniqueNgrams = new Set(ngrams);

      uniqueNgrams.forEach(ngram => {
        documentFrequency.set(ngram, (documentFrequency.get(ngram) || 0) + 1);
        allNgrams.add(ngram);
      });
    });

    // Sort by frequency and select top features
    const sortedNgrams = Array.from(allNgrams)
      .sort((a, b) => (documentFrequency.get(b) || 0) - (documentFrequency.get(a) || 0))
      .slice(0, this.maxFeatures);

    // Build vocabulary
    sortedNgrams.forEach((ngram, index) => {
      this.vocabulary.set(ngram, index);
    });

    // Calculate IDF
    const N = documents.length;
    this.vocabulary.forEach((index, ngram) => {
      const df = documentFrequency.get(ngram) || 1;
      const idf = Math.log(N / df) + 1;
      this.idf.set(ngram, idf);
    });

    return this;
  }

  /**
   * Transform a document to TF-IDF vector
   */
  transform(document) {
    const tokens = this.tokenize(document);
    const ngrams = this.generateNgrams(tokens, this.ngramRange);
    const termFrequency = new Map();

    // Calculate term frequency
    ngrams.forEach(ngram => {
      termFrequency.set(ngram, (termFrequency.get(ngram) || 0) + 1);
    });

    // Create TF-IDF vector
    const vector = new Map();
    termFrequency.forEach((tf, ngram) => {
      if (this.vocabulary.has(ngram)) {
        const index = this.vocabulary.get(ngram);
        const idf = this.idf.get(ngram) || 1;
        const tfidf = tf * idf;
        vector.set(index, tfidf);
      }
    });

    return vector;
  }

  /**
   * Fit and transform in one step
   */
  fitTransform(documents) {
    this.fit(documents);
    return documents.map(doc => this.transform(doc));
  }

  /**
   * Get top features from a document
   */
  getTopFeatures(document, topN = 20) {
    const vector = this.transform(document);
    const features = Array.from(vector.entries())
      .map(([index, tfidf]) => {
        const ngram = Array.from(this.vocabulary.entries())
          .find(([_, idx]) => idx === index)?.[0];
        return { ngram, tfidf, index };
      })
      .sort((a, b) => b.tfidf - a.tfidf)
      .slice(0, topN);

    return features;
  }

  /**
   * Extract key skills and terms from resume
   */
  extractKeyTerms(resumeText, topN = 30) {
    const topFeatures = this.getTopFeatures(resumeText, topN);
    return topFeatures.map(f => ({
      term: f.ngram,
      score: parseFloat(f.tfidf.toFixed(4)),
      weight: parseFloat((f.tfidf / (topFeatures[0]?.tfidf || 1)).toFixed(2))
    }));
  }

  /**
   * Analyze resume and extract insights
   */
  analyzeResume(resumeText) {
    const tokens = this.tokenize(resumeText);
    const ngrams = this.generateNgrams(tokens, this.ngramRange);
    const keyTerms = this.extractKeyTerms(resumeText, 50);

    // Categorize terms
    const skillKeywords = ['python', 'javascript', 'react', 'node', 'java', 'sql', 'aws', 'docker', 'kubernetes', 'git', 'html', 'css', 'mongodb', 'express', 'angular', 'vue', 'typescript', 'golang', 'rust', 'c++', 'c#', 'php', 'ruby', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'tensorflow', 'pytorch', 'scikit', 'pandas', 'numpy', 'spark', 'hadoop', 'kafka', 'elasticsearch', 'redis', 'postgresql', 'mysql', 'oracle', 'firebase', 'graphql', 'rest', 'soap', 'microservices', 'devops', 'cicd', 'jenkins', 'gitlab', 'github', 'bitbucket', 'jira', 'agile', 'scrum', 'linux', 'windows', 'macos', 'ios', 'android', 'flutter', 'react native', 'machine learning', 'deep learning', 'nlp', 'computer vision', 'data science', 'analytics', 'tableau', 'power bi', 'excel', 'vba', 'salesforce', 'sap', 'erp', 'crm', 'blockchain', 'solidity', 'web3', 'cloud', 'azure', 'gcp', 'heroku', 'netlify', 'vercel', 'api', 'json', 'xml', 'html5', 'es6', 'webpack', 'babel', 'npm', 'yarn', 'git', 'svn', 'jira', 'confluence', 'slack', 'figma', 'sketch', 'photoshop', 'illustrator', 'xd', 'ui', 'ux', 'design', 'testing', 'jest', 'mocha', 'cypress', 'selenium', 'junit', 'pytest', 'rspec', 'postman', 'insomnia', 'swagger', 'openapi'];
    
    const experienceKeywords = ['experience', 'worked', 'developed', 'designed', 'implemented', 'managed', 'led', 'created', 'built', 'deployed', 'maintained', 'optimized', 'improved', 'enhanced', 'architected', 'engineered', 'contributed', 'collaborated', 'mentored', 'trained', 'supervised', 'directed', 'coordinated', 'oversaw', 'spearheaded', 'pioneered', 'established', 'launched', 'scaled', 'automated', 'streamlined', 'reduced', 'increased', 'achieved', 'exceeded', 'delivered', 'completed', 'accomplished', 'resolved', 'solved', 'troubleshot', 'debugged', 'tested', 'reviewed', 'documented', 'analyzed', 'evaluated', 'assessed', 'monitored', 'tracked', 'reported', 'presented', 'communicated', 'negotiated', 'facilitated', 'organized', 'planned', 'scheduled', 'budgeted', 'forecasted', 'strategized', 'innovated', 'optimized', 'refactored', 'migrated', 'integrated', 'synchronized', 'orchestrated'];

    const educationKeywords = ['bachelor', 'master', 'phd', 'degree', 'diploma', 'certificate', 'university', 'college', 'school', 'institute', 'academy', 'bootcamp', 'course', 'training', 'certification', 'gpa', 'honors', 'distinction', 'cum laude', 'magna cum laude', 'summa cum laude'];

    const certificationKeywords = ['certified', 'certification', 'aws', 'azure', 'gcp', 'cissp', 'ccna', 'ccnp', 'ccie', 'scrum', 'pmp', 'prince2', 'itil', 'comptia', 'security+', 'network+', 'a+', 'oracle', 'microsoft', 'google', 'coursera', 'udacity', 'pluralsight', 'linkedin learning', 'edx', 'datacamp', 'codecademy'];

    // Extract skills - both from predefined keywords AND from top terms
    const matchedSkills = keyTerms.filter(t => skillKeywords.some(sk => t.term.toLowerCase().includes(sk.toLowerCase())));
    
    // Add top terms that look like skills (capitalized words, technical terms)
    const additionalSkills = keyTerms.filter(t => {
      const term = t.term.toLowerCase();
      // Include if it's a top term and not already matched
      return !matchedSkills.some(s => s.term === t.term) &&
             (term.length > 2 && term.length < 30) && // reasonable length
             (t.weight > 0.3 || t.score > 2); // high TF-IDF score
    });

    const allSkills = [...matchedSkills, ...additionalSkills].slice(0, 20);
    
    const experience = keyTerms.filter(t => experienceKeywords.some(ek => t.term.includes(ek)));
    const education = keyTerms.filter(t => educationKeywords.some(ek => t.term.includes(ek)));
    const certifications = keyTerms.filter(t => certificationKeywords.some(ck => t.term.includes(ck)));

    return {
      totalTokens: tokens.length,
      totalNgrams: ngrams.length,
      uniqueNgrams: new Set(ngrams).size,
      keyTerms: keyTerms,
      categorizedTerms: {
        skills: allSkills.slice(0, 15),
        experience: experience.slice(0, 10),
        education: education.slice(0, 5),
        certifications: certifications.slice(0, 5)
      },
      termDensity: {
        skills: allSkills.length,
        experience: experience.length,
        education: education.length,
        certifications: certifications.length
      }
    };
  }

  /**
   * Compare two resumes using TF-IDF similarity
   */
  cosineSimilarity(vector1, vector2) {
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    vector1.forEach((value) => {
      magnitude1 += value * value;
    });

    vector2.forEach((value) => {
      magnitude2 += value * value;
    });

    vector1.forEach((value, index) => {
      if (vector2.has(index)) {
        dotProduct += value * vector2.get(index);
      }
    });

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Get vocabulary size
   */
  getVocabularySize() {
    return this.vocabulary.size;
  }

  /**
   * Get feature names
   */
  getFeatureNames() {
    return Array.from(this.vocabulary.keys());
  }
}

module.exports = TFIDFAnalyzer;
