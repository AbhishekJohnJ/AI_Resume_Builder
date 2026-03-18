import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bot } from 'lucide-react';
import ProfileSummaryCard from './ProfileSummaryCard';
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
      var(--accent) 30%,
      var(--accent-alt) 50%,
      var(--accent) 70%,
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
    background: linear-gradient(90deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 60%, white) 40%, var(--accent) 60%, var(--accent-alt) 100%);
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
  const [theme, setTheme] = useState(() => localStorage.getItem('appTheme') || 'gold');
  const [showThemePicker, setShowThemePicker] = useState(false);

  // Apply saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('appTheme') || 'gold';
    document.body.setAttribute('data-theme', saved === 'gold' ? '' : saved);
  }, []);

  const themes = [
    { id: 'gold',   label: 'Gold',   dot: '#ffd700' },
    { id: 'purple', label: 'Purple', dot: '#a855f7' },
    { id: 'green',  label: 'Green',  dot: '#22c55e' },
    { id: 'cyan',   label: 'Cyan',   dot: '#06b6d4' },
  ];

  const applyTheme = (id) => {
    setTheme(id);
    setShowThemePicker(false);
    localStorage.setItem('appTheme', id);
    document.body.setAttribute('data-theme', id === 'gold' ? '' : id);
  };

  const currentTheme = themes.find(t => t.id === theme);

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
          {/* Theme picker */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowThemePicker(v => !v)}
              title="Switch theme"
              style={{
                background: showThemePicker ? 'rgba(255,255,255,0.08)' : 'transparent',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                gap: '0',
              }}
            >
              <span style={{
                width: '14px', height: '14px', borderRadius: '50%',
                background: currentTheme.dot,
                display: 'block',
                boxShadow: `0 0 6px ${currentTheme.dot}`,
              }} />
            </button>

            {showThemePicker && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 999 }}
                  onClick={() => setShowThemePicker(false)}
                />
                <div style={{
                  position: 'absolute',
                  top: '44px',
                  right: 0,
                  background: '#1a1a1a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '0.4rem',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem',
                  minWidth: '120px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                }}>
                  {themes.map(t => (
                    <button
                      key={t.id}
                      onClick={() => applyTheme(t.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.5rem 0.75rem',
                        background: theme === t.id ? 'rgba(255,255,255,0.07)' : 'transparent',
                        border: 'none',
                        borderRadius: '7px',
                        cursor: 'pointer',
                        color: theme === t.id ? '#fff' : 'rgba(255,255,255,0.6)',
                        fontSize: '0.82rem',
                        fontWeight: theme === t.id ? 600 : 400,
                        transition: 'all 0.15s',
                        textAlign: 'left',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                      onMouseLeave={e => e.currentTarget.style.background = theme === t.id ? 'rgba(255,255,255,0.07)' : 'transparent'}
                    >
                      <span style={{
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: t.dot, flexShrink: 0,
                        boxShadow: `0 0 5px ${t.dot}`,
                      }} />
                      {t.label}
                      {theme === t.id && <span style={{ marginLeft: 'auto', color: t.dot, fontSize: '0.7rem' }}>✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
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
