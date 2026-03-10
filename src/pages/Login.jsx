import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { FaFileAlt, FaPalette, FaRocket, FaChartLine } from 'react-icons/fa';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Fake authentication - redirect to dashboard
    if (email && password) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-left">
          <div className="feature-showcase">
            <h1 className="showcase-title">Build Your Professional Story</h1>
            <p className="showcase-subtitle">Create stunning resumes and portfolios that get you noticed</p>
            
            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon">
                  <FaFileAlt />
                </div>
                <div className="feature-text">
                  <h3>Smart Resume Builder</h3>
                  <p>AI-powered templates that adapt to your industry</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <FaPalette />
                </div>
                <div className="feature-text">
                  <h3>Portfolio Showcase</h3>
                  <p>Display your work with beautiful, customizable layouts</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <FaRocket />
                </div>
                <div className="feature-text">
                  <h3>One-Click Deploy</h3>
                  <p>Share your profile with a personalized link</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <FaChartLine />
                </div>
                <div className="feature-text">
                  <h3>Track Your Impact</h3>
                  <p>See who views your resume and portfolio</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="login-right">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <MdEmail className="input-icon" />
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <MdLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary">Sign In</button>
        </form>
        <p className="signup-link">
          Don't have an account? <a href="/signup">Create one</a>
        </p>
      </div>
        </div>
      </div>
    </div>
  );
}

export default Login;