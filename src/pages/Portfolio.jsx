import { useState, useRef, useEffect } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useNavigate } from 'react-router-dom';
import { User, Menu, Plus, Send, FileText, Image, X, Code, RefreshCw, Copy, Check, HelpCircle } from 'lucide-react';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import GeneratedPortfolio from '../components/GeneratedPortfolio';
import { parseThemeColor, isColorChangeOnly, parseColorReplace } from '../utils/parseThemeColor';
import { isFeatureLocked, incrementFeatureUsage, getRemainingUses, trackQuestAction, unlockFeature, getGamificationData } from '../utils/gamification';
import './Dashboard.css';
import './Portfolio.css';
import './ResumeBuilder.css';

/* ── Sample portfolio data ── */
const pd = {
  name: 'Alex Morgan',
  title: 'Full Stack Developer',
  tagline: 'Building elegant solutions to complex problems',
  email: 'alex@example.com',
  phone: '+1 (555) 987-6543',
  location: 'San Francisco, CA',
  github: 'github.com/alexmorgan',
  linkedin: 'linkedin.com/in/alexmorgan',
  website: 'alexmorgan.dev',
  about: 'Passionate full-stack developer with 5+ years of experience crafting scalable web applications. I love turning ideas into reality through clean code and thoughtful design.',
  skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS', 'Docker', 'GraphQL', 'Python'],
  projects: [
    { name: 'E-Commerce Platform', desc: 'A full-stack shopping platform with real-time inventory, payment integration, and admin dashboard.', tech: ['React', 'Node.js', 'MongoDB'], link: '#' },
    { name: 'AI Chat App', desc: 'Real-time chat application powered by OpenAI with smart reply suggestions and sentiment analysis.', tech: ['Next.js', 'Socket.io', 'OpenAI'], link: '#' },
    { name: 'DevOps Dashboard', desc: 'Monitoring dashboard for microservices with live metrics, alerts, and deployment pipelines.', tech: ['React', 'Docker', 'AWS'], link: '#' },
  ],
  experience: [
    { role: 'Senior Developer', company: 'TechCorp Inc.', period: '2021 – Present', desc: 'Led a team of 5 engineers building cloud-native applications.' },
    { role: 'Full Stack Developer', company: 'StartupXYZ', period: '2019 – 2021', desc: 'Built and shipped 3 SaaS products from scratch.' },
  ],
};

