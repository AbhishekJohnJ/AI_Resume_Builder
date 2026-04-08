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
  { icon: MousePointer, title: 'Choose a Template', desc: 'Browse the 8 portfolio templates — Dark Hacker, Clean Minimal, Vibrant Creative and more. Click one to select it.' },
  { icon: Type,         title: 'Write Your Prompt', desc: 'Describe your work: "Full stack developer specialising in React and Node.js, worked at two startups, 3 side projects." The more detail, the better.' },
  { icon: Wand2,       title: 'Generate Portfolio', desc: 'Press send. The AI populates your chosen template with your name, bio, skills, projects, and experience.' },
  { icon: Palette,     title: 'Change the Theme', desc: 'Type "change theme to purple" or "make background dark green" to instantly recolor the portfolio without regenerating content.' },
  { icon: Save,        title: 'Auto-Saved', desc: 'Every generated portfolio is automatically saved to My Portfolios so you can revisit or export it any time.' },
  { icon: Download,    title: 'Export', desc: 'Use "Export PDF" for a document, or "View Code" to copy the standalone HTML + CSS and host it anywhere.' },
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
              <h1 className="about-title">ResumeAI</h1>
              <p className="about-version">Version 1.0.0</p>
              <p className="about-tagline">Build stunning resumes and portfolios powered by AI</p>
            </div>

            <div className="about-cards">
              <div className="about-card">
                <Bot size={32} className="about-card-icon" />
                <h3>AI-Powered</h3>
                <p>Generate professional resumes and portfolios using advanced AI that understands your experience and skills.</p>
              </div>
              <div className="about-card">
                <Palette size={32} className="about-card-icon" />
                <h3>Beautiful Templates</h3>
                <p>Choose from a variety of professionally designed templates to make your resume stand out.</p>
              </div>
              <div className="about-card">
                <Zap size={32} className="about-card-icon" />
                <h3>Gamified Experience</h3>
                <p>Complete quests, earn XP, and level up your career. Get 3 free uses for each feature to start your journey.</p>
              </div>
            </div>

            <div className="about-section">
              <h2>What You Can Do</h2>
              <ul className="about-features">
                <li><Bot size={16} /><span>Build and customize resumes with AI assistance</span></li>
                <li><Globe size={16} /><span>Create portfolio pages to showcase your work</span></li>
                <li><Zap size={16} /><span>Complete quests and earn XP to level up your career</span></li>
                <li><Save size={16} /><span>Save and manage multiple resume versions</span></li>
                <li><Share2 size={16} /><span>Export and share your resumes easily</span></li>
                <li><Layout size={16} /><span>Pick from multiple color themes and layouts</span></li>
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
                  { icon: Target, title: 'Free Trial Limits', desc: 'Every new user gets 3 free uses each for Resume Builder, Portfolio Builder, and AI Resume Analyzer. Use them wisely to explore all features!' },
                  { icon: Zap, title: 'Earn XP', desc: 'Complete quests on your Dashboard to earn XP points. Each quest rewards you with XP based on difficulty: Common (20-30 XP), Rare (40 XP), Epic (50-60 XP).' },
                  { icon: TrendingUp, title: 'Level Up', desc: 'As you earn XP, you progress through career levels: Rookie (0-49 XP), Builder (50-119 XP), Pro (120-199 XP), and Elite (200+ XP).' },
                  { icon: Bot, title: 'Quest Examples', desc: 'Analyse your resume with AI (50 XP), Generate a portfolio (40 XP), Build a resume (30 XP), Preview templates (20-25 XP), and improve your resume score (60 XP).' },
                  { icon: RefreshCw, title: 'Daily Reset', desc: 'Quests reset daily, giving you fresh opportunities to earn XP and level up your career profile every day.' },
                  { icon: Save, title: 'Track Progress', desc: 'Monitor your XP progress, completed quests, and career level on the Dashboard. Your progress ring shows how close you are to completing all quests.' },
                ]}
                color="#10b981"
              />
            </div>

            <div className="about-footer">
              <p>Made with care to help you land your dream job.</p>
              <div className="about-tech-mini">
                <span>Built with</span>
                {['React', 'Node.js', 'MongoDB', 'OpenAI', 'Vite', 'Tailwind CSS'].map(t => (
                  <span key={t} className="tech-badge-mini">{t}</span>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default About;
