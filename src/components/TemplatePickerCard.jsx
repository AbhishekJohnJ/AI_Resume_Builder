import { useState } from 'react';
import './TemplatePickerCard.css';

const sampleData = {
  name: 'ALEX JOHNSON',
  nameLower: 'Alex Johnson',
  title: 'Full Stack Developer',
  email: 'alex@email.com',
  phone: '+1 (555) 000-0000',
  location: 'New York, USA',
  linkedin: 'linkedin.com/in/alexj',
  summary:
    'Customer-focused Full Stack Developer with solid understanding of React, Node.js and cloud technologies. Offering 3 years of experience providing quality product recommendations and solutions to meet customer needs and exceed expectations. Demonstrated record of exceeding revenue targets by leveraging communication skills and sales expertise.',
  skills: [
    ['React', 'Node.js'],
    ['MongoDB', 'TypeScript'],
    ['AWS', 'Git'],
    ['REST APIs', 'Docker'],
  ],
  experience: [
    {
      role: 'Senior Frontend Developer',
      company: 'TechCorp Inc. · New York, USA',
      period: '01/2023 – Present',
      points: [
        'Increased monthly sales 12% by effectively building and deploying React applications.',
        'Provided more value to business by leveraging automation, attention to detail, and integrity.',
        'Processed payments and maintained accurate datasets to meet financial targets.',
      ],
    },
    {
      role: 'Junior Developer',
      company: 'StartupXYZ · New York, USA',
      period: '06/2021 – 12/2022',
      points: [
        'Upsold services and products to existing customers successfully, averaging store sales by $1,000 weekly.',
        'Maintained strong team of over 200 customers daily with efficient, well-executed customer service.',
        'Trained new staff of 12 trainees in new onboarding program offerings and procedures.',
      ],
    },
  ],
  education: {
    degree: 'B.Sc. Computer Science',
    school: 'Oxford Software Institute & Oxford School of English',
    location: 'New York, USA',
    year: '2021',
  },
  languages: ['English', 'Spanish'],
};

