import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import MyResumes from './pages/MyResumes';
import Portfolio from './pages/Portfolio';
import MyPortfolios from './pages/MyPortfolios';

import About from './pages/About';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resume-builder" element={<ResumeBuilder />} />
        <Route path="/my-resumes" element={<MyResumes />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/my-portfolios" element={<MyPortfolios />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
