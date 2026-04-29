import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { FaFileAlt, FaPalette, FaMagic, FaLayerGroup } from 'react-icons/fa';
import { authAPI } from '../services/api';
import { showToast } from '../components/Toast';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('appTheme') || 'gold';
    document.body.setAttribute('data-theme', saved === 'gold' ? '' : saved);
  }, []);

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
      
      showToast('Login successful! Welcome back.', 'success');
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      const msg = err.message || 'Login failed. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-left">
          <div className="feature-showcase">
            <h1 className="showcase-title">
              {'ResumeCraft AI'.split('').map((char, i) =>
                char === ' '
                  ? <span key={i} className="glow-space" />
                  : <span key={i} className="glow-letter" style={{ animationDelay: `${i * 0.15}s` }}>{char}</span>
              )}
            </h1>
            <p className="showcase-subtitle">Your AI-powered resume & portfolio builder â€” from prompt to professional in seconds</p>
            
            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon">
                  <FaFileAlt />
                </div>
                <div className="feature-text">
                  <h3>AI Resume Builder</h3>
                  <p>Generate professional resumes from text prompts or uploaded files with AI assistance</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <FaPalette />
                </div>
                <div className="feature-text">
                  <h3>Portfolio Generator</h3>
                  <p>Create stunning portfolios with multiple templates â€” AI generates projects, skills & experience</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <FaMagic />
                </div>
                <div className="feature-text">
                  <h3>AI Resume Analyzer</h3>
                  <p>Get detailed analysis with scoring, strengths, weaknesses, and personalized improvement tips</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <FaLayerGroup />
                </div>
                <div className="feature-text">
                  <h3>Gamified Career Growth</h3>
                  <p>Complete daily quests to earn XP, level up your career, and unlock premium features</p>
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
