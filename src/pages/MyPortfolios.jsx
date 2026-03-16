import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Menu, Trash2, Eye, X, Download, Code, Copy, Check } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import Sidebar from '../components/Sidebar';
import GeneratedPortfolio from '../components/GeneratedPortfolio';
import ProfileSummaryCard from '../components/ProfileSummaryCard';
import './Dashboard.css';
import './MyResumes.css';

function MyPortfolios() {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [codeTab, setCodeTab] = useState('html');
  const [copied, setCopied] = useState(false);
  const previewRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    fetch(`http://localhost:5000/api/portfolios/${user.id}`)
      .then(r => r.json())
      .then(data => { setPortfolios(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/api/portfolios/${id}`, { method: 'DELETE' });
    setPortfolios(prev => prev.filter(p => p._id !== id));
  };

  const handleDownloadPDF = async () => {
    const el = previewRef.current?.querySelector('.pt');
    if (!el) return;
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(el, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageW / canvas.width, pageH / canvas.height);
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width * ratio, canvas.height * ratio);
    pdf.save(`${preview?.data?.name?.replace(/\s+/g, '_') || 'portfolio'}.pdf`);
  };

  const buildThemeVarBlock = (tc, selector) => {
    if (!tc) return '';
    const ALL_VARS = ['--tc', '--tc-dark', '--tc-light', '--tc-accent', '--bg', '--bg-2', '--text', '--text-muted'];
    const varMap = {
      '--tc': tc.main, '--tc-dark': tc.dark, '--tc-light': tc.light, '--tc-accent': tc.accent,
      '--bg': tc['--bg'], '--bg-2': tc['--bg-2'], '--text': tc['--text'], '--text-muted': tc['--text-muted'],
    };
    const lines = ALL_VARS.filter(v => varMap[v]).map(v => `  ${v}: ${varMap[v]};`).join('\n');
    return lines ? `${selector} {\n${lines}\n}` : '';
  };

  const getExportedHTML = () => {
    if (!preview) return '';
    const tc = preview.themeColor || null;
    const markup = renderToStaticMarkup(
      <GeneratedPortfolio data={preview.data} templateId={preview.templateId} themeColor={tc} />
    );
    const block = buildThemeVarBlock(tc, ':root');
    const colorVars = block ? `\n  <style>\n    ${block.replace(/\n/g, '\n    ')}\n  </style>` : '';
    return `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <title>${preview.data?.name || 'Portfolio'}</title>\n  <link rel="stylesheet" href="portfolio.css" />${colorVars}\n</head>\n<body>\n${markup}\n</body>\n</html>`;
  };

  const getExportedCSS = () => {
    const tplId = preview?.templateId;
    const tc = preview?.themeColor || null;
    if (!tplId) return '';
    try {
      let css = '/* Portfolio CSS */\n\n';
      const block = buildThemeVarBlock(tc, `.pt${tplId}`);
      if (block) css += `/* Theme color overrides */\n${block}\n\n`;
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            const t = rule.cssText;
            if (t.includes(`.pt${tplId}-`) || t.includes(`.pt${tplId} `) || t.startsWith(`.pt${tplId}{`) || t.startsWith(`.pt${tplId} `)) {
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
            <h1 className="page-title" style={{ color: '#ffa116' }}>My Portfolios</h1>
            <p className="page-subtitle">All your generated portfolios in one place</p>
          </div>

          {loading ? (
            <div className="mr-loading"><div className="gr-spinner" /></div>
          ) : portfolios.length === 0 ? (
            <div className="mr-empty">
              <p>No portfolios yet.</p>
              <button className="btn-build-now portfolio" onClick={() => navigate('/portfolio')}>
                Build one now →
              </button>
            </div>
          ) : (
            <div className="mr-grid">
              {portfolios.map(p => (
                <div key={p._id} className="mr-card">
                  <div className="mr-card-preview">
                    <div className="mr-card-inner">
                      <GeneratedPortfolio data={p.data} templateId={p.templateId} themeColor={p.themeColor || null} />
                    </div>
                  </div>
                  <div className="mr-card-footer">
                    <div className="mr-card-info">
                      <span className="mr-card-name">{p.data?.name || 'Portfolio'}</span>
                      <span className="mr-card-date">{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="mr-card-actions">
                      <button className="mr-btn mr-btn-view" onClick={() => setPreview(p)}><Eye size={14} /></button>
                      <button className="mr-btn mr-btn-delete" onClick={() => handleDelete(p._id)}><Trash2 size={14} /></button>
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
                <GeneratedPortfolio data={preview.data} templateId={preview.templateId} themeColor={preview.themeColor || null} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPortfolios;