/* ══════════════════════════════════════
   TEMPLATE 1 — Classic Dark Header
══════════════════════════════════════ */
function Template1() {
  const d = sampleData;
  return (
    <div className="rv rv1">
      <div className="rv1-header">
        <div className="rv1-initials">DA</div>
        <div>
          <div className="rv1-name">{d.name}</div>
          <div className="rv1-meta">{d.title} · {d.phone} · {d.location}</div>
          <div className="rv1-meta">{d.email} · {d.linkedin}</div>
        </div>
      </div>
      <div className="rv-body">
        <Section title="SUMMARY"><p className="rv-p">{d.summary}</p></Section>
        <Section title="SKILLS">
          <div className="rv1-skills-grid">
            {d.skills.map((row, i) => row.map((s, j) => <span key={`${i}${j}`} className="rv1-skill-item">• {s}</span>))}
          </div>
        </Section>
        <Section title="EXPERIENCE">
          {d.experience.map((e, i) => (
            <div key={i} className="rv-exp">
              <div className="rv1-exp-header"><strong>{e.role}</strong><span>{e.period}</span></div>
              <div className="rv-company">{e.company}</div>
              {e.points.map((p, j) => <p key={j} className="rv-bullet">• {p}</p>)}
            </div>
          ))}
        </Section>
        <Section title="EDUCATION AND TRAINING">
          <div className="rv1-exp-header"><strong>{d.education.degree}</strong><span>{d.education.year}</span></div>
          <div className="rv-company">{d.education.school} · {d.education.location}</div>
        </Section>
        <Section title="LANGUAGES">
          {d.languages.map((l, i) => <p key={i} className="rv-p">{l}</p>)}
        </Section>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   TEMPLATE 2 — Clean Centered
══════════════════════════════════════ */
function Template2() {
  const d = sampleData;
  return (
    <div className="rv rv2">
      <div className="rv2-header">
        <div className="rv2-initials">DA</div>
        <div className="rv2-name">{d.nameLower}</div>
        <div className="rv2-meta">{d.linkedin} · {d.phone} · {d.location}</div>
      </div>
      <div className="rv-body">
        <Section2 title="Summary"><p className="rv-p">{d.summary}</p></Section2>
        <Section2 title="Skills">
          <div className="rv2-skills-grid">
            {d.skills.map((row, i) => row.map((s, j) => <span key={`${i}${j}`} className="rv2-skill">• {s}</span>))}
          </div>
        </Section2>
        <Section2 title="Experience">
          {d.experience.map((e, i) => (
            <div key={i} className="rv-exp">
              <div className="rv2-exp-header"><strong>{e.role}</strong><span>{e.period}</span></div>
              <div className="rv-company">{e.company}</div>
              {e.points.map((p, j) => <p key={j} className="rv-bullet">• {p}</p>)}
            </div>
          ))}
        </Section2>
        <Section2 title="Education and Training">
          <div className="rv2-exp-header"><strong>{d.education.degree}</strong><span>{d.education.year}</span></div>
          <div className="rv-company">{d.education.school} · {d.education.location}</div>
        </Section2>
        <Section2 title="Languages">
          {d.languages.map((l, i) => <p key={i} className="rv-p">{l}</p>)}
        </Section2>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   TEMPLATE 3 — Photo Sidebar
══════════════════════════════════════ */
function Template3() {
  const d = sampleData;
  return (
    <div className="rv rv3">
      <div className="rv3-header">
        <div className="rv3-photo">
          <div className="rv3-photo-placeholder">AJ</div>
        </div>
        <div className="rv3-header-info">
          <div className="rv3-name">{d.name}</div>
          <div className="rv3-meta">{d.location} · {d.phone}</div>
          <div className="rv3-meta">{d.email} · {d.linkedin}</div>
        </div>
      </div>
      <div className="rv3-body">
        <div className="rv3-left">
          <div className="rv3-section-title">SUMMARY</div>
          <p className="rv-p">{d.summary}</p>
          <div className="rv3-section-title" style={{marginTop:'14px'}}>SKILLS</div>
          {d.skills.flat().map((s, i) => <p key={i} className="rv-p">• {s}</p>)}
          <div className="rv3-section-title" style={{marginTop:'14px'}}>LANGUAGES</div>
          {d.languages.map((l, i) => <p key={i} className="rv-p">{l}</p>)}
        </div>
        <div className="rv3-right">
          <div className="rv3-section-title">EXPERIENCE</div>
          {d.experience.map((e, i) => (
            <div key={i} className="rv-exp">
              <div className="rv3-exp-header"><strong>{e.role}</strong><span>{e.period}</span></div>
              <div className="rv-company">{e.company}</div>
              {e.points.map((p, j) => <p key={j} className="rv-bullet">• {p}</p>)}
            </div>
          ))}
          <div className="rv3-section-title" style={{marginTop:'14px'}}>EDUCATION AND TRAINING</div>
          <strong className="rv-p">{d.education.degree}</strong>
          <div className="rv-company">{d.education.school} · {d.education.location} · {d.education.year}</div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   TEMPLATE 4 — Elegant Serif
══════════════════════════════════════ */
function Template4() {
  const d = sampleData;
  return (
    <div className="rv rv4">
      <div className="rv4-header">
        <div className="rv4-name">{d.nameLower}</div>
        <div className="rv4-meta">{d.phone} · {d.email} · {d.location}</div>
        <div className="rv4-divider" />
      </div>
      <div className="rv-body">
        <Section4 title="Summary"><p className="rv-p">{d.summary}</p></Section4>
        <Section4 title="Skills">
          <div className="rv4-skills">
            {d.skills.flat().map((s, i) => <span key={i} className="rv4-skill">• {s}</span>)}
          </div>
        </Section4>
        <Section4 title="Experience">
          {d.experience.map((e, i) => (
            <div key={i} className="rv-exp">
              <div className="rv4-exp-row"><em>{e.role}</em><span>{e.period}</span></div>
              <div className="rv-company">{e.company}</div>
              {e.points.map((p, j) => <p key={j} className="rv-bullet">• {p}</p>)}
            </div>
          ))}
        </Section4>
        <Section4 title="Education and Training">
          <div className="rv4-exp-row"><em>{d.education.degree}</em><span>{d.education.year}</span></div>
          <div className="rv-company">{d.education.school} · {d.education.location}</div>
        </Section4>
        <Section4 title="Languages">
          {d.languages.map((l, i) => <p key={i} className="rv-p">{l}</p>)}
        </Section4>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   TEMPLATE 5 — Bold Accent
══════════════════════════════════════ */
function Template5() {
  const d = sampleData;
  return (
    <div className="rv rv5">
      <div className="rv5-header">
        <div>
          <span className="rv5-name-bold">DIYA </span>
          <span className="rv5-name-light">AGARWAL</span>
        </div>
        <div className="rv5-meta">{d.location} · {d.phone} · {d.email} · {d.linkedin}</div>
      </div>
      <div className="rv5-body">
        <div className="rv5-left">
          <div className="rv5-section-title">SUMMARY</div>
          <p className="rv-p">{d.summary}</p>
          <div className="rv5-section-title">SKILLS</div>
          <div className="rv5-skills">
            {d.skills.map((row, i) => (
              <div key={i} className="rv5-skill-row">
                {row.map((s, j) => <span key={j} className="rv5-skill">{s}</span>)}
              </div>
            ))}
          </div>
          <div className="rv5-section-title">EDUCATION</div>
          <strong className="rv-p">{d.education.degree}</strong>
          <div className="rv-company">{d.education.school}</div>
          <div className="rv-company">{d.education.location} · {d.education.year}</div>
          <div className="rv5-section-title">LANGUAGES</div>
          {d.languages.map((l, i) => <p key={i} className="rv-p">{l}</p>)}
        </div>
        <div className="rv5-right">
          <div className="rv5-section-title">EXPERIENCE</div>
          {d.experience.map((e, i) => (
            <div key={i} className="rv-exp">
              <div className="rv5-exp-header"><strong>{e.role}</strong><span>{e.period}</span></div>
              <div className="rv-company">{e.company}</div>
              {e.points.map((p, j) => <p key={j} className="rv-bullet">• {p}</p>)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Section helpers ── */
function Section({ title, children }) {
  return <div className="rv-section"><div className="rv1-section-title">{title}</div>{children}</div>;
}
function Section2({ title, children }) {
  return <div className="rv-section"><div className="rv2-section-title">{title}</div>{children}</div>;
}
function Section4({ title, children }) {
  return <div className="rv-section"><div className="rv4-section-title">{title}</div>{children}</div>;
}

/* ── Template registry ── */
const templates = [
  { id: 1, name: 'Classic', tag: 'Timeless', component: <Template1 /> },
  { id: 2, name: 'Clean', tag: 'Popular', component: <Template2 /> },
  { id: 3, name: 'Photo', tag: 'Modern', component: <Template3 /> },
  { id: 4, name: 'Elegant', tag: 'Serif', component: <Template4 /> },
  { id: 5, name: 'Bold', tag: 'Stand Out', component: <Template5 /> },
];

function TemplatePickerCard({ onSelect, selected }) {
  const [preview, setPreview] = useState(null); // holds template object

  return (
    <div className="tpl-picker">
      <div className="tpl-picker-header">
        <h2 className="tpl-picker-title">Choose Your Resume Template</h2>
        <p className="tpl-picker-sub">Pick a professionally designed template to build your resume</p>
      </div>

      {/* ── Modal popup ── */}
      {preview && (
        <div className="tpl-modal-overlay" onClick={() => setPreview(null)}>
          <div className="tpl-modal" onClick={e => e.stopPropagation()}>
            <button className="tpl-modal-close" onClick={() => setPreview(null)}>✕</button>
            <div className="tpl-modal-preview">
              <div className="tpl-modal-scale">{preview.component}</div>
            </div>
            <div className="tpl-modal-actions">
              <p className="tpl-modal-name">{preview.name} Template</p>
              <button
                className="tpl-modal-use-btn"
                onClick={() => { onSelect(preview.id); setPreview(null); }}
              >
                Use this template
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="tpl-grid">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className={`tpl-card ${selected === tpl.id ? 'tpl-selected' : ''}`}
            onClick={() => setPreview(tpl)}
          >
            {tpl.id === 2 || tpl.id === 5 ? <div className="tpl-recommended">Recommended</div> : null}
            <div className="tpl-preview-wrap">
              <div className="tpl-preview-scale">{tpl.component}</div>
            </div>
            <button
              className="tpl-choose-btn"
              onClick={e => { e.stopPropagation(); onSelect(tpl.id); }}
            >
              {selected === tpl.id ? '✓ Selected' : 'Choose template'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TemplatePickerCard;
