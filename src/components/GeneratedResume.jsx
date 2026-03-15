import './TemplatePickerCard.css';
import './GeneratedResume.css';

function GeneratedResume({ data, templateId, themeColor }) {
  const d = data;
  const initials = d.initials || d.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || 'AB';
  const props = { d, initials, themeColor };
  if (templateId === 1) return <T1 {...props} />;
  if (templateId === 2) return <T2 {...props} />;
  if (templateId === 3) return <T3 {...props} />;
  if (templateId === 4) return <T4 {...props} />;
  if (templateId === 5) return <T5 {...props} />;
  if (templateId === 6) return <T6 {...props} />;
  if (templateId === 7) return <T7 {...props} />;
  if (templateId === 8) return <T8 {...props} />;
  if (templateId === 9) return <T9 {...props} />;
  if (templateId === 10) return <T10 {...props} />;
  if (templateId === 11) return <T11 {...props} />;
  if (templateId === 12) return <T12 {...props} />;
  return <T1 {...props} />;
}

/** Build CSS variable overrides from a themeColor palette */
function themeVars(themeColor) {
  if (!themeColor) return {};
  return {
    '--tc': themeColor.main,
    '--tc-dark': themeColor.dark,
    '--tc-light': themeColor.light,
    '--tc-accent': themeColor.accent,
  };
}

