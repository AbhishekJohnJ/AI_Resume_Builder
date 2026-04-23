const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  gamification: Object,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

// Quest XP values
const QUEST_XP = {
  1: 50,  // Resume Sniper
  2: 40,  // Portfolio Architect
  3: 30,  // Resume Crafter
  4: 20,  // Template Explorer
  5: 60,  // Score Chaser
  6: 25   // Portfolio Explorer
};

async function fixUserXP() {
  try {
    // Get all users
    const users = await User.find({});
    console.log(`\n📊 Found ${users.length} users\n`);

    for (const user of users) {
      if (!user.gamification || !user.gamification.completedQuests) {
        console.log(`⏭️  Skipping ${user.email} - no gamification data`);
        continue;
      }

      const completedQuests = user.gamification.completedQuests || [];
      const currentXP = user.gamification.userXP || 0;
      const currentTotalEarnedXP = user.gamification.totalEarnedXP || 0;

      // Calculate correct XP based on completed quests
      let correctTotalEarnedXP = 0;
      for (const questId of completedQuests) {
        correctTotalEarnedXP += QUEST_XP[questId] || 0;
      }

      console.log(`👤 ${user.email}`);
      console.log(`   Completed Quests: [${completedQuests.join(', ')}]`);
      console.log(`   Current Available XP: ${currentXP}`);
      console.log(`   Current Total Earned XP: ${currentTotalEarnedXP}`);
      console.log(`   Correct Total Earned XP: ${correctTotalEarnedXP}`);

      let needsUpdate = false;

      // If totalEarnedXP doesn't exist or is incorrect, set it
      if (currentTotalEarnedXP !== correctTotalEarnedXP) {
        console.log(`   🔧 FIXING Total Earned XP: ${currentTotalEarnedXP} → ${correctTotalEarnedXP}`);
        user.gamification.totalEarnedXP = correctTotalEarnedXP;
        needsUpdate = true;
      }

      // If userXP is less than totalEarnedXP and no spending has occurred, sync them
      // (This handles the case where user earned XP but totalEarnedXP wasn't tracked)
      if (currentXP < correctTotalEarnedXP && currentXP === currentTotalEarnedXP) {
        console.log(`   🔧 SYNCING Available XP: ${currentXP} → ${correctTotalEarnedXP}`);
        user.gamification.userXP = correctTotalEarnedXP;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await user.save();
        console.log(`   ✅ Fixed!\n`);
      } else {
        console.log(`   ✓ XP is correct\n`);
      }
    }

    console.log('✅ All users checked and fixed!');
    console.log('\n📝 Summary:');
    console.log('   - Available XP (userXP): Shown in TopBar, decreases when spent');
    console.log('   - Total Earned XP (totalEarnedXP): Shown in Career Quest Board, never decreases');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixUserXP();
