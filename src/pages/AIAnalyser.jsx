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

      const res = await fetch('http://localhost:5000/api/ai/analyze-resume-tfidf', {
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
            <p className="page-subtitle">Dataset-powered resume analysis · Trained on 500 synthetic resumes · 21 structured fields</p>
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
                📊 Benchmarked against <strong>resume-ai-training-dataset-500.xlsx</strong> — 500 synthetic resumes · 21 fields · 7 target domains
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
                      style={{ '--score-color': scoreColor(result.resumeScore || result.score || 0) }}>
                      <span className="analyser-score-num">{result.resumeScore || result.score || 0}</span>
                      <span className="analyser-score-label">/ 100</span>
                    </div>
                    <div className="analyser-score-info">
                      <h3>Resume Score</h3>
                      <p>{result.resumeLevel || result.summary || 'Resume analysis complete'}</p>
                      {result.datasetComparison && (
                        <p style={{ fontSize: '0.9em', color: '#aaa', marginTop: '8px' }}>
                          Percentile: {result.datasetComparison.percentileRank} | Benchmark: {result.datasetComparison.benchmarkScore}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Numerical Features */}
                  {result.numericalFeatures && (
                    <div className="analyser-section">
                      <h4 className="analyser-section-title" style={{ color: '#ffd700' }}>📊 Your Profile Scores</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        <div style={{ padding: '10px', background: 'rgba(255,215,0,0.08)', borderRadius: '6px', border: '1px solid rgba(255,215,0,0.3)' }}>
                          <div style={{ fontSize: '0.9em', color: '#aaa' }}>GitHub Score</div>
                          <div style={{ fontSize: '1.4em', fontWeight: '600', color: '#ffd700' }}>{result.numericalFeatures.GitHub_Score || 0}/10</div>
                        </div>
                        <div style={{ padding: '10px', background: 'rgba(0,200,150,0.08)', borderRadius: '6px', border: '1px solid rgba(0,200,150,0.3)' }}>
                          <div style={{ fontSize: '0.9em', color: '#aaa' }}>LinkedIn Score</div>
                          <div style={{ fontSize: '1.4em', fontWeight: '600', color: '#00c896' }}>{result.numericalFeatures.LinkedIn_Score || 0}/10</div>
                        </div>
                        <div style={{ padding: '10px', background: 'rgba(96,165,250,0.08)', borderRadius: '6px', border: '1px solid rgba(96,165,250,0.3)' }}>
                          <div style={{ fontSize: '0.9em', color: '#aaa' }}>ATS Score</div>
                          <div style={{ fontSize: '1.4em', fontWeight: '600', color: '#60a5fa' }}>{result.numericalFeatures.ATS_Score || 0}/100</div>
                        </div>
                        <div style={{ padding: '10px', background: 'rgba(167,139,250,0.08)', borderRadius: '6px', border: '1px solid rgba(167,139,250,0.3)' }}>
                          <div style={{ fontSize: '0.9em', color: '#aaa' }}>Projects</div>
                          <div style={{ fontSize: '1.4em', fontWeight: '600', color: '#a78bfa' }}>{result.numericalFeatures.project_count || 0}</div>
                        </div>
                        <div style={{ padding: '10px', background: 'rgba(255,161,22,0.08)', borderRadius: '6px', border: '1px solid rgba(255,161,22,0.3)' }}>
                          <div style={{ fontSize: '0.9em', color: '#aaa' }}>Certifications</div>
                          <div style={{ fontSize: '1.4em', fontWeight: '600', color: '#ffa116' }}>{result.numericalFeatures.cert_count || 0}</div>
                        </div>
                        <div style={{ padding: '10px', background: 'rgba(233,69,96,0.08)', borderRadius: '6px', border: '1px solid rgba(233,69,96,0.3)' }}>
                          <div style={{ fontSize: '0.9em', color: '#aaa' }}>Skills</div>
                          <div style={{ fontSize: '1.4em', fontWeight: '600', color: '#e94560' }}>{result.numericalFeatures.skill_count || 0}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Extracted Features */}
                  {result.extractedFeatures && (result.extractedFeatures.topSkills?.length > 0 || result.extractedFeatures.experienceKeywords?.length > 0) && (
                    <div className="analyser-section">
                      <h4 className="analyser-section-title" style={{ color: '#a78bfa' }}>🎯 Your Top Skills & Experience</h4>
                      {result.extractedFeatures.topSkills?.length > 0 && (
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ fontSize: '0.9em', fontWeight: '600', color: '#a78bfa', marginBottom: '6px' }}>
                            Top Skills: <span style={{ color: '#ffa116' }}>({result.extractedFeatures.topSkills.length})</span>
                          </div>
                          <div className="analyser-tags">
                            {result.extractedFeatures.topSkills.map((skill, i) => (
                              <span key={i} className="analyser-tag" style={{ borderColor: 'rgba(167,139,250,0.4)', color: '#a78bfa', background: 'rgba(167,139,250,0.08)' }}>{skill}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {result.extractedFeatures.experienceKeywords?.length > 0 && (
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ fontSize: '0.9em', fontWeight: '600', color: '#ffa116', marginBottom: '6px' }}>
                            Experience Keywords: <span style={{ color: '#a78bfa' }}>({result.extractedFeatures.experienceKeywords.length})</span>
                          </div>
                          <div className="analyser-tags">
                            {result.extractedFeatures.experienceKeywords.map((keyword, i) => (
                              <span key={i} className="analyser-tag" style={{ borderColor: 'rgba(255,161,22,0.4)', color: '#ffa116', background: 'rgba(255,161,22,0.08)' }}>{keyword}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Weak Areas */}
                  {(result.weakAreas || result.weaknesses)?.length > 0 && (
                    <div className="analyser-section">
                      <h4 className="analyser-section-title weaknesses">💡 Things to Work On</h4>
                      <ul className="analyser-list">
                        {(result.weakAreas || result.weaknesses).map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* Strengths */}
                  {result.strengths?.length > 0 && (
                    <div className="analyser-section">
                      <h4 className="analyser-section-title strengths">⭐ What You're Doing Great</h4>
                      <ul className="analyser-list">
                        {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* Suggestions */}
                  {(result.suggestions || result.recommendedTasks)?.length > 0 && (
                    <div className="analyser-section">
                      <h4 className="analyser-section-title suggestions">🎯 Quick Tips to Improve</h4>
                      <ul className="analyser-list">
                        {(result.suggestions || result.recommendedTasks).map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* Improvement Roadmap */}
                  {result.improvementRoadmap?.length > 0 && (
                    <div className="analyser-section">
                      <h4 className="analyser-section-title" style={{ color: '#ffa116' }}>📋 Your Growth Plan</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {result.improvementRoadmap.map((item, i) => (
                          <div key={i} style={{
                            padding: '12px',
                            background: 'rgba(255,161,22,0.08)',
                            border: '1px solid rgba(255,161,22,0.3)',
                            borderRadius: '6px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '6px' }}>
                              <span style={{ fontWeight: '600', color: '#ffa116' }}>{item.task}</span>
                              <span style={{
                                fontSize: '0.8em',
                                padding: '2px 8px',
                                background: item.priority === 'High' ? 'rgba(233,69,96,0.2)' : 'rgba(96,165,250,0.2)',
                                color: item.priority === 'High' ? '#e94560' : '#60a5fa',
                                borderRadius: '3px'
                              }}>
                                {item.priority}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.9em', color: '#aaa' }}>
                              ⏱️ {item.estimatedTime} | 📈 {item.impact} impact
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Insights */}
                  {result.keyInsights?.length > 0 && (
                    <div className="analyser-section">
                      <h4 className="analyser-section-title" style={{ color: '#a78bfa' }}>📊 Your Resume Summary</h4>
                      <ul className="analyser-list">
                        {result.keyInsights.map((insight, i) => <li key={i}>{insight}</li>)}
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
