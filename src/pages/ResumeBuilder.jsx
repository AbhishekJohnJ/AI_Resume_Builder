import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Menu, Paperclip, X, Send, FileText, Image } from 'lucide-react';
import ProfileSummaryCard from '../components/ProfileSummaryCard';
import Sidebar from '../components/Sidebar';
import TemplatePickerCard from '../components/TemplatePickerCard';
import './Dashboard.css';
import './ResumeBuilder.css';

function ResumeBuilder() {
  const navigate = useNavigate();
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleLogout = () => navigate('/');
  const toggleProfileCard = () => setShowProfileCard(!showProfileCard);

  const handleFileChange = (e) => {
    const picked = Array.from(e.target.files);
    setFiles(prev => [...prev, ...picked]);
    e.target.value = '';
  };

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = () => {
    if (!prompt.trim() && files.length === 0) return;
    // TODO: wire to AI service
    console.log('Prompt:', prompt, 'Files:', files);
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <Image size={14} />;
    return <FileText size={14} />;
  };

  return (
    <div className="dashboard-page">
      <nav className="top-bar">
        <div className="top-bar-content">
          <div className="logo">
            <button className="mobile-menu-btn"><Menu size={24} /></button>
            <span className="logo-text">Portfolio</span>
          </div>
          <div className="nav-links">
            <a href="/" className="nav-link">Home</a>
            <a href="/about" className="nav-link">About</a>
            <a href="/projects" className="nav-link">Projects</a>
            <a href="/contact" className="nav-link">Contact</a>
          </div>
          <div className="auth-buttons">
            <button onClick={toggleProfileCard} className="btn-user-profile"><User size={20} /></button>
            <button onClick={handleLogout} className="btn-logout-nav">Logout</button>
          </div>
        </div>
      </nav>

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

      <Sidebar />

      <div className="dashboard-container">
        <main className="dashboard-content">
          <div className="page-header">
            <h1 className="page-title">Resume Builder</h1>
            <p className="page-subtitle">Build and optimize your professional resume</p>
          </div>

          <div className="resume-builder-content">
            <TemplatePickerCard
              selected={selectedTemplate}
              onSelect={setSelectedTemplate}
            />

            {/* ── AI Prompt Box ── */}
            <div className="rb-prompt-section">
              <h3 className="rb-prompt-title">Describe your resume or upload your existing one</h3>
              <p className="rb-prompt-sub">Tell the AI about your experience, skills, and the job you're targeting — or upload a file to get started.</p>

              <div className="rb-prompt-box">
                {/* File chips */}
                {files.length > 0 && (
                  <div className="rb-file-chips">
                    {files.map((f, i) => (
                      <div key={i} className="rb-file-chip">
                        {getFileIcon(f)}
                        <span>{f.name}</span>
                        <button onClick={() => removeFile(i)}><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}

                <textarea
                  className="rb-textarea"
                  placeholder="e.g. I'm a Full Stack Developer with 3 years of experience in React and Node.js, applying for a Senior Developer role at a fintech company..."
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  rows={4}
                  onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSubmit(); }}
                />

                <div className="rb-prompt-actions">
                  <div className="rb-prompt-left">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                      multiple
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                    <button className="rb-attach-btn" onClick={() => fileInputRef.current.click()}>
                      <Paperclip size={16} />
                      <span>Attach file</span>
                    </button>
                    <span className="rb-file-hint">PDF, DOCX, JPG, PNG</span>
                  </div>
                  <button
                    className={`rb-send-btn ${prompt.trim() || files.length ? 'active' : ''}`}
                    onClick={handleSubmit}
                  >
                    <Send size={16} />
                    <span>Generate Resume</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ResumeBuilder;
