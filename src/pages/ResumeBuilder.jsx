import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Menu, Plus, X, Send, FileText, Image } from 'lucide-react';
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
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);

  const handleLogout = () => navigate('/');
  const toggleProfileCard = () => setShowProfileCard(!showProfileCard);

  const handleFileChange = (e) => {
    const picked = Array.from(e.target.files);
    setFiles(prev => [...prev, ...picked]);
    e.target.value = '';
    setShowUploadMenu(false);
  };

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = () => {
    if (!prompt.trim() && files.length === 0) return;
    console.log('Prompt:', prompt, 'Files:', files);
  };

  return (
    <div className="dashboard-page resume-builder-page">
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

              {/* Hidden file inputs */}
              <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.gif,.webp" multiple style={{ display: 'none' }} onChange={handleFileChange} />
              <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.txt" multiple style={{ display: 'none' }} onChange={handleFileChange} />

              {/* File chips above bar */}
              {files.length > 0 && (
                <div className="rb-file-chips">
                  {files.map((f, i) => (
                    <div key={i} className="rb-file-chip">
                      {f.type.startsWith('image/') ? <Image size={13} /> : <FileText size={13} />}
                      <span>{f.name}</span>
                      <button onClick={() => removeFile(i)}><X size={11} /></button>
                    </div>
                  ))}
                </div>
              )}

              {/* Pill bar */}
              <div className={`rb-bar${prompt.trim() || files.length ? ' rb-bar-active' : ''}`}>
                <div className="rb-plus-wrap">
                  <button className="rb-plus-btn" onClick={() => setShowUploadMenu(v => !v)}>
                    <Plus size={18} />
                  </button>
                  {showUploadMenu && (
                    <div className="rb-upload-menu">
                      <button className="rb-upload-option" onClick={() => fileInputRef.current.click()}>
                        <Image size={16} />
                        <span>Upload Image</span>
                        <span className="rb-upload-hint">JPG, PNG</span>
                      </button>
                      <button className="rb-upload-option" onClick={() => docInputRef.current.click()}>
                        <FileText size={16} />
                        <span>Upload Document</span>
                        <span className="rb-upload-hint">PDF, DOCX</span>
                      </button>
                    </div>
                  )}
                </div>
                <textarea
                  className="rb-input"
                  placeholder="Describe your experience, skills, or the job you're targeting..."
                  value={prompt}
                  rows={1}
                  onChange={e => {
                    setPrompt(e.target.value);
                    const el = e.target;
                    el.style.height = 'auto';
                    const maxH = 300;
                    el.style.height = Math.min(el.scrollHeight, maxH) + 'px';
                    el.style.overflowY = el.scrollHeight > maxH ? 'auto' : 'hidden';
                  }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                />
                <button
                  className={`rb-send-btn${prompt.trim() || files.length ? ' rb-send-active' : ''}`}
                  onClick={handleSubmit}
                  disabled={!prompt.trim() && files.length === 0}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ResumeBuilder;
