import { useState, useRef } from 'react';
import { Upload, X, ScanSearch, FileText, Zap, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';
import './AIAnalyser.css';

const SECTION_LABELS = {
  career_objective: '🎯 Career Objective',
  education: '🎓 Education',
  experience: '💼 Experience',
  skills: '⚡ Skills',
  certifications: '📜 Certifications',
  languages: '🌐 Languages',
  extracurriculars: '🏆 Extracurriculars',
};

const qualityColor = { Poor: '#e94560', Fair: '#ffa116', Good: '#60a5fa', Excellent: '#00c896' };

function QualityBadge({ quality }) {
  const color = qualityColor[quality] || '#888';
  return <span className="analyser-quality-badge" style={{ color, borderColor: color }}>{quality}</span>;
}

function SectionRow({ label, data }) {
  const Icon = data.present ? CheckCircle : XCircle;
  const iconColor = data.present ? '#00c896' : '#e94560';
  return (
    <div className="analyser-section-row">
      <Icon size={15} color={iconColor} style={{ flexShrink: 0 }} />
      <span className="analyser-section-row-label">{label}</span>
      {data.present && <QualityBadge quality={data.quality} />}
      <span className="analyser-section-row-note">{data.note}</span>
    </div>
  );
}

function AIAnalyser() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setResult(null);
      setError('');
    }
    e.target.value = '';
  };

  const handleAnalyse = async () => {
    if (!file && !text.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    console.log('🚀 [FRONTEND] Starting analysis...');
    console.log('📄 [FRONTEND] File:', file?.name || 'None');
    console.log('📝 [FRONTEND] Text length:', text.trim().length);

    try {
      let response;

      if (file) {
        // Upload PDF
        console.log('📤 [FRONTEND] Uploading PDF:', file.name);
        const formData = new FormData();
        formData.append('file', file);

        console.log('🔗 [FRONTEND] Calling: POST /api/ai/upload-and-predict');

        response = await fetch('http://localhost:5000/api/ai/upload-and-predict', {
          method: 'POST',
          body: formData
        });
      } else {
        // Analyze text
        console.log('📝 [FRONTEND] Analyzing text');
        console.log('🔗 [FRONTEND] Calling: POST /api/ai/predict-resume');

        response = await fetch('http://localhost:5000/api/ai/predict-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeText: text.trim(),
            targetRole: targetRole.trim() || undefined
          })
        });
      }

      console.log('📊 [FRONTEND] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ [FRONTEND] Analysis complete');
      console.log('🎯 [FRONTEND] Score:', data.resume_score);
      console.log('📊 [FRONTEND] Level:', data.resume_level);

      setResult(data);
      localStorage.setItem('analyzedResumeScore', String(data.resume_score || 0));
      localStorage.setItem('analyzedResumeResult', JSON.stringify(data));

    } catch (err) {
      console.error('❌ [FRONTEND] Error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (s) => s >= 80 ? '#00c896' : s >= 60 ? '#ffa116' : '#e94560';

  return (
    <div className="dashboard-page">
      <TopBar />
      <Sidebar />
      <div className="dashboard-container">
        <main className="dashboard-content">
          <div className="page-header">
            <h1 className="page-title" style={{ color: '#ffd700' }}>AI Analyser</h1>
            <p className="page-subtitle">Analyze resumes · AI-powered insights · Personalized feedback</p>
          </div>

          <div className="analyser-layout">
            {/* Input Panel */}
            <div className="analyser-input-panel">
              <div
                className={`analyser-dropzone ${file ? 'has-file' : ''}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={handleFile}
                />
                {file ? (
                  <div className="analyser-file-info">
                    <FileText size={28} color="#ffd700" />
                    <span className="analyser-file-name">{file.name}</span>
                    <button
                      className="analyser-file-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={32} color="#555" />
                    <p className="analyser-drop-text">Click to upload PDF</p>
                    <p className="analyser-drop-sub">or paste your resume text below</p>
                  </>
                )}
              </div>

              <div className="analyser-divider"><span>or</span></div>

              <textarea
                className="analyser-textarea"
                placeholder="Paste your resume text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={7}
              />

              <input
                className="analyser-role-input"
                type="text"
                placeholder="Target role (optional) — e.g. Frontend Developer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />

              {error && (
                <div className="analyser-error">
                  <AlertCircle size={15} />
                  {error}
                </div>
              )}

              <button
                className={`analyser-btn ${(file || text.trim()) && !loading ? 'active' : ''}`}
                onClick={handleAnalyse}
                disabled={(!file && !text.trim()) || loading}
              >
                {loading ? <span className="analyser-spinner" /> : <ScanSearch size={18} />}
                {loading ? 'Analysing...' : 'Analyse Resume'}
              </button>

              <p className="analyser-dataset-note">
                📊 Powered by AI · Trained on 500 resume profiles
              </p>
            </div>

            {/* Results Panel */}
            <div className="analyser-results-panel">
              {!result && !loading && (
                <div className="analyser-placeholder">
                  <Zap size={48} color="#2a2a2a" />
                  <p>Your analysis will appear here</p>
                </div>
              )}

              {loading && (
                <div className="analyser-placeholder">
                  <div className="analyser-pulse" />
                  <p>Analysing your resume...</p>
                </div>
              )}

              {result && (
                <div className="analyser-result">
                  {/* Score Card */}
                  <div className="analyser-score-card">
                    <div
                      className="analyser-score-ring"
                      style={{ '--score-color': scoreColor(result.resume_score || 0) }}
                    >
                      <span className="analyser-score-num">{Math.round(result.resume_score || 0)}</span>
                      <span className="analyser-score-label">/ 100</span>
                    </div>
                    <div className="analyser-score-info">
                      <h3>Resume Score</h3>
                      <p>{result.resume_level || 'Analysis complete'}</p>
                    </div>
                  </div>

                  {/* Features */}
                  {result.features && (
                    <div className="analyser-section">
                      <h4 className="analyser-section-title" style={{ color: '#ffd700' }}>📊 Your Profile</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ padding: '10px', background: 'rgba(255,215,0,0.08)', borderRadius: '6px' }}>
                          <div style={{ fontSize: '0.9em', color: '#aaa' }}>Skills</div>
                          <div style={{ fontSize: '1.4em', fontWeight: '600', color: '#ffd700' }}>
                            {result.features.skill_count || 0}
                          </div>
                        </div>
                        <div style={{ padding: '10px', background: 'rgba(0,200,150,0.08)', borderRadius: '6px' }}>
                          <div style={{ fontSize: '0.9em', color: '#aaa' }}>Projects</div>
                          <div style={{ fontSize: '1.4em', fontWeight: '600', color: '#00c896' }}>
                            {result.features.project_count || 0}
                          </div>
                        </div>
                        <div style={{ padding: '10px', background: 'rgba(96,165,250,0.08)', borderRadius: '6px' }}>
                          <div style={{ fontSize: '0.9em', color: '#aaa' }}>Certifications</div>
                          <div style={{ fontSize: '1.4em', fontWeight: '600', color: '#60a5fa' }}>
                            {result.features.cert_count || 0}
                          </div>
                        </div>
                        <div style={{ padding: '10px', background: 'rgba(167,139,250,0.08)', borderRadius: '6px' }}>
                          <div style={{ fontSize: '0.9em', color: '#aaa' }}>Experience</div>
                          <div style={{ fontSize: '1.4em', fontWeight: '600', color: '#a78bfa' }}>
                            {result.features.experience_years || 0}y
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Top Skills */}
                  {result.features?.top_skills?.length > 0 && (
                    <div className="analyser-section">
                      <h4 className="analyser-section-title" style={{ color: '#a78bfa' }}>⚡ Top Skills</h4>
                      <div className="analyser-tags">
                        {result.features.top_skills.map((skill, i) => (
                          <span key={i} className="analyser-tag" style={{ borderColor: 'rgba(167,139,250,0.4)', color: '#a78bfa', background: 'rgba(167,139,250,0.08)' }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weak Areas */}
                  {result.weak_areas?.length > 0 && (
                    <div className="analyser-section">
                      <h4 className="analyser-section-title" style={{ color: '#e94560' }}>💡 Areas to Improve</h4>
                      <ul className="analyser-list">
                        {result.weak_areas.map((area, i) => (
                          <li key={i}>{area}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggestions */}
                  {result.suggestions?.length > 0 && (
                    <div className="analyser-section">
                      <h4 className="analyser-section-title" style={{ color: '#ffa116' }}>🎯 Suggestions</h4>
                      <ul className="analyser-list">
                        {result.suggestions.map((suggestion, i) => (
                          <li key={i}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommended Tasks */}
                  {result.recommended_tasks?.length > 0 && (
                    <div className="analyser-section">
                      <h4 className="analyser-section-title" style={{ color: '#00c896' }}>📋 Next Steps</h4>
                      <ul className="analyser-list">
                        {result.recommended_tasks.map((task, i) => (
                          <li key={i}>{task}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AIAnalyser;
