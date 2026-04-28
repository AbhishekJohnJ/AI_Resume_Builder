import { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Send, FileText, Image, Download, RefreshCw, HelpCircle, Bot } from 'lucide-react';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import TemplatePickerCard from '../components/TemplatePickerCard';
import GeneratedResume from '../components/GeneratedResume';
import { parseThemeColor, isColorChangeOnly } from '../utils/parseThemeColor';
import './Dashboard.css';
import './ResumeBuilder.css';
import '../components/GeneratedResume.css';

// Chat message types
// { role: 'bot' | 'user', text: string, isQuestion?: bool, questionKey?: string }

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
  const chatEndRef = useRef(null);

  // Chat state
  const [chatMode, setChatMode] = useState(false); // true = in Q&A mode
  const [chatMessages, setChatMessages] = useState([]); // conversation history
  const [pendingQuestions, setPendingQuestions] = useState([]); // remaining questions
  const [collectedAnswers, setCollectedAnswers] = useState({}); // key: answer
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [fetchingQuestions, setFetchingQuestions] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, fetchingQuestions]);

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
      const formData = new FormData();
      formData.append('prompt', finalPrompt);
      formData.append('templateId', selectedTemplate);
      if (resumeData) formData.append('existingData', JSON.stringify(resumeData));
      files.forEach(f => formData.append('files', f));

      const res = await fetch('http://localhost:3001/api/ai/generate-resume', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate resume');
      setResumeData(data.resumeData);
      setChatMessages(prev => [...prev, { role: 'bot', text: '✅ Your resume has been generated! Scroll down to view it.' }]);

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
      setChatMessages(prev => [...prev, { role: 'bot', text: `❌ ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  // Build final prompt from original + collected answers
  const buildFinalPrompt = (orig, answers, questions) => {
    const parts = [orig];
    questions.forEach(q => {
      const ans = answers[q.key];
      if (ans && ans.trim()) parts.push(`${q.label}: ${ans.trim()}`);
    });
    return parts.join('. ');
  };

  // Handle user answering a question in chat
  const handleChatAnswer = async (answer) => {
    if (!pendingQuestions.length) return;
    const currentQ = pendingQuestions[0];
    const newAnswers = { ...collectedAnswers, [currentQ.key]: answer };
    setCollectedAnswers(newAnswers);

    // Add user message to chat
    setChatMessages(prev => [...prev, { role: 'user', text: answer || '(skipped)' }]);

    const remaining = pendingQuestions.slice(1);
    setPendingQuestions(remaining);

    if (remaining.length > 0) {
      // Ask next question
      const next = remaining[0];
      setChatMessages(prev => [...prev, {
        role: 'bot',
        text: next.question,
        hint: next.hint,
        placeholder: next.placeholder,
        required: next.required,
        isQuestion: true,
      }]);
    } else {
      // All questions answered — generate
      setChatMessages(prev => [...prev, {
        role: 'bot',
        text: '✨ Perfect! I have everything I need. Generating your resume now...',
      }]);
      setChatMode(false);

      // Build final prompt from original + all answers
      const allQ = questionsRef.current;
      const parts = [originalPrompt];
      allQ.forEach(q => {
        const ans = newAnswers[q.key];
        if (ans && ans.trim()) parts.push(`${q.label || q.question}: ${ans.trim()}`);
      });
      const finalPrompt = parts.join('. ');
      await generateWithPrompt(finalPrompt);
    }
  };

  const questionsRef = useRef([]);

  const handleSubmit = async () => {
    if (!prompt.trim() && files.length === 0) return;
    if (!selectedTemplate) { setError('Please select a template first.'); return; }
    setError('');

    // Enhancement or color change — skip chat
    if (resumeData || files.length > 0) {
      if (isColorChangeOnly(prompt)) {
        if (!resumeData) { setError('Generate a resume first, then change the colour.'); return; }
        const c = parseThemeColor(prompt);
        if (c) setThemeColor(c);
        return;
      }
      await generateWithPrompt(prompt);
      return;
    }

    // First generation — ask AI what's missing
    const userPrompt = prompt.trim();
    if (!selectedTemplate) { setError('Please select a template first.'); return; }
    setOriginalPrompt(userPrompt);
    setPrompt('');
    setFetchingQuestions(true);

    // Show user's message in chat
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
        // No questions needed — generate directly
        setChatMessages(prev => [...prev, { role: 'bot', text: '✨ Great, I have enough info! Generating your resume...' }]);
        setChatMode(false);
        await generateWithPrompt(userPrompt);
      } else {
        setPendingQuestions(questions);
        setCollectedAnswers({});
        const first = questions[0];
        setChatMessages(prev => [...prev, {
          role: 'bot',
          text: `I can build a great resume for you! I just need a few more details. (${questions.length} quick questions)`,
        }, {
          role: 'bot',
          text: first.question,
          hint: first.hint,
          placeholder: first.placeholder,
          required: first.required,
          isQuestion: true,
        }]);
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
    const ratio = Math.min(pdf.internal.pageSize.getWidth() / canvas.width, pdf.internal.pageSize.getHeight() / canvas.height);
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width * ratio, canvas.height * ratio);
    pdf.save(`${resumeData?.name?.replace(/\s+/g, '_') || 'resume'}.pdf`);
  };

  const currentQuestion = chatMode && pendingQuestions.length > 0 ? pendingQuestions[0] : null;

  return (
    <div className="dashboard-page resume-builder-page">
      <TopBar />
      <Sidebar />
      <div className="dashboard-container">
        <main className="dashboard-content">
          <div className="page-header">
            <h1 className="page-title">Resume Builder</h1>
            <p className="page-subtitle">Pick a template, describe yourself, and let AI build your resume</p>
          </div>

          <div className="resume-builder-content">
            <TemplatePickerCard selected={selectedTemplate} onSelect={setSelectedTemplate} />

            <div className="rb-prompt-section">
              <h3 className="rb-prompt-title">
                {chatMode ? '🤖 AI Assistant' : 'Describe your resume or upload your existing one'}
              </h3>
              <p className="rb-prompt-sub">
                {chatMode
                  ? 'Answer the questions below to help AI build the best resume for you'
                  : 'Tell the AI your role, experience, and skills — the more detail, the better'}
              </p>

              {/* ── Chat conversation ── */}
              {chatMessages.length > 0 && (
                <div className="rb-chat-history">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`rb-chat-msg rb-chat-${msg.role}`}>
                      {msg.role === 'bot' && (
                        <div className="rb-chat-avatar"><Bot size={14} /></div>
                      )}
                      <div className="rb-chat-bubble">
                        <p className="rb-chat-text">{msg.text}</p>
                        {msg.hint && <p className="rb-chat-hint">{msg.hint}</p>}
                      </div>
                    </div>
                  ))}
                  {fetchingQuestions && (
                    <div className="rb-chat-msg rb-chat-bot">
                      <div className="rb-chat-avatar"><Bot size={14} /></div>
                      <div className="rb-chat-bubble rb-chat-typing">
                        <span/><span/><span/>
                      </div>
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
                    chatMode && currentQuestion
                      ? currentQuestion.placeholder || 'Type your answer...'
                      : resumeData
                        ? 'e.g. Make my summary more impactful, add Docker to skills...'
                        : 'e.g. I have 2 years experience as a Full Stack Developer at NVIDIA...'
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
                      if (chatMode && currentQuestion) {
                        if (currentQuestion.required && !prompt.trim()) return;
                        handleChatAnswer(prompt.trim());
                        setPrompt('');
                      } else {
                        handleSubmit();
                      }
                    }
                  }}
                />
                <button
                  className={`rb-send-btn${(prompt.trim() || files.length || (chatMode && currentQuestion && !currentQuestion.required)) && !loading ? ' rb-send-active' : ''}`}
                  onClick={() => {
                    if (chatMode && currentQuestion) {
                      if (currentQuestion.required && !prompt.trim()) return;
                      handleChatAnswer(prompt.trim());
                      setPrompt('');
                    } else {
                      handleSubmit();
                    }
                  }}
                  disabled={loading || fetchingQuestions}
                >
                  {loading ? <span className="rb-spinner" /> : <Send size={16} />}
                </button>
              </div>

              {/* Skip button for optional questions */}
              {chatMode && currentQuestion && !currentQuestion.required && (
                <button className="rb-skip-q" onClick={() => { handleChatAnswer(''); setPrompt(''); }}>
                  Skip this question →
                </button>
              )}

              {error && <div className="gr-error">{error}</div>}

              {!chatMode && (
                <div className="rb-help-row">
                  <button className="rb-help-btn" onClick={() => navigate('/about')}>
                    <HelpCircle size={15} /> Need any help?
                  </button>
                </div>
              )}
            </div>

            {loading && (
              <div className="gr-loading">
                <div className="gr-spinner" />
                <p className="gr-loading-text">{resumeData ? 'Enhancing your resume...' : 'Generating your resume with AI...'}</p>
              </div>
            )}

            {resumeData && !loading && (
              <div className="gr-output" ref={resumeRef}>
                <div className="gr-output-header">
                  <h3 className="gr-output-title">Your Generated Resume</h3>
                  <div className="gr-actions">
                    <button className="gr-btn gr-btn-regenerate" onClick={() => { setChatMessages([]); setChatMode(false); handleSubmit(); }}>
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
