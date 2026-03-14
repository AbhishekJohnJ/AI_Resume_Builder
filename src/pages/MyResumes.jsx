import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Menu, Trash2, Eye, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import GeneratedResume from '../components/GeneratedResume';
import ProfileSummaryCard from '../components/ProfileSummaryCard';
import './Dashboard.css';
import './MyResumes.css';
import '../components/GeneratedResume.css';

function MyResumes() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [showProfileCard, setShowProfileCard] = useState(false);

  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    if (!user?.id) return;
    fetch(`http://localhost:5000/api/resumes/${user.id}`)
      .then(r => r.json())
      .then(data => { setResumes(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/api/resumes/${id}`, { method: 'DELETE' });
    setResumes(prev => prev.filter(r => r._id !== id));
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
          </div>
          <div className="auth-buttons">
            <button onClick={() => setShowProfileCard(v => !v)} className="btn-user-profile"><User size={20} /></button>
            <button onClick={() => navigate('/')} className="btn-logout-nav">Logout</button>
          </div>
        </div>
      </nav>

      {showProfileCard && (
        <>
          <div className="profile-overlay" onClick={() => setShowProfileCard(false)} />
          <div className="profile-dropdown">
            <ProfileSummaryCard name={user.name || 'User'} role="Member"
              profileImage={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&size=200&background=667eea&color=fff&bold=true`}
              resumeScore={0} leaderboardRank={0} totalPoints={0} />
          </div>
        </>
      )}

      <Sidebar />

      <div className="dashboard-container">
        <main className="dashboard-content">
          <div className="page-header">
            <h1 className="page-title" style={{ color: '#ffd700' }}>My Resumes</h1>
            <p className="page-subtitle">All your generated resumes in one place</p>
          </div>

          {loading ? (
            <div className="mr-loading"><div className="gr-spinner" /></div>
          ) : resumes.length === 0 ? (
            <div className="mr-empty">
              <p>No resumes yet. <span onClick={() => navigate('/resume-builder')}>Build one now →</span></p>
            </div>
          ) : (
            <div className="mr-grid">
              {resumes.map(r => (
                <div key={r._id} className="mr-card">
                  <div className="mr-card-preview">
                    <div className="mr-card-inner">
                      <GeneratedResume data={r.data} templateId={r.templateId} />
                    </div>
                  </div>
                  <div className="mr-card-footer">
                    <div className="mr-card-info">
                      <span className="mr-card-name">{r.data?.name || 'Resume'}</span>
                      <span className="mr-card-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="mr-card-actions">
                      <button className="mr-btn mr-btn-view" onClick={() => setPreview(r)}><Eye size={14} /></button>
                      <button className="mr-btn mr-btn-delete" onClick={() => handleDelete(r._id)}><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {preview && (
        <div className="mr-modal-overlay" onClick={() => setPreview(null)}>
          <div className="mr-modal" onClick={e => e.stopPropagation()}>
            <button className="mr-modal-close" onClick={() => setPreview(null)}><X size={20} /></button>
            <div className="mr-modal-body">
              <GeneratedResume data={preview.data} templateId={preview.templateId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyResumes;
