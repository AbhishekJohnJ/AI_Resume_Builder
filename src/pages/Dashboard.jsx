import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="dashboard-page">
      <nav className="top-bar">
        <div className="top-bar-content">
          <div className="logo">
            <span className="logo-text">Portfolio</span>
          </div>
          <div className="nav-links">
            <a href="/" className="nav-link">Home</a>
            <a href="/about" className="nav-link">About</a>
            <a href="/projects" className="nav-link">Projects</a>
            <a href="/contact" className="nav-link">Contact</a>
          </div>
          <div className="auth-buttons">
            <button onClick={handleLogout} className="btn-logout-nav">Logout</button>
          </div>
        </div>
      </nav>
      <div className="dashboard-container">
      <main className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome to your Dashboard!</h2>
          <p>You have successfully logged in.</p>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Users</h3>
            <p className="stat-number">1,234</p>
          </div>
          <div className="stat-card">
            <h3>Revenue</h3>
            <p className="stat-number">$45,678</p>
          </div>
          <div className="stat-card">
            <h3>Orders</h3>
            <p className="stat-number">567</p>
          </div>
          <div className="stat-card">
            <h3>Growth</h3>
            <p className="stat-number">+23%</p>
          </div>
        </div>
      </main>
    </div>
    </div>
  );
}

export default Dashboard;
