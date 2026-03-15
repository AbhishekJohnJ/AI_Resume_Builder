import { useState, useEffect, useRef } from 'react';
import './TemplatePickerCard.css';

function ScaledPreview({ children, className }) {
  const wrapRef = useRef(null);
  const innerRef = useRef(null);
  const [scale, setScale] = useState(0.38);
  const [scaledHeight, setScaledHeight] = useState(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    const update = () => {
      const s = wrap.offsetWidth / 794;
      setScale(s);
      // After scale is applied, the rendered height of inner * scale = container height
      const contentH = inner.scrollHeight;
      setScaledHeight(contentH * s);
    };

    // Wait a tick for inner to render before measuring
    const t = setTimeout(update, 0);
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    ro.observe(inner);
    return () => { clearTimeout(t); ro.disconnect(); };
  }, [children]);

  return (
    <div ref={wrapRef} className={className} style={scaledHeight ? { height: scaledHeight, position: 'relative' } : { position: 'relative' }}>
      <div ref={innerRef} style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: 794, position: 'absolute', top: 0, left: 0, pointerEvents: 'none', userSelect: 'none' }}>
        {children}
      </div>
    </div>
  );
}

const d = {
  name: 'Adeline Palmerston',
  firstName: 'ADELINE', lastName: 'PALMERSTON',
  title: 'Graphics Designer',
  email: 'adeline@example.com',
  phone: '+1 (555) 123-4567',
  location: '123 Anywhere St., Any City',
  linkedin: 'linkedin.com/in/adeline',
  website: 'www.adeline.com',
  summary: 'Experienced graphics designer with 5+ years creating compelling visual identities, marketing materials, and digital content. Passionate about clean design and brand storytelling.',
  skills: ['Adobe Photoshop', 'Illustrator', 'Figma', 'Branding', 'UI Design', 'Typography', 'Motion Graphics'],
  experience: [
    { role: 'Senior Graphic Designer', company: 'Dreyard International Co.', period: '2020 – 2024', desc: 'Led visual design for global campaigns, managed brand guidelines, and mentored junior designers.' },
    { role: 'Graphic Designer', company: 'Animated Industries', period: '2017 – 2019', desc: 'Created marketing collateral, social media assets, and product packaging for 30+ clients.' },
    { role: 'Junior Designer', company: 'Pixel Studio', period: '2015 – 2017', desc: 'Assisted senior designers with layout, typography, and digital illustration projects.' },
  ],
  education: [
    { degree: 'Bachelor of Design', school: 'Meadows University', year: '2015' },
    { degree: 'Bachelor of Design', school: 'Animated Industries', year: '2013' },
  ],
  languages: ['English – Native', 'French – Intermediate'],
  awards: ['Best Designer Award 2022', 'Creative Excellence 2021'],
};

