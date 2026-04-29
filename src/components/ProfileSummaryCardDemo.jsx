import ProfileSummaryCard from './ProfileSummaryCard';

function ProfileSummaryCardDemo() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <ProfileSummaryCard
        name="Abhishek John"
        role="Full Stack Developer"
        profileImage="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"
        resumeScore={78}
        leaderboardRank={24}
        totalPoints={1240}
      />
    </div>
  );
}

export default ProfileSummaryCardDemo;

