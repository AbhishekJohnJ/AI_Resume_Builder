# XP System Update - Separate Earned vs Available XP

## Overview
The XP system now tracks two separate values to properly handle earning and spending XP:

### 1. **Available XP** (`userXP`)
- Displayed in: **TopBar** (top-right corner)
- Purpose: Current XP balance that can be spent
- Behavior: 
  - ✅ Increases when completing quests
  - ❌ Decreases when unlocking features (Resume Builder, Portfolio Builder, AI Analysis)
  - Can go down to 0

### 2. **Total Earned XP** (`totalEarnedXP`)
- Displayed in: **Career Quest Board** (Dashboard)
- Purpose: Lifetime XP earned from all completed quests
- Behavior:
  - ✅ Increases when completing quests
  - ✅ NEVER decreases (permanent record)
  - Used for calculating career level and quest completion percentage

## Career Levels (Based on Total Earned XP)
- **Rookie**: 0-49 XP
- **Builder**: 50-119 XP
- **Pro**: 120-199 XP
- **Elite**: 200+ XP

## Quest XP Values
| Quest ID | Quest Name | XP | Rarity |
|----------|------------|-----|--------|
| 1 | Resume Sniper | 50 XP | Epic |
| 2 | Portfolio Architect | 40 XP | Rare |
| 3 | Resume Crafter | 30 XP | Common |
| 4 | Template Explorer | 20 XP | Common |
| 5 | Score Chaser | 60 XP | Epic |
| 6 | Portfolio Explorer | 25 XP | Rare |
| **TOTAL** | **All Quests** | **225 XP** | - |

## Example Scenario

### User completes all 6 quests:
- **Total Earned XP**: 225 XP (100% - shown in Career Quest Board)
- **Available XP**: 225 XP (shown in TopBar)
- **Career Level**: Elite

### User spends 100 XP to unlock features:
- **Total Earned XP**: 225 XP (unchanged - still 100%)
- **Available XP**: 125 XP (decreased - shown in TopBar)
- **Career Level**: Elite (unchanged)

## Database Schema Update

```javascript
gamification: {
  userXP: 0,              // Available XP (can be spent)
  totalEarnedXP: 0,       // Lifetime earned XP (never decreases)
  resumeUses: 0,
  aiAnalysisUses: 0,
  portfolioUses: 0,
  resumeLimit: 3,
  aiAnalysisLimit: 3,
  portfolioLimit: 3,
  completedQuests: [],
  lastQuestReset: null,
  questActions: {}
}
```

## How to Fix Existing Users

Run the fix script to update existing users:

```bash
cd server
node fixUserXP.js
```

This script will:
1. Calculate correct `totalEarnedXP` based on completed quests
2. Set `userXP` to `totalEarnedXP` if it's currently 0
3. Ensure both values are properly initialized

## Files Modified

### Server
- `server/server.js` - Updated user schema and gamification initialization
- `server/fixUserXP.js` - Script to fix existing user data

### Client
- `src/utils/gamification.js` - Updated to track both XP values
- `src/pages/Dashboard.jsx` - Uses `totalEarnedXP` for Career Quest Board
- `src/components/XPCounter.jsx` - Uses `userXP` for TopBar display

## Testing

1. Complete a quest → Both `userXP` and `totalEarnedXP` increase
2. Spend XP to unlock a feature → Only `userXP` decreases
3. Check Career Quest Board → Shows `totalEarnedXP` (never decreases)
4. Check TopBar → Shows `userXP` (available balance)

## Benefits

✅ Users can see their lifetime achievements (totalEarnedXP)
✅ Users can track their spendable balance (userXP)
✅ Career level is based on total earned, not current balance
✅ Quest completion percentage is accurate and permanent
✅ Clear separation between earning and spending
