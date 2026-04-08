/**
 * Gamification System - Usage Limits & XP Unlocks
 * Manages feature usage tracking, XP rewards, and unlock system
 */

// ── Feature Limits & Unlock Costs ──────────────────────────────────────────
const FEATURES = {
  resumeUses: {
    initialLimit: 5,
    unlockCost: 50,
    unlockAmount: 3,
    label: 'Resume Builder'
  },
  aiAnalysisUses: {
    initialLimit: 3,
    unlockCost: 40,
    unlockAmount: 2,
    label: 'AI Analysis'
  },
  portfolioUses: {
    initialLimit: 2,
    unlockCost: 60,
    unlockAmount: 2,
    label: 'Portfolio Builder'
  }
};

// ── XP Rewards ─────────────────────────────────────────────────────────────
const XP_REWARDS = {
  resumeCreated: 10,
  resumeImproved: 15,
  resumeUploaded: 20,
  portfolioCreated: 15,
  aiAnalysisCompleted: 12
};

// ── Initialize User Data ───────────────────────────────────────────────────
export function initializeGamification() {
  const existing = localStorage.getItem('gamificationData');
  if (!existing) {
    const data = {
      userXP: 0,
      resumeUses: 0,
      aiAnalysisUses: 0,
      portfolioUses: 0,
      resumeLimit: FEATURES.resumeUses.initialLimit,
      aiAnalysisLimit: FEATURES.aiAnalysisUses.initialLimit,
      portfolioLimit: FEATURES.portfolioUses.initialLimit
    };
    localStorage.setItem('gamificationData', JSON.stringify(data));
    return data;
  }
  return JSON.parse(existing);
}

// ── Get Current Data ───────────────────────────────────────────────────────
export function getGamificationData() {
  return initializeGamification();
}

// ── Update Data ────────────────────────────────────────────────────────────
function saveGamificationData(data) {
  localStorage.setItem('gamificationData', JSON.stringify(data));
  window.dispatchEvent(new Event('gamificationUpdate'));
}

// ── Check if Feature is Locked ─────────────────────────────────────────────
export function isFeatureLocked(featureName) {
  const data = getGamificationData();
  const usesKey = `${featureName}Uses`;
  const limitKey = `${featureName}Limit`;
  return data[usesKey] >= data[limitKey];
}

// ── Get Remaining Uses ─────────────────────────────────────────────────────
export function getRemainingUses(featureName) {
  const data = getGamificationData();
  const usesKey = `${featureName}Uses`;
  const limitKey = `${featureName}Limit`;
  return Math.max(0, data[limitKey] - data[usesKey]);
}

// ── Increment Feature Usage ────────────────────────────────────────────────
export function incrementFeatureUsage(featureName) {
  const data = getGamificationData();
  const usesKey = `${featureName}Uses`;
  data[usesKey] = (data[usesKey] || 0) + 1;
  saveGamificationData(data);
  return data;
}

// ── Award XP ───────────────────────────────────────────────────────────────
export function awardXP(action) {
  const data = getGamificationData();
  const xpAmount = XP_REWARDS[action] || 0;
  data.userXP = (data.userXP || 0) + xpAmount;
  saveGamificationData(data);
  return { newXP: data.userXP, earned: xpAmount };
}

// ── Unlock More Uses ───────────────────────────────────────────────────────
export function unlockFeature(featureName) {
  const data = getGamificationData();
  const feature = FEATURES[featureName];
  
  if (!feature) {
    return { success: false, error: 'Invalid feature' };
  }

  if (data.userXP < feature.unlockCost) {
    return { 
      success: false, 
      error: `Need ${feature.unlockCost - data.userXP} more XP` 
    };
  }

  // Deduct XP and increase limit
  data.userXP -= feature.unlockCost;
  const limitKey = `${featureName}Limit`;
  data[limitKey] = (data[limitKey] || feature.initialLimit) + feature.unlockAmount;
  
  saveGamificationData(data);
  return { 
    success: true, 
    newLimit: data[limitKey],
    remainingXP: data.userXP 
  };
}

// ── Get Lock Message ───────────────────────────────────────────────────────
export function getLockMessage(featureName) {
  const feature = FEATURES[featureName];
  if (!feature) return '';
  
  const data = getGamificationData();
  const needed = Math.max(0, feature.unlockCost - data.userXP);
  
  if (needed > 0) {
    return `Earn ${needed} more XP to unlock ${feature.unlockAmount} more uses`;
  }
  return `Unlock ${feature.unlockAmount} more uses for ${feature.unlockCost} XP`;
}

// ── Get Feature Info ───────────────────────────────────────────────────────
export function getFeatureInfo(featureName) {
  const feature = FEATURES[featureName];
  const data = getGamificationData();
  const usesKey = `${featureName}Uses`;
  const limitKey = `${featureName}Limit`;
  
  return {
    label: feature.label,
    used: data[usesKey] || 0,
    limit: data[limitKey] || feature.initialLimit,
    remaining: getRemainingUses(featureName),
    locked: isFeatureLocked(featureName),
    unlockCost: feature.unlockCost,
    unlockAmount: feature.unlockAmount,
    canUnlock: data.userXP >= feature.unlockCost
  };
}

// ── Export Constants ───────────────────────────────────────────────────────
export { FEATURES, XP_REWARDS };
