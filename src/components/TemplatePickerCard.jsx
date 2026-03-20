import { useState, useEffect, useRef } from 'react';
import './TemplatePickerCard.css';

function ScaledPreview({ children, className, scaleDivisor = 794 }) {
  const wrapRef = useRef(null);
  const innerRef = useRef(null);
  const [scale, setScale] = useState(0);
  const [scaledHeight, setScaledHeight] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    const update = () => {
      const s = wrap.offsetWidth / scaleDivisor;
      const contentH = inner.scrollHeight;
      setScale(s);
      setScaledHeight(Math.min(contentH * s, 300));
      setReady(true);
    };

    const t = setTimeout(update, 0);
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    ro.observe(inner);
    return () => { clearTimeout(t); ro.disconnect(); };
  }, [children]);

  return (
    <div
      ref={wrapRef}
      className={className}
      style={scaledHeight ? { height: scaledHeight, position: 'relative' } : { position: 'relative' }}
    >
      <div
        ref={innerRef}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: 794,
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          userSelect: 'none',
          visibility: ready ? 'visible' : 'hidden',
        }}
      >
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

/* ══════════════════════════════════════
   T7 — Dark Executive
══════════════════════════════════════ */
function Template7() {
  return (
    <div className="rv rv7">
      <div className="rv7-header">
        <div className="rv7-photo"><span>AP</span></div>
        <div>
          <div className="rv7-name">{d.name}</div>
          <div className="rv7-title">{d.title}</div>
          <div className="rv7-contacts">
            <span>✉ {d.email}</span><span>📞 {d.phone}</span><span>📍 {d.location}</span>
          </div>
        </div>
      </div>
      <div className="rv7-body">
        <div className="rv7-sec-title">PROFESSIONAL SUMMARY</div>
        <p className="rv7-text">{d.summary}</p>
        <div className="rv7-sec-title">EXPERIENCE</div>
        {d.experience.map((e,i) => (
          <div key={i} className="rv7-exp">
            <div className="rv7-exp-header">
              <strong className="rv7-text">{e.role}</strong>
              <span className="rv7-period">{e.period}</span>
            </div>
            <div className="rv7-company">{e.company}</div>
            <p className="rv7-text">{e.desc}</p>
          </div>
        ))}
        <div className="rv7-two-col">
          <div>
            <div className="rv7-sec-title">EDUCATION</div>
            {d.education.map((e,i) => (
              <div key={i} style={{marginBottom:8}}>
                <strong className="rv7-text">{e.degree}</strong>
                <div className="rv7-company">{e.school} · {e.year}</div>
              </div>
            ))}
            <div className="rv7-sec-title">AWARDS</div>
            {d.awards.map((a,i) => <p key={i} className="rv7-text">• {a}</p>)}
          </div>
          <div>
            <div className="rv7-sec-title">SKILLS</div>
            {d.skills.map((s,i) => (
              <div key={i} style={{marginBottom:5}}>
                <span className="rv7-text">{s}</span>
                <div style={{height:3,background:'#333',borderRadius:2,marginTop:2}}>
                  <div style={{width:`${90-i*8}%`,height:'100%',background:'#c9a84c',borderRadius:2}}/>
                </div>
              </div>
            ))}
            <div className="rv7-sec-title">LANGUAGES</div>
            {d.languages.map((l,i) => <p key={i} className="rv7-text">{l}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   T8 — Purple Creative
══════════════════════════════════════ */
function Template8() {
  return (
    <div className="rv rv8">
      <div className="rv8-sidebar">
        <div className="rv8-photo"><span>AP</span></div>
        <div className="rv8-name">{d.name}</div>
        <div className="rv8-title">{d.title}</div>
        <div className="rv8-divider"/>
        <div className="rv8-sec-title">Contact</div>
        <p className="rv8-text">✉ {d.email}</p>
        <p className="rv8-text">📞 {d.phone}</p>
        <p className="rv8-text">📍 {d.location}</p>
        <div className="rv8-sec-title">Skills</div>
        {d.skills.map((s,i) => <p key={i} className="rv8-text">▸ {s}</p>)}
        <div className="rv8-sec-title">Languages</div>
        {d.languages.map((l,i) => <p key={i} className="rv8-text">{l}</p>)}
        <div className="rv8-sec-title">Awards</div>
        {d.awards.map((a,i) => <p key={i} className="rv8-text">★ {a}</p>)}
      </div>
      <div className="rv8-main">
        <div className="rv8-sec-title-main">About Me</div>
        <p className="rv8-main-text">{d.summary}</p>
        <div className="rv8-sec-title-main">Experience</div>
        {d.experience.map((e,i) => (
          <div key={i} className="rv8-exp">
            <div className="rv8-exp-period">{e.period}</div>
            <strong className="rv8-main-text">{e.role}</strong>
            <div className="rv8-company">{e.company}</div>
            <p className="rv8-main-text">{e.desc}</p>
          </div>
        ))}
        <div className="rv8-sec-title-main">Education</div>
        {d.education.map((e,i) => (
          <div key={i} style={{marginBottom:8}}>
            <strong className="rv8-main-text">{e.degree}</strong>
            <div className="rv8-company">{e.school} · {e.year}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   T9 — Minimal White
══════════════════════════════════════ */
function Template9() {
  return (
    <div className="rv rv9">
      <div className="rv9-header">
        <div className="rv9-name">{d.name}</div>
        <div className="rv9-title">{d.title}</div>
        <div className="rv9-contacts">
          <span>{d.email}</span><span>|</span><span>{d.phone}</span><span>|</span><span>{d.location}</span>
        </div>
        <div className="rv9-divider"/>
      </div>
      <div className="rv9-body">
        <div className="rv9-sec-title">SUMMARY</div>
        <p className="rv9-text">{d.summary}</p>
        <div className="rv9-sec-title">EXPERIENCE</div>
        {d.experience.map((e,i) => (
          <div key={i} className="rv9-exp">
            <div className="rv9-exp-header">
              <strong className="rv9-text">{e.role} — {e.company}</strong>
              <span className="rv9-period">{e.period}</span>
            </div>
            <p className="rv9-text">{e.desc}</p>
          </div>
        ))}
        <div className="rv9-two-col">
          <div>
            <div className="rv9-sec-title">EDUCATION</div>
            {d.education.map((e,i) => (
              <div key={i} style={{marginBottom:6}}>
                <strong className="rv9-text">{e.degree}</strong>
                <div className="rv9-muted">{e.school} · {e.year}</div>
              </div>
            ))}
            <div className="rv9-sec-title">AWARDS</div>
            {d.awards.map((a,i) => <p key={i} className="rv9-text">• {a}</p>)}
          </div>
          <div>
            <div className="rv9-sec-title">SKILLS</div>
            <div className="rv9-skills-wrap">
              {d.skills.map((s,i) => <span key={i} className="rv9-skill-tag">{s}</span>)}
            </div>
            <div className="rv9-sec-title">LANGUAGES</div>
            {d.languages.map((l,i) => <p key={i} className="rv9-text">{l}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   T10 — Red Accent
══════════════════════════════════════ */
function Template10() {
  return (
    <div className="rv rv10">
      <div className="rv10-sidebar">
        <div className="rv10-photo"><span>AP</span></div>
        <div className="rv10-name">{d.name}</div>
        <div className="rv10-title">{d.title}</div>
        <div className="rv10-sec-title">CONTACT</div>
        <p className="rv10-text">✉ {d.email}</p>
        <p className="rv10-text">📞 {d.phone}</p>
        <p className="rv10-text">📍 {d.location}</p>
        <div className="rv10-sec-title">SKILLS</div>
        {d.skills.map((s,i) => (
          <div key={i} style={{marginBottom:5}}>
            <span className="rv10-text">{s}</span>
            <div style={{height:3,background:'rgba(255,255,255,0.2)',borderRadius:2,marginTop:2}}>
              <div style={{width:`${90-i*8}%`,height:'100%',background:'#e53e3e',borderRadius:2}}/>
            </div>
          </div>
        ))}
        <div className="rv10-sec-title">LANGUAGES</div>
        {d.languages.map((l,i) => <p key={i} className="rv10-text">{l}</p>)}
      </div>
      <div className="rv10-main">
        <div className="rv10-sec-title-main">PROFILE</div>
        <p className="rv10-main-text">{d.summary}</p>
        <div className="rv10-sec-title-main">EXPERIENCE</div>
        {d.experience.map((e,i) => (
          <div key={i} className="rv10-exp">
            <div className="rv10-exp-period">{e.period}</div>
            <strong className="rv10-main-text">{e.role}</strong>
            <div className="rv10-company">{e.company}</div>
            <p className="rv10-main-text">{e.desc}</p>
          </div>
        ))}
        <div className="rv10-sec-title-main">EDUCATION</div>
        {d.education.map((e,i) => (
          <div key={i} style={{marginBottom:8}}>
            <strong className="rv10-main-text">{e.degree}</strong>
            <div className="rv10-company">{e.school} · {e.year}</div>
          </div>
        ))}
        <div className="rv10-sec-title-main">AWARDS</div>
        {d.awards.map((a,i) => <p key={i} className="rv10-main-text">• {a}</p>)}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   T11 — Green Nature
══════════════════════════════════════ */
function Template11() {
  return (
    <div className="rv rv11">
      <div className="rv11-header">
        <div className="rv11-photo"><span>AP</span></div>
        <div className="rv11-header-text">
          <div className="rv11-name">{d.name}</div>
          <div className="rv11-title">{d.title}</div>
        </div>
        <div className="rv11-header-contact">
          <p className="rv11-contact">✉ {d.email}</p>
          <p className="rv11-contact">📞 {d.phone}</p>
          <p className="rv11-contact">📍 {d.location}</p>
        </div>
      </div>
      <div className="rv11-body">
        <div className="rv11-left">
          <div className="rv11-sec-title">ABOUT</div>
          <p className="rv11-text">{d.summary}</p>
          <div className="rv11-sec-title">SKILLS</div>
          {d.skills.map((s,i) => <span key={i} className="rv11-skill-tag">{s}</span>)}
          <div className="rv11-sec-title">LANGUAGES</div>
          {d.languages.map((l,i) => <p key={i} className="rv11-text">{l}</p>)}
          <div className="rv11-sec-title">AWARDS</div>
          {d.awards.map((a,i) => <p key={i} className="rv11-text">🏆 {a}</p>)}
        </div>
        <div className="rv11-right">
          <div className="rv11-sec-title">EXPERIENCE</div>
          {d.experience.map((e,i) => (
            <div key={i} className="rv11-exp">
              <div className="rv11-exp-period">{e.period}</div>
              <strong className="rv11-text">{e.role}</strong>
              <div className="rv11-company">{e.company}</div>
              <p className="rv11-text">{e.desc}</p>
            </div>
          ))}
          <div className="rv11-sec-title">EDUCATION</div>
          {d.education.map((e,i) => (
            <div key={i} style={{marginBottom:8}}>
              <strong className="rv11-text">{e.degree}</strong>
              <div className="rv11-company">{e.school} · {e.year}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   T12 — Navy Classic
══════════════════════════════════════ */
function Template12() {
  return (
    <div className="rv rv12">
      <div className="rv12-top">
        <div className="rv12-photo"><span>AP</span></div>
        <div className="rv12-top-text">
          <div className="rv12-name">{d.name}</div>
          <div className="rv12-title">{d.title}</div>
          <div className="rv12-contacts">
            <span>✉ {d.email}</span><span>📞 {d.phone}</span><span>📍 {d.location}</span>
          </div>
        </div>
      </div>
      <div className="rv12-body">
        <div className="rv12-left">
          <div className="rv12-sec-title">SUMMARY</div>
          <p className="rv12-text">{d.summary}</p>
          <div className="rv12-sec-title">EDUCATION</div>
          {d.education.map((e,i) => (
            <div key={i} style={{marginBottom:8}}>
              <strong className="rv12-text">{e.degree}</strong>
              <div className="rv12-muted">{e.school} · {e.year}</div>
            </div>
          ))}
          <div className="rv12-sec-title">LANGUAGES</div>
          {d.languages.map((l,i) => <p key={i} className="rv12-text">{l}</p>)}
          <div className="rv12-sec-title">AWARDS</div>
          {d.awards.map((a,i) => <p key={i} className="rv12-text">• {a}</p>)}
        </div>
        <div className="rv12-right">
          <div className="rv12-sec-title">EXPERIENCE</div>
          {d.experience.map((e,i) => (
            <div key={i} className="rv12-exp">
              <div className="rv12-exp-period">{e.period}</div>
              <strong className="rv12-text">{e.role}</strong>
              <div className="rv12-company">{e.company}</div>
              <p className="rv12-text">{e.desc}</p>
            </div>
          ))}
          <div className="rv12-sec-title">SKILLS</div>
          <div className="rv12-skills-wrap">
            {d.skills.map((s,i) => <span key={i} className="rv12-skill-tag">{s}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   T13 — Cyan Tech
══════════════════════════════════════ */
function Template13() {
  return (
    <div className="rv rv13">
      <div className="rv13-header">
        <div className="rv13-header-left">
          <div className="rv13-photo"><span>AP</span></div>
          <div>
            <div className="rv13-name">{d.name}</div>
            <div className="rv13-title">{d.title}</div>
          </div>
        </div>
        <div className="rv13-header-right">
          <span className="rv13-contact">✉ {d.email}</span>
          <span className="rv13-contact">📞 {d.phone}</span>
          <span className="rv13-contact">📍 {d.location}</span>
        </div>
      </div>
      <div className="rv13-body">
        <div className="rv13-left">
          <div className="rv13-sec-title">SKILLS</div>
          {d.skills.map((s,i) => (
            <div key={i} className="rv13-skill-row">
              <span className="rv13-skill-name">{s}</span>
              <div className="rv13-skill-bar"><div className="rv13-skill-fill" style={{width:`${90-i*8}%`}}/></div>
            </div>
          ))}
          <div className="rv13-sec-title">EDUCATION</div>
          {d.education.map((e,i) => (
            <div key={i} style={{marginBottom:8}}>
              <strong className="rv13-text">{e.degree}</strong>
              <div className="rv13-muted">{e.school} · {e.year}</div>
            </div>
          ))}
          <div className="rv13-sec-title">LANGUAGES</div>
          {d.languages.map((l,i) => <p key={i} className="rv13-text">{l}</p>)}
        </div>
        <div className="rv13-right">
          <div className="rv13-sec-title">PROFILE</div>
          <p className="rv13-text">{d.summary}</p>
          <div className="rv13-sec-title">EXPERIENCE</div>
          {d.experience.map((e,i) => (
            <div key={i} className="rv13-exp">
              <div className="rv13-exp-header">
                <strong className="rv13-text">{e.role}</strong>
                <span className="rv13-period">{e.period}</span>
              </div>
              <div className="rv13-company">{e.company}</div>
              <p className="rv13-text">{e.desc}</p>
            </div>
          ))}
          <div className="rv13-sec-title">AWARDS</div>
          {d.awards.map((a,i) => <p key={i} className="rv13-text">▸ {a}</p>)}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   T14 — Coral Modern
══════════════════════════════════════ */
function Template14() {
  return (
    <div className="rv rv14">
      <div className="rv14-top">
        <div className="rv14-name">{d.firstName} <span className="rv14-name-accent">{d.lastName}</span></div>
        <div className="rv14-title">{d.title}</div>
        <div className="rv14-contacts">
          <span>{d.email}</span><span>|</span><span>{d.phone}</span><span>|</span><span>{d.location}</span>
        </div>
      </div>
      <div className="rv14-body">
        <div className="rv14-left">
          <div className="rv14-sec-title">About Me</div>
          <p className="rv14-text">{d.summary}</p>
          <div className="rv14-sec-title">Skills</div>
          <div className="rv14-skills-wrap">
            {d.skills.map((s,i) => <span key={i} className="rv14-skill-tag">{s}</span>)}
          </div>
          <div className="rv14-sec-title">Languages</div>
          {d.languages.map((l,i) => <p key={i} className="rv14-text">{l}</p>)}
          <div className="rv14-sec-title">Awards</div>
          {d.awards.map((a,i) => <p key={i} className="rv14-text">🏆 {a}</p>)}
        </div>
        <div className="rv14-right">
          <div className="rv14-sec-title">Experience</div>
          {d.experience.map((e,i) => (
            <div key={i} className="rv14-exp">
              <div className="rv14-exp-period">{e.period}</div>
              <strong className="rv14-text">{e.role}</strong>
              <div className="rv14-company">{e.company}</div>
              <p className="rv14-text">{e.desc}</p>
            </div>
          ))}
          <div className="rv14-sec-title">Education</div>
          {d.education.map((e,i) => (
            <div key={i} style={{marginBottom:8}}>
              <strong className="rv14-text">{e.degree}</strong>
              <div className="rv14-company">{e.school} · {e.year}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   T15 — Indigo Professional
══════════════════════════════════════ */
function Template15() {
  return (
    <div className="rv rv15">
      <div className="rv15-sidebar">
        <div className="rv15-photo"><span>AP</span></div>
        <div className="rv15-name">{d.name}</div>
        <div className="rv15-title">{d.title}</div>
        <div className="rv15-divider"/>
        <div className="rv15-sec-title">Contact</div>
        <p className="rv15-text">✉ {d.email}</p>
        <p className="rv15-text">📞 {d.phone}</p>
        <p className="rv15-text">📍 {d.location}</p>
        <div className="rv15-sec-title">Skills</div>
        {d.skills.map((s,i) => <span key={i} className="rv15-skill-tag">{s}</span>)}
        <div className="rv15-sec-title">Languages</div>
        {d.languages.map((l,i) => <p key={i} className="rv15-text">{l}</p>)}
      </div>
      <div className="rv15-main">
        <div className="rv15-sec-title">Professional Summary</div>
        <p className="rv15-main-text">{d.summary}</p>
        <div className="rv15-sec-title">Work Experience</div>
        {d.experience.map((e,i) => (
          <div key={i} className="rv15-exp">
            <div className="rv15-exp-header">
              <strong className="rv15-main-text">{e.role}</strong>
              <span className="rv15-period">{e.period}</span>
            </div>
            <div className="rv15-company">{e.company}</div>
            <p className="rv15-main-text">{e.desc}</p>
          </div>
        ))}
        <div className="rv15-two-col">
          <div>
            <div className="rv15-sec-title">Education</div>
            {d.education.map((e,i) => (
              <div key={i} style={{marginBottom:8}}>
                <strong className="rv15-main-text">{e.degree}</strong>
                <div className="rv15-company">{e.school} · {e.year}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="rv15-sec-title">Awards</div>
            {d.awards.map((a,i) => <p key={i} className="rv15-main-text">★ {a}</p>)}
          </div>
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
  { id: 7, name: 'Dark Executive', tag: 'Premium', component: <Template7 />, recommended: false },
  { id: 8, name: 'Purple Creative', tag: 'Bold', component: <Template8 />, recommended: true },
  { id: 9, name: 'Minimal White', tag: 'Clean', component: <Template9 />, recommended: false },
  { id: 10, name: 'Red Accent', tag: 'Vibrant', component: <Template10 />, recommended: false },
  { id: 11, name: 'Green Nature', tag: 'Fresh', component: <Template11 />, recommended: false },
  { id: 12, name: 'Navy Classic',        tag: 'Formal',    component: <Template12 />, recommended: false },
  { id: 13, name: 'Cyan Tech',           tag: 'Tech',      component: <Template13 />, recommended: false },
  { id: 14, name: 'Coral Modern',        tag: 'Modern',    component: <Template14 />, recommended: true  },
  { id: 15, name: 'Indigo Professional', tag: 'Premium',   component: <Template15 />, recommended: false },
];

function TemplatePickerCard({ onSelect, selected }) {
  const [preview, setPreview] = useState(null);
  const [page, setPage] = useState(1);
  const [sliding, setSliding] = useState(false);
  const PER_PAGE = 6;
  const totalPages = Math.ceil(templates.length / PER_PAGE);

  const getVisible = (p) => templates.slice((p - 1) * PER_PAGE, p * PER_PAGE);

  // Track is always totalPages wide, positioned so active page is in view
  // translateX = -(page-1) * (100/totalPages)%
  const slideWidth = 100 / totalPages; // each slide is this % of the track

  const goToPage = (p) => {
    if (sliding || p === page) return;
    setSliding(true);
    // Use rAF so the transition:none frame paints first, then we update page with transition on
    requestAnimationFrame(() => {
      setPage(p);
    });
  };

  const handleTransitionEnd = () => {
    setSliding(false);
  };

  const trackStyle = {
    transform: `translateX(-${(page - 1) * slideWidth}%)`,
    transition: sliding ? 'transform 0.42s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
    width: `${totalPages * 100}%`,
  };

  const renderGrid = (pageIndex) => {
    const items = getVisible(pageIndex);
    return (
      <div
        key={pageIndex}
        className="tpl-slide"
        style={{ width: `${slideWidth}%` }}
      >
        <div className="tpl-grid">
          {items.map((tpl) => (
            <div
              key={tpl.id}
              className={`tpl-card ${selected === tpl.id ? 'tpl-selected' : ''}`}
              onClick={() => setPreview(tpl)}
            >
              {tpl.recommended && <div className="tpl-recommended">Recommended</div>}
              <ScaledPreview className="tpl-preview-wrap" scaleDivisor={540}>{tpl.component}</ScaledPreview>
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
  };

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

      <div className="tpl-viewport">
        <div
          className="tpl-track"
          style={trackStyle}
          onTransitionEnd={handleTransitionEnd}
        >
          {Array.from({ length: totalPages }, (_, i) => renderGrid(i + 1))}
        </div>
      </div>

      <div className="tpl-pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button
            key={p}
            className={`tpl-page-btn${page === p ? ' tpl-page-active' : ''}`}
            onClick={() => goToPage(p)}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TemplatePickerCard;
