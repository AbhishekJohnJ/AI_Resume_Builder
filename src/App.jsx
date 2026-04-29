import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { initializeGamification } from './utils/gamification';

function ProtectedRoute({ children }) {
  const user = localStorage.getItem('currentUser');
  return user ? children : <Navigate to="/" replace />;
}

function App() {
  // Initialize gamification system on app load
  useEffect(() => {
    initializeGamification();
  }, []);

  return (
    <Router>
      <ToastContainer />
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

