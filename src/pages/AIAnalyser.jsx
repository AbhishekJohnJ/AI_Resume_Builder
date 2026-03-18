import { useState, useRef } from 'react';
import { Upload, X, ScanSearch, FileText, Zap, AlertCircle, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';
import './AIAnalyser.css';

const SECTION_LABELS = {
  career_objective: '🎯 Career Objective',
  education:        '🎓 Education',
  experience:       '💼 Experience',
  skills:           '⚡ Skills',
  certifications:   '📜 Certifications',
  languages:        '🌐 Languages',
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
    if (f) { setFile(f); setResult(null); setError(''); }
    e.target.value = '';
  };

  const handleAnalyse = async () => {
    if (!file && !text.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      let resumeText = text.trim();

      if (file) {
        const formData = new FormData();
        formData.append('files', file);
        formData.append('prompt', 'extract and summarise resume content');
        const extractRes = await fetch('http://localhost:5000/api/ai/generate-resume', {
          method: 'POST',
          body: formData
        });
        const extractData = await extractRes.json();
        if (extractData?.resumeData) {
          resumeText = JSON.stringify(extractData.resumeData);
        }
      }

      const res = await fetch('http://localhost:5000/api/ai/analyse-resume-full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, targetRole: targetRole.trim() || undefined })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setResult(data);
    } catch (err) {
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
            <p className="page-subtitle">Dataset-powered resume analysis across 35 dimensions · 9,544 resume benchmark</p>
          </div>

          <div className="analyser-layout">
            {/* Input Panel */}
            <div className="analyser-input-panel">

              <div
                className={`analyser-dropzone ${file ? 'has-file' : ''}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc,.txt"
                  style={{ display: 'none' }} onChange={handleFile} />
                {file ? (
                  <div className="analyser-file-info">
                    <FileText size={28} color="#ffd700" />
                    <span className="analyser-file-name">{file.name}</span>
                    <button className="analyser-file-remove"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={32} color="#555" />
                    <p className="analyser-drop-text">Click to upload PDF, DOCX, or TXT</p>
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
                📊 Benchmarked against <strong>resume_data.csv</strong> — 9,544 resumes · 35 fields
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
                  <p>Analysing against dataset...</p>
                </div>
              )}

              {result && (
                <div className="analyser-result">

                  {/* Score */}
                  <div className="analyser-score-card">
                    <div className="analyser-score-ring"
                      style={{ '--score-color': scoreColor(result.score) }}>
                      <span className="analyser-score-num">{result.score}</span>
                      <span className="analyser-score-label">/ 100</span>
                    </div>
                    <div className="analyser-score-info">
                      <h3>Dataset-Calibrated Score</h3>
                      <p>{result.summary}</p>
                    </div>
                  </div>

                  {/* Section Breakdown */}
                  {result.sections && (
                    <div className="analyser-section">
                      <h4 className="analyser-section-title" style={{ color: '#a78bfa' }}>📋 Section Breakdown</h4>
                      <div className="analyser-sections-grid">
                        {Object.entries(result.sections).map(([key, val]) => (
                          <SectionRow key={key} label={SECTION_LABELS[key] || key} data={val} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Job Match */}
                  {result.jobMatch && (
                    <div className="analyser-section">
                      <h4 className="analyser-section-title" style={{ color: '#ffa116' }}>🎯 Job Match</h4>
                      <div className="analyser-job-match">
                        <div className="analyser-match-score-row">
                          <span className="analyser-match-label">Match Score</span>
                          <div className="analyser-match-bar-wrap">
                            <div className="analyser-match-bar">
                              <div className="analyser-match-fill"
                                style={{ width: `${result.jobMatch.matchScore}%`,
                                  background: scoreColor(result.jobMatch.matchScore) }} />
                            </div>
                            <span className="analyser-match-pct"
                              style={{ color: scoreColor(result.jobMatch.matchScore) }}>
                              {result.jobMatch.matchScore}%
                            </span>
                          </div>
                        </div>
                        {result.jobMatch.suggestedRoles?.length > 0 && (
                          <div className="analyser-match-row">
                            <span className="analyser-match-label">Suggested Roles</span>
                            <div className="analyser-tags">
                              {result.jobMatch.suggestedRoles.map((r, i) => (
                                <span key={i} className="analyser-tag" style={{ borderColor: 'rgba(255,161,22,0.4)', color: '#ffa116', background: 'rgba(255,161,22,0.08)' }}>{r}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {result.jobMatch.missingSkills?.length > 0 && (
                          <div className="analyser-match-row">
                            <span className="analyser-match-label">Missing Skills</span>
                            <div className="analyser-tags">
                              {result.jobMatch.missingSkills.map((s, i) => (
                                <span key={i} className="analyser-tag" style={{ borderColor: 'rgba(233,69,96,0.4)', color: '#e94560', background: 'rgba(233,69,96,0.08)' }}>{s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Strengths */}
                  {result.strengths?.length > 0 && (
                    <div className="analyser-section">
                      <h4 className="analyser-section-title strengths">✅ Strengths</h4>
                      <ul className="analyser-list">
                        {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* Weaknesses */}
                  {result.weaknesses?.length > 0 && (
                    <div className="analyser-section">
                      <h4 className="analyser-section-title weaknesses">⚠️ Areas to Improve</h4>
                      <ul className="analyser-list">
                        {result.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* Suggestions */}
                  {result.suggestions?.length > 0 && (
                    <div className="analyser-section">
                      <h4 className="analyser-section-title suggestions">💡 Suggestions</h4>
                      <ul className="analyser-list">
                        {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* Keywords */}
                  {result.keywords?.length > 0 && (
                    <div className="analyser-section">
                      <h4 className="analyser-section-title keywords">🔑 Detected Skills</h4>
                      <div className="analyser-tags">
                        {result.keywords.map((k, i) => (
                          <span key={i} className="analyser-tag">{k}</span>
                        ))}
                      </div>
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
