/**
 * Gamification System - Quest-Based XP & Feature Unlocks
 * Users complete daily quests to earn XP, then spend XP to unlock feature uses
 * Data is stored per user in the database
 */

// â”€â”€ Feature Limits & Unlock Costs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const FEATURES = {
  resume: {
    initialLimit: 3,  // 3 free trials
    unlockCost: 20,   // 20 XP per use after free trials
    unlockAmount: 1,  // Unlock 1 use at a time
    label: 'Resume Builder',
    usesKey: 'resumeUses',
    limitKey: 'resumeLimit'
  },
  aiAnalysis: {
    initialLimit: 3,  // 3 free trials
    unlockCost: 50,   // 50 XP per use after free trials
    unlockAmount: 1,  // Unlock 1 use at a time
    label: 'AI Analysis',
    usesKey: 'aiAnalysisUses',
    limitKey: 'aiAnalysisLimit'
  },
  portfolio: {
    initialLimit: 3,  // 3 free trials
    unlockCost: 30,   // 30 XP per use after free trials
    unlockAmount: 1,  // Unlock 1 use at a time
    label: 'Portfolio Builder',
    usesKey: 'portfolioUses',
    limitKey: 'portfolioLimit'
  }
};

// â”€â”€ Daily Quests (6 quests, each completable once per day) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DAILY_QUESTS = [
  { id: 1, name: 'Resume Sniper', desc: 'Analyse your resume with AI and score above 70', xp: 50 },
  { id: 2, name: 'Portfolio Architect', desc: 'Generate a portfolio using any template', xp: 40 },
  { id: 3, name: 'Resume Crafter', desc: 'Build a resume using the Resume Builder', xp: 30 },
  { id: 4, name: 'Template Explorer', desc: 'Preview at least 5 different resume templates', xp: 20 },
  { id: 5, name: 'Score Chaser', desc: 'Re-analyse your resume after edits to improve your score', xp: 60 },
  { id: 6, name: 'Portfolio Explorer', desc: 'Preview at least 3 different portfolio templates', xp: 25 }
];

// â”€â”€ Helper: Get Current User ID â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getCurrentUserId() {
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  return user?.id;
}

// â”€â”€ API: Fetch Gamification Data from Server â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function fetchGamificationData() {
  const userId = getCurrentUserId();
  if (!userId) {
    console.warn('No user logged in');
    return getDefaultData();
  }

  try {
    const response = await fetch(`http://localhost:3001/api/gamification/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch gamification data');
    return await response.json();
  } catch (error) {
    console.error('Error fetching gamification data:', error);
    return getDefaultData();
  }
}

// â”€â”€ API: Save Gamification Data to Server â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function saveGamificationData(data) {
  const userId = getCurrentUserId();
  if (!userId) {
    console.warn('No user logged in');
    return;
  }

  try {
    const response = await fetch(`http://localhost:3001/api/gamification/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to save gamification data');
    
    // Dispatch event to update UI
    window.dispatchEvent(new Event('gamificationUpdate'));
  } catch (error) {
    console.error('Error saving gamification data:', error);
  }
}

// â”€â”€ Get Default Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getDefaultData() {
  return {
    userXP: 0,              // Available XP (can be spent)
    totalEarnedXP: 0,       // Lifetime earned XP (never decreases)
    resumeUses: 0,
    aiAnalysisUses: 0,
    portfolioUses: 0,
    resumeLimit: FEATURES.resumeUses.initialLimit,
    aiAnalysisLimit: FEATURES.aiAnalysisUses.initialLimit,
    portfolioLimit: FEATURES.portfolioUses.initialLimit,
    completedQuests: [],
    lastQuestReset: new Date().toDateString(),
    questActions: {}
  };
}

// â”€â”€ Initialize User Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function initializeGamification() {
  return await fetchGamificationData();
}

// â”€â”€ Get Current Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getGamificationData() {
  return await fetchGamificationData();
}

// â”€â”€ Check if Feature is Locked â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function isFeatureLocked(featureName) {
  const data = await getGamificationData();
  const feature = FEATURES[featureName];
  if (!feature) return true;
  
  const usesKey = feature.usesKey;
  const limitKey = feature.limitKey;
  return data[usesKey] >= data[limitKey];
}

// â”€â”€ Get Remaining Uses â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getRemainingUses(featureName) {
  const data = await getGamificationData();
  const feature = FEATURES[featureName];
  if (!feature) return 0;
  
  const usesKey = feature.usesKey;
  const limitKey = feature.limitKey;
  return Math.max(0, data[limitKey] - data[usesKey]);
}

// â”€â”€ Increment Feature Usage & Auto-Complete Quest â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function incrementFeatureUsage(featureName, questId = null) {
  const data = await getGamificationData();
  const feature = FEATURES[featureName];
  if (!feature) return data;
  
  const usesKey = feature.usesKey;
  data[usesKey] = (data[usesKey] || 0) + 1;
  
  // Auto-complete associated quest on first use
  if (questId && data[usesKey] === 1) {
    const quest = DAILY_QUESTS.find(q => q.id === questId);
    if (quest && !data.completedQuests.includes(questId)) {
      data.userXP = (data.userXP || 0) + quest.xp;
      data.totalEarnedXP = (data.totalEarnedXP || 0) + quest.xp;  // Track lifetime earnings
      data.completedQuests.push(questId);
      
      await saveGamificationData(data);
      
      // Dispatch event to update UI
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('questCompleted', { 
          detail: { questName: quest.name, xp: quest.xp } 
        }));
      }, 500);
      
      return data;
    }
  }
  
  await saveGamificationData(data);
  return data;
}

