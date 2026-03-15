import './TemplatePickerCard.css';
import './GeneratedResume.css';

function GeneratedResume({ data, templateId }) {
  const d = data;
  const initials = d.initials || d.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || 'AB';
  if (templateId === 1) return <T1 d={d} initials={initials} />;
  if (templateId === 2) return <T2 d={d} initials={initials} />;
  if (templateId === 3) return <T3 d={d} initials={initials} />;
  if (templateId === 4) return <T4 d={d} initials={initials} />;
  if (templateId === 5) return <T5 d={d} initials={initials} />;
  if (templateId === 6) return <T6 d={d} initials={initials} />;
  return <T1 d={d} initials={initials} />;
}

/* ── T1: Blue Sidebar ── */
function T1({ d, initials }) {
  return (
    <div className="rv rv1">
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
function T2({ d, initials }) {
  return (
    <div className="rv rv2">
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
function T3({ d, initials }) {
  return (
    <div className="rv rv3">
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
function T4({ d, initials }) {
  return (
    <div className="rv rv4">
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
function T5({ d, initials }) {
  return (
    <div className="rv rv5">
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
function T6({ d, initials }) {
  return (
    <div className="rv rv6">
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

export default GeneratedResume;