/* ── T1: Blue Sidebar ── */
function T1({ d, initials, themeColor }) {
  return (
    <div className="rv rv1" style={themeVars(themeColor)}>
      <div className="rv1-sidebar">
        <div className="rv1-photo"><span>{initials}</span></div>
        <div className="rv1-name">{d.name}</div>
        <div className="rv1-title">{d.title}</div>
        <div className="rv1-divider" />
        <div className="rv1-sec-title">Contact</div>
        <p className="rv1-text">📞 {d.phone}</p>
        <p className="rv1-text">✉ {d.email}</p>
        <p className="rv1-text">📍 {d.location}</p>
        {d.linkedin && <p className="rv1-text">🔗 {d.linkedin}</p>}
        {d.website && <p className="rv1-text">🌐 {d.website}</p>}
        <div className="rv1-sec-title">Skills</div>
        {d.skills?.map((s, i) => (
          <div key={i} className="rv1-skill-row">
            <span className="rv1-skill-name">{s}</span>
            <div className="rv1-skill-bar"><div className="rv1-skill-fill" style={{ width: `${90 - i * 8}%` }} /></div>
          </div>
        ))}
        {d.languages?.length > 0 && <>
          <div className="rv1-sec-title">Languages</div>
          {d.languages.map((l, i) => <p key={i} className="rv1-text">{l}</p>)}
        </>}
        {d.awards?.length > 0 && <>
          <div className="rv1-sec-title">Awards</div>
          {d.awards.map((a, i) => <p key={i} className="rv1-text">• {a}</p>)}
        </>}
      </div>
      <div className="rv1-main">
        <div className="rv1-main-sec-title">About Me</div>
        <p style={{ fontSize: 10, color: '#333', lineHeight: 1.6, marginBottom: 16 }}>{d.summary}</p>
        <div className="rv1-main-sec-title">Education</div>
        {d.education?.map((e, i) => (
          <div key={i} className="rv1-edu-item">
            <div className="rv1-edu-year">{e.year}</div>
            <div>
              <strong className="rv1-text" style={{ color: '#1a1a1a' }}>{e.degree}</strong>
              <div className="rv1-company">{e.school}</div>
            </div>
          </div>
        ))}
        <div className="rv1-main-sec-title" style={{ marginTop: 16 }}>Experience</div>
        {d.experience?.map((e, i) => (
          <div key={i} className="rv1-exp-item">
            <div className="rv1-exp-dot" />
            <div>
              <div className="rv1-exp-period">{e.period}</div>
              <strong className="rv1-text" style={{ color: '#1a1a1a' }}>{e.role}</strong>
              <div className="rv1-company">{e.company}</div>
              <p className="rv1-text">{e.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── T2: Dark Header, Two-Column ── */
function T2({ d, initials, themeColor }) {
  return (
    <div className="rv rv2" style={themeVars(themeColor)}>
      <div className="rv2-header">
        <div className="rv2-photo"><span>{initials}</span></div>
        <div className="rv2-header-info">
          <div className="rv2-name">{d.name?.toUpperCase()}</div>
          <div className="rv2-title">{d.title}</div>
          <div className="rv2-contacts">
            <span>📞 {d.phone}</span><span>✉ {d.email}</span><span>📍 {d.location}</span>
            {d.linkedin && <span>🔗 {d.linkedin}</span>}
          </div>
        </div>
      </div>
      <div className="rv2-body">
        <div className="rv2-left">
          <div className="rv2-sec">
            <div className="rv2-sec-title">About Me</div>
            <p className="rv2-text">{d.summary}</p>
          </div>
          <div className="rv2-sec">
            <div className="rv2-sec-title">Skills</div>
            {d.skills?.map((s, i) => (
              <div key={i} className="rv2-skill-row">
                <span className="rv2-skill-name">{s}</span>
                <div className="rv2-skill-bar"><div className="rv2-skill-fill" style={{ width: `${88 - i * 7}%` }} /></div>
              </div>
            ))}
          </div>
          {d.languages?.length > 0 && (
            <div className="rv2-sec">
              <div className="rv2-sec-title">Languages</div>
              {d.languages.map((l, i) => <p key={i} className="rv2-text">{l}</p>)}
            </div>
          )}
          {d.awards?.length > 0 && (
            <div className="rv2-sec">
              <div className="rv2-sec-title">Awards</div>
              {d.awards.map((a, i) => <p key={i} className="rv2-award-item">{a}</p>)}
            </div>
          )}
        </div>
        <div className="rv2-right">
          <div className="rv2-sec">
            <div className="rv2-sec-title">Experience</div>
            {d.experience?.map((e, i) => (
              <div key={i} className="rv2-exp">
                <div className="rv2-exp-period">{e.period}</div>
                <strong className="rv2-text" style={{ color: '#1a1a1a' }}>{e.role}</strong>
                <div className="rv2-company">{e.company}</div>
                <p className="rv2-text">{e.desc}</p>
              </div>
            ))}
          </div>
          <div className="rv2-sec">
            <div className="rv2-sec-title">Education</div>
            {d.education?.map((e, i) => (
              <div key={i} className="rv2-exp">
                <div className="rv2-exp-period">{e.year}</div>
                <strong className="rv2-text" style={{ color: '#1a1a1a' }}>{e.degree}</strong>
                <div className="rv2-company">{e.school}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── T3: Teal Sidebar ── */
function T3({ d, initials, themeColor }) {
  return (
    <div className="rv rv3" style={themeVars(themeColor)}>
      <div className="rv3-sidebar">
        <div className="rv3-photo"><span>{initials}</span></div>
        <div className="rv3-name">{d.name?.toUpperCase()}</div>
        <div className="rv3-title">{d.title}</div>
        <div className="rv3-sec-title">Contact</div>
        <p className="rv3-text">📞 {d.phone}</p>
        <p className="rv3-text">✉ {d.email}</p>
        <p className="rv3-text">📍 {d.location}</p>
        {d.linkedin && <p className="rv3-text">🔗 {d.linkedin}</p>}
        <div className="rv3-sec-title">Education</div>
        {d.education?.map((e, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div className="rv3-text" style={{ fontWeight: 700 }}>{e.school}</div>
            <div className="rv3-text">{e.degree}</div>
            <div className="rv3-muted">{e.year}</div>
          </div>
        ))}
        <div className="rv3-sec-title">Skills</div>
        {d.skills?.map((s, i) => <p key={i} className="rv3-text">• {s}</p>)}
        {d.languages?.length > 0 && <>
          <div className="rv3-sec-title">Languages</div>
          {d.languages.map((l, i) => <p key={i} className="rv3-text">{l}</p>)}
        </>}
        {d.awards?.length > 0 && <>
          <div className="rv3-sec-title">Awards</div>
          {d.awards.map((a, i) => <p key={i} className="rv3-text">• {a}</p>)}
        </>}
      </div>
      <div className="rv3-main">
        <div className="rv3-main-header">
          <div className="rv3-main-name">{d.name?.toUpperCase()}</div>
          <div className="rv3-main-title">{d.title}</div>
        </div>
        <div className="rv3-sec-title-main">Profile</div>
        <p className="rv3-main-text">{d.summary}</p>
        <div className="rv3-sec-title-main">Experience</div>
        {d.experience?.map((e, i) => (
          <div key={i} className="rv3-exp">
            <strong className="rv3-main-text" style={{ color: '#1a1a1a' }}>{e.role}</strong>
            <div className="rv3-company">{e.company} · {e.period}</div>
            <p className="rv3-main-text">{e.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── T4: Orange Header ── */
function T4({ d, initials, themeColor }) {
  return (
    <div className="rv rv4" style={themeVars(themeColor)}>
      <div className="rv4-header">
        <div className="rv4-header-left">
          <div className="rv4-photo"><span>{initials}</span></div>
          <div>
            <div className="rv4-name">{d.name?.toUpperCase()}</div>
            <div className="rv4-title">{d.title?.toUpperCase()}</div>
          </div>
        </div>
        <div className="rv4-header-right">
          <p className="rv4-contact">📞 {d.phone}</p>
          <p className="rv4-contact">✉ {d.email}</p>
          <p className="rv4-contact">📍 {d.location}</p>
          {d.linkedin && <p className="rv4-contact">🔗 {d.linkedin}</p>}
        </div>
      </div>
      <div className="rv4-body">
        <div className="rv4-left">
          <div className="rv4-sec-title">Profile</div>
          <p className="rv4-text">{d.summary}</p>
          <div className="rv4-sec-title">Work Experience</div>
          {d.experience?.map((e, i) => (
            <div key={i} className="rv4-exp">
              <div className="rv4-exp-period">{e.period}</div>
              <strong className="rv4-text" style={{ color: '#1a1a1a' }}>{e.role}</strong>
              <div className="rv4-company">{e.company}</div>
              <p className="rv4-text">{e.desc}</p>
            </div>
          ))}
          {d.awards?.length > 0 && <>
            <div className="rv4-sec-title">Awards</div>
            {d.awards.map((a, i) => <p key={i} className="rv4-award-item">{a}</p>)}
          </>}
        </div>
        <div className="rv4-right">
          <div className="rv4-sec-title">Skills</div>
          {d.skills?.map((s, i) => <p key={i} className="rv4-text">• {s}</p>)}
          <div className="rv4-sec-title">Education</div>
          {d.education?.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <strong className="rv4-text" style={{ color: '#1a1a1a' }}>{e.degree}</strong>
              <div className="rv4-company">{e.school} · {e.year}</div>
            </div>
          ))}
          {d.languages?.length > 0 && <>
            <div className="rv4-sec-title">Languages</div>
            {d.languages.map((l, i) => <p key={i} className="rv4-text">{l}</p>)}
          </>}
        </div>
      </div>
    </div>
  );
}

/* ── T5: Grey Header, Two-Column ── */
function T5({ d, initials, themeColor }) {
  return (
    <div className="rv rv5" style={themeVars(themeColor)}>
      <div className="rv5-header">
        <div className="rv5-photo"><span>{initials}</span></div>
        <div>
          <div className="rv5-name">{d.name?.toUpperCase()}</div>
          <div className="rv5-title">{d.title}</div>
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
          {d.experience?.map((e, i) => (
            <div key={i} className="rv5-exp">
              <div className="rv5-exp-period">{e.period}</div>
              <strong className="rv5-text" style={{ color: '#1a1a1a' }}>{e.role}</strong>
              <div className="rv5-company">{e.company}</div>
              <p className="rv5-text">{e.desc}</p>
            </div>
          ))}
          {d.awards?.length > 0 && <>
            <div className="rv5-sec-title">Awards</div>
            {d.awards.map((a, i) => <p key={i} className="rv5-award-item">{a}</p>)}
          </>}
        </div>
        <div className="rv5-right">
          <div className="rv5-sec-title">Education</div>
          {d.education?.map((e, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <strong className="rv5-text" style={{ color: '#1a1a1a' }}>{e.degree}</strong>
              <div className="rv5-company">{e.school}</div>
              <div className="rv5-muted">{e.year}</div>
            </div>
          ))}
          <div className="rv5-sec-title">Skills</div>
          {d.skills?.map((s, i) => (
            <div key={i} className="rv5-skill-row">
              <span className="rv5-skill-name">{s}</span>
              <div className="rv5-skill-bar"><div className="rv5-skill-fill" style={{ width: `${85 - i * 7}%` }} /></div>
            </div>
          ))}
          {d.languages?.length > 0 && <>
            <div className="rv5-sec-title">Languages</div>
            {d.languages.map((l, i) => <p key={i} className="rv5-text">{l}</p>)}
          </>}
        </div>
      </div>
    </div>
  );
}

/* ── T6: Teal Header ── */
function T6({ d, initials, themeColor }) {
  return (
    <div className="rv rv6" style={themeVars(themeColor)}>
      <div className="rv6-header">
        <div className="rv6-photo"><span>{initials}</span></div>
        <div className="rv6-header-text">
          <div className="rv6-name">{d.name?.toUpperCase()}</div>
          <div className="rv6-title">{d.title}</div>
        </div>
        <div className="rv6-header-contact">
          <p className="rv6-contact">{d.phone}</p>
          <p className="rv6-contact">{d.email}</p>
          <p className="rv6-contact">{d.location}</p>
          {d.linkedin && <p className="rv6-contact">{d.linkedin}</p>}
        </div>
      </div>
      <div className="rv6-body">
        <div className="rv6-left">
          <div className="rv6-sec-title">Profile</div>
          <p className="rv6-text">{d.summary}</p>
          <div className="rv6-sec-title">Skills</div>
          {d.skills?.map((s, i) => <p key={i} className="rv6-text">• {s}</p>)}
          {d.languages?.length > 0 && <>
            <div className="rv6-sec-title">Languages</div>
            {d.languages.map((l, i) => <p key={i} className="rv6-text">{l}</p>)}
          </>}
          {d.awards?.length > 0 && <>
            <div className="rv6-sec-title">Awards</div>
            {d.awards.map((a, i) => <p key={i} className="rv6-award-item">{a}</p>)}
          </>}
        </div>
        <div className="rv6-right">
          <div className="rv6-sec-title">Education</div>
          {d.education?.map((e, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <strong className="rv6-text" style={{ color: '#1a1a1a' }}>{e.school}</strong>
              <div className="rv6-text">{e.degree}</div>
              <div className="rv6-muted">{e.year}</div>
            </div>
          ))}
          <div className="rv6-sec-title">Experience</div>
          {d.experience?.map((e, i) => (
            <div key={i} className="rv6-exp">
              <strong className="rv6-text" style={{ color: '#1a1a1a' }}>{e.role}</strong>
              <div className="rv6-company">{e.company} · {e.period}</div>
              <p className="rv6-text">{e.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── T7: Dark Executive ── */
function T7({ d, initials, themeColor }) {
  return (
    <div className="rv rv7" style={themeVars(themeColor)}>
      <div className="rv7-header">
        <div className="rv7-photo"><span>{initials}</span></div>
        <div>
          <div className="rv7-name">{d.name}</div>
          <div className="rv7-title">{d.title}</div>
          <div className="rv7-contacts">
            <span>✉ {d.email}</span><span>📞 {d.phone}</span><span>📍 {d.location}</span>
            {d.linkedin && <span>🔗 {d.linkedin}</span>}
          </div>
        </div>
      </div>
      <div className="rv7-body">
        <div className="rv7-sec-title">Professional Summary</div>
        <p className="rv7-text">{d.summary}</p>
        <div className="rv7-sec-title">Experience</div>
        {d.experience?.map((e, i) => (
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
            <div className="rv7-sec-title">Education</div>
            {d.education?.map((e, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <strong className="rv7-text">{e.degree}</strong>
                <div className="rv7-company">{e.school} · {e.year}</div>
              </div>
            ))}
            {d.awards?.length > 0 && <>
              <div className="rv7-sec-title">Awards</div>
              {d.awards.map((a, i) => <p key={i} className="rv7-text">• {a}</p>)}
            </>}
          </div>
          <div>
            <div className="rv7-sec-title">Skills</div>
            {d.skills?.map((s, i) => (
              <div key={i} style={{ marginBottom: 5 }}>
                <span className="rv7-text">{s}</span>
                <div style={{ height: 3, background: '#333', borderRadius: 2, marginTop: 2 }}>
                  <div style={{ width: `${90 - i * 8}%`, height: '100%', background: 'var(--tc, #c9a84c)', borderRadius: 2 }} />
                </div>
              </div>
            ))}
            {d.languages?.length > 0 && <>
              <div className="rv7-sec-title">Languages</div>
              {d.languages.map((l, i) => <p key={i} className="rv7-text">{l}</p>)}
            </>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── T8: Purple Creative ── */
function T8({ d, initials, themeColor }) {
  return (
    <div className="rv rv8" style={themeVars(themeColor)}>
      <div className="rv8-sidebar">
        <div className="rv8-photo"><span>{initials}</span></div>
        <div className="rv8-name">{d.name}</div>
        <div className="rv8-title">{d.title}</div>
        <div className="rv8-divider" />
        <div className="rv8-sec-title">Contact</div>
        <p className="rv8-text">✉ {d.email}</p>
        <p className="rv8-text">📞 {d.phone}</p>
        <p className="rv8-text">📍 {d.location}</p>
        {d.linkedin && <p className="rv8-text">🔗 {d.linkedin}</p>}
        <div className="rv8-sec-title">Skills</div>
        {d.skills?.map((s, i) => <p key={i} className="rv8-text">▸ {s}</p>)}
        {d.languages?.length > 0 && <>
          <div className="rv8-sec-title">Languages</div>
          {d.languages.map((l, i) => <p key={i} className="rv8-text">{l}</p>)}
        </>}
        {d.awards?.length > 0 && <>
          <div className="rv8-sec-title">Awards</div>
          {d.awards.map((a, i) => <p key={i} className="rv8-text">★ {a}</p>)}
        </>}
      </div>
      <div className="rv8-main">
        <div className="rv8-sec-title-main">About Me</div>
        <p className="rv8-main-text">{d.summary}</p>
        <div className="rv8-sec-title-main">Experience</div>
        {d.experience?.map((e, i) => (
          <div key={i} className="rv8-exp">
            <div className="rv8-exp-period">{e.period}</div>
            <strong className="rv8-main-text">{e.role}</strong>
            <div className="rv8-company">{e.company}</div>
            <p className="rv8-main-text">{e.desc}</p>
          </div>
        ))}
        <div className="rv8-sec-title-main">Education</div>
        {d.education?.map((e, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <strong className="rv8-main-text">{e.degree}</strong>
            <div className="rv8-company">{e.school} · {e.year}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── T9: Minimal White ── */
function T9({ d, initials, themeColor }) {
  return (
    <div className="rv rv9" style={themeVars(themeColor)}>
      <div className="rv9-header">
        <div className="rv9-name">{d.name}</div>
        <div className="rv9-title">{d.title}</div>
        <div className="rv9-contacts">
          <span>{d.email}</span><span>|</span><span>{d.phone}</span><span>|</span><span>{d.location}</span>
          {d.linkedin && <><span>|</span><span>{d.linkedin}</span></>}
        </div>
        <div className="rv9-divider" />
      </div>
      <div className="rv9-body">
        <div className="rv9-sec-title">Summary</div>
        <p className="rv9-text">{d.summary}</p>
        <div className="rv9-sec-title">Experience</div>
        {d.experience?.map((e, i) => (
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
            <div className="rv9-sec-title">Education</div>
            {d.education?.map((e, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <strong className="rv9-text">{e.degree}</strong>
                <div className="rv9-muted">{e.school} · {e.year}</div>
              </div>
            ))}
            {d.awards?.length > 0 && <>
              <div className="rv9-sec-title">Awards</div>
              {d.awards.map((a, i) => <p key={i} className="rv9-text">• {a}</p>)}
            </>}
          </div>
          <div>
            <div className="rv9-sec-title">Skills</div>
            <div className="rv9-skills-wrap">
              {d.skills?.map((s, i) => <span key={i} className="rv9-skill-tag">{s}</span>)}
            </div>
            {d.languages?.length > 0 && <>
              <div className="rv9-sec-title">Languages</div>
              {d.languages.map((l, i) => <p key={i} className="rv9-text">{l}</p>)}
            </>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── T10: Red Accent ── */
function T10({ d, initials, themeColor }) {
  return (
    <div className="rv rv10" style={themeVars(themeColor)}>
      <div className="rv10-sidebar">
        <div className="rv10-photo"><span>{initials}</span></div>
        <div className="rv10-name">{d.name}</div>
        <div className="rv10-title">{d.title}</div>
        <div className="rv10-sec-title">Contact</div>
        <p className="rv10-text">✉ {d.email}</p>
        <p className="rv10-text">📞 {d.phone}</p>
        <p className="rv10-text">📍 {d.location}</p>
        {d.linkedin && <p className="rv10-text">🔗 {d.linkedin}</p>}
        <div className="rv10-sec-title">Skills</div>
        {d.skills?.map((s, i) => (
          <div key={i} style={{ marginBottom: 5 }}>
            <span className="rv10-text">{s}</span>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.2)', borderRadius: 2, marginTop: 2 }}>
              <div style={{ width: `${90 - i * 8}%`, height: '100%', background: 'var(--tc, #e53e3e)', borderRadius: 2 }} />
            </div>
          </div>
        ))}
        {d.languages?.length > 0 && <>
          <div className="rv10-sec-title">Languages</div>
          {d.languages.map((l, i) => <p key={i} className="rv10-text">{l}</p>)}
        </>}
      </div>
      <div className="rv10-main">
        <div className="rv10-sec-title-main">Profile</div>
        <p className="rv10-main-text">{d.summary}</p>
        <div className="rv10-sec-title-main">Experience</div>
        {d.experience?.map((e, i) => (
          <div key={i} className="rv10-exp">
            <div className="rv10-exp-period">{e.period}</div>
            <strong className="rv10-main-text">{e.role}</strong>
            <div className="rv10-company">{e.company}</div>
            <p className="rv10-main-text">{e.desc}</p>
          </div>
        ))}
        <div className="rv10-sec-title-main">Education</div>
        {d.education?.map((e, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <strong className="rv10-main-text">{e.degree}</strong>
            <div className="rv10-company">{e.school} · {e.year}</div>
          </div>
        ))}
        {d.awards?.length > 0 && <>
          <div className="rv10-sec-title-main">Awards</div>
          {d.awards.map((a, i) => <p key={i} className="rv10-main-text">• {a}</p>)}
        </>}
      </div>
    </div>
  );
}

/* ── T11: Green Nature ── */
function T11({ d, initials, themeColor }) {
  return (
    <div className="rv rv11" style={themeVars(themeColor)}>
      <div className="rv11-header">
        <div className="rv11-photo"><span>{initials}</span></div>
        <div className="rv11-header-text">
          <div className="rv11-name">{d.name}</div>
          <div className="rv11-title">{d.title}</div>
        </div>
        <div className="rv11-header-contact">
          <p className="rv11-contact">✉ {d.email}</p>
          <p className="rv11-contact">📞 {d.phone}</p>
          <p className="rv11-contact">📍 {d.location}</p>
          {d.linkedin && <p className="rv11-contact">🔗 {d.linkedin}</p>}
        </div>
      </div>
      <div className="rv11-body">
        <div className="rv11-left">
          <div className="rv11-sec-title">About</div>
          <p className="rv11-text">{d.summary}</p>
          <div className="rv11-sec-title">Skills</div>
          {d.skills?.map((s, i) => <span key={i} className="rv11-skill-tag">{s}</span>)}
          {d.languages?.length > 0 && <>
            <div className="rv11-sec-title">Languages</div>
            {d.languages.map((l, i) => <p key={i} className="rv11-text">{l}</p>)}
          </>}
          {d.awards?.length > 0 && <>
            <div className="rv11-sec-title">Awards</div>
            {d.awards.map((a, i) => <p key={i} className="rv11-text">🏆 {a}</p>)}
          </>}
        </div>
        <div className="rv11-right">
          <div className="rv11-sec-title">Experience</div>
          {d.experience?.map((e, i) => (
            <div key={i} className="rv11-exp">
              <div className="rv11-exp-period">{e.period}</div>
              <strong className="rv11-text">{e.role}</strong>
              <div className="rv11-company">{e.company}</div>
              <p className="rv11-text">{e.desc}</p>
            </div>
          ))}
          <div className="rv11-sec-title">Education</div>
          {d.education?.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <strong className="rv11-text">{e.degree}</strong>
              <div className="rv11-company">{e.school} · {e.year}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── T12: Navy Classic ── */
function T12({ d, initials, themeColor }) {
  return (
    <div className="rv rv12" style={themeVars(themeColor)}>
      <div className="rv12-top">
        <div className="rv12-photo"><span>{initials}</span></div>
        <div className="rv12-top-text">
          <div className="rv12-name">{d.name}</div>
          <div className="rv12-title">{d.title}</div>
          <div className="rv12-contacts">
            <span>✉ {d.email}</span><span>📞 {d.phone}</span><span>📍 {d.location}</span>
            {d.linkedin && <span>🔗 {d.linkedin}</span>}
          </div>
        </div>
      </div>
      <div className="rv12-body">
        <div className="rv12-left">
          <div className="rv12-sec-title">Summary</div>
          <p className="rv12-text">{d.summary}</p>
          <div className="rv12-sec-title">Education</div>
          {d.education?.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <strong className="rv12-text">{e.degree}</strong>
              <div className="rv12-muted">{e.school} · {e.year}</div>
            </div>
          ))}
          {d.languages?.length > 0 && <>
            <div className="rv12-sec-title">Languages</div>
            {d.languages.map((l, i) => <p key={i} className="rv12-text">{l}</p>)}
          </>}
          {d.awards?.length > 0 && <>
            <div className="rv12-sec-title">Awards</div>
            {d.awards.map((a, i) => <p key={i} className="rv12-text">• {a}</p>)}
          </>}
        </div>
        <div className="rv12-right">
          <div className="rv12-sec-title">Experience</div>
          {d.experience?.map((e, i) => (
            <div key={i} className="rv12-exp">
              <div className="rv12-exp-period">{e.period}</div>
              <strong className="rv12-text">{e.role}</strong>
              <div className="rv12-company">{e.company}</div>
              <p className="rv12-text">{e.desc}</p>
            </div>
          ))}
          <div className="rv12-sec-title">Skills</div>
          <div className="rv12-skills-wrap">
            {d.skills?.map((s, i) => <span key={i} className="rv12-skill-tag">{s}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GeneratedResume;
