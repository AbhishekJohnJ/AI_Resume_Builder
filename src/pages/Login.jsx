import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { FaFileAlt, FaPalette, FaRocket, FaChartLine } from 'react-icons/fa';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find user with matching credentials
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      // Store logged in user
      localStorage.setItem('currentUser', JSON.stringify(user));
      navigate('/dashboard');
    } else {
      setError('Invalid email or password. Please try again.');
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