/* ══════════════════════════════════════
   T1 — Modern Minimalist (Blue accent, photo top-left)
══════════════════════════════════════ */
function Template1() {
  return (
    <div className="rv rv1">
      <div className="rv1-sidebar">
        <div className="rv1-photo"><span>AP</span></div>
        <div className="rv1-name">{d.name}</div>
        <div className="rv1-title">{d.title}</div>
        <div className="rv1-divider" />
        <div className="rv1-sec-title">About Me</div>
        <p className="rv1-text">{d.summary}</p>
        <div className="rv1-sec-title">Contact</div>
        <p className="rv1-text">📞 {d.phone}</p>
        <p className="rv1-text">✉ {d.email}</p>
        <p className="rv1-text">📍 {d.location}</p>
        <div className="rv1-sec-title">Skills</div>
        {d.skills.map((s,i) => (
          <div key={i} className="rv1-skill-row">
            <span className="rv1-skill-name">{s}</span>
            <div className="rv1-skill-bar"><div className="rv1-skill-fill" style={{width:`${90-i*8}%`}}/></div>
          </div>
        ))}
        <div className="rv1-sec-title">Language</div>
        {d.languages.map((l,i) => <p key={i} className="rv1-text">{l}</p>)}
      </div>
      <div className="rv1-main">
        <div className="rv1-main-header">
          <div className="rv1-edu-icon">🎓</div>
          <div className="rv1-main-sec-title">Education</div>
        </div>
        {d.education.map((e,i) => (
          <div key={i} className="rv1-edu-item">
            <div className="rv1-edu-year">{e.year}</div>
            <div><strong className="rv1-text">{e.degree}</strong><div className="rv1-company">{e.school}</div></div>
          </div>
        ))}
        <div className="rv1-main-sec-title" style={{marginTop:18}}>Experience</div>
        {d.experience.map((e,i) => (
          <div key={i} className="rv1-exp-item">
            <div className="rv1-exp-dot"/>
            <div>
              <div className="rv1-exp-period">{e.period}</div>
              <strong className="rv1-text">{e.role}</strong>
              <div className="rv1-company">{e.company}</div>
              <p className="rv1-text">{e.desc}</p>
            </div>
          </div>
        ))}
        <div className="rv1-main-sec-title" style={{marginTop:18}}>Awards & Recognition</div>
        {d.awards.map((a,i) => (
          <div key={i} className="rv1-award-item">{a}</div>
        ))}
        <div className="rv1-main-sec-title" style={{marginTop:18}}>Profile</div>
        <p className="rv1-text" style={{color:'#444'}}>{d.summary}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   T2 — Professional Modern CV (Dark header, 2-col)
══════════════════════════════════════ */
function Template2() {
  return (
    <div className="rv rv2">
      <div className="rv2-header">
        <div className="rv2-photo"><span>LP</span></div>
        <div className="rv2-header-info">
          <div className="rv2-name">LORNA ALVARADO</div>
          <div className="rv2-title">Marketing Manager</div>
          <div className="rv2-contacts">
            <span>📞 {d.phone}</span><span>✉ {d.email}</span><span>📍 {d.location}</span>
          </div>
        </div>
      </div>
      <div className="rv2-body">
        <div className="rv2-left">
          <div className="rv2-sec">
            <div className="rv2-sec-title">ABOUT ME</div>
            <p className="rv2-text">{d.summary}</p>
          </div>
          <div className="rv2-sec">
            <div className="rv2-sec-title">SKILLS</div>
            {d.skills.map((s,i) => (
              <div key={i} className="rv2-skill-row">
                <span className="rv2-skill-name">{s}</span>
                <div className="rv2-skill-bar"><div className="rv2-skill-fill" style={{width:`${88-i*7}%`}}/></div>
              </div>
            ))}
          </div>
          <div className="rv2-sec">
            <div className="rv2-sec-title">LANGUAGE</div>
            {d.languages.map((l,i) => <p key={i} className="rv2-text">{l}</p>)}
          </div>
        </div>
        <div className="rv2-right">
          <div className="rv2-sec">
            <div className="rv2-sec-title">EXPERIENCE</div>
            {d.experience.map((e,i) => (
              <div key={i} className="rv2-exp">
                <div className="rv2-exp-period">{e.period}</div>
                <strong className="rv2-text">{e.role}</strong>
                <div className="rv2-company">{e.company}</div>
                <p className="rv2-text">{e.desc}</p>
              </div>
            ))}
          </div>
          <div className="rv2-sec">
            <div className="rv2-sec-title">EDUCATION</div>
            {d.education.map((e,i) => (
              <div key={i} className="rv2-exp">
                <div className="rv2-exp-period">{e.year}</div>
                <strong className="rv2-text">{e.degree}</strong>
                <div className="rv2-company">{e.school}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   T3 — White Simple Student CV (Teal sidebar)
══════════════════════════════════════ */
function Template3() {
  return (
    <div className="rv rv3">
      <div className="rv3-sidebar">
        <div className="rv3-photo"><span>DS</span></div>
        <div className="rv3-name">DONNA STROUPE</div>
        <div className="rv3-title">Student</div>
        <div className="rv3-sec-title">PROFILE</div>
        <p className="rv3-text">{d.summary}</p>
        <div className="rv3-sec-title">EDUCATION</div>
        {d.education.map((e,i) => (
          <div key={i} style={{marginBottom:8}}>
            <div className="rv3-text" style={{fontWeight:700}}>{e.school}</div>
            <div className="rv3-text">{e.degree}</div>
            <div className="rv3-muted">{e.year}</div>
          </div>
        ))}
        <div className="rv3-sec-title">LANGUAGE</div>
        {d.languages.map((l,i) => <p key={i} className="rv3-text">{l}</p>)}
        <div className="rv3-sec-title">COMPUTER SKILLS</div>
        {d.skills.slice(0,4).map((s,i) => <p key={i} className="rv3-text">• {s}</p>)}
      </div>
      <div className="rv3-main">
        <div className="rv3-main-header">
          <div className="rv3-main-name">DONNA STROUPE</div>
          <div className="rv3-main-title">Student</div>
        </div>
        <div className="rv3-sec-title-main">VOLUNTEER EXPERIENCE</div>
        {d.experience.map((e,i) => (
          <div key={i} className="rv3-exp">
            <strong className="rv3-main-text">{e.role}</strong>
            <div className="rv3-company">{e.company} · {e.period}</div>
            <p className="rv3-main-text">{e.desc}</p>
          </div>
        ))}
        <div className="rv3-sec-title-main">CONTACT ME</div>
        <p className="rv3-main-text">📞 {d.phone}</p>
        <p className="rv3-main-text">✉ {d.email}</p>
        <p className="rv3-main-text">📍 {d.location}</p>
        <div className="rv3-sec-title-main">SKILLS</div>
        {d.skills.map((s,i) => (
          <div key={i} style={{display:'flex', alignItems:'center', gap:6, marginBottom:5}}>
            <span className="rv3-main-text" style={{flex:1}}>{s}</span>
            <div style={{width:60, height:3, background:'#e0e0e0', borderRadius:2}}>
              <div style={{width:`${90-i*8}%`, height:'100%', background:'#5f8a8b', borderRadius:2}}/>
            </div>
          </div>
        ))}
        <div className="rv3-sec-title-main">AWARDS</div>
        {d.awards.map((a,i) => (
          <div key={i} className="rv3-award-item">{a}</div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   T4 — Orange White Graphic Designer
══════════════════════════════════════ */
function Template4() {
  return (
    <div className="rv rv4">
      <div className="rv4-header">
        <div className="rv4-header-left">
          <div className="rv4-photo"><span>AD</span></div>
          <div>
            <div className="rv4-name">AVERY DAVIS</div>
            <div className="rv4-title">GRAPHIC DESIGNER</div>
          </div>
        </div>
        <div className="rv4-header-right">
          <p className="rv4-contact">📞 {d.phone}</p>
          <p className="rv4-contact">✉ {d.email}</p>
          <p className="rv4-contact">📍 {d.location}</p>
        </div>
      </div>
      <div className="rv4-body">
        <div className="rv4-left">
          <div className="rv4-sec-title">Profile</div>
          <p className="rv4-text">{d.summary}</p>
          <div className="rv4-sec-title">Work Experience</div>
          {d.experience.map((e,i) => (
            <div key={i} className="rv4-exp">
              <div className="rv4-exp-period">{e.period}</div>
              <strong className="rv4-text">{e.role}</strong>
              <div className="rv4-company">{e.company}</div>
              <p className="rv4-text">{e.desc}</p>
            </div>
          ))}
          <div className="rv4-sec-title">Languages</div>
          {d.languages.map((l,i) => <p key={i} className="rv4-text">{l}</p>)}
        </div>
        <div className="rv4-right">
          <div className="rv4-sec-title">Skills</div>
          {d.skills.map((s,i) => <p key={i} className="rv4-text">• {s}</p>)}
          <div className="rv4-sec-title">Education History</div>
          {d.education.map((e,i) => (
            <div key={i} style={{marginBottom:8}}>
              <strong className="rv4-text">{e.degree}</strong>
              <div className="rv4-company">{e.school} · {e.year}</div>
            </div>
          ))}
          <div className="rv4-sec-title">References</div>
          <div className="rv4-refs">
            <div><strong className="rv4-text">Mari Zhang</strong><div className="rv4-company">Studio Studios · CEO</div></div>
            <div><strong className="rv4-text">Jamie Chastain</strong><div className="rv4-company">Warner & Spencer · CFO</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   T5 — Olivia Wilson Style (Clean 2-col, grey accent)
══════════════════════════════════════ */
function Template5() {
  return (
    <div className="rv rv5">
      <div className="rv5-header">
        <div className="rv5-photo"><span>OW</span></div>
        <div>
          <div className="rv5-name">OLIVIA WILSON</div>
          <div className="rv5-title">Graphics Designer</div>
          <div className="rv5-contacts">
            <span>{d.phone}</span><span>{d.email}</span><span>{d.location}</span>
          </div>
        </div>
      </div>
      <div className="rv5-body">
        <div className="rv5-left">
          <div className="rv5-sec-title">Profile</div>
          <p className="rv5-text">{d.summary}</p>
          <div className="rv5-sec-title">Work Experience</div>
          {d.experience.map((e,i) => (
            <div key={i} className="rv5-exp">
              <div className="rv5-exp-period">{e.period}</div>
              <strong className="rv5-text">{e.role}</strong>
              <div className="rv5-company">{e.company}</div>
              <p className="rv5-text">{e.desc}</p>
            </div>
          ))}
        </div>
        <div className="rv5-right">
          <div className="rv5-sec-title">Education</div>
          {d.education.map((e,i) => (
            <div key={i} style={{marginBottom:10}}>
              <strong className="rv5-text">{e.degree}</strong>
              <div className="rv5-company">{e.school}</div>
              <div className="rv5-muted">{e.year}</div>
            </div>
          ))}
          <div className="rv5-sec-title">Expertise</div>
          {d.skills.map((s,i) => (
            <div key={i} className="rv5-skill-row">
              <span className="rv5-skill-name">{s}</span>
              <div className="rv5-skill-bar"><div className="rv5-skill-fill" style={{width:`${85-i*7}%`}}/></div>
            </div>
          ))}
          <div className="rv5-sec-title">Language</div>
          {d.languages.map((l,i) => <p key={i} className="rv5-text">{l}</p>)}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   T6 — Connor Hamilton (Teal bold header, 2-col)
══════════════════════════════════════ */
function Template6() {
  return (
    <div className="rv rv6">
      <div className="rv6-header">
        <div className="rv6-photo"><span>CH</span></div>
        <div className="rv6-header-text">
          <div className="rv6-name">CONNOR<br/>HAMILTON</div>
          <div className="rv6-title">Student</div>
        </div>
        <div className="rv6-header-contact">
          <p className="rv6-contact">{d.phone}</p>
          <p className="rv6-contact">{d.email}</p>
          <p className="rv6-contact">{d.location}</p>
        </div>
      </div>
      <div className="rv6-body">
        <div className="rv6-left">
          <div className="rv6-sec-title">PROFILE</div>
          <p className="rv6-text">{d.summary}</p>
          <div className="rv6-sec-title">LANGUAGE</div>
          {d.languages.map((l,i) => <p key={i} className="rv6-text">{l}</p>)}
          <div className="rv6-sec-title">CONTACT ME</div>
          <p className="rv6-text">📞 {d.phone}</p>
          <p className="rv6-text">✉ {d.email}</p>
          <p className="rv6-text">📍 {d.location}</p>
          <div className="rv6-sec-title">COMPUTER SKILLS</div>
          {d.skills.slice(0,4).map((s,i) => <p key={i} className="rv6-text">• {s}</p>)}
        </div>
        <div className="rv6-right">
          <div className="rv6-sec-title">EDUCATION</div>
          {d.education.map((e,i) => (
            <div key={i} style={{marginBottom:10}}>
              <strong className="rv6-text">{e.school}</strong>
              <div className="rv6-text">{e.degree}</div>
              <div className="rv6-muted">{e.year}</div>
            </div>
          ))}
          <div className="rv6-sec-title">WORK EXPERIENCE</div>
          {d.experience.map((e,i) => (
            <div key={i} className="rv6-exp">
              <strong className="rv6-text">{e.role}</strong>
              <div className="rv6-company">{e.company} · {e.period}</div>
              <p className="rv6-text">{e.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const templates = [
  { id: 1, name: 'Modern Minimalist', tag: 'Popular', component: <Template1 />, recommended: true },
  { id: 2, name: 'Professional Modern', tag: 'Classic', component: <Template2 />, recommended: false },
  { id: 3, name: 'Simple Student CV', tag: 'Clean', component: <Template3 />, recommended: false },
  { id: 4, name: 'Orange Graphic', tag: 'Creative', component: <Template4 />, recommended: true },
  { id: 5, name: 'Clean Two-Column', tag: 'Minimal', component: <Template5 />, recommended: false },
  { id: 6, name: 'Bold Teal Header', tag: 'Stand Out', component: <Template6 />, recommended: false },
];

function TemplatePickerCard({ onSelect, selected }) {
  const [preview, setPreview] = useState(null);

  return (
    <div className="tpl-picker">
      {preview && (
        <div className="tpl-modal-overlay" onClick={() => setPreview(null)}>
          <div className="tpl-modal" onClick={e => e.stopPropagation()}>
            <button className="tpl-modal-close" onClick={() => setPreview(null)}>✕</button>
            <ScaledPreview className="tpl-modal-preview">{preview.component}</ScaledPreview>
            <div className="tpl-modal-actions">
              <p className="tpl-modal-name">{preview.name}</p>
              <button className="tpl-modal-use-btn" onClick={() => { onSelect(preview.id); setPreview(null); }}>
                Use this template
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="tpl-grid">
        {templates.map((tpl) => (
          <div key={tpl.id} className={`tpl-card ${selected === tpl.id ? 'tpl-selected' : ''}`} onClick={() => setPreview(tpl)}>
            {tpl.recommended && <div className="tpl-recommended">Recommended</div>}
            <ScaledPreview className="tpl-preview-wrap">{tpl.component}</ScaledPreview>
            <div className="tpl-card-footer">
              <span className="tpl-card-name">{tpl.name}</span>
              <button className="tpl-choose-btn" onClick={e => { e.stopPropagation(); onSelect(tpl.id); }}>
                {selected === tpl.id ? '✓ Selected' : 'Choose template'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TemplatePickerCard;
