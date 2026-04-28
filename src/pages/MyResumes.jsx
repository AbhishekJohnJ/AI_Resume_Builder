import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Eye, X, Download, Code, Copy, Check } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
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
  const [showCode, setShowCode] = useState(false);
  const [codeTab, setCodeTab] = useState('html');
  const [copied, setCopied] = useState(false);
  const previewRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    if (!user?.id) return;
    fetch(`http://localhost:3001/api/resumes/${user.id}`)
      .then(r => r.json())
      .then(data => { setResumes(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    await fetch(`http://localhost:3001/api/resumes/${id}`, { method: 'DELETE' });
    setResumes(prev => prev.filter(r => r._id !== id));
  };

  const handleDownloadPDF = async () => {
    const el = previewRef.current?.querySelector('.rv');
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const jsPDF = (await import('jspdf')).default;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageW / canvas.width, pageH / canvas.height);
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width * ratio, canvas.height * ratio);
    pdf.save(`${preview?.data?.name?.replace(/\s+/g, '_') || 'resume'}.pdf`);
  };

  const getExportedHTML = () => {
    if (!preview) return '';
    const markup = renderToStaticMarkup(
      <GeneratedResume data={preview.data} templateId={preview.templateId} />
    );
    return `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <title>${preview.data?.name || 'Resume'}</title>\n  <link rel="stylesheet" href="resume.css" />\n</head>\n<body>\n${markup}\n</body>\n</html>`;
  };

  const getExportedCSS = () => {
    const tplId = preview?.templateId;
    if (!tplId) return '';
    try {
      let css = '/* Resume CSS */\n\n';
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            const t = rule.cssText;
            if (t.includes(`.rv${tplId}-`) || t.includes(`.rv${tplId} `) || t.startsWith(`.rv${tplId}{`) || t.startsWith(`.rv${tplId} `)) {
              css += rule.cssText + '\n';
            }
          }
        } catch { /* cross-origin */ }
      }
      return css;
    } catch { return '/* Could not extract CSS */'; }
  };

  const handleCopy = () => {
    const text = codeTab === 'html' ? getExportedHTML() : getExportedCSS();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="dashboard-page">
      <TopBar />
      <Sidebar />

      <div className="dashboard-container">
        <main className="dashboard-content">
          <div className="page-header">
            <h1 className="page-title" style={{ color: 'var(--accent)' }}>My Resumes</h1>
            <p className="page-subtitle">All your generated resumes in one place</p>
          </div>

          {loading ? (
            <div className="mr-loading"><div className="gr-spinner" /></div>
          ) : resumes.length === 0 ? (
            <div className="mr-empty">
              <p>No resumes yet.</p>
              <button className="btn-build-now" onClick={() => navigate('/resume-builder')}>
                Build one now →
              </button>
            </div>
          ) : (
            <div className="mr-grid">
              {resumes.map(r => (
                <div key={r._id} className="mr-card">
                  <div className="mr-card-preview">
                    <div className="mr-card-inner">
                      <GeneratedResume data={r.data} templateId={r.templateId} themeColor={r.themeColor || null} />
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
        <div className="mr-modal-overlay" onClick={() => { setPreview(null); setShowCode(false); }}>
          <div className="mr-modal" onClick={e => e.stopPropagation()}>
            <div className="mr-modal-topbar">
              <div className="mr-modal-actions-bar">
                <button className="mr-action-btn" onClick={handleDownloadPDF}><Download size={14} /> Export PDF</button>
                <button className="mr-action-btn" onClick={() => { setShowCode(true); setCodeTab('html'); }}><Code size={14} /> View Code</button>
              </div>
              <button className="mr-modal-close" onClick={() => { setPreview(null); setShowCode(false); }}><X size={20} /></button>
            </div>
            {showCode ? (
              <div className="mr-code-panel">
                <div className="mr-code-tabs">
                  <button className={`mr-code-tab${codeTab === 'html' ? ' mr-code-tab-active' : ''}`} onClick={() => setCodeTab('html')}>HTML</button>
                  <button className={`mr-code-tab${codeTab === 'css' ? ' mr-code-tab-active' : ''}`} onClick={() => setCodeTab('css')}>CSS</button>
                  <button className={`mr-copy-btn${copied ? ' mr-copy-copied' : ''}`} onClick={handleCopy}>
                    {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
                  </button>
                </div>
                <pre className="mr-code-block"><code>{codeTab === 'html' ? getExportedHTML() : getExportedCSS()}</code></pre>
              </div>
            ) : (
              <div className="mr-modal-body" ref={previewRef}>
                <GeneratedResume data={preview.data} templateId={preview.templateId} themeColor={preview.themeColor || null} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MyResumes;
