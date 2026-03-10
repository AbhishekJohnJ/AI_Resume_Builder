import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </header>
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
  );
}

export default Dashboard;
