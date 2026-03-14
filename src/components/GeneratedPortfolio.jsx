import '../pages/Portfolio.css';

/* ── Template renderers using AI-generated data ── */

function T1({ d }) {
  return (
    <div className="pt pt1">
      <div className="pt1-nav">
        <span className="pt1-logo">&lt;{d.name.split(' ')[0]} /&gt;</span>
        <div className="pt1-nav-links"><span>About</span><span>Projects</span><span>Contact</span></div>
      </div>
      <div className="pt1-hero">
        <div className="pt1-hero-badge">Available for work</div>
        <h1 className="pt1-hero-name">{d.name}</h1>
        <p className="pt1-hero-title">{d.title}</p>
        <p className="pt1-hero-tagline">{d.tagline}</p>
        <div className="pt1-hero-btns">
          <button className="pt1-btn-primary">View Projects</button>
          <button className="pt1-btn-outline">Download CV</button>
        </div>
      </div>
      <div className="pt1-skills-bar">
        {d.skills.map((s, i) => <span key={i} className="pt1-skill-tag">{s}</span>)}
      </div>
      <div className="pt1-projects">
        <h2 className="pt1-section-title"><span className="pt1-accent">//</span> Projects</h2>
        <div className="pt1-projects-grid">
          {d.projects.map((p, i) => (
            <div key={i} className="pt1-project-card">
              <div className="pt1-project-num">0{i + 1}</div>
              <h3 className="pt1-project-name">{p.name}</h3>
              <p className="pt1-project-desc">{p.desc}</p>
              <div className="pt1-project-tech">{p.tech.map((t, j) => <span key={j} className="pt1-tech-tag">{t}</span>)}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="pt1-contact">
        <h2 className="pt1-section-title"><span className="pt1-accent">//</span> Contact</h2>
        <p className="pt1-contact-text">{d.email} · {d.github}</p>
      </div>
    </div>
  );
}

function T2({ d }) {
  return (
    <div className="pt pt2">
      <div className="pt2-sidebar">
        <div className="pt2-avatar">{d.initials}</div>
        <h2 className="pt2-name">{d.name}</h2>
        <p className="pt2-title">{d.title}</p>
        <div className="pt2-divider" />
        <div className="pt2-contact-list">
          <p className="pt2-contact-item">✉ {d.email}</p>
          <p className="pt2-contact-item">📍 {d.location}</p>
          <p className="pt2-contact-item">🔗 {d.github}</p>
        </div>
        <div className="pt2-divider" />
        <p className="pt2-label">Skills</p>
        <div className="pt2-skills">{d.skills.map((s, i) => <span key={i} className="pt2-skill">{s}</span>)}</div>
      </div>
      <div className="pt2-main">
        <section className="pt2-section">
          <h2 className="pt2-section-title">About Me</h2>
          <p className="pt2-about">{d.about}</p>
        </section>
        <section className="pt2-section">
          <h2 className="pt2-section-title">Projects</h2>
          {d.projects.map((p, i) => (
            <div key={i} className="pt2-project">
              <div className="pt2-project-header">
                <h3 className="pt2-project-name">{p.name}</h3>
                <div className="pt2-project-tech">{p.tech.map((t, j) => <span key={j} className="pt2-tech">{t}</span>)}</div>
              </div>
              <p className="pt2-project-desc">{p.desc}</p>
            </div>
          ))}
        </section>
        <section className="pt2-section">
          <h2 className="pt2-section-title">Experience</h2>
          {d.experience.map((e, i) => (
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

function T3({ d }) {
  return (
    <div className="pt pt3">
      <div className="pt3-hero">
        <div className="pt3-hero-content">
          <p className="pt3-greeting">Hello, I'm</p>
          <h1 className="pt3-name">{d.name}</h1>
          <p className="pt3-title">{d.title}</p>
          <p className="pt3-tagline">{d.tagline}</p>
          <div className="pt3-btns">
            <button className="pt3-btn-primary">Hire Me</button>
            <button className="pt3-btn-ghost">See Work</button>
          </div>
        </div>
        <div className="pt3-hero-avatar">{d.initials}</div>
      </div>
      <div className="pt3-skills-section">
        <h2 className="pt3-section-title">Tech Stack</h2>
        <div className="pt3-skills-grid">
          {d.skills.map((s, i) => (
            <div key={i} className="pt3-skill-card"><span className="pt3-skill-icon">⚡</span><span className="pt3-skill-name">{s}</span></div>
          ))}
        </div>
      </div>
      <div className="pt3-projects-section">
        <h2 className="pt3-section-title">Featured Work</h2>
        <div className="pt3-projects-list">
          {d.projects.map((p, i) => (
            <div key={i} className={`pt3-project-card pt3-project-card-${(i % 3) + 1}`}>
              <div className="pt3-project-index">{String(i + 1).padStart(2, '0')}</div>
              <div className="pt3-project-body">
                <h3 className="pt3-project-name">{p.name}</h3>
                <p className="pt3-project-desc">{p.desc}</p>
                <div className="pt3-project-tech">{p.tech.map((t, j) => <span key={j} className="pt3-tech-pill">{t}</span>)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="pt3-contact-section">
        <h2 className="pt3-contact-title">Let's Work Together</h2>
        <p className="pt3-contact-sub">{d.email}</p>
        <button className="pt3-contact-btn">Get In Touch</button>
      </div>
    </div>
  );
}

function T4({ d }) {
  return (
    <div className="pt pt4">
      <div className="pt4-header">
        <div className="pt4-header-left">
          <div className="pt4-avatar">{d.initials}</div>
          <div>
            <h1 className="pt4-name">{d.name}</h1>
            <p className="pt4-title">{d.title}</p>
            <div className="pt4-contacts">
              <span>{d.email}</span><span>·</span><span>{d.location}</span><span>·</span><span>{d.github}</span>
            </div>
          </div>
        </div>
        <nav className="pt4-nav"><span>About</span><span>Work</span><span>Skills</span><span>Contact</span></nav>
      </div>
      <div className="pt4-body">
        <div className="pt4-left">
          <div className="pt4-sec-title">About</div>
          <p className="pt4-text">{d.about}</p>
          <div className="pt4-sec-title">Skills</div>
          <div className="pt4-skills">
            {d.skills.map((s, i) => (
              <div key={i} className="pt4-skill-row">
                <span className="pt4-skill-name">{s}</span>
                <div className="pt4-skill-bar"><div className="pt4-skill-fill" style={{ width: `${90 - i * 7}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="pt4-right">
          <div className="pt4-sec-title">Experience</div>
          {d.experience.map((e, i) => (
            <div key={i} className="pt4-exp">
              <div className="pt4-exp-period">{e.period}</div>
              <strong className="pt4-exp-role">{e.role}</strong>
              <div className="pt4-exp-company">{e.company}</div>
              <p className="pt4-text">{e.desc}</p>
            </div>
          ))}
          <div className="pt4-sec-title">Projects</div>
          {d.projects.map((p, i) => (
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

function T5({ d }) {
  return (
    <div className="pt pt5">
      <div className="pt5-hero">
        <div className="pt5-hero-tag">Portfolio</div>
        <h1 className="pt5-name">{d.name}</h1>
        <p className="pt5-role">{d.title}</p>
        <div className="pt5-socials">
          <span className="pt5-social">{d.github}</span>
          <span className="pt5-social">{d.email}</span>
        </div>
      </div>
      <div className="pt5-body">
        <div className="pt5-about-block">
          <div className="pt5-block-label">About</div>
          <p className="pt5-about-text">{d.about}</p>
        </div>
        <div className="pt5-skills-block">
          <div className="pt5-block-label">Skills</div>
          <div className="pt5-skills-wrap">{d.skills.map((s, i) => <span key={i} className="pt5-skill">{s}</span>)}</div>
        </div>
        <div className="pt5-projects-block">
          <div className="pt5-block-label">Work</div>
          <div className="pt5-projects-grid">
            {d.projects.map((p, i) => (
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

function T6({ d }) {
  return (
    <div className="pt pt6">
      <div className="pt6-bg" />
      <div className="pt6-content">
        <div className="pt6-hero">
          <div className="pt6-avatar">{d.initials}</div>
          <div className="pt6-hero-text">
            <h1 className="pt6-name">{d.name}</h1>
            <p className="pt6-title">{d.title}</p>
            <p className="pt6-tagline">{d.tagline}</p>
            <div className="pt6-btns">
              <button className="pt6-btn-primary">View Work</button>
              <button className="pt6-btn-ghost">Contact Me</button>
            </div>
          </div>
        </div>
        <div className="pt6-cards-row">
          {d.skills.slice(0, 4).map((s, i) => (
            <div key={i} className="pt6-skill-card"><span className="pt6-skill-icon">◈</span>{s}</div>
          ))}
        </div>
        <div className="pt6-projects">
          <h2 className="pt6-sec-title">Featured Projects</h2>
          <div className="pt6-projects-grid">
            {d.projects.map((p, i) => (
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
          <span>{d.email}</span><span>·</span><span>{d.github}</span><span>·</span><span>{d.location}</span>
        </div>
      </div>
    </div>
  );
}

const templates = { 1: T1, 2: T2, 3: T3, 4: T4, 5: T5, 6: T6 };

export default function GeneratedPortfolio({ data, templateId }) {
  const Component = templates[templateId] || T1;
  return <Component d={data} />;
}
