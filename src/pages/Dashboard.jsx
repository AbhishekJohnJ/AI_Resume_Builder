import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, User2, Target, Building2, FileText, Map, TrendingUp, Briefcase } from 'lucide-react';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import chatbotIcon from '../assets/chatbot.jpg';
import './Dashboard.css';
import './DashboardMain.css';

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userName = user?.name?.split(' ')[0] || 'there';
  const [appTheme, setAppTheme] = useState(() => localStorage.getItem('appTheme') || 'gold');

  // Load AI analysis results from localStorage
  const loadAnalysis = () => {
    const raw = localStorage.getItem('analyzedResumeResult');
    return raw ? JSON.parse(raw) : null;
  };
  const [analysis, setAnalysis] = useState(loadAnalysis);

  const resumeScore = analysis?.resumeScore || analysis?.score || 0;

  // Derive skill progress from analysis strengths/skills or fall back to defaults
  const buildSkills = (a) => {
    if (!a) return [
      { name: 'Resume', progress: 0 },
      { name: 'Skills', progress: 0 },
      { name: 'Experience', progress: 0 },
    ];
    const sections = a.sectionAnalysis || {};
    const toVal = (key) => {
      const q = sections[key]?.quality;
      if (!q) return 0;
      return q === 'Excellent' ? 95 : q === 'Good' ? 75 : q === 'Fair' ? 50 : 25;
    };
    return [
      { name: '📄 Resume Completion', val: resumeScore, cls: 'resume' },
      { name: '⚡ Skills Section',    val: toVal('skills'),     cls: 'skill' },
      { name: '💼 Experience',        val: toVal('experience'), cls: 'github' },
      { name: '🎓 Education',         val: toVal('education'),  cls: 'linkedin' },
    ];
  };

  const [progressBars, setProgressBars] = useState(() => buildSkills(loadAnalysis()));

  // Derive skill cards from analysis
  const buildSkillCards = (a) => {
    if (!a?.strengths?.length) return [];
    return a.strengths.slice(0, 3).map((s, i) => ({
      name: s.length > 20 ? s.slice(0, 20) + '…' : s,
      progress: 90 - i * 12,
    }));
  };
  const [skills, setSkills] = useState(() => buildSkillCards(loadAnalysis()));

  // Refresh when returning from AIAnalyser
  useEffect(() => {
    const refresh = () => {
      const a = loadAnalysis();
      setAnalysis(a);
      setProgressBars(buildSkills(a));
      setSkills(buildSkillCards(a));
    };
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    return () => { window.removeEventListener('focus', refresh); window.removeEventListener('storage', refresh); };
  }, []);

  useEffect(() => {
    const onStorage = () => setAppTheme(localStorage.getItem('appTheme') || 'gold');
    window.addEventListener('storage', onStorage);
    const onFocus = () => setAppTheme(localStorage.getItem('appTheme') || 'gold');
    window.addEventListener('focus', onFocus);
    return () => { window.removeEventListener('storage', onStorage); window.removeEventListener('focus', onFocus); };
  }, []);

  const QUESTS = [
    { id: 2, icon: Building2, title: 'Portfolio Architect', desc: 'Generate a portfolio using any template.',                  xp: 40, rarity: 'rare',   action: () => navigate('/portfolio') },
    { id: 3, icon: FileText, title: 'Resume Crafter',      desc: 'Build a resume using the Resume Builder.',                  xp: 30, rarity: 'common', action: () => navigate('/resume-builder') },
    { id: 4, icon: Map, title: 'Template Explorer',   desc: 'Preview at least 5 different resume templates.',            xp: 20, rarity: 'common', action: () => navigate('/resume-builder') },
    { id: 5, icon: TrendingUp, title: 'Score Chaser',        desc: 'Re-analyse your resume after edits to improve your score.', xp: 60, rarity: 'epic',   action: () => navigate('/ai-analyser') },
    { id: 6, icon: Briefcase, title: 'Portfolio Pro',       desc: 'Save and view your generated portfolio.',                   xp: 35, rarity: 'rare',   action: () => navigate('/my-portfolios') },
    { id: 1, icon: Target, title: 'Resume Sniper',      desc: 'Analyse your resume with AI and score above 70.',           xp: 50, rarity: 'epic',   action: () => navigate('/ai-analyser') },
  ];

  const [completedQuests, setCompletedQuests] = useState(
    () => JSON.parse(localStorage.getItem('questsCompleted') || '[]')
  );
  const toggleQuest = (id) => {
    setCompletedQuests(prev => {
      const next = prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id];
      localStorage.setItem('questsCompleted', JSON.stringify(next));
      return next;
    });
  };
  const totalXP  = completedQuests.reduce((s, id) => s + (QUESTS.find(q => q.id === id)?.xp || 0), 0);
  const maxXP    = QUESTS.reduce((s, q) => s + q.xp, 0);
  const xpPct    = Math.round((totalXP / maxXP) * 100);
  const careerLevel = totalXP < 50 ? 'Rookie' : totalXP < 120 ? 'Builder' : totalXP < 200 ? 'Pro' : 'Elite';

  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      role: 'ai',
      text: `Hi ${userName}! 👋 I'm your AI career assistant. Ask me anything about your resume, portfolio, or career growth.`
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  const handleAiSend = async () => {
    if (!aiInput.trim() || aiLoading) return;

    const userMsg = aiInput.trim();
    setAiInput('');
    setAiMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });

      const data = await res.json();

      setAiMessages(prev => [
        ...prev,
        { role: 'ai', text: data.reply || 'Sorry, I could not get a response.' }
      ]);
    } catch {
      setAiMessages(prev => [
        ...prev,
        { role: 'ai', text: 'Connection error. Make sure the server is running.' }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <TopBar
        onAiToggle={() => setAiOpen(v => !v)}
        aiOpen={aiOpen}
        centerContent={
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <span style={{ color: '#e5e5e5', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, color: 'var(--accent)' }}>
              <style>{`
                @keyframes synapse {
                  0%, 100% { stroke-dashoffset: 20; opacity: 0.2; }
                  50%       { stroke-dashoffset: 0;  opacity: 1;   }
                }
                @keyframes nodePulse {
                  0%, 100% { r: 1.5; opacity: 0.5; }
                  50%       { r: 2.2; opacity: 1;   }
                }
                @keyframes coreBeat {
                  0%, 100% { r: 3;   }
                  50%       { r: 3.8; }
                }
                .syn-t  { animation: synapse 1.8s ease-in-out infinite; }
                .syn-r  { animation: synapse 1.8s ease-in-out infinite; animation-delay: -0.45s; }
                .syn-b  { animation: synapse 1.8s ease-in-out infinite; animation-delay: -0.9s;  }
                .syn-l  { animation: synapse 1.8s ease-in-out infinite; animation-delay: -1.35s; }
                .nd-t   { animation: nodePulse 1.8s ease-in-out infinite; }
                .nd-r   { animation: nodePulse 1.8s ease-in-out infinite; animation-delay: -0.45s; }
                .nd-b   { animation: nodePulse 1.8s ease-in-out infinite; animation-delay: -0.9s;  }
                .nd-l   { animation: nodePulse 1.8s ease-in-out infinite; animation-delay: -1.35s; }
                .nd-core { animation: coreBeat 1.8s ease-in-out infinite; }
              `}</style>
              {/* synapse lines */}
              <line className="syn-t" x1="12" y1="9" x2="12" y2="3"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="6" strokeDashoffset="20" />
              <line className="syn-r" x1="15" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="6" strokeDashoffset="20" />
              <line className="syn-b" x1="12" y1="15" x2="12" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="6" strokeDashoffset="20" />
              <line className="syn-l" x1="9"  y1="12" x2="3"  y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="6" strokeDashoffset="20" />
              {/* outer nodes */}
              <circle className="nd-t"  cx="12" cy="3"  r="1.5" fill="currentColor" />
              <circle className="nd-r"  cx="21" cy="12" r="1.5" fill="currentColor" />
              <circle className="nd-b"  cx="12" cy="21" r="1.5" fill="currentColor" />
              <circle className="nd-l"  cx="3"  cy="12" r="1.5" fill="currentColor" />
              {/* core node */}
              <circle className="nd-core" cx="12" cy="12" r="3" fill="currentColor" />
              <circle cx="12" cy="12" r="1.2" fill="#111" />
            </svg>
            Welcome back, <strong style={{ color: 'var(--accent)' }}>{userName}</strong>
          </span>
          <span style={{ color: '#666', fontSize: '0.78rem' }}>Ready to build something great today?</span>
        </div>
      } />

      <Sidebar />

      <div className="dashboard-body">
        <div className="dashboard-container">
          <main className="dashboard-content">
            <h1 className="dashboard-title">Dashboard</h1>

            {/* ── Career Quest Board ── */}
            <div className="qb-wrap">
              {/* Header */}
              <div className="qb-header">
                <div className="qb-header-left">
                  <div className="qb-title-row">
                    <span className="qb-crown">⚔️</span>
                    <h2 className="qb-title">Career Quest Board</h2>
                    <span className="qb-level-badge">{careerLevel}</span>
                  </div>
                  <p className="qb-sub">Complete quests · Earn XP · Level up your career</p>
                </div>
                <div className="qb-xp-block">
                  <div className="qb-xp-ring">
                    <svg viewBox="0 0 44 44" className="qb-ring-svg">
                      <circle cx="22" cy="22" r="18" fill="none" stroke="#222" strokeWidth="4"/>
                      <circle cx="22" cy="22" r="18" fill="none" stroke="var(--accent,#ffd700)" strokeWidth="4"
                        strokeDasharray={`${xpPct * 1.131} 113.1`}
                        strokeLinecap="round" strokeDashoffset="28.3"
                        style={{transition:'stroke-dasharray 0.6s ease'}}/>
                    </svg>
                    <span className="qb-ring-pct">{xpPct}%</span>
                  </div>
                  <div>
                    <div className="qb-xp-nums"><span className="qb-xp-earned">{totalXP}</span><span className="qb-xp-max">/{maxXP} XP</span></div>
                    <div className="qb-xp-label">{completedQuests.length}/{QUESTS.length} quests done</div>
                  </div>
                </div>
              </div>

              {/* Quest Grid */}
              <div className="qb-grid">
                {QUESTS.map(q => {
                  const done = completedQuests.includes(q.id);
                  const IconComponent = q.icon;
                  return (
                    <div key={q.id} className={`qb-card qb-${q.rarity} ${done ? 'qb-done' : ''}`}>
                      <div className="qb-card-glow"/>
                      <div className="qb-card-inner">
                        <div className="qb-card-top">
                          <span className="qb-card-icon"><IconComponent size={28} strokeWidth={2} /></span>
                          <span className="qb-rarity-pill">{q.rarity}</span>
                        </div>
                        <div className="qb-card-title">{q.title}</div>
                        <p className="qb-card-desc">{q.desc}</p>
                        <div className="qb-card-bottom">
                          <span className="qb-xp-pill">+{q.xp} XP</span>
                          <div className="qb-btns">
                            <button className="qb-go" onClick={q.action}>Launch →</button>
                            <button className={`qb-mark ${done ? 'qb-mark-done' : ''}`} onClick={() => toggleQuest(q.id)}>
                              {done ? '✓' : '○'}
                            </button>
                          </div>
                        </div>
                      </div>
                      {done && <div className="qb-done-overlay">✓ COMPLETED</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="skills-card">
              <div className="skills-card-header">
                <h2 className="skills-card-title">Skill Progress</h2>
              </div>
              {skills.length > 0 ? (
                <div className="skills-list">
                  {skills.map(skill => (
                    <div key={skill.name} className="skill-item">
                      <div className="skill-header">
                        <span className="skill-name">{skill.name}</span>
                        <span className="skill-percentage">{skill.progress}%</span>
                      </div>
                      <div className="skill-progress-bar">
                        <div className="skill-progress-fill" style={{ width: `${skill.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dashboard-empty-state">
                  <span>💡</span>
                  <p>"Analyse your resume to unlock skill insights and track your growth."</p>
                  <button className="dashboard-cta-btn" onClick={() => navigate('/ai-analyser')}>Analyse Now →</button>
                </div>
              )}
            </div>
          </main>
        </div>

        <div className={`ai-panel${aiOpen ? ' ai-panel-open' : ''}`}>
          <div className="ai-panel-title">
            <div className="ai-panel-title-icon">
              <img src={chatbotIcon} alt="AI" className={`chatbot-img theme-${appTheme}`} style={{ width: '30px', height: '30px', objectFit: 'contain', mixBlendMode: 'lighten' }} />
            </div>
            AI Assistant
          </div>
          <div className="ai-chat-messages">
            {aiMessages.map((msg, i) => (
              <div key={i} className={`ai-msg ${msg.role}`}>
                {msg.role === 'ai' && (
                  <div className="ai-avatar">
                    <img src={chatbotIcon} alt="AI" className={`chatbot-img theme-${appTheme}`} style={{ width: '28px', height: '28px', objectFit: 'contain', mixBlendMode: 'lighten' }} />
                  </div>
                )}
                {msg.role === 'user' && (
                  <div className="ai-avatar user-avatar"><User2 size={14} /></div>
                )}
                <span className="ai-msg-text">{msg.text}</span>
              </div>
            ))}

            {aiLoading && (
              <div className="ai-msg ai">
                <div className="ai-avatar">
                  <img src={chatbotIcon} alt="AI" className={`chatbot-img theme-${appTheme}`} style={{ width: '28px', height: '28px', objectFit: 'contain', mixBlendMode: 'lighten' }} />
                </div>
                <span className="ai-typing">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="ai-chat-input-row">
            <input
              className="ai-chat-input"
              type="text"
              placeholder="Ask me anything..."
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
            />
            <button
              className="ai-send-btn"
              onClick={handleAiSend}
              disabled={aiLoading}
              type="button"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
