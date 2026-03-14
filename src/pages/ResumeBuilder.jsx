import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Menu } from 'lucide-react';
import ProfileSummaryCard from '../components/ProfileSummaryCard';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';
import './ResumeBuilder.css';

function ResumeBuilder() {
  const navigate = useNavigate();
  const [showProfileCard, setShowProfileCard] = useState(false);

  const handleLogout = () => {
    navigate('/');
  };

  const toggleProfileCard = () => {
    setShowProfileCard(!showProfileCard);
  };

  return (
    <div className="dashboard-page">
      <nav className="top-bar">
        <div className="top-bar-content">
          <div className="logo">
            <button className="mobile-menu-btn">
              <Menu size={24} />
            </button>
            <span className="logo-text">Portfolio</span>
          </div>
          <div className="nav-links">
            <a href="/" className="nav-link">Home</a>
            <a href="/about" className="nav-link">About</a>
            <a href="/projects" className="nav-link">Projects</a>
            <a href="/contact" className="nav-link">Contact</a>
          </div>
          <div className="auth-buttons">
            <button onClick={toggleProfileCard} className="btn-user-profile">
              <User size={20} />
            </button>
            <button onClick={handleLogout} className="btn-logout-nav">Logout</button>
          </div>
        </div>
      </nav>

      {/* Profile Card Dropdown */}
      {showProfileCard && (
        <>
          <div className="profile-overlay" onClick={toggleProfileCard}></div>
          <div className="profile-dropdown">
            <ProfileSummaryCard
              name="Abhishek John"
              role="Full Stack Developer"
              profileImage="https://ui-avatars.com/api/?name=Abhishek+John&size=200&background=667eea&color=fff&bold=true"
              resumeScore={78}
              leaderboardRank={24}
              totalPoints={1240}
            />
          </div>
        </>
      )}

      {/* Sidebar */}
      <Sidebar />

      <div className="dashboard-container">
        <main className="dashboard-content">
          <div className="page-header">
            <h1 className="page-title">Resume Builder</h1>
            <p className="page-subtitle">Build and optimize your professional resume</p>
          </div>

          <div className="resume-builder-content">
          </div>
        </main>
      </div>
    </div>
  );
}

export default ResumeBuilder;
