import { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Send, FileText, Image, Download, RefreshCw, HelpCircle } from 'lucide-react';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import TemplatePickerCard from '../components/TemplatePickerCard';
import GeneratedResume from '../components/GeneratedResume';
import { parseThemeColor, isColorChangeOnly } from '../utils/parseThemeColor';
import './Dashboard.css';
import './ResumeBuilder.css';
import '../components/GeneratedResume.css';

function ResumeBuilder() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState([]);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resumeData, setResumeData] = useState(null);
  const [themeColor, setThemeColor] = useState(null);
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);
  const resumeRef = useRef(null);

  const handleLogout = () => navigate('/');

  const handleFileChange = (e) => {
    const picked = Array.from(e.target.files);
    setFiles(prev => [...prev, ...picked]);
    e.target.value = '';
    setShowUploadMenu(false);
  };

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!prompt.trim() && files.length === 0) return;
    if (!selectedTemplate) {
      setError('Please select a template first.');
      return;
    }
    setError('');

    // Parse theme color from prompt
    const detectedColor = parseThemeColor(prompt);
    if (detectedColor) setThemeColor(detectedColor);

    // If it's only a color-change request, just recolor — no AI call needed
    if (isColorChangeOnly(prompt)) {
      if (!resumeData) setError('Generate a resume first, then change the colour.');
      return;
    }

    setLoading(true);
    if (!resumeData) setResumeData(null); // only clear on fresh generation
    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('templateId', selectedTemplate);
      if (resumeData) formData.append('existingData', JSON.stringify(resumeData));
      files.forEach(f => formData.append('files', f));

      const res = await fetch('http://localhost:3001/api/ai/generate-resume', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate resume');
      setResumeData(data.resumeData);

      // Save to database
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (user?.id) {
        await fetch('http://localhost:3001/api/resumes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, templateId: selectedTemplate, data: data.resumeData, themeColor: detectedColor || null }),
        });
      }

      setTimeout(() => resumeRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    const el = document.getElementById('gr-resume-paper');
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = canvas.width;
    const imgH = canvas.height;
    const ratio = Math.min(pageW / imgW, pageH / imgH);
    pdf.addImage(imgData, 'PNG', 0, 0, imgW * ratio, imgH * ratio);
    pdf.save(`${resumeData?.name?.replace(/\s+/g, '_') || 'resume'}.pdf`);
  };

  return (
    <div className="dashboard-page resume-builder-page">
      <TopBar />

      <Sidebar />

      <div className="dashboard-container">
        <main className="dashboard-content">
          <div className="page-header">
            <h1 className="page-title">Resume Builder</h1>
            <p className="page-subtitle">Pick a professionally designed template to build your resume</p>
          </div>

          <div className="resume-builder-content">
            <TemplatePickerCard selected={selectedTemplate} onSelect={setSelectedTemplate} />

            {/* ── AI Prompt Box ── */}
            <div className="rb-prompt-section">
              <h3 className="rb-prompt-title">Describe your resume or upload your existing one</h3>
              <p className="rb-prompt-sub">Tell the AI about your experience, skills, and the job you're targeting — or upload a file to get started.</p>

              <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.gif,.webp" multiple style={{ display: 'none' }} onChange={handleFileChange} />
              <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.csv" multiple style={{ display: 'none' }} onChange={handleFileChange} />

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



              <div className={`rb-bar${prompt.trim() || files.length ? ' rb-bar-active' : ''}`}>
                <div className="rb-plus-wrap">
                  <button className="rb-plus-btn" onClick={() => setShowUploadMenu(v => !v)}>
                    <Plus size={18} />
                  </button>
                  {showUploadMenu && (
                    <div className="rb-upload-menu">
                      <button className="rb-upload-option" onClick={() => fileInputRef.current.click()}>
                        <Image size={16} /><span>Upload Image</span><span className="rb-upload-hint">JPG, PNG</span>
                      </button>
                      <button className="rb-upload-option" onClick={() => docInputRef.current.click()}>
                        <FileText size={16} /><span>Upload Document</span><span className="rb-upload-hint">PDF, DOCX, Excel</span>
                      </button>
                    </div>
                  )}
                </div>
                <textarea
                  className="rb-input"
                  placeholder={resumeData ? 'e.g. Make my summary more impactful, add Docker to skills, improve job descriptions...' : 'e.g. Full Stack Developer, React...'}
                  value={prompt}
                  rows={2}
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
                  className={`rb-send-btn${(prompt.trim() || files.length) && !loading ? ' rb-send-active' : ''}`}
                  onClick={handleSubmit}
                  disabled={loading || (!prompt.trim() && files.length === 0)}
                >
                  {loading ? <span className="rb-spinner" /> : <Send size={16} />}
                </button>
              </div>

              {error && <div className="gr-error">{error}</div>}

              <div className="rb-help-row">
                <button className="rb-help-btn" onClick={() => navigate('/about')}>
                  <HelpCircle size={15} />
                  Need any help?
                </button>
              </div>
            </div>

            {/* ── Loading ── */}
            {loading && (
              <div className="gr-loading">
                <div className="gr-spinner" />
                <p className="gr-loading-text">{resumeData ? 'Enhancing your resume...' : 'Generating your resume with AI...'}</p>
              </div>
            )}

            {/* ── Generated Resume Output ── */}
            {resumeData && !loading && (
              <div className="gr-output" ref={resumeRef}>
                <div className="gr-output-header">
                  <h3 className="gr-output-title">Your Generated Resume</h3>
                  <div className="gr-actions">
                    <button className="gr-btn gr-btn-regenerate" onClick={handleSubmit}>
                      <RefreshCw size={14} /> Regenerate
                    </button>
                    <button className="gr-btn gr-btn-download" onClick={handleDownload}>
                      <Download size={14} /> Download
                    </button>
                  </div>
                </div>
                <div className="gr-paper-wrap">
                  <div id="gr-resume-paper" className="gr-paper">
                    <GeneratedResume data={resumeData} templateId={selectedTemplate} themeColor={themeColor} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ResumeBuilder;
