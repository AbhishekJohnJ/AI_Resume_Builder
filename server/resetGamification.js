/**
 * Reset Gamification Data in Database
 * Run this script to clear all gamification data and reset free trials
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    resetGamificationData();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function resetGamificationData() {
  try {
    // Get User model
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      gamification: Object
    }));

    // Reset gamification data for all users
    const result = await User.updateMany(
      {},
      {
        $unset: { gamification: "" }
      }
    );

    console.log(`✅ Reset gamification data for ${result.modifiedCount} users`);
    console.log('✅ All users now have fresh gamification state with 1 free trial per feature');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting gamification data:', error);
    process.exit(1);
  }
}
