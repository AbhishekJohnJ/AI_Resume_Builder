import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Menu, Bell, Send } from 'lucide-react';
import ProfileSummaryCard from '../components/ProfileSummaryCard';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';
import './DashboardMain.css';

function Dashboard() {
  const navigate = useNavigate();
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: 'Add GitHub project',
      desc: 'Link a real project to showcase your coding skills.',
      why: 'Recruiters check GitHub to verify your technical ability.',
      points: 20,
      difficulty: 'Easy',
      category: 'GitHub',
      completed: false
    },
    {
      id: 2,
      name: 'Update LinkedIn profile',
      desc: 'Add your latest role, skills, and a professional photo.',
      why: '87% of recruiters use LinkedIn to find candidates.',
      points: 15,
      difficulty: 'Medium',
      category: 'LinkedIn',
      completed: false
    },
    {
      id: 3,
      name: 'Add portfolio project',
      desc: 'Showcase a project with description, tech stack, and live link.',
      why: 'A strong portfolio increases interview chances by 3x.',
      points: 10,
      difficulty: 'Easy',
      category: 'Portfolio',
      completed: false
    },
    {
      id: 4,
      name: 'Complete resume summary',
      desc: 'Write a 2–3 sentence professional summary at the top of your resume.',
      why: 'Summaries help recruiters quickly understand your value.',
      points: 25,
      difficulty: 'Hard',
      category: 'Resume',
      completed: false
    },
  ]);

  const skills = [
    { name: 'React', progress: 80 },
    { name: 'Node.js', progress: 65 },
    { name: 'MongoDB', progress: 40 }
  ];

  const handleLogout = () => {
    navigate('/');
  };

  const toggleProfileCard = () => {
    setShowProfileCard(!showProfileCard);
  };

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const completedTasksCount = tasks.filter(t => t.completed).length;

  const [aiMessages, setAiMessages] = useState([
    { role: 'ai', text: "Hi Abhishek! 👋 I'm your AI career assistant. Ask me anything about your resume, portfolio, or career growth." }
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
      const res = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      setAiMessages(prev => [...prev, { role: 'ai', text: data.reply || 'Sorry, I could not get a response.' }]);
    } catch {
      setAiMessages(prev => [...prev, { role: 'ai', text: 'Connection error. Make sure the server is running.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <nav className="top-bar">
        <div className="top-bar-content">
          {/* Logo */}
          <div className="logo">
            <button className="mobile-menu-btn"><Menu size={24} /></button>
            <span className="logo-text">Portfolio</span>
          </div>

          {/* Personal Greeting */}
          <div className="top-bar-greeting">
            <span className="greeting-text">👋 Welcome back, <strong>Abhishek</strong></span>
            <span className="greeting-sub">Ready to build something great today?</span>
          </div>

          {/* Right Actions */}
          <div className="top-bar-actions">
            <button className="top-bar-icon-btn notif-btn">
              <Bell size={20} />
              <span className="notif-badge">3</span>
            </button>
            <button onClick={toggleProfileCard} className="top-bar-icon-btn profile-btn">
              <User size={20} />
            </button>
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

      {/* 3-panel body */}
      <div className="dashboard-body">

        {/* Main scrollable content */}
        <div className="dashboard-container">
          <main className="dashboard-content">
            <h1 className="dashboard-title">Dashboard</h1>

            {/* Summary Cards */}
            <div className="summary-cards-grid">
              <div className="summary-card">
                <h3 className="summary-card-title">Resume Score</h3>
                <p className="summary-card-value">78 <span className="value-suffix">/ 100</span></p>
              </div>
              <div className="summary-card">
                <h3 className="summary-card-title">Portfolio Strength</h3>
                <p className="summary-card-value">85 <span className="value-suffix">/ 100</span></p>
              </div>
              <div className="summary-card">
                <h3 className="summary-card-title">Total Points / XP</h3>
                <p className="summary-card-value">1,240 <span className="value-suffix">XP</span></p>
              </div>
              <div className="summary-card">
                <h3 className="summary-card-title">Leaderboard Rank</h3>
                <p className="summary-card-value">#24</p>
              </div>
            </div>

            {/* Profile Strength */}
            <div className="progress-area">
              <h2 className="progress-area-title">Profile Strength</h2>
              <div className="progress-bars">
                {[
                  { label: '📄 Resume Completion', val: 78, cls: 'resume' },
                  { label: '🔗 LinkedIn Strength',  val: 65, cls: 'linkedin' },
                  { label: '🐙 GitHub Strength',    val: 82, cls: 'github' },
                  { label: '🚀 Skill Growth',       val: 55, cls: 'skill' },
                ].map(b => (
                  <div key={b.cls} className="progress-item">
                    <div className="progress-label">
                      <span className="progress-name">{b.label}</span>
                      <span className="progress-value">{b.val}%</span>
                    </div>
                    <div className="progress-track">
                      <div className={`progress-fill ${b.cls}`} style={{ width: `${b.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Tasks */}
            <div className="tasks-card">
              <div className="tasks-card-header">
                <h2 className="tasks-card-title">Daily Tasks</h2>
                <span className="tasks-count">{completedTasksCount}/{tasks.length}</span>
              </div>
              <div className="tasks-list">
                {tasks.map(task => (
                  <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`} onClick={() => toggleTask(task.id)}>
                    <div className="task-top">
                      <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} className="task-checkbox" onClick={e => e.stopPropagation()} />
                      <div className="task-body">
                        <div className="task-header-row">
                          <span className="task-name">{task.name}</span>
                          <div className="task-meta">
                            <span className={`task-difficulty diff-${task.difficulty.toLowerCase()}`}>{task.difficulty}</span>
                            <span className="task-category">{task.category}</span>
                            <span className="task-points">+{task.points} XP</span>
                          </div>
                        </div>
                        <p className="task-desc">{task.desc}</p>
                        <p className="task-why">💡 {task.why}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Progress */}
            <div className="skills-card">
              <div className="skills-card-header">
                <h2 className="skills-card-title">Skill Progress</h2>
              </div>
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
            </div>
          </main>
        </div>

        {/* Right AI Chat Panel */}
        <div className="ai-panel">
          <div className="ai-panel-title">🤖 AI Assistant</div>
          <div className="ai-chat-messages">
            {aiMessages.map((msg, i) => (
              <div key={i} className={`ai-msg ${msg.role}`}>
                {msg.role === 'ai' && <span className="ai-avatar">🤖</span>}
                <span className="ai-msg-text">{msg.text}</span>
              </div>
            ))}
            {aiLoading && (
              <div className="ai-msg ai">
                <span className="ai-avatar">🤖</span>
                <span className="ai-typing"><span /><span /><span /></span>
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
              onChange={e => setAiInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAiSend()}
            />
            <button className="ai-send-btn" onClick={handleAiSend} disabled={aiLoading}>
              <Send size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
