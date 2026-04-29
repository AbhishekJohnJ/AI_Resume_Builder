import { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Send, FileText, Image, Download, RefreshCw, HelpCircle } from 'lucide-react';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import TemplatePickerCard from '../components/TemplatePickerCard';
import GeneratedResume from '../components/GeneratedResume';
import { parseThemeColor, isColorChangeOnly } from '../utils/parseThemeColor';
import { isFeatureLocked, incrementFeatureUsage, getRemainingUses, unlockFeature, getGamificationData } from '../utils/gamification';
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
  const [remainingUses, setRemainingUses] = useState('...');

  // Inline chatbot state
  const [chatMode, setChatMode] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [collectedAnswers, setCollectedAnswers] = useState({});
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [fetchingQuestions, setFetchingQuestions] = useState(false);
  const questionsRef = useRef([]);
  const chatEndRef = useRef(null);

  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);
  const resumeRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, fetchingQuestions]);

  useEffect(() => {
    const loadRemainingUses = async () => {
      try {
        const uses = await getRemainingUses('resume');
        const locked = await isFeatureLocked('resume');
        if (uses > 0) setRemainingUses(uses);
        else if (locked) setRemainingUses('20 XP');
        else setRemainingUses(0);
      } catch { setRemainingUses('...'); }
    };
    loadRemainingUses();
    window.addEventListener('gamificationUpdate', loadRemainingUses);
    return () => window.removeEventListener('gamificationUpdate', loadRemainingUses);
  }, []);

  const handleTemplateSelect = (templateId) => setSelectedTemplate(templateId);
  const handleFileChange = (e) => {
    setFiles(prev => [...prev, ...Array.from(e.target.files)]);
    e.target.value = '';
    setShowUploadMenu(false);
  };
  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const generateWithPrompt = async (finalPrompt) => {
    setError('');
    setLoading(true);
    const detectedColor = parseThemeColor(finalPrompt);
    if (detectedColor) setThemeColor(detectedColor);
    try {
      const locked = await isFeatureLocked('resume');
      if (locked) {
        const unlockResult = await unlockFeature('resume');
        if (!unlockResult.success) {
          setError(`Not enough XP! ${unlockResult.error}. Complete quests to earn more XP.`);
          setLoading(false);
          return;
        }
      }
      const formData = new FormData();
      formData.append('prompt', finalPrompt);
      formData.append('templateId', selectedTemplate);
      if (resumeData) formData.append('existingData', JSON.stringify(resumeData));
      files.forEach(f => formData.append('files', f));

      const res = await fetch('http://localhost:3001/api/ai/generate-resume', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate resume');
      setResumeData(data.resumeData);
      setChatMessages(prev => [...prev, { role: 'bot', text: 'Your resume is ready! Scroll down to view it.' }]);

      await incrementFeatureUsage('resume', 3);
      const newUses = await getRemainingUses('resume');
      setRemainingUses(newUses === 0 ? '20 XP' : newUses);

      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (user?.id) {
        await fetch('http://localhost:3001/api/resumes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, templateId: selectedTemplate, data: data.resumeData, themeColor: detectedColor || null }),
        }).catch(() => {});
      }
      setTimeout(() => resumeRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
    } catch (err) {
      const msg = err.message.includes('fetch') ? 'Server connection failed. Make sure the server is running on port 3001.' : err.message;
      setError(msg);
      setChatMessages(prev => [...prev, { role: 'bot', text: msg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleChatAnswer = async (answer) => {
    if (!pendingQuestions.length) return;
    const currentQ = pendingQuestions[0];
    const newAnswers = { ...collectedAnswers, [currentQ.key]: answer };
    setCollectedAnswers(newAnswers);
    setChatMessages(prev => [...prev, { role: 'user', text: answer || '(skipped)' }]);
    const remaining = pendingQuestions.slice(1);
    setPendingQuestions(remaining);
    if (remaining.length > 0) {
      const next = remaining[0];
      setChatMessages(prev => [...prev, { role: 'bot', text: next.question, hint: next.hint, placeholder: next.placeholder, required: next.required, isQuestion: true }]);
    } else {
      setChatMessages(prev => [...prev, { role: 'bot', text: 'Perfect! Generating your resume now...' }]);
      setChatMode(false);
      const parts = [originalPrompt];
      questionsRef.current.forEach(q => {
        const ans = newAnswers[q.key];
        if (ans && ans.trim()) parts.push(`${q.label || q.question}: ${ans.trim()}`);
      });
      await generateWithPrompt(parts.join('. '));
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim() && files.length === 0) return;
    if (!selectedTemplate) { setError('Please select a template first.'); return; }
    setError('');

    if (isColorChangeOnly(prompt)) {
      if (!resumeData) { setError('Generate a resume first, then change the colour.'); return; }
      const c = parseThemeColor(prompt);
      if (c) setThemeColor(c);
      return;
    }

    if (resumeData || files.length > 0) {
      await generateWithPrompt(prompt);
      return;
    }

    const userPrompt = prompt.trim();
    setOriginalPrompt(userPrompt);
    setPrompt('');
    setFetchingQuestions(true);
    setChatMessages([{ role: 'user', text: userPrompt }]);
    setChatMode(true);

    try {
      const res = await fetch('http://localhost:3001/api/ai/gather-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt, type: 'resume' }),
      });
      const data = await res.json();
      const questions = data.questions || [];
      questionsRef.current = questions;

      if (questions.length === 0) {
        setChatMessages(prev => [...prev, { role: 'bot', text: 'Great, I have enough info! Generating your resume...' }]);
        setChatMode(false);
        await generateWithPrompt(userPrompt);
      } else {
        setPendingQuestions(questions);
        setCollectedAnswers({});
        const first = questions[0];
        setChatMessages(prev => [...prev,
          { role: 'bot', text: `I can build a great resume! Just ${questions.length} quick question${questions.length > 1 ? 's' : ''} first.` },
          { role: 'bot', text: first.question, hint: first.hint, placeholder: first.placeholder, required: first.required, isQuestion: true },
        ]);
      }
    } catch {
      setChatMode(false);
      await generateWithPrompt(userPrompt);
    } finally {
      setFetchingQuestions(false);
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
            <TemplatePickerCard selected={selectedTemplate} onSelect={handleTemplateSelect} />
            {/* AI Prompt Box with inline chatbot */}
            <div className="rb-prompt-section">
              <h3 className="rb-prompt-title">
                {chatMode ? 'AI Assistant' : 'Describe your resume or upload your existing one'}
              </h3>
              <p className="rb-prompt-sub">
                {chatMode ? 'Answer the questions to help AI build the best resume for you' : 'Tell the AI your name, role, experience, and skills'}
              </p>

              {/* Chat history */}
              {chatMessages.length > 0 && (
                <div className="rb-chat-history">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`rb-chat-msg rb-chat-${msg.role}`}>
                      {msg.role === 'bot' && <div className="rb-chat-avatar">AI</div>}
                      <div className="rb-chat-bubble">
                        <p className="rb-chat-text">{msg.text}</p>
                        {msg.hint && <p className="rb-chat-hint">{msg.hint}</p>}
                      </div>
                    </div>
                  ))}
                  {fetchingQuestions && (
                    <div className="rb-chat-msg rb-chat-bot">
                      <div className="rb-chat-avatar">AI</div>
                      <div className="rb-chat-bubble rb-chat-typing"><span/><span/><span/></div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}

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
                {!chatMode && (
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
                )}
                <textarea
                  className="rb-input"
                  placeholder={
                    chatMode && pendingQuestions[0]
                      ? pendingQuestions[0].placeholder || 'Type your answer...'
                      : resumeData
                        ? 'e.g. Make my summary more impactful, add Docker to skills...'
                        : 'e.g. I am Mithun, Full Stack Developer at NVIDIA with 2 years experience...'
                  }
                  value={prompt}
                  rows={2}
                  onChange={e => {
                    setPrompt(e.target.value);
                    const el = e.target;
                    el.style.height = 'auto';
                    el.style.height = Math.min(el.scrollHeight, 300) + 'px';
                    el.style.overflowY = el.scrollHeight > 300 ? 'auto' : 'hidden';
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (chatMode && pendingQuestions.length > 0) {
                        if (pendingQuestions[0].required && !prompt.trim()) return;
                        handleChatAnswer(prompt.trim());
                        setPrompt('');
                      } else {
                        handleSubmit();
                      }
                    }
                  }}
                />
                <button
                  className={`rb-send-btn${(prompt.trim() || files.length || (chatMode && pendingQuestions[0] && !pendingQuestions[0].required)) && !loading ? ' rb-send-active' : ''}`}
                  onClick={() => {
                    if (chatMode && pendingQuestions.length > 0) {
                      if (pendingQuestions[0].required && !prompt.trim()) return;
                      handleChatAnswer(prompt.trim());
                      setPrompt('');
                    } else {
                      handleSubmit();
                    }
                  }}
                  disabled={loading || fetchingQuestions}
                  title={`${remainingUses} uses remaining`}
                >
                  {loading ? <span className="rb-spinner" /> : <Send size={16} />}
                  <span className="rb-uses-count">{remainingUses}</span>
                </button>
              </div>

              {chatMode && pendingQuestions[0] && !pendingQuestions[0].required && (
                <button className="rb-skip-q" onClick={() => { handleChatAnswer(''); setPrompt(''); }}>
                  Skip this question
                </button>
              )}

              {error && <div className="gr-error">{error}</div>}

              {!chatMode && (
                <div className="rb-help-row">
                  <button className="rb-help-btn" onClick={() => navigate('/about')}>
                    <HelpCircle size={15} />
                    Need any help?
                  </button>
                </div>
              )}
            </div>

            {/* â”€â”€ Loading â”€â”€ */}
            {loading && (
              <div className="gr-loading">
                <div className="gr-spinner" />
                <p className="gr-loading-text">{resumeData ? 'Enhancing your resume...' : 'Generating your resume with AI...'}</p>
              </div>
            )}

            {/* â”€â”€ Generated Resume Output â”€â”€ */}
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

