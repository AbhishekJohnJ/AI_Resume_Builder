import { useState } from 'react';
import { Bot, Palette, Zap, FileText, Globe, Save, Share2, Layout, ChevronDown, ChevronUp, MousePointer, Type, Paperclip, Wand2, Download, RefreshCw, Target, TrendingUp } from 'lucide-react';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import './About.css';
import './Dashboard.css';

const resumeSteps = [
  { icon: MousePointer, title: 'Pick a Template', desc: 'Scroll through the template gallery and click on the one that fits your style. A gold border confirms your selection.' },
  { icon: Type,         title: 'Describe Yourself', desc: 'Type a prompt like "Software engineer with 3 years React experience" or paste your existing resume text into the chat box.' },
  { icon: Paperclip,   title: 'Attach Files (optional)', desc: 'Click the attachment icon to upload a PDF, DOCX, or image of your existing resume. The AI will extract and use the content.' },
  { icon: Wand2,       title: 'Generate', desc: 'Hit the send button. The AI builds your resume in seconds and renders it live on the right side of the screen.' },
  { icon: RefreshCw,   title: 'Refine', desc: 'Not happy with a section? Just type a follow-up like "make the summary more concise" or "change theme to blue" and regenerate.' },
  { icon: Download,    title: 'Export', desc: 'Click "Export PDF" to download a print-ready PDF, or "View Code" to grab the raw HTML/CSS for your own site.' },
];

const portfolioSteps = [
  { icon: MousePointer, title: 'Choose a Template', desc: 'Browse 11 portfolio templates — Dark Hacker, Neon Cyberpunk, Glass Dark, Clean Minimal, and more. Click one to select it.' },
  { icon: Type,         title: 'Write Your Prompt', desc: 'Describe yourself: "UI/UX designer specializing in mobile apps" or "Full stack developer with React and Node.js experience." AI generates 4-6 projects, skills, and experience.' },
  { icon: Wand2,       title: 'Generate Portfolio', desc: 'Press send. AI populates your template with name, bio, skills (10-15), projects (with descriptions), and work experience.' },
  { icon: Palette,     title: 'Smart Design Control', desc: 'Type "pill buttons", "glass cards", or "gradient background" to change design styles. Or "change theme to purple" for color changes.' },
  { icon: RefreshCw,   title: 'Enhancement Mode', desc: 'Already have a portfolio? Type "make my about section more creative" or "add a new project about AI" to modify existing content.' },
  { icon: Download,    title: 'Export Options', desc: 'Download as PDF, or click "View Code" to copy standalone HTML/CSS/JS and host it on GitHub Pages, Netlify, or anywhere.' },
];