/* ══════════════════════════════════════
   Template 1 — Dark Hacker Theme
══════════════════════════════════════ */
function PortfolioTemplate1() {
  return (
    <div className="pt pt1">
      <div className="pt1-nav">
        <span className="pt1-logo">&lt;{pd.name.split(' ')[0]} /&gt;</span>
        <div className="pt1-nav-links">
          <span>About</span><span>Projects</span><span>Contact</span>
        </div>
      </div>
      <div className="pt1-hero">
        <div className="pt1-hero-badge">Available for work</div>
        <h1 className="pt1-hero-name">{pd.name}</h1>
        <p className="pt1-hero-title">{pd.title}</p>
        <p className="pt1-hero-tagline">{pd.tagline}</p>
        <div className="pt1-hero-btns">
          <button className="pt1-btn-primary">View Projects</button>
          <button className="pt1-btn-outline">Download CV</button>
        </div>
      </div>
      <div className="pt1-skills-bar">
        {pd.skills.map((s, i) => <span key={i} className="pt1-skill-tag">{s}</span>)}
      </div>
      <div className="pt1-projects">
        <h2 className="pt1-section-title"><span className="pt1-accent">//</span> Projects</h2>
        <div className="pt1-projects-grid">
          {pd.projects.map((p, i) => (
            <div key={i} className="pt1-project-card">
              <div className="pt1-project-num">0{i + 1}</div>
              <h3 className="pt1-project-name">{p.name}</h3>
              <p className="pt1-project-desc">{p.desc}</p>
              <div className="pt1-project-tech">
                {p.tech.map((t, j) => <span key={j} className="pt1-tech-tag">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="pt1-contact">
        <h2 className="pt1-section-title"><span className="pt1-accent">//</span> Contact</h2>
        <p className="pt1-contact-text">{pd.email} · {pd.github}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   Template 2 — Clean Minimal Light
══════════════════════════════════════ */
function PortfolioTemplate2() {
  return (
    <div className="pt pt2">
      <div className="pt2-sidebar">
        <div className="pt2-avatar">AM</div>
        <h2 className="pt2-name">{pd.name}</h2>
        <p className="pt2-title">{pd.title}</p>
        <div className="pt2-divider" />
        <div className="pt2-contact-list">
          <p className="pt2-contact-item">✉ {pd.email}</p>
          <p className="pt2-contact-item">📍 {pd.location}</p>
          <p className="pt2-contact-item">🔗 {pd.github}</p>
        </div>
        <div className="pt2-divider" />
        <p className="pt2-label">Skills</p>
        <div className="pt2-skills">
          {pd.skills.map((s, i) => <span key={i} className="pt2-skill">{s}</span>)}
        </div>
      </div>
      <div className="pt2-main">
        <section className="pt2-section">
          <h2 className="pt2-section-title">About Me</h2>
          <p className="pt2-about">{pd.about}</p>
        </section>
        <section className="pt2-section">
          <h2 className="pt2-section-title">Projects</h2>
          {pd.projects.map((p, i) => (
            <div key={i} className="pt2-project">
              <div className="pt2-project-header">
                <h3 className="pt2-project-name">{p.name}</h3>
                <div className="pt2-project-tech">
                  {p.tech.map((t, j) => <span key={j} className="pt2-tech">{t}</span>)}
                </div>
              </div>
              <p className="pt2-project-desc">{p.desc}</p>
            </div>
          ))}
        </section>
        <section className="pt2-section">
          <h2 className="pt2-section-title">Experience</h2>
          {pd.experience.map((e, i) => (
            <div key={i} className="pt2-exp">
              <div className="pt2-exp-header">
                <strong className="pt2-exp-role">{e.role}</strong>
                <span className="pt2-exp-period">{e.period}</span>
              </div>
              <p className="pt2-exp-company">{e.company}</p>
              <p className="pt2-exp-desc">{e.desc}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   Template 3 — Vibrant Gradient Creative
══════════════════════════════════════ */
function PortfolioTemplate3() {
  return (
    <div className="pt pt3">
      <div className="pt3-hero">
        <div className="pt3-hero-content">
          <p className="pt3-greeting">Hello, I'm</p>
          <h1 className="pt3-name">{pd.name}</h1>
          <p className="pt3-title">{pd.title}</p>
          <p className="pt3-tagline">{pd.tagline}</p>
          <div className="pt3-btns">
            <button className="pt3-btn-primary">Hire Me</button>
            <button className="pt3-btn-ghost">See Work</button>
          </div>
        </div>
        <div className="pt3-hero-avatar">AM</div>
      </div>
      <div className="pt3-skills-section">
        <h2 className="pt3-section-title">Tech Stack</h2>
        <div className="pt3-skills-grid">
          {pd.skills.map((s, i) => (
            <div key={i} className="pt3-skill-card">
              <span className="pt3-skill-icon">⚡</span>
              <span className="pt3-skill-name">{s}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="pt3-projects-section">
        <h2 className="pt3-section-title">Featured Work</h2>
        <div className="pt3-projects-list">
          {pd.projects.map((p, i) => (
            <div key={i} className={`pt3-project-card pt3-project-card-${i + 1}`}>
              <div className="pt3-project-index">{String(i + 1).padStart(2, '0')}</div>
              <div className="pt3-project-body">
                <h3 className="pt3-project-name">{p.name}</h3>
                <p className="pt3-project-desc">{p.desc}</p>
                <div className="pt3-project-tech">
                  {p.tech.map((t, j) => <span key={j} className="pt3-tech-pill">{t}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="pt3-contact-section">
        <h2 className="pt3-contact-title">Let's Work Together</h2>
        <p className="pt3-contact-sub">{pd.email}</p>
        <button className="pt3-contact-btn">Get In Touch</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   Template 4 — Navy Executive
══════════════════════════════════════ */
function PortfolioTemplate4() {
  return (
    <div className="pt pt4">
      <div className="pt4-header">
        <div className="pt4-header-left">
          <div className="pt4-avatar">AM</div>
          <div>
            <h1 className="pt4-name">{pd.name}</h1>
            <p className="pt4-title">{pd.title}</p>
            <div className="pt4-contacts">
              <span>{pd.email}</span><span>·</span><span>{pd.location}</span><span>·</span><span>{pd.github}</span>
            </div>
          </div>
        </div>
        <nav className="pt4-nav">
          <span>About</span><span>Work</span><span>Skills</span><span>Contact</span>
        </nav>
      </div>
      <div className="pt4-body">
        <div className="pt4-left">
          <div className="pt4-sec-title">About</div>
          <p className="pt4-text">{pd.about}</p>
          <div className="pt4-sec-title">Skills</div>
          <div className="pt4-skills">
            {pd.skills.map((s, i) => (
              <div key={i} className="pt4-skill-row">
                <span className="pt4-skill-name">{s}</span>
                <div className="pt4-skill-bar"><div className="pt4-skill-fill" style={{ width: `${90 - i * 7}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="pt4-right">
          <div className="pt4-sec-title">Experience</div>
          {pd.experience.map((e, i) => (
            <div key={i} className="pt4-exp">
              <div className="pt4-exp-period">{e.period}</div>
              <strong className="pt4-exp-role">{e.role}</strong>
              <div className="pt4-exp-company">{e.company}</div>
              <p className="pt4-text">{e.desc}</p>
            </div>
          ))}
          <div className="pt4-sec-title">Projects</div>
          {pd.projects.map((p, i) => (
            <div key={i} className="pt4-project">
              <strong className="pt4-exp-role">{p.name}</strong>
              <p className="pt4-text">{p.desc}</p>
              <div className="pt4-techs">{p.tech.map((t, j) => <span key={j} className="pt4-tech">{t}</span>)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   Template 5 — Sunset Bold
══════════════════════════════════════ */
function PortfolioTemplate5() {
  return (
    <div className="pt pt5">
      <div className="pt5-hero">
        <div className="pt5-hero-tag">Portfolio</div>
        <h1 className="pt5-name">{pd.name}</h1>
        <p className="pt5-role">{pd.title}</p>
        <div className="pt5-socials">
          <span className="pt5-social">{pd.github}</span>
          <span className="pt5-social">{pd.email}</span>
        </div>
      </div>
      <div className="pt5-body">
        <div className="pt5-about-block">
          <div className="pt5-block-label">About</div>
          <p className="pt5-about-text">{pd.about}</p>
        </div>
        <div className="pt5-skills-block">
          <div className="pt5-block-label">Skills</div>
          <div className="pt5-skills-wrap">
            {pd.skills.map((s, i) => <span key={i} className="pt5-skill">{s}</span>)}
          </div>
        </div>
        <div className="pt5-projects-block">
          <div className="pt5-block-label">Work</div>
          <div className="pt5-projects-grid">
            {pd.projects.map((p, i) => (
              <div key={i} className="pt5-project-card">
                <div className="pt5-project-num">0{i + 1}</div>
                <h3 className="pt5-project-name">{p.name}</h3>
                <p className="pt5-project-desc">{p.desc}</p>
                <div className="pt5-techs">{p.tech.map((t, j) => <span key={j} className="pt5-tech">{t}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   Template 6 — Glass Dark
══════════════════════════════════════ */
function PortfolioTemplate6() {
  return (
    <div className="pt pt6">
      <div className="pt6-bg" />
      <div className="pt6-content">
        <div className="pt6-hero">
          <div className="pt6-avatar">AM</div>
          <div className="pt6-hero-text">
            <h1 className="pt6-name">{pd.name}</h1>
            <p className="pt6-title">{pd.title}</p>
            <p className="pt6-tagline">{pd.tagline}</p>
            <div className="pt6-btns">
              <button className="pt6-btn-primary">View Work</button>
              <button className="pt6-btn-ghost">Contact Me</button>
            </div>
          </div>
        </div>
        <div className="pt6-cards-row">
          {pd.skills.slice(0, 4).map((s, i) => (
            <div key={i} className="pt6-skill-card"><span className="pt6-skill-icon">◈</span>{s}</div>
          ))}
        </div>
        <div className="pt6-projects">
          <h2 className="pt6-sec-title">Featured Projects</h2>
          <div className="pt6-projects-grid">
            {pd.projects.map((p, i) => (
              <div key={i} className="pt6-project-card">
                <div className="pt6-project-glow" />
                <h3 className="pt6-project-name">{p.name}</h3>
                <p className="pt6-project-desc">{p.desc}</p>
                <div className="pt6-techs">{p.tech.map((t, j) => <span key={j} className="pt6-tech">{t}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="pt6-footer">
          <span>{pd.email}</span><span>·</span><span>{pd.github}</span><span>·</span><span>{pd.location}</span>
        </div>
      </div>
    </div>
  );
}
/* ══════════════════════════════════════
   Template 7 — Rose Minimal
══════════════════════════════════════ */
function PortfolioTemplate7() {
  return (
    <div className="pt pt7">
      <div className="pt7-header">
        <div className="pt7-header-left">
          <div className="pt7-avatar">AM</div>
          <div>
            <div className="pt7-name">{pd.name}</div>
            <div className="pt7-title">{pd.title}</div>
          </div>
        </div>
        <div className="pt7-contacts">
          <span>{pd.email}</span><span>·</span><span>{pd.location}</span>
        </div>
      </div>
      <div className="pt7-body">
        <div className="pt7-left">
          <div className="pt7-block">
            <div className="pt7-sec-title">About</div>
            <p className="pt7-text">{pd.about}</p>
          </div>
          <div className="pt7-block">
            <div className="pt7-sec-title">Skills</div>
            {pd.skills.map((s, i) => <span key={i} className="pt7-skill-tag">{s}</span>)}
          </div>
          <div className="pt7-block">
            <div className="pt7-sec-title">Experience</div>
            {pd.experience.map((e, i) => (
              <div key={i} className="pt7-exp">
                <div className="pt7-exp-period">{e.period}</div>
                <span className="pt7-exp-role">{e.role}</span>
                <div className="pt7-exp-company">{e.company}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="pt7-right">
          <div className="pt7-sec-title">Projects</div>
          {pd.projects.map((p, i) => (
            <div key={i} className="pt7-project">
              <div className="pt7-project-name">{p.name}</div>
              <p className="pt7-project-desc">{p.desc}</p>
              <div className="pt7-techs">{p.tech.map((t, j) => <span key={j} className="pt7-tech">{t}</span>)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   Template 8 — Emerald Split
══════════════════════════════════════ */
function PortfolioTemplate8() {
  return (
    <div className="pt pt8">
      <div className="pt8-sidebar">
        <div className="pt8-avatar">AM</div>
        <div className="pt8-name">{pd.name}</div>
        <div className="pt8-title">{pd.title}</div>
        <div className="pt8-divider" />
        <div className="pt8-sec-title">Contact</div>
        <p className="pt8-text">✉ {pd.email}</p>
        <p className="pt8-text">📞 {pd.phone}</p>
        <p className="pt8-text">📍 {pd.location}</p>
        <p className="pt8-text">🔗 {pd.github}</p>
        <div className="pt8-sec-title">Skills</div>
        {pd.skills.map((s, i) => <span key={i} className="pt8-skill-tag">{s}</span>)}
      </div>
      <div className="pt8-main">
        <div className="pt8-main-sec-title">About Me</div>
        <p className="pt8-about">{pd.about}</p>
        <div className="pt8-main-sec-title">Experience</div>
        {pd.experience.map((e, i) => (
          <div key={i} className="pt8-exp">
            <div className="pt8-exp-period">{e.period}</div>
            <span className="pt8-exp-role">{e.role}</span>
            <div className="pt8-exp-company">{e.company}</div>
            <p className="pt8-exp-desc">{e.desc}</p>
          </div>
        ))}
        <div className="pt8-main-sec-title">Projects</div>
        {pd.projects.map((p, i) => (
          <div key={i} className="pt8-project">
            <div className="pt8-project-name">{p.name}</div>
            <p className="pt8-project-desc">{p.desc}</p>
            <div className="pt8-techs">{p.tech.map((t, j) => <span key={j} className="pt8-tech">{t}</span>)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   Template 9 — Amber Warm
══════════════════════════════════════ */
function PortfolioTemplate9() {
  return (
    <div className="pt pt9">
      <div className="pt9-header">
        <div className="pt9-avatar">AM</div>
        <div className="pt9-header-text">
          <h1 className="pt9-name">{pd.name}</h1>
          <p className="pt9-title">{pd.title}</p>
          <p className="pt9-tagline">{pd.tagline}</p>
        </div>
        <div className="pt9-contacts">
          <span>{pd.email}</span>
          <span>{pd.location}</span>
          <span>{pd.github}</span>
        </div>
      </div>
      <div className="pt9-body">
        <div className="pt9-left">
          <div className="pt9-sec-title">About</div>
          <p className="pt9-text">{pd.about}</p>
          <div className="pt9-sec-title">Skills</div>
          <div className="pt9-skills">
            {pd.skills.map((s, i) => <span key={i} className="pt9-skill">{s}</span>)}
          </div>
          <div className="pt9-sec-title">Experience</div>
          {pd.experience.map((e, i) => (
            <div key={i} className="pt9-exp">
              <div className="pt9-exp-period">{e.period}</div>
              <strong className="pt9-exp-role">{e.role}</strong>
              <div className="pt9-exp-company">{e.company}</div>
            </div>
          ))}
        </div>
        <div className="pt9-right">
          <div className="pt9-sec-title">Projects</div>
          {pd.projects.map((p, i) => (
            <div key={i} className="pt9-project">
              <div className="pt9-project-num">0{i + 1}</div>
              <div className="pt9-project-body">
                <h3 className="pt9-project-name">{p.name}</h3>
                <p className="pt9-project-desc">{p.desc}</p>
                <div className="pt9-techs">{p.tech.map((t, j) => <span key={j} className="pt9-tech">{t}</span>)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   Template 10 — Slate Professional
══════════════════════════════════════ */
function PortfolioTemplate10() {
  return (
    <div className="pt pt10">
      <div className="pt10-nav">
        <span className="pt10-logo">{pd.name}</span>
        <div className="pt10-nav-links">
          <span>About</span><span>Projects</span><span>Contact</span>
        </div>
      </div>
      <div className="pt10-hero">
        <div className="pt10-hero-left">
          <p className="pt10-greeting">Hi, I'm</p>
          <h1 className="pt10-name">{pd.name}</h1>
          <p className="pt10-role">{pd.title}</p>
          <p className="pt10-about">{pd.about}</p>
          <div className="pt10-btns">
            <button className="pt10-btn-primary">View Work</button>
            <button className="pt10-btn-ghost">Contact</button>
          </div>
        </div>
        <div className="pt10-hero-right">
          <div className="pt10-avatar">AM</div>
          <div className="pt10-skills">
            {pd.skills.slice(0, 6).map((s, i) => <span key={i} className="pt10-skill">{s}</span>)}
          </div>
        </div>
      </div>
      <div className="pt10-projects">
        <h2 className="pt10-sec-title">Featured Projects</h2>
        <div className="pt10-projects-grid">
          {pd.projects.map((p, i) => (
            <div key={i} className="pt10-project-card">
              <h3 className="pt10-project-name">{p.name}</h3>
              <p className="pt10-project-desc">{p.desc}</p>
              <div className="pt10-techs">{p.tech.map((t, j) => <span key={j} className="pt10-tech">{t}</span>)}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="pt10-footer">
        <span>{pd.email}</span><span>·</span><span>{pd.github}</span><span>·</span><span>{pd.location}</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   Template 11 — Neon Cyberpunk
══════════════════════════════════════ */
function PortfolioTemplate11() {
  return (
    <div className="pt pt11">
      <div className="pt11-scanlines" />
      <div className="pt11-content">
        <div className="pt11-hero">
          <div className="pt11-hero-badge">[ ONLINE ]</div>
          <h1 className="pt11-name">{pd.name}<span className="pt11-cursor">_</span></h1>
          <p className="pt11-role">&gt; {pd.title}</p>
          <p className="pt11-tagline">{pd.tagline}</p>
          <div className="pt11-btns">
            <button className="pt11-btn">[ VIEW_PROJECTS ]</button>
            <button className="pt11-btn pt11-btn-alt">[ CONTACT ]</button>
          </div>
        </div>
        <div className="pt11-skills-row">
          {pd.skills.map((s, i) => <span key={i} className="pt11-skill">&lt;{s}/&gt;</span>)}
        </div>
        <div className="pt11-projects">
          <div className="pt11-sec-title">// PROJECTS</div>
          {pd.projects.map((p, i) => (
            <div key={i} className="pt11-project">
              <div className="pt11-project-id">#{String(i + 1).padStart(3, '0')}</div>
              <div className="pt11-project-body">
                <div className="pt11-project-name">{p.name}</div>
                <p className="pt11-project-desc">{p.desc}</p>
                <div className="pt11-techs">{p.tech.map((t, j) => <span key={j} className="pt11-tech">{t}</span>)}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="pt11-footer">
          <span>{pd.email}</span><span className="pt11-sep">|</span><span>{pd.github}</span>
        </div>
      </div>
    </div>
  );
}

function ScaledModalPreview({ children }) {
  return (
    <div style={{ width: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
      {children}
    </div>
  );
} 

/* ══════════════════════════════════════
   Scaled preview — fills container width, clips height
══════════════════════════════════════ */
function ScaledPortfolioPreview({ children }) {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(0.85);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setScale(el.offsetWidth / 900);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0,
        transform: `scale(${scale})`, transformOrigin: 'top left',
        width: 900, pointerEvents: 'none', userSelect: 'none',
      }}>
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   Template definitions
══════════════════════════════════════ */
const portfolioTemplates = [
  { id: 1, name: 'Dark Hacker',     tag: 'Developer',    component: <PortfolioTemplate1 />, recommended: true  },
  { id: 2, name: 'Clean Minimal',   tag: 'Professional', component: <PortfolioTemplate2 />, recommended: false },
  { id: 3, name: 'Vibrant Creative',tag: 'Creative',     component: <PortfolioTemplate3 />, recommended: false },
  { id: 4, name: 'Navy Executive',  tag: 'Corporate',    component: <PortfolioTemplate4 />, recommended: false },
  { id: 5, name: 'Sunset Bold',     tag: 'Bold',         component: <PortfolioTemplate5 />, recommended: false },
  { id: 6, name: 'Glass Dark',      tag: 'Modern',       component: <PortfolioTemplate6 />, recommended: true  },
  { id: 7, name: 'Rose Minimal',    tag: 'Elegant',      component: <PortfolioTemplate7 />, recommended: false },
  { id: 8, name: 'Emerald Split',   tag: 'Fresh',        component: <PortfolioTemplate8 />,  recommended: false },
  { id: 9, name: 'Amber Warm',      tag: 'Warm',         component: <PortfolioTemplate9 />,  recommended: false },
  { id: 10, name: 'Slate Pro',      tag: 'Professional', component: <PortfolioTemplate10 />, recommended: true  },
  { id: 11, name: 'Neon Cyberpunk', tag: 'Futuristic',   component: <PortfolioTemplate11 />, recommended: false },
];

/* ══════════════════════════════════════
   Scaled preview helper
══════════════════════════════════════ */
function ScaledPreview({ children, width = 900 }) {
  return (
    <div className="pt-preview-outer">
      <div
        className="pt-preview-inner"
        style={{ width, transform: `scale(var(--pt-scale, 0.42))`, transformOrigin: 'top left' }}
      >
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   Portfolio Page
══════════════════════════════════════ */
function Portfolio() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [page, setPage] = useState(1);
  const [sliding, setSliding] = useState(false);
  const PF_PER_PAGE = 4;
  const [showCode, setShowCode] = useState(false);
  const [codeTab, setCodeTab] = useState('html');
  const [copied, setCopied] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState([]);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [portfolioData, setPortfolioData] = useState(null);
  const [themeColor, setThemeColor] = useState(null);
  const [remainingUses, setRemainingUses] = useState('...');
  const [isLocked, setIsLocked] = useState(false);
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);
  const outputRef = useRef(null);

  // Load remaining uses and lock status on mount
  useEffect(() => {
    const loadGamificationStatus = async () => {
      try {
        const data = await getGamificationData();
        const uses = await getRemainingUses('portfolio');
        const locked = await isFeatureLocked('portfolio');
        setIsLocked(locked);
        
        console.log('Portfolio - Loaded uses:', uses, 'Locked:', locked);
        
        // If no uses left, show XP cost instead of 0
        if (uses === 0) {
          setRemainingUses('30 XP');
        } else {
          setRemainingUses(uses);
        }
      } catch (error) {
        console.error('Error loading gamification status:', error);
        setRemainingUses('30 XP'); // Fallback
      }
    };
    loadGamificationStatus();
    
    const handleUpdate = () => loadGamificationStatus();
    window.addEventListener('gamificationUpdate', handleUpdate);
    return () => window.removeEventListener('gamificationUpdate', handleUpdate);
  }, []);

  const handleFileChange = (e) => {
    setFiles(prev => [...prev, ...Array.from(e.target.files)]);
    e.target.value = '';
    setShowUploadMenu(false);
  };
  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const handleGenerate = async () => {
    if (!prompt.trim() && files.length === 0) return;
    if (!selectedTemplate) { 
      setError('Please select a template above before generating.'); 
      return; 
    }

    setError('');

    // Parse theme color from prompt
    const detectedColor = parseThemeColor(prompt);
    const replaceColor = parseColorReplace(prompt, selectedTemplate);
    // Merge: replace-mode overrides take priority over single/multi-target
    const mergedColor = (detectedColor || replaceColor)
      ? { ...(detectedColor || {}), ...(replaceColor || {}) }
      : null;
    if (mergedColor) setThemeColor(mergedColor);

    // If it's only a color-change request, just recolor — no AI call needed (FREE!)
    if (isColorChangeOnly(prompt)) {
      if (!portfolioData) setError('Generate a portfolio first, then change the colour.');
      return;
    }

    // Check if feature is locked (no uses left) - ONLY for actual generation
    const locked = await isFeatureLocked('portfolio');
    if (locked) {
      // Try to auto-unlock with XP
      const unlockResult = await unlockFeature('portfolio');
      if (!unlockResult.success) {
        setError(`Not enough XP! ${unlockResult.error}. Complete quests to earn more XP.`);
        return;
      }
      // Successfully unlocked! Update UI and continue
      const uses = await getRemainingUses('portfolio');
      const newLocked = await isFeatureLocked('portfolio');
      setRemainingUses(uses);
      setIsLocked(newLocked);
    }

    setLoading(true);
    const isNewPortfolio = !portfolioData;
    if (!portfolioData) setPortfolioData(null); // only clear on fresh generation
    try {
      const res = await fetch('http://localhost:5000/api/ai/generate-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          templateId: selectedTemplate,
          existingData: portfolioData || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate portfolio');
      setPortfolioData(data.portfolioData);

      // Increment usage and auto-complete quest
      await incrementFeatureUsage('portfolio', 2); // Quest ID 2: Portfolio Architect

      // Reload remaining uses to update UI
      const newUses = await getRemainingUses('portfolio');
      if (newUses === 0) {
        setRemainingUses('30 XP');
      } else {
        setRemainingUses(newUses);
      }

      // Save to database
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (user?.id) {
        await fetch('http://localhost:5000/api/portfolios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, templateId: selectedTemplate, data: data.portfolioData, themeColor: mergedColor || null }),
        });
      }

      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCode = () => setShowCode(true);

  /** Serialize all active themeColor vars into a CSS block */
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
    if (!portfolioData) return '';
    const markup = renderToStaticMarkup(
      <GeneratedPortfolio data={portfolioData} templateId={selectedTemplate} themeColor={themeColor} />
    );
    const block = buildThemeVarBlock(themeColor, ':root');
    const colorVars = block ? `\n  <style>\n    ${block.replace(/\n/g, '\n    ')}\n  </style>` : '';
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${portfolioData.name || 'Portfolio'}</title>
  <link rel="stylesheet" href="portfolio.css" />${colorVars}
</head>
<body>
${markup}
</body>
</html>`;
  };

  const getExportedCSS = () => {
    const tplId = selectedTemplate;
    try {
      let css = '/* Portfolio CSS — generated by AI Portfolio Builder */\n\n';
      const block = buildThemeVarBlock(themeColor, `.pt${tplId}`);
      if (block) css += `/* Theme color overrides */\n${block}\n\n`;
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            const text = rule.cssText;
            if (
              text.includes(`.pt${tplId}-`) ||
              text.includes(`.pt${tplId} `) ||
              text.includes(`.pt${tplId}{`) ||
              text.includes(`.pt .pt${tplId}`) ||
              text.startsWith(`.pt${tplId}`)
            ) {
              css += rule.cssText + '\n';
            }
          }
        } catch { /* cross-origin sheet */ }
      }
      return css;
    } catch {
      return '/* Could not extract CSS — copy from Portfolio.css */';
    }
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
            <h1 className="page-title">Portfolio Templates</h1>
            <p className="page-subtitle">Choose a template to showcase your work and skills</p>
          </div>

          {(() => {
            const totalPages = Math.ceil(portfolioTemplates.length / PF_PER_PAGE);
            const slideWidth = 100 / totalPages;
            const trackStyle = {
              transform: `translateX(-${(page - 1) * slideWidth}%)`,
              transition: sliding ? 'transform 0.42s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
              width: `${totalPages * 100}%`,
            };
            const goToPage = (p) => {
              if (sliding || p === page) return;
              setSliding(true);
              requestAnimationFrame(() => setPage(p));
            };
            return (
              <>
                <div className="pf-viewport">
                  <div
                    className="pf-track"
                    style={trackStyle}
                    onTransitionEnd={() => setSliding(false)}
                  >
                    {Array.from({ length: totalPages }, (_, pi) => (
                      <div key={pi} className="pf-slide" style={{ width: `${slideWidth}%` }}>
                        <div className="pf-grid">
                          {portfolioTemplates.slice(pi * PF_PER_PAGE, (pi + 1) * PF_PER_PAGE).map((tpl) => (
                            <div
                              key={tpl.id}
                              className={`pf-card ${selectedTemplate === tpl.id ? 'pf-card-selected' : ''}`}
                              onClick={() => {
                                setPreviewTemplate(tpl);
                                // Track template preview for Quest 6: Portfolio Explorer
                                trackQuestAction(6, { uniqueId: tpl.id });
                              }}
                            >
                              {tpl.recommended && <span className="pf-badge">Recommended</span>}
                              <div className="pf-card-preview">
                                <ScaledPortfolioPreview>{tpl.component}</ScaledPortfolioPreview>
                                <div className="pf-card-overlay">
                                  <span className="pf-preview-hint">Click to preview</span>
                                </div>
                              </div>
                              <div className="pf-card-footer">
                                <div className="pf-card-meta">
                                  <span className="pf-tag">{tpl.tag}</span>
                                  <span className="pf-tpl-name">{tpl.name}</span>
                                </div>
                                <button
                                  className={`pf-btn-select ${selectedTemplate === tpl.id ? 'pf-btn-selected' : ''}`}
                                  onClick={e => { e.stopPropagation(); setSelectedTemplate(tpl.id); }}
                                >
                                  {selectedTemplate === tpl.id ? '✓ Selected' : 'Use Template'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pf-pagination">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      className={`pf-page-btn${page === p ? ' pf-page-active' : ''}`}
                      onClick={() => goToPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </>
            );
          })()}

          {/* ── Portfolio Prompt Section ── */}
          <div className="rb-prompt-section">
            <h3 className="rb-prompt-title">Describe your portfolio or upload your existing one</h3>
            <p className="rb-prompt-sub">Tell the AI about your projects, skills, and the role you're targeting — or upload a file to get started.</p>

            <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.gif,.webp" multiple style={{ display: 'none' }} onChange={handleFileChange} />
            <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.txt" multiple style={{ display: 'none' }} onChange={handleFileChange} />

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
                      <FileText size={16} /><span>Upload Document</span><span className="rb-upload-hint">PDF, DOCX</span>
                    </button>
                  </div>
                )}
              </div>
              <textarea
                className="rb-input"
                placeholder={portfolioData ? 'e.g. Make the about section more bold, add a new project, improve my tagline...' : 'e.g. Designer, React, portfolio...'}
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
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
              />
              <button
                className={`rb-send-btn${(prompt.trim() || files.length) && !loading ? ' rb-send-active' : ''}`}
                onClick={handleGenerate}
                disabled={loading || (!prompt.trim() && files.length === 0)}
                title={isLocked ? 'Will spend 30 XP to generate' : `${remainingUses} uses remaining`}
              >
                {loading ? <span className="rb-spinner" /> : <Send size={16} />}
                <span className="pf-uses-badge">{remainingUses}</span>
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
              <p className="gr-loading-text">{portfolioData ? 'Enhancing your portfolio...' : 'Generating your portfolio with AI...'}</p>
            </div>
          )}

          {/* ── Generated Portfolio Output ── */}
          {portfolioData && !loading && (
            <div className="gr-output" ref={outputRef}>
              <div className="gr-output-header">
                <h3 className="gr-output-title">Your Generated Portfolio</h3>
                <div className="gr-actions">
                  <button className="gr-btn gr-btn-regenerate" onClick={handleGenerate}>
                    <RefreshCw size={14} /> Regenerate
                  </button>
                  <button className="gr-btn gr-btn-download" onClick={handleExportCode}>
                    <Code size={14} /> Export Code
                  </button>
                </div>
              </div>
              <div className="gr-paper-wrap">
                <div id="gp-portfolio-paper" className="gr-paper">
                  <GeneratedPortfolio data={portfolioData} templateId={selectedTemplate} themeColor={themeColor} />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Code Export Modal */}
      {showCode && portfolioData && (
        <div className="pf-modal-overlay" onClick={() => setShowCode(false)}>
          <div className="pf-code-modal" onClick={e => e.stopPropagation()}>
            <div className="pf-modal-header">
              <span className="pf-modal-title">Export Code — {portfolioData.name}</span>
              <div className="pf-modal-actions">
                <button className={`pf-code-copy-btn${copied ? ' pf-code-copied' : ''}`} onClick={handleCopy}>
                  {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                </button>
                <button className="pf-modal-close" onClick={() => setShowCode(false)}>✕</button>
              </div>
            </div>
            <div className="pf-code-tabs">
              <button className={`pf-code-tab${codeTab === 'html' ? ' pf-code-tab-active' : ''}`} onClick={() => setCodeTab('html')}>HTML</button>
              <button className={`pf-code-tab${codeTab === 'css' ? ' pf-code-tab-active' : ''}`} onClick={() => setCodeTab('css')}>CSS</button>
            </div>
            <pre className="pf-code-block">
              <code>{codeTab === 'html' ? getExportedHTML() : getExportedCSS()}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Full preview modal */}
      {previewTemplate && (
        <div className="pf-modal-overlay" onClick={() => setPreviewTemplate(null)}>
          <div className="pf-modal" onClick={e => e.stopPropagation()}>
            <div className="pf-modal-header">
              <span className="pf-modal-title">{previewTemplate.name}</span>
              <div className="pf-modal-actions">
                <button
                  className={`pf-btn-select ${selectedTemplate === previewTemplate.id ? 'pf-btn-selected' : ''}`}
                  onClick={() => { setSelectedTemplate(previewTemplate.id); setPreviewTemplate(null); }}
                >
                  {selectedTemplate === previewTemplate.id ? '✓ Selected' : 'Use Template'}
                </button>
                <button className="pf-modal-close" onClick={() => setPreviewTemplate(null)}>✕</button>
              </div>
            </div>
            <div className="pf-modal-body">
              <ScaledModalPreview>
                {previewTemplate.component}
              </ScaledModalPreview>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Portfolio;
