import { useState, useEffect, useRef } from 'react';
import './InfoGatherer.css';

export function buildPromptFromAnswers(originalPrompt, answers) {
  const parts = [originalPrompt];
  answers.forEach(({ question, answer }) => {
    if (answer.trim()) parts.push(`${question}: ${answer}`);
  });
  return parts.join('. ');
}

function InfoGatherer({ type = 'resume', originalPrompt = '', onComplete, onSkip }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [step, setStep] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [loadingQ, setLoadingQ] = useState(true);
  const inputRef = useRef(null);

  // Ask Groq to analyze the prompt and return missing questions
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoadingQ(true);
      try {
        const res = await fetch('http://localhost:3001/api/ai/gather-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: originalPrompt, type }),
        });
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
          setAnswers(data.questions.map(q => ({ question: q.question, answer: '' })));
        } else {
          // No questions needed — generate directly
          onComplete(originalPrompt, []);
        }
      } catch {
        // On error, generate directly
        onComplete(originalPrompt, []);
      } finally {
        setLoadingQ(false);
      }
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (!loadingQ) inputRef.current?.focus();
  }, [step, loadingQ]);

  if (loadingQ) {
    return (
      <div className="ig-overlay">
        <div className="ig-modal ig-loading-modal">
          <div className="ig-loading-icon">🤖</div>
          <div className="ig-loading-text">Analyzing your prompt...</div>
          <div className="ig-loading-dots"><span/><span/><span/></div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return null;

  const current = questions[step];
  const isLast = step === questions.length - 1;
  const progress = Math.round((step / questions.length) * 100);

  const handleNext = () => {
    const val = inputVal.trim();
    if (current.required && !val) return;
    const newAnswers = answers.map((a, i) => i === step ? { ...a, answer: val } : a);
    setAnswers(newAnswers);
    setInputVal('');
    if (isLast) {
      const finalPrompt = buildPromptFromAnswers(originalPrompt, newAnswers);
      onComplete(finalPrompt, newAnswers);
    } else {
      setStep(s => s + 1);
    }
  };

  const handleSkip = () => {
    const newAnswers = [...answers];
    setInputVal('');
    if (isLast) {
      const finalPrompt = buildPromptFromAnswers(originalPrompt, newAnswers);
      onComplete(finalPrompt, newAnswers);
    } else {
      setStep(s => s + 1);
    }
  };

  const handleBack = () => {
    setStep(s => s - 1);
    setInputVal(answers[step - 1]?.answer || '');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleNext(); }
  };

  return (
    <div className="ig-overlay">
      <div className="ig-modal">
        {/* Header */}
        <div className="ig-header">
          <div className="ig-header-left">
            <span className="ig-icon">🤖</span>
            <div>
              <div className="ig-title">AI Assistant</div>
              <div className="ig-subtitle">A few quick questions to build a great {type}</div>
            </div>
          </div>
          <button className="ig-skip-all" onClick={() => onSkip()}>Skip all →</button>
        </div>

        {/* Progress */}
        <div className="ig-progress-bar">
          <div className="ig-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="ig-step-count">{step + 1} of {questions.length}</div>

        {/* Question */}
        <div className="ig-question">
          <span className="ig-q-num">Q{step + 1}</span>
          <span className="ig-q-text">{current.question}</span>
          {current.required && <span className="ig-required">*</span>}
        </div>

        {current.hint && <p className="ig-q-hint">{current.hint}</p>}

        {/* Input */}
        {current.multiline ? (
          <textarea
            ref={inputRef}
            className="ig-textarea"
            placeholder={current.placeholder || ''}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={handleKey}
            rows={3}
          />
        ) : (
          <input
            ref={inputRef}
            className="ig-input"
            type="text"
            placeholder={current.placeholder || ''}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={handleKey}
          />
        )}

        {/* Actions */}
        <div className="ig-actions">
          {step > 0 && (
            <button className="ig-btn-back" onClick={handleBack}>← Back</button>
          )}
          <div className="ig-actions-right">
            {!current.required && (
              <button className="ig-btn-skip" onClick={handleSkip}>Skip</button>
            )}
            <button
              className={`ig-btn-next ${(!current.required || inputVal.trim()) ? 'active' : ''}`}
              onClick={handleNext}
              disabled={current.required && !inputVal.trim()}
            >
              {isLast ? '✨ Generate' : 'Next →'}
            </button>
          </div>
        </div>

        <p className="ig-hint">Press Enter to continue</p>
      </div>
    </div>
  );
}

export default InfoGatherer;
