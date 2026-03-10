import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Menu } from 'lucide-react';
import ProfileSummaryCard from '../components/ProfileSummaryCard';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';
import './DashboardMain.css';

function Dashboard() {
  const navigate = useNavigate();
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Add GitHub project', points: 20, completed: false },
    { id: 2, name: 'Update LinkedIn profile', points: 15, completed: false },
    { id: 3, name: 'Add portfolio project', points: 10, completed: false }
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
          {/* Page Title */}
          <h1 className="dashboard-title">Dashboard</h1>

          {/* Summary Cards */}
          <div className="summary-cards-grid">
            {/* Resume Score Card */}
            <div className="summary-card">
              <h3 className="summary-card-title">Resume Score</h3>
              <p className="summary-card-value">
                78 <span className="value-suffix">/ 100</span>
              </p>
            </div>

            {/* Total Points Card */}
            <div className="summary-card">
              <h3 className="summary-card-title">Total Points</h3>
              <p className="summary-card-value">1,240</p>
            </div>

            {/* Leaderboard Rank Card */}
            <div className="summary-card">
              <h3 className="summary-card-title">Leaderboard Rank</h3>
              <p className="summary-card-value">#24</p>
            </div>
          </div>

          {/* Daily Tasks Card */}
          <div className="tasks-card">
            <div className="tasks-card-header">
              <h2 className="tasks-card-title">Daily Tasks</h2>
              <span className="tasks-count">{completedTasksCount}/{tasks.length}</span>
            </div>
            <div className="tasks-list">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`task-item ${task.completed ? 'completed' : ''}`}
                  onClick={() => toggleTask(task.id)}
                >
                  <div className="task-left">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="task-checkbox"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="task-name">{task.name}</span>
                  </div>
                  <span className="task-points">+{task.points} points</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Progress Card */}
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
                    <div
                      className="skill-progress-fill"
                      style={{ width: `${skill.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
