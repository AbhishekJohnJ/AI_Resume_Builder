import { useState, useRef, useEffect } from 'react';
import { Upload, X, ScanSearch, FileText, Zap, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import { isFeatureLocked, incrementFeatureUsage, getRemainingUses, trackQuestAction, unlockFeature } from '../utils/gamification';
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
  const [remainingUses, setRemainingUses] = useState('...');
  const [isLocked, setIsLocked] = useState(false);
  const fileInputRef = useRef(null);

  // Load remaining uses and lock status on mount
  useEffect(() => {
    const loadGamificationStatus = async () => {
      try {
        const data = await getGamificationData();
        const uses = await getRemainingUses('aiAnalysis');
        const locked = await isFeatureLocked('aiAnalysis');
        setIsLocked(locked);
        
        console.log('AI Analyser - Loaded uses:', uses, 'Locked:', locked);
        
        // If no uses left, show XP cost instead of 0
        if (uses === 0) {
          setRemainingUses('50 XP');
        } else {
          setRemainingUses(uses);
        }
      } catch (error) {
        console.error('Error loading gamification status:', error);
        setRemainingUses('50 XP'); // Fallback
      }
    };
    loadGamificationStatus();
    
    const handleUpdate = () => loadGamificationStatus();
    window.addEventListener('gamificationUpdate', handleUpdate);
    return () => window.removeEventListener('gamificationUpdate', handleUpdate);
  }, []);

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

    // Check if feature is locked (no uses left)
    const locked = await isFeatureLocked('aiAnalysis');
    if (locked) {
      // Try to auto-unlock with XP
      const unlockResult = await unlockFeature('aiAnalysis');
      if (!unlockResult.success) {
        setError(`Not enough XP! ${unlockResult.error}. Complete quests to earn more XP.`);
        return;
      }
      // Successfully unlocked! Update UI and continue
      const uses = await getRemainingUses('aiAnalysis');
      setRemainingUses(uses);
      setIsLocked(false);
    }

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

      // Increment usage and auto-complete quest
      await incrementFeatureUsage('aiAnalysis', 1); // Quest ID 1: Resume Sniper
      
      // Reload remaining uses to update UI
      const newUses = await getRemainingUses('aiAnalysis');
      if (newUses === 0) {
        setRemainingUses('50 XP');
      } else {
        setRemainingUses(newUses);
      }
      
      // Track for Quest 5: Score Chaser (re-analyze after edits)
      await trackQuestAction(5, { analysisCount: true });

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
                title={`${remainingUses} uses remaining`}
              >
                {loading ? <span className="analyser-spinner" /> : <ScanSearch size={18} />}
                {loading ? 'Analysing...' : 'Analyse Resume'}
                <span className="analyser-uses-badge">{remainingUses}</span>
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
                      {result.professional_comparison && (
                        <p style={{ fontSize: '0.85em', color: '#aaa', marginTop: '8px' }}>
                          {result.professional_comparison}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Score Explanation */}
                  {result.score_explanation && (
                    <div className="analyser-section">
                      <h4 className="analyser-section-title" style={{ color: '#ffa116' }}>🎯 Why This Score?</h4>
                      {result.score_explanation.why_this_score && (
                        <div style={{ padding: '12px', background: 'rgba(255,161,22,0.08)', borderRadius: '6px', marginBottom: '12px' }}>
                          <p style={{ fontSize: '0.95em', color: '#ddd', lineHeight: '1.6' }}>
                            {result.score_explanation.why_this_score}
                          </p>
                        </div>
                      )}
                      {result.score_explanation.unique_aspects?.length > 0 && (
                        <>
                          <p style={{ fontSize: '0.9em', color: '#aaa', marginBottom: '6px', marginTop: '10px' }}>✨ What Makes Your Resume Unique:</p>
                          <ul className="analyser-list">
                            {result.score_explanation.unique_aspects.map((aspect, i) => (
                              <li key={i} style={{ fontSize: '0.9em' }}>{aspect}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}

                  {/* Professional Comparison */}
                  {result.professional_comparison && (
                    <div className="analyser-section">
                      <h4 className="analyser-section-title" style={{ color: '#60a5fa' }}>📈 Professional Comparison</h4>
                      <p style={{ lineHeight: '1.6', color: '#ddd' }}>{result.professional_comparison}</p>
                    </div>
                  )}

                  {/* LinkedIn Profile */}
                  {result.linkedin_profile && (
                    <div className="analyser-section">
                      <h4 className="analyser-section-title" style={{ color: '#0077b5' }}>💼 LinkedIn Profile</h4>
                      <div style={{ background: 'rgba(0,119,181,0.08)', padding: '12px', borderRadius: '6px', marginBottom: '10px' }}>
                        <p style={{ fontSize: '0.9em', color: '#aaa', marginBottom: '8px' }}>
                          <strong>Status:</strong> {result.linkedin_profile.has_linkedin ? '✅ Mentioned' : '❌ Not Mentioned'}
                        </p>
                        {result.linkedin_profile.current_status && (
                          <p style={{ fontSize: '0.9em', color: '#ddd', marginBottom: '8px' }}>
                            {result.linkedin_profile.current_status}
                          </p>
                        )}
                      </div>
                      {result.linkedin_profile.suggestions?.length > 0 && (
                        <>
                          <p style={{ fontSize: '0.9em', color: '#aaa', marginBottom: '6px' }}>📝 Suggestions:</p>
                          <ul className="analyser-list">
                            {result.linkedin_profile.suggestions.map((s, i) => (
                              <li key={i} style={{ fontSize: '0.9em' }}>{s}</li>
                            ))}
                          </ul>
                        </>
                      )}
                      {result.linkedin_profile.optimization_tips?.length > 0 && (
                        <>
                          <p style={{ fontSize: '0.9em', color: '#aaa', marginBottom: '6px', marginTop: '10px' }}>💡 Optimization Tips:</p>
                          <ul className="analyser-list">
                            {result.linkedin_profile.optimization_tips.map((t, i) => (
                              <li key={i} style={{ fontSize: '0.9em' }}>{t}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}

                  {/* GitHub Profile */}
                  {result.github_profile && (
                    <div className="analyser-section">
                      <h4 className="analyser-section-title" style={{ color: '#333' }}>🐙 GitHub Profile</h4>
                      <div style={{ background: 'rgba(51,51,51,0.08)', padding: '12px', borderRadius: '6px', marginBottom: '10px' }}>
                        <p style={{ fontSize: '0.9em', color: '#aaa', marginBottom: '8px' }}>
                          <strong>Status:</strong> {result.github_profile.has_github ? '✅ Mentioned' : '❌ Not Mentioned'}
                        </p>
                        {result.github_profile.current_status && (
                          <p style={{ fontSize: '0.9em', color: '#ddd', marginBottom: '8px' }}>
                            {result.github_profile.current_status}
                          </p>
                        )}
                      </div>
                      {result.github_profile.project_suggestions?.length > 0 && (
                        <>
                          <p style={{ fontSize: '0.9em', color: '#aaa', marginBottom: '6px' }}>🚀 Project Ideas:</p>
                          <ul className="analyser-list">
                            {result.github_profile.project_suggestions.map((p, i) => (
                              <li key={i} style={{ fontSize: '0.9em' }}>{p}</li>
                            ))}
                          </ul>
                        </>
                      )}
                      {result.github_profile.portfolio_tips?.length > 0 && (
                        <>
                          <p style={{ fontSize: '0.9em', color: '#aaa', marginBottom: '6px', marginTop: '10px' }}>💡 Portfolio Tips:</p>
                          <ul className="analyser-list">
                            {result.github_profile.portfolio_tips.map((t, i) => (
                              <li key={i} style={{ fontSize: '0.9em' }}>{t}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}

                  {/* Other Profiles */}
                  {result.other_profiles?.mentioned_sites?.length > 0 && (
                    <div className="analyser-section">
                      <h4 className="analyser-section-title" style={{ color: '#ffa116' }}>🌐 Other Online Profiles</h4>
                      <p style={{ fontSize: '0.9em', color: '#aaa', marginBottom: '8px' }}>
                        <strong>Mentioned Sites:</strong> {result.other_profiles.mentioned_sites.join(', ')}
                      </p>
                      {result.other_profiles.recommendations?.length > 0 && (
                        <>
                          <p style={{ fontSize: '0.9em', color: '#aaa', marginBottom: '6px' }}>📝 Recommendations:</p>
                          <ul className="analyser-list">
                            {result.other_profiles.recommendations.map((r, i) => (
                              <li key={i} style={{ fontSize: '0.9em' }}>{r}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}

                  {/* Professional Standards */}
                  {result.professional_standards && (
                    <div className="analyser-section">
                      <h4 className="analyser-section-title" style={{ color: '#00c896' }}>✅ Professional Standards Assessment</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {Object.entries(result.professional_standards).map(([key, value]) => (
                          <div key={key} style={{ padding: '10px', background: 'rgba(0,200,150,0.08)', borderRadius: '6px' }}>
                            <p style={{ fontSize: '0.85em', color: '#aaa', marginBottom: '4px', textTransform: 'capitalize' }}>
                              {key.replace(/_/g, ' ')}
                            </p>
                            <p style={{ fontSize: '0.9em', color: '#ddd' }}>{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Student Specific */}
                  {result.student_specific && (
                    <div className="analyser-section">
                      <h4 className="analyser-section-title" style={{ color: '#a78bfa' }}>🎓 Student-Specific Assessment</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                        {Object.entries(result.student_specific).filter(([k]) => k !== 'recommendations').map(([key, value]) => (
                          <div key={key} style={{ padding: '10px', background: 'rgba(167,139,250,0.08)', borderRadius: '6px' }}>
                            <p style={{ fontSize: '0.85em', color: '#aaa', marginBottom: '4px', textTransform: 'capitalize' }}>
                              {key.replace(/_/g, ' ')}
                            </p>
                            <p style={{ fontSize: '0.9em', color: '#ddd' }}>{value}</p>
                          </div>
                        ))}
                      </div>
                      {result.student_specific.recommendations?.length > 0 && (
                        <>
                          <p style={{ fontSize: '0.9em', color: '#aaa', marginBottom: '6px' }}>📝 Recommendations:</p>
                          <ul className="analyser-list">
                            {result.student_specific.recommendations.map((r, i) => (
                              <li key={i} style={{ fontSize: '0.9em' }}>{r}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}

                  {/* How to Prepare Resume - Field Specific */}
                  {result.how_to_prepare_resume && (
                    <div className="analyser-section">
                      <h4 className="analyser-section-title" style={{ color: '#ffd700' }}>📚 How to Prepare Your Resume</h4>
                      
                      {result.identified_field && (
                        <div style={{ padding: '10px', background: 'rgba(255,215,0,0.08)', borderRadius: '6px', marginBottom: '12px' }}>
                          <p style={{ fontSize: '0.9em', color: '#ffd700', fontWeight: 'bold' }}>
                            🎯 Field: {result.identified_field}
                          </p>
                          <p style={{ fontSize: '0.85em', color: '#aaa', marginTop: '4px' }}>
                            Tailored recommendations for your field of study
                          </p>
                        </div>
                      )}

                      {result.how_to_prepare_resume.field_specific_skills?.length > 0 && (
                        <>
                          <p style={{ fontSize: '0.9em', color: '#aaa', marginBottom: '6px', marginTop: '10px' }}>⚡ Field-Specific Skills to Add:</p>
                          <ul className="analyser-list">
                            {result.how_to_prepare_resume.field_specific_skills.map((item, i) => (
                              <li key={i} style={{ fontSize: '0.9em' }}>{item}</li>
                            ))}
                          </ul>
                        </>
                      )}

                      {result.how_to_prepare_resume.field_specific_projects?.length > 0 && (
                        <>
                          <p style={{ fontSize: '0.9em', color: '#aaa', marginBottom: '6px', marginTop: '10px' }}>🚀 Field-Specific Projects to Build:</p>
                          <ul className="analyser-list">
                            {result.how_to_prepare_resume.field_specific_projects.map((item, i) => (
                              <li key={i} style={{ fontSize: '0.9em' }}>{item}</li>
                            ))}
                          </ul>
                        </>
                      )}

                      {result.how_to_prepare_resume.field_specific_certifications?.length > 0 && (
                        <>
                          <p style={{ fontSize: '0.9em', color: '#aaa', marginBottom: '6px', marginTop: '10px' }}>📜 Field-Specific Certifications:</p>
                          <ul className="analyser-list">
                            {result.how_to_prepare_resume.field_specific_certifications.map((item, i) => (
                              <li key={i} style={{ fontSize: '0.9em' }}>{item}</li>
                            ))}
                          </ul>
                        </>
                      )}

                      {result.how_to_prepare_resume.field_specific_platforms?.length > 0 && (
                        <>
                          <p style={{ fontSize: '0.9em', color: '#aaa', marginBottom: '6px', marginTop: '10px' }}>🌐 Field-Specific Platforms:</p>
                          <ul className="analyser-list">
                            {result.how_to_prepare_resume.field_specific_platforms.map((item, i) => (
                              <li key={i} style={{ fontSize: '0.9em' }}>{item}</li>
                            ))}
                          </ul>
                        </>
                      )}

                      {result.how_to_prepare_resume.field_specific_keywords?.length > 0 && (
                        <>
                          <p style={{ fontSize: '0.9em', color: '#aaa', marginBottom: '6px', marginTop: '10px' }}>🔑 Field-Specific Keywords:</p>
                          <ul className="analyser-list">
                            {result.how_to_prepare_resume.field_specific_keywords.map((item, i) => (
                              <li key={i} style={{ fontSize: '0.9em' }}>{item}</li>
                            ))}
                          </ul>
                        </>
                      )}

                      {result.how_to_prepare_resume.field_specific_experiences?.length > 0 && (
                        <>
                          <p style={{ fontSize: '0.9em', color: '#aaa', marginBottom: '6px', marginTop: '10px' }}>💼 Field-Specific Experiences to Pursue:</p>
                          <ul className="analyser-list">
                            {result.how_to_prepare_resume.field_specific_experiences.map((item, i) => (
                              <li key={i} style={{ fontSize: '0.9em' }}>{item}</li>
                            ))}
                          </ul>
                        </>
                      )}

                      {result.how_to_prepare_resume.formatting_tips?.length > 0 && (
                        <>
                          <p style={{ fontSize: '0.9em', color: '#aaa', marginBottom: '6px', marginTop: '10px' }}>🎨 Formatting Tips:</p>
                          <ul className="analyser-list">
                            {result.how_to_prepare_resume.formatting_tips.map((item, i) => (
                              <li key={i} style={{ fontSize: '0.9em' }}>{item}</li>
                            ))}
                          </ul>
                        </>
                      )}

                      {result.how_to_prepare_resume.content_tips?.length > 0 && (
                        <>
                          <p style={{ fontSize: '0.9em', color: '#aaa', marginBottom: '6px', marginTop: '10px' }}>✍️ Content Tips:</p>
                          <ul className="analyser-list">
                            {result.how_to_prepare_resume.content_tips.map((item, i) => (
                              <li key={i} style={{ fontSize: '0.9em' }}>{item}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}

                  {/* Strengths */}
                  {result.strengths?.length > 0 && (
                    <div className="analyser-section">
                      <h4 className="analyser-section-title" style={{ color: '#00c896' }}>💪 Strengths</h4>
                      <ul className="analyser-list">
                        {result.strengths.map((strength, i) => (
                          <li key={i}>{strength}</li>
                        ))}
                      </ul>
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

                  {/* Key Insights */}
                  {result.key_insights?.length > 0 && (
                    <div className="analyser-section">
                      <h4 className="analyser-section-title" style={{ color: '#60a5fa' }}>💡 Key Insights</h4>
                      <ul className="analyser-list">
                        {result.key_insights.map((insight, i) => (
                          <li key={i}>{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ATS Score */}
                  {result.ats_score && (
                    <div className="analyser-section">
                      <h4 className="analyser-section-title" style={{ color: '#a78bfa' }}>🤖 ATS Compatibility Score</h4>
                      <div style={{ padding: '12px', background: 'rgba(167,139,250,0.08)', borderRadius: '6px' }}>
                        <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#a78bfa' }}>
                          {Math.round(result.ats_score)}%
                        </div>
                        <p style={{ fontSize: '0.9em', color: '#aaa', marginTop: '6px' }}>
                          {result.ats_score >= 80 ? '✅ Excellent ATS compatibility' : result.ats_score >= 60 ? '⚠️ Good ATS compatibility' : '❌ Needs ATS optimization'}
                        </p>
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
