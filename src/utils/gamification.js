/**
 * Gamification System - Quest-Based XP & Feature Unlocks
 * Users complete daily quests to earn XP, then spend XP to unlock feature uses
 */

// ── Feature Limits & Unlock Costs ──────────────────────────────────────────
const FEATURES = {
  resumeUses: {
    initialLimit: 3,  // 3 free trials
    unlockCost: 50,
    unlockAmount: 3,
    label: 'Resume Builder'
  },
  aiAnalysisUses: {
    initialLimit: 3,  // 3 free trials
    unlockCost: 40,
    unlockAmount: 2,
    label: 'AI Analysis'
  },
  portfolioUses: {
    initialLimit: 3,  // 3 free trials
    unlockCost: 60,
    unlockAmount: 2,
    label: 'Portfolio Builder'
  }
};

// ── Daily Quests (6 quests, each completable once per day) ─────────────────
const DAILY_QUESTS = [
  { id: 1, name: 'Resume Sniper', desc: 'Analyse your resume with AI and score above 70', xp: 50 },
  { id: 2, name: 'Portfolio Architect', desc: 'Generate a portfolio using any template', xp: 40 },
  { id: 3, name: 'Resume Crafter', desc: 'Build a resume using the Resume Builder', xp: 30 },
  { id: 4, name: 'Template Explorer', desc: 'Preview at least 5 different resume templates', xp: 20 },
  { id: 5, name: 'Score Chaser', desc: 'Re-analyse your resume after edits to improve your score', xp: 60 },
  { id: 6, name: 'Portfolio Pro', desc: 'Save and view your generated portfolio', xp: 35 }
];

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
      portfolioLimit: FEATURES.portfolioUses.initialLimit,
      completedQuests: [], // Quest IDs completed today
      lastQuestReset: new Date().toDateString() // Track daily reset
    };
    localStorage.setItem('gamificationData', JSON.stringify(data));
    return data;
  }
  
  const data = JSON.parse(existing);
  
  // Check if we need to reset daily quests
  const today = new Date().toDateString();
  if (data.lastQuestReset !== today) {
    data.completedQuests = [];
    data.lastQuestReset = today;
    localStorage.setItem('gamificationData', JSON.stringify(data));
  }
  
  return data;
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

// ── Increment Feature Usage & Auto-Complete Quest ─────────────────────────
export function incrementFeatureUsage(featureName, questId = null) {
  const data = getGamificationData();
  const usesKey = `${featureName}Uses`;
  data[usesKey] = (data[usesKey] || 0) + 1;
  
  // Auto-complete associated quest on first use
  if (questId && data[usesKey] === 1) {
    const quest = DAILY_QUESTS.find(q => q.id === questId);
    if (quest && !data.completedQuests.includes(questId)) {
      data.userXP = (data.userXP || 0) + quest.xp;
      data.completedQuests.push(questId);
      
      saveGamificationData(data);
      
      // Dispatch event to update UI
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('questCompleted', { 
          detail: { questName: quest.name, xp: quest.xp } 
        }));
      }, 500);
      
      return data;
    }
  }
  
  saveGamificationData(data);
  return data;
}

// ── Complete Quest & Award XP ──────────────────────────────────────────────
export function completeQuest(questId) {
  const data = getGamificationData();
  const quest = DAILY_QUESTS.find(q => q.id === questId);
  
  if (!quest) {
    return { success: false, error: 'Invalid quest' };
  }
  
  // Check if already completed today
  if (data.completedQuests.includes(questId)) {
    return { success: false, error: 'Quest already completed today' };
  }
  
  // Award XP and mark as completed
  data.userXP = (data.userXP || 0) + quest.xp;
  data.completedQuests.push(questId);
  
  saveGamificationData(data);
  return { 
    success: true, 
    xpEarned: quest.xp,
    newXP: data.userXP,
    questName: quest.name
  };
}

// ── Check if Quest is Completed ────────────────────────────────────────────
export function isQuestCompleted(questId) {
  const data = getGamificationData();
  return data.completedQuests.includes(questId);
}

// ── Get All Quests with Status ─────────────────────────────────────────────
export function getAllQuests() {
  const data = getGamificationData();
  return DAILY_QUESTS.map(quest => ({
    ...quest,
    completed: data.completedQuests.includes(quest.id)
  }));
}

// ── Unlock More Uses (Spend XP) ────────────────────────────────────────────
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
    return `Complete quests to earn ${needed} more XP`;
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

// ── Track Quest Actions ───────────────────────────────────────────────────
export function trackQuestAction(questId, actionData = {}) {
  const data = getGamificationData();
  
  // Initialize action tracking if not exists
  if (!data.questActions) {
    data.questActions = {};
  }
  
  // Track the action
  const actionKey = `quest_${questId}`;
  if (!data.questActions[actionKey]) {
    data.questActions[actionKey] = { count: 0, data: {} };
  }
  
  data.questActions[actionKey].count += 1;
  data.questActions[actionKey].data = { ...data.questActions[actionKey].data, ...actionData };
  
  saveGamificationData(data);
  return data.questActions[actionKey];
}

// ── Get Quest Action Count ─────────────────────────────────────────────────
export function getQuestActionCount(questId) {
  const data = getGamificationData();
  const actionKey = `quest_${questId}`;
  return data.questActions?.[actionKey]?.count || 0;
}
