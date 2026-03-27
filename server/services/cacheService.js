/**
 * Cache Service for Resume Analysis
 * Stores analysis results to avoid redundant API calls for identical resumes
 */
const crypto = require('crypto');

class CacheService {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 100; // Maximum number of cached analyses
    console.log('✅ Cache service initialized');
  }

  /**
   * Generate hash of resume text for cache key
   */
  generateHash(resumeText, targetRole = '') {
    const combined = `${resumeText.trim()}|${targetRole.trim()}`;
    return crypto.createHash('sha256').update(combined).digest('hex');
  }

  /**
   * Get cached analysis if available
   */
  get(resumeText, targetRole = '') {
    const hash = this.generateHash(resumeText, targetRole);
    
    if (this.cache.has(hash)) {
      const cached = this.cache.get(hash);
      console.log(`✅ [CACHE] Hit - returning cached analysis`);
      console.log(`   Hash: ${hash.substring(0, 8)}...`);
      console.log(`   Cached at: ${new Date(cached.timestamp).toLocaleString()}`);
      return cached.data;
    }
    
    console.log(`❌ [CACHE] Miss - no cached analysis found`);
    console.log(`   Hash: ${hash.substring(0, 8)}...`);
    return null;
  }

  /**
   * Store analysis in cache
   */
  set(resumeText, targetRole = '', analysisData) {
    const hash = this.generateHash(resumeText, targetRole);
    
    // If cache is full, remove oldest entry
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      console.log(`⚠️  [CACHE] Cache full, removed oldest entry`);
    }
    
    this.cache.set(hash, {
      data: analysisData,
      timestamp: Date.now(),
      textLength: resumeText.length,
      targetRole: targetRole || 'none'
    });
    
    console.log(`✅ [CACHE] Stored analysis in cache`);
    console.log(`   Hash: ${hash.substring(0, 8)}...`);
    console.log(`   Cache size: ${this.cache.size}/${this.maxCacheSize}`);
  }

  /**
   * Clear all cache
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🗑️  [CACHE] Cleared ${size} cached analyses`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      entries: Array.from(this.cache.entries()).map(([hash, data]) => ({
        hash: hash.substring(0, 8) + '...',
        timestamp: new Date(data.timestamp).toLocaleString(),
        textLength: data.textLength,
        targetRole: data.targetRole
      }))
    };
  }
}

module.exports = new CacheService();
