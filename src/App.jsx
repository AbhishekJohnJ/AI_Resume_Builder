import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import MyResumes from './pages/MyResumes';
import Portfolio from './pages/Portfolio';
import MyPortfolios from './pages/MyPortfolios';
import About from './pages/About';
import AIAnalyser from './pages/AIAnalyser';
import { ToastContainer } from './components/Toast';

const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour in ms

function isSessionValid() {
  const user = localStorage.getItem('currentUser');
  const lastActive = localStorage.getItem('lastActiveTime');
  if (!user || !lastActive) return false;
  return Date.now() - parseInt(lastActive, 10) < SESSION_TIMEOUT;
}

function updateActivity() {
  localStorage.setItem('lastActiveTime', String(Date.now()));
}

// Tracks activity on every route change
function ActivityTracker() {
  const location = useLocation();
  useEffect(() => {
    if (localStorage.getItem('currentUser')) {
      updateActivity();
    }
  }, [location]);
  return null;
}

function ProtectedRoute({ children }) {
  if (!isSessionValid()) {
    // Clear expired session
    localStorage.removeItem('currentUser');
    localStorage.removeItem('lastActiveTime');
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <ToastContainer />
      <ActivityTracker />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard"      element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/resume-builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
        <Route path="/my-resumes"     element={<ProtectedRoute><MyResumes /></ProtectedRoute>} />
        <Route path="/portfolio"      element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
        <Route path="/my-portfolios"  element={<ProtectedRoute><MyPortfolios /></ProtectedRoute>} />
        <Route path="/ai-analyser"    element={<ProtectedRoute><AIAnalyser /></ProtectedRoute>} />
        <Route path="/about"          element={<ProtectedRoute><About /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
