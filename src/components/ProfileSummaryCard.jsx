import { Trophy, Award } from 'lucide-react';
import './ProfileSummaryCard.css';

function ProfileSummaryCard({
  name,
  role,
  profileImage,
  resumeScore,
  leaderboardRank,
  totalPoints
}) {
  return (
    <div className="profile-summary-card">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-image-wrapper">
          <img
            src={profileImage}
            alt={name}
            className="profile-image"
          />
        </div>
        <div className="profile-info">
          <h2 className="profile-name">{name}</h2>
          <p className="profile-role">{role}</p>
        </div>
      </div>

      {/* Resume Score Section */}
      <div className="resume-score-section">
        <div className="score-header">
          <span className="score-label">Resume Score</span>
          <span className="score-value">{resumeScore}/100</span>
        </div>
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${resumeScore}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {/* Leaderboard Rank */}
        <div className="stat-item">
          <Trophy className="stat-icon" size={20} strokeWidth={2.5} />
          <div className="stat-content">
            <p className="stat-label">Rank</p>
            <p className="stat-value">#{leaderboardRank}</p>
          </div>
        </div>

        {/* Total Points */}
        <div className="stat-item">
          <Award className="stat-icon" size={20} strokeWidth={2.5} />
          <div className="stat-content">
            <p className="stat-label">Points</p>
            <p className="stat-value">{totalPoints.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileSummaryCard;