// â”€â”€ Complete Quest & Award XP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function completeQuest(questId) {
  const data = await getGamificationData();
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
  data.totalEarnedXP = (data.totalEarnedXP || 0) + quest.xp;  // Track lifetime earnings
  data.completedQuests.push(questId);
  
  await saveGamificationData(data);
  return { 
    success: true, 
    xpEarned: quest.xp,
    newXP: data.userXP,
    questName: quest.name
  };
}

// â”€â”€ Check if Quest is Completed â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function isQuestCompleted(questId) {
  const data = await getGamificationData();
  return data.completedQuests.includes(questId);
}

// â”€â”€ Get All Quests with Status â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getAllQuests() {
  const data = await getGamificationData();
  return DAILY_QUESTS.map(quest => ({
    ...quest,
    completed: data.completedQuests.includes(quest.id)
  }));
}

// â”€â”€ Unlock More Uses (Spend XP) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function unlockFeature(featureName) {
  const data = await getGamificationData();
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
  data.userXP -= feature.unlockCost;  // Only deduct from available XP
  // totalEarnedXP stays the same (never decreases)
  const limitKey = feature.limitKey;
  data[limitKey] = (data[limitKey] || feature.initialLimit) + feature.unlockAmount;
  
  await saveGamificationData(data);
  return { 
    success: true, 
    newLimit: data[limitKey],
    remainingXP: data.userXP 
  };
}

// â”€â”€ Get Lock Message â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getLockMessage(featureName) {
  const feature = FEATURES[featureName];
  if (!feature) return '';
  
  const data = await getGamificationData();
  const needed = Math.max(0, feature.unlockCost - data.userXP);
  
  if (needed > 0) {
    return `Complete quests to earn ${needed} more XP`;
  }
  return `Unlock ${feature.unlockAmount} more uses for ${feature.unlockCost} XP`;
}

// â”€â”€ Get Feature Info â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getFeatureInfo(featureName) {
  const feature = FEATURES[featureName];
  if (!feature) return null;
  
  const data = await getGamificationData();
  const usesKey = feature.usesKey;
  const limitKey = feature.limitKey;
  
  return {
    label: feature.label,
    used: data[usesKey] || 0,
    limit: data[limitKey] || feature.initialLimit,
    remaining: await getRemainingUses(featureName),
    locked: await isFeatureLocked(featureName),
    unlockCost: feature.unlockCost,
    unlockAmount: feature.unlockAmount,
    canUnlock: data.userXP >= feature.unlockCost
  };
}

// â”€â”€ Track Quest Actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function trackQuestAction(questId, actionData = {}) {
  const data = await getGamificationData();
  
  // Initialize action tracking if not exists
  if (!data.questActions) {
    data.questActions = {};
  }
  
  // Track the action
  const actionKey = `quest_${questId}`;
  if (!data.questActions[actionKey]) {
    data.questActions[actionKey] = { count: 0, data: {}, uniqueItems: [] };
  }
  
  data.questActions[actionKey].count += 1;
  data.questActions[actionKey].data = { ...data.questActions[actionKey].data, ...actionData };
  
  // Track unique items (for template previews, portfolio views, etc.)
  if (actionData.uniqueId) {
    if (!data.questActions[actionKey].uniqueItems) {
      data.questActions[actionKey].uniqueItems = [];
    }
    if (!data.questActions[actionKey].uniqueItems.includes(actionData.uniqueId)) {
      data.questActions[actionKey].uniqueItems.push(actionData.uniqueId);
    }
  }
  
  await saveGamificationData(data);
  
  // Check if quest should auto-complete based on action count
  await checkQuestCompletion(questId, data);
  
  return data.questActions[actionKey];
}

// â”€â”€ Check Quest Completion Based on Actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function checkQuestCompletion(questId, data = null) {
  if (!data) data = await getGamificationData();
  
  const quest = DAILY_QUESTS.find(q => q.id === questId);
  if (!quest || data.completedQuests.includes(questId)) return;
  
  const actionKey = `quest_${questId}`;
  const action = data.questActions?.[actionKey];
  
  let shouldComplete = false;
  
  // Quest 4: Template Explorer - Preview at least 5 different templates
  if (questId === 4 && action?.uniqueItems?.length >= 5) {
    shouldComplete = true;
  }
  
  // Quest 5: Score Chaser - Re-analyse resume (at least 2 analyses)
  if (questId === 5 && data.aiAnalysisUses >= 2) {
    shouldComplete = true;
  }
  
  // Quest 6: Portfolio Explorer - Preview at least 3 different portfolio templates
  if (questId === 6 && action?.uniqueItems?.length >= 3) {
    shouldComplete = true;
  }
  
  if (shouldComplete) {
    data.userXP = (data.userXP || 0) + quest.xp;
    data.totalEarnedXP = (data.totalEarnedXP || 0) + quest.xp;  // Track lifetime earnings
    data.completedQuests.push(questId);
    await saveGamificationData(data);
    
    // Dispatch event to update UI
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('questCompleted', { 
        detail: { questName: quest.name, xp: quest.xp } 
      }));
    }, 500);
  }
}

// â”€â”€ Get Quest Action Count â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getQuestActionCount(questId) {
  const data = await getGamificationData();
  const actionKey = `quest_${questId}`;
  return data.questActions?.[actionKey]?.count || 0;
}

