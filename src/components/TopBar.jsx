import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bot } from 'lucide-react';
import ProfileSummaryCard from './ProfileSummaryCard';
import XPCounter from './XPCounter';
import chatbotIcon from '../assets/chatbot.jpg';
import finalLogo from '../assets/finalized_logo.png';

const logoStyles = `
  @keyframes topbarBorderGlow {
    0%, 100% { opacity: 0.4; }
    50%       { opacity: 1; }
  }
  @keyframes topbarAccentLine {
    0%   { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }
  .topbar-nav {
  }
  .topbar-nav::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg,
      transparent 0%,
      #ffd700 30%,
      #ffed4e 50%,
      #ffd700 70%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: topbarAccentLine 3s linear infinite, topbarBorderGlow 3s ease-in-out infinite;
  }
  @keyframes shimmerSweep {
    0% { left: -100%; }
    60%, 100% { left: 200%; }
  }
  @keyframes brandShimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .logo-wrapper {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    width: 54px;
    height: 54px;
    flex-shrink: 0;
    cursor: pointer;
  }
  .logo-wrapper::after {
    content: '';
    position: absolute;
    top: -20%;
    left: -100%;
    width: 45%;
    height: 140%;
    background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.6) 50%, transparent 70%);
    animation: shimmerSweep 3s ease-in-out infinite;
    pointer-events: none;
  }
  .logo-img {
    width: 54px;
    height: 54px;
    object-fit: contain;
    display: block;
  }
  .brand-craft {
    background: linear-gradient(90deg, #ffd700 0%, #ffed4e 40%, #ffd700 60%, #ffc700 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: brandShimmer 2.5s linear infinite;
  }
`;

function TopBar({ centerContent = null, onAiToggle = null, aiOpen = false }) {
  const navigate = useNavigate();
  const [showProfileCard, setShowProfileCard] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userName = currentUser?.name || currentUser?.username || currentUser?.email?.split('@')[0] || 'User';
  const userRole = currentUser?.role || currentUser?.title || 'ResumeCraft Member';
  const resumeScore = parseInt(localStorage.getItem('analyzedResumeScore') || '0', 10);

  return (
    <>
      <style>{logoStyles}</style>
      <nav className="topbar-nav" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: '#111111',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
        zIndex: 1000,
      }}>
        {/* Logo + Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="logo-wrapper">
            <img
              src={finalLogo}
              alt="ResumeCraft logo"
              className="logo-img"
            />
          </div>
          <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.3rem', letterSpacing: '0.05em' }}>
            Resume<span className="brand-craft">Craft</span>
          </span>
        </div>

        {centerContent && (
          <div style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
          }}>
            {centerContent}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <XPCounter />
          {onAiToggle && (
            <button
              onClick={onAiToggle}
              title="Toggle AI Assistant"
              style={{
                background: aiOpen ? 'rgba(255,215,0,0.15)' : 'transparent',
                border: `1px solid ${aiOpen ? 'var(--accent)' : 'rgba(255,215,0,0.35)'}`,
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                padding: 0,
                overflow: 'hidden',
              }}
            >
              <Bot size={20} color={aiOpen ? 'var(--accent)' : 'rgba(255,255,255,0.7)'} />
            </button>
          )}
          <button
            onClick={() => setShowProfileCard(v => !v)}
            title={userName}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: 0,
              overflow: 'hidden',
            }}
          >
            {userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
          </button>

          <button
            onClick={() => navigate('/')}
            style={{
              background: 'transparent',
              border: '1px solid var(--accent, #ffd700)',
              color: 'var(--accent, #ffd700)',
              borderRadius: '6px',
              padding: '0.3rem 0.9rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent, #ffd700)'; e.currentTarget.style.color = '#111'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--accent, #ffd700)'; }}
          >
            Logout
          </button>
        </div>
      </nav>

      {showProfileCard && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 1001 }}
            onClick={() => setShowProfileCard(false)}
          />
          <div style={{
            position: 'fixed',
            top: '60px',
            right: '1rem',
            zIndex: 1002,
          }}>
            <ProfileSummaryCard
              name={userName}
              role={userRole}
              profileImage={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&size=200&background=667eea&color=fff&bold=true`}
              resumeScore={resumeScore}
              leaderboardRank={24}
              totalPoints={1240}
            />
          </div>
        </>
      )}
    </>
  );
}

export default TopBar;

