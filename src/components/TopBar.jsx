import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import ProfileSummaryCard from './ProfileSummaryCard';

const logoStyles = `
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
    background: linear-gradient(90deg, #ffd700 0%, #fff8a0 40%, #ffd700 60%, #b8860b 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: brandShimmer 2.5s linear infinite;
  }
`;

function TopBar({ centerContent = null }) {
  const navigate = useNavigate();
  const [showProfileCard, setShowProfileCard] = useState(false);

  return (
    <>
      <style>{logoStyles}</style>
      <nav style={{
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
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Logo + Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="logo-wrapper">
            <img
              src="/src/assets/finalized_logo.png"
              alt="ResumeCraft logo"
              className="logo-img"
            />
          </div>
          <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.3rem', letterSpacing: '0.05em' }}>
            𝐑𝐞𝐬𝐮𝐦𝐞<span className="brand-craft">𝐂𝐫𝐚𝐟𝐭</span>
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
          <button
            onClick={() => setShowProfileCard(v => !v)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.7)',
              display: 'flex',
              alignItems: 'center',
              padding: '0.25rem',
            }}
          >
            <User size={20} />
          </button>

          <button
            onClick={() => navigate('/')}
            style={{
              background: 'transparent',
              border: '1px solid #ffd700',
              color: '#ffd700',
              borderRadius: '6px',
              padding: '0.3rem 0.9rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.target.style.background = '#ffd700'; e.target.style.color = '#111'; }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#ffd700'; }}
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
    </>
  );
}

export default TopBar;
