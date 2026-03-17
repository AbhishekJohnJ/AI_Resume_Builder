import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { FaFileAlt, FaPalette, FaMagic, FaLayerGroup } from 'react-icons/fa';
import { authAPI } from '../services/api';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate inputs
    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      // Call API to login
      const response = await authAPI.login({ email, password });
      
      // Store user data in localStorage
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-left">
          <div className="feature-showcase">
            <h1 className="showcase-title">ResumeCraft AI</h1>
            <p className="showcase-subtitle">Your AI-powered resume & portfolio builder — from prompt to professional in seconds</p>
            
            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon">
                  <FaFileAlt />
                </div>
                <div className="feature-text">
                  <h3>AI Resume Builder</h3>
                  <p>Describe yourself in plain text — AI generates a full resume instantly</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <FaPalette />
                </div>
                <div className="feature-text">
                  <h3>Portfolio Generator</h3>
                  <p>Turn your experience into a stunning portfolio with one prompt</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <FaMagic />
                </div>
                <div className="feature-text">
                  <h3>Smart Design Control</h3>
                  <p>Change button styles, card designs, and backgrounds just by asking</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <FaLayerGroup />
                </div>
                <div className="feature-text">
                  <h3>Resume &amp; Portfolio Templates</h3>
                  <p>Pick a template, describe your story — AI fills in the rest</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="login-right">
          <div className="login-card">
            <h2>Welcome Back</h2>
            
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
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