function HelpAccordion({ title, icon: Icon, steps, color }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`help-accordion ${open ? 'help-accordion-open' : ''}`}>
      <button className="help-accordion-header" onClick={() => setOpen(v => !v)}>
        <span className="help-accordion-title">
          <Icon size={20} style={{ color }} />
          {title}
        </span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && (
        <div className="help-steps">
          {steps.map((s, i) => {
            const StepIcon = s.icon;
            return (
              <div key={i} className="help-step">
                <div className="help-step-left">
                  <div className="help-step-num" style={{ borderColor: color, color }}>{i + 1}</div>
                  <div className="help-step-line" />
                </div>
                <div className="help-step-body">
                  <div className="help-step-title">
                    <StepIcon size={15} style={{ color }} />
                    {s.title}
                  </div>
                  <p className="help-step-desc">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function About() {
  return (
    <div className="dashboard-page">
      <TopBar />
      <Sidebar />
      <div className="dashboard-container">
        <main className="dashboard-content">
          <div className="about-container">

            <div className="about-hero">
              <div className="about-logo-wrap">
                <FileText size={48} className="about-logo-icon" />
              </div>
              <h1 className="about-title">ResumeCraft AI</h1>
              <p className="about-version">Version 2.0.0</p>
              <p className="about-tagline">Your AI-powered resume & portfolio builder — from prompt to professional in seconds</p>
            </div>

            <div className="about-cards">
              <div className="about-card">
                <Bot size={32} className="about-card-icon" />
                <h3>AI-Powered Generation</h3>
                <p>Generate professional resumes and portfolios using OpenRouter AI (GPT-3.5-turbo & DeepSeek). Describe yourself in plain text — AI fills in the rest.</p>
              </div>
              <div className="about-card">
                <Palette size={32} className="about-card-icon" />
                <h3>11+ Beautiful Templates</h3>
                <p>Choose from 11 portfolio templates and multiple resume designs. Change colors, button styles, card designs, and backgrounds with natural language.</p>
              </div>
              <div className="about-card">
                <Zap size={32} className="about-card-icon" />
                <h3>Smart Resume Analysis</h3>
                <p>Upload PDF or paste text to get AI-powered analysis with score (0-100), strengths, weaknesses, LinkedIn/GitHub tips, and field-specific recommendations.</p>
              </div>
            </div>

            <div className="about-section">
              <h2>What You Can Do</h2>
              <ul className="about-features">
                <li><Bot size={16} /><span>Build resumes from text prompts or uploaded files (PDF, DOCX, images with OCR)</span></li>
                <li><Globe size={16} /><span>Generate portfolios with 11 unique templates (Dark Hacker, Neon Cyberpunk, Glass Dark, etc.)</span></li>
                <li><Target size={16} /><span>Analyze resumes with AI — get detailed feedback, score, and improvement suggestions</span></li>
                <li><Zap size={16} /><span>Complete 6 daily quests to earn XP (225 XP total per day)</span></li>
                <li><TrendingUp size={16} /><span>Level up from Rookie → Builder → Pro → Elite based on earned XP</span></li>
                <li><Save size={16} /><span>Auto-save all resumes and portfolios to MongoDB database</span></li>
                <li><Share2 size={16} /><span>Export to PDF or download HTML/CSS code for hosting</span></li>
                <li><Layout size={16} /><span>Smart design control: change button styles, card designs, backgrounds by asking</span></li>
                <li><RefreshCw size={16} /><span>Enhancement mode: modify existing resumes/portfolios with natural language</span></li>
              </ul>
            </div>

            <div className="about-section about-help-section">
              <h2>User Guide</h2>
              <p className="help-intro">Step-by-step walkthroughs for the two main builders.</p>
              <HelpAccordion
                title="How to use Resume Builder"
                icon={FileText}
                steps={resumeSteps}
                color="var(--accent)"
              />
              <HelpAccordion
                title="How to use Portfolio Builder"
                icon={Layout}
                steps={portfolioSteps}
                color="var(--accent-alt)"
              />
              <HelpAccordion
                title="Free Trial & XP System"
                icon={Zap}
                steps={[
                  { icon: Target, title: 'Free Trial Limits', desc: 'Every user gets 3 free uses for Resume Builder (20 XP to unlock more), Portfolio Builder (30 XP), and AI Analyzer (50 XP). After free trials, spend earned XP to unlock additional uses.' },
                  { icon: Zap, title: 'Earn XP Through Quests', desc: 'Complete 6 daily quests to earn XP: Resume Sniper (50 XP), Portfolio Architect (40 XP), Resume Crafter (30 XP), Score Chaser (60 XP), Portfolio Explorer (25 XP), Template Explorer (20 XP). Total: 225 XP/day.' },
                  { icon: TrendingUp, title: 'Career Levels', desc: 'Progress through 4 levels based on lifetime earned XP: Rookie (0-49 XP), Builder (50-119 XP), Pro (120-199 XP), Elite (200+ XP). Your level reflects your engagement and growth.' },
                  { icon: Bot, title: 'Quest Auto-Completion', desc: 'Quests complete automatically when you use features: analyze resume (Quest 1), generate portfolio (Quest 2), build resume (Quest 3), preview 5 templates (Quest 4), re-analyze (Quest 5), preview 3 portfolios (Quest 6).' },
                  { icon: RefreshCw, title: 'Daily Quest Reset', desc: 'All quests reset at midnight, giving you fresh opportunities to earn 225 XP daily. Completed quests are tracked per day, so you can complete them again tomorrow.' },
                  { icon: Save, title: 'XP Tracking', desc: 'Two XP types: Available XP (spend on unlocks) and Total Earned XP (lifetime achievement, never decreases). Dashboard shows both with progress ring and completion percentage.' },
                ]}
                color="#10b981"
              />
            </div>

            <div className="about-footer">
              <p>Made with care to help you land your dream job.</p>
              <div className="about-tech-mini">
                <span>Built with</span>
                {['React 19', 'Node.js', 'Express', 'MongoDB', 'OpenRouter AI', 'Python ML', 'Vite', 'TailwindCSS'].map(t => (
                  <span key={t} className="tech-badge-mini">{t}</span>
                ))}
              </div>
              <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#888' }}>
                AI Models: GPT-3.5-turbo (generation), DeepSeek (analysis) • ML: Gradient Boosting, Random Forest • Dataset: 500 resume profiles
              </p>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default About;
