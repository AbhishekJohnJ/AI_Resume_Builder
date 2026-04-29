import './TemplatePickerCard.css';
import './GeneratedResume.css';

function GeneratedResume({ data, templateId, themeColor }) {
  const d = data;
  const initials = d.initials || d.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || 'AB';
  const props = { d, initials, themeColor, ds: d.designStyle };
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

/** Build design style class names from designStyle object */
function designClasses(ds) {
  if (!ds) return '';
  const parts = [];
  if (ds.button && ds.button !== 'default') parts.push(`ds-btn-${ds.button}`);
  if (ds.card && ds.card !== 'default') parts.push(`ds-card-${ds.card}`);
  if (ds.background && ds.background !== 'solid') parts.push(`ds-bg-${ds.background}`);
  return parts.join(' ');
}

/**
 * Renders skills list in different styles based on sectionStyle.skills:
 *   'bars' (default) | 'badges' | 'dots' | 'numbered'
 */
function SkillsSection({ skills, style = 'bars', barClass, barFillClass, nameClass, textClass }) {
  if (!skills?.length) return null;
  if (style === 'badges') {
    return (
      <div className="rv-skills-tags">
        {skills.map((s, i) => <span key={i} className="rv-skill-badge">{s}</span>)}
      </div>
    );
  }
  if (style === 'dots') {
    return (
      <div>
        {skills.map((s, i) => (
          <div key={i} className="rv-skill-dot-row">
            <div className="rv-skill-dot" />
            <span className={textClass || 'rv1-text'}>{s}</span>
          </div>
        ))}
      </div>
    );
  }
  if (style === 'numbered') {
    return (
      <div>
        {skills.map((s, i) => (
          <div key={i} className="rv-skill-numbered">
            <span className="rv-skill-num">{String(i + 1).padStart(2, '0')}.</span>
            <span className={textClass || 'rv1-text'}>{s}</span>
          </div>
        ))}
      </div>
    );
  }
  // default: bars
  return (
    <div>
      {skills.map((s, i) => (
        <div key={i} className={barClass || 'rv1-skill-row'}>
          <span className={nameClass || 'rv1-skill-name'}>{s}</span>
          <div className={barClass ? barClass.replace('row', 'bar') : 'rv1-skill-bar'}>
            <div className={barFillClass || 'rv1-skill-fill'} style={{ width: `${90 - i * 8}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Renders experience entries in different styles based on sectionStyle.experience:
 *   'default' | 'timeline' | 'card' | 'compact'
 * All styles support bullet points if exp.bullets array exists.
 */
function ExperienceSection({ experience, style = 'default', periodClass, roleClass, companyClass, textClass }) {
  if (!experience?.length) return null;

  const renderDesc = (e) => {
    if (e.bullets?.length) {
      return (
        <ul className="rv-exp-bullets">
          {e.bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      );
    }
    return <p className={textClass || 'rv1-text'}>{e.desc}</p>;
  };

  if (style === 'timeline') {
    return (
      <div>
        {experience.map((e, i) => (
          <div key={i} className="rv-exp-timeline">
            <div className="rv-exp-timeline-dot" />
            <div className={periodClass || 'rv1-exp-period'}>{e.period}</div>
            <strong className={roleClass || 'rv1-text'} style={{ color: '#1a1a1a' }}>{e.role}</strong>
            <div className={companyClass || 'rv1-company'}>{e.company}</div>
            {renderDesc(e)}
          </div>
        ))}
      </div>
    );
  }
  if (style === 'card') {
    return (
      <div>
        {experience.map((e, i) => (
          <div key={i} className="rv-exp-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
              <strong className={roleClass || 'rv1-text'} style={{ color: '#1a1a1a' }}>{e.role}</strong>
              <span className={periodClass || 'rv1-exp-period'}>{e.period}</span>
            </div>
            <div className={companyClass || 'rv1-company'}>{e.company}</div>
            {renderDesc(e)}
          </div>
        ))}
      </div>
    );
  }
  if (style === 'compact') {
    return (
      <div>
        {experience.map((e, i) => (
          <div key={i} className="rv-exp-compact">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong className={roleClass || 'rv1-text'} style={{ color: '#1a1a1a', fontSize: 10 }}>{e.role} Â· {e.company}</strong>
              <span className={periodClass || 'rv1-exp-period'}>{e.period}</span>
            </div>
            {renderDesc(e)}
          </div>
        ))}
      </div>
    );
  }
  // default
  return (
    <div>
      {experience.map((e, i) => (
        <div key={i} className="rv1-exp-item">
          <div className="rv1-exp-dot" />
          <div>
            <div className={periodClass || 'rv1-exp-period'}>{e.period}</div>
            <strong className={roleClass || 'rv1-text'} style={{ color: '#1a1a1a' }}>{e.role}</strong>
            <div className={companyClass || 'rv1-company'}>{e.company}</div>
            {renderDesc(e)}
          </div>
        </div>
      ))}
    </div>
  );
}

/* â”€â”€ T1: Blue Sidebar â”€â”€ */
function T1({ d, initials, themeColor, ds }) {
  const ss = d.sectionStyle || {};
  return (
    <div className={`rv rv1 ${designClasses(ds)}`} style={themeVars(themeColor)}>
      <div className="rv1-sidebar">
        <div className="rv1-photo"><span>{initials}</span></div>
        <div className="rv1-name">{d.name}</div>
        <div className="rv1-title">{d.title}</div>
        <div className="rv1-divider" />
        <div className="rv1-sec-title">Contact</div>
        <p className="rv1-text">ðŸ“ž {d.phone}</p>
        <p className="rv1-text">âœ‰ {d.email}</p>
        <p className="rv1-text">ðŸ“ {d.location}</p>
        {d.linkedin && <p className="rv1-text">ðŸ”— {d.linkedin}</p>}
        {d.website && <p className="rv1-text">ðŸŒ {d.website}</p>}
        <div className="rv1-sec-title">Skills</div>
        <SkillsSection
          skills={d.skills}
          style={ss.skills || 'bars'}
          barClass="rv1-skill-row"
          barFillClass="rv1-skill-fill"
          nameClass="rv1-skill-name"
          textClass="rv1-text"
        />
        {d.languages?.length > 0 && <>
          <div className="rv1-sec-title">Languages</div>
          {d.languages.map((l, i) => <p key={i} className="rv1-text">{l}</p>)}
        </>}
        {d.awards?.length > 0 && <>
          <div className="rv1-sec-title">Awards</div>
          {d.awards.map((a, i) => <p key={i} className="rv1-text">â€¢ {a}</p>)}
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
        <ExperienceSection
          experience={d.experience}
          style={ss.experience || 'default'}
          periodClass="rv1-exp-period"
          roleClass="rv1-text"
          companyClass="rv1-company"
          textClass="rv1-text"
        />
      </div>
    </div>
  );
}

/* â”€â”€ T2: Dark Header, Two-Column â”€â”€ */
function T2({ d, initials, themeColor, ds }) {
  const ss = d.sectionStyle || {};
  return (
    <div className={`rv rv2 ${designClasses(ds)}`} style={themeVars(themeColor)}>
      <div className="rv2-header">
        <div className="rv2-photo"><span>{initials}</span></div>
        <div className="rv2-header-info">
          <div className="rv2-name">{d.name?.toUpperCase()}</div>
          <div className="rv2-title">{d.title}</div>
          <div className="rv2-contacts">
            <span>ðŸ“ž {d.phone}</span><span>âœ‰ {d.email}</span><span>ðŸ“ {d.location}</span>
            {d.linkedin && <span>ðŸ”— {d.linkedin}</span>}
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
            <SkillsSection skills={d.skills} style={ss.skills || 'bars'} barClass="rv2-skill-row" barFillClass="rv2-skill-fill" nameClass="rv2-skill-name" textClass="rv2-text" />
          </div>
          {d.languages?.length > 0 && <div className="rv2-sec"><div className="rv2-sec-title">Languages</div>{d.languages.map((l, i) => <p key={i} className="rv2-text">{l}</p>)}</div>}
          {d.awards?.length > 0 && <div className="rv2-sec"><div className="rv2-sec-title">Awards</div>{d.awards.map((a, i) => <p key={i} className="rv2-award-item">{a}</p>)}</div>}
        </div>
        <div className="rv2-right">
          <div className="rv2-sec">
            <div className="rv2-sec-title">Experience</div>
            <ExperienceSection experience={d.experience} style={ss.experience || 'default'} periodClass="rv2-exp-period" roleClass="rv2-text" companyClass="rv2-company" textClass="rv2-text" />
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

/* â”€â”€ T3: Teal Sidebar â”€â”€ */
function T3({ d, initials, themeColor, ds }) {
  const ss = d.sectionStyle || {};
  return (
    <div className={`rv rv3 ${designClasses(ds)}`} style={themeVars(themeColor)}>
      <div className="rv3-sidebar">
        <div className="rv3-photo"><span>{initials}</span></div>
        <div className="rv3-name">{d.name?.toUpperCase()}</div>
        <div className="rv3-title">{d.title}</div>
        <div className="rv3-sec-title">Contact</div>
        <p className="rv3-text">ðŸ“ž {d.phone}</p>
        <p className="rv3-text">âœ‰ {d.email}</p>
        <p className="rv3-text">ðŸ“ {d.location}</p>
        {d.linkedin && <p className="rv3-text">ðŸ”— {d.linkedin}</p>}
        <div className="rv3-sec-title">Education</div>
        {d.education?.map((e, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div className="rv3-text" style={{ fontWeight: 700 }}>{e.school}</div>
            <div className="rv3-text">{e.degree}</div>
            <div className="rv3-muted">{e.year}</div>
          </div>
        ))}
        <div className="rv3-sec-title">Skills</div>
        <SkillsSection skills={d.skills} style={ss.skills || 'dots'} textClass="rv3-text" />
        {d.languages?.length > 0 && <><div className="rv3-sec-title">Languages</div>{d.languages.map((l, i) => <p key={i} className="rv3-text">{l}</p>)}</>}
        {d.awards?.length > 0 && <><div className="rv3-sec-title">Awards</div>{d.awards.map((a, i) => <p key={i} className="rv3-text">â€¢ {a}</p>)}</>}
      </div>
      <div className="rv3-main">
        <div className="rv3-main-header">
          <div className="rv3-main-name">{d.name?.toUpperCase()}</div>
          <div className="rv3-main-title">{d.title}</div>
        </div>
        <div className="rv3-sec-title-main">Profile</div>
        <p className="rv3-main-text">{d.summary}</p>
        <div className="rv3-sec-title-main">Experience</div>
        <ExperienceSection experience={d.experience} style={ss.experience || 'default'} periodClass="rv3-company" roleClass="rv3-main-text" companyClass="rv3-company" textClass="rv3-main-text" />
      </div>
    </div>
  );
}

/* â”€â”€ T4: Orange Header â”€â”€ */
function T4({ d, initials, themeColor, ds }) {
  const ss = d.sectionStyle || {};
  return (
    <div className={`rv rv4 ${designClasses(ds)}`} style={themeVars(themeColor)}>
      <div className="rv4-header">
        <div className="rv4-header-left">
          <div className="rv4-photo"><span>{initials}</span></div>
          <div>
            <div className="rv4-name">{d.name?.toUpperCase()}</div>
            <div className="rv4-title">{d.title?.toUpperCase()}</div>
          </div>
        </div>
        <div className="rv4-header-right">
          <p className="rv4-contact">ðŸ“ž {d.phone}</p>
          <p className="rv4-contact">âœ‰ {d.email}</p>
          <p className="rv4-contact">ðŸ“ {d.location}</p>
          {d.linkedin && <p className="rv4-contact">ðŸ”— {d.linkedin}</p>}
        </div>
      </div>
      <div className="rv4-body">
        <div className="rv4-left">
          <div className="rv4-sec-title">Profile</div>
          <p className="rv4-text">{d.summary}</p>
          <div className="rv4-sec-title">Work Experience</div>
          <ExperienceSection experience={d.experience} style={ss.experience || 'default'} periodClass="rv4-exp-period" roleClass="rv4-text" companyClass="rv4-company" textClass="rv4-text" />
          {d.awards?.length > 0 && <><div className="rv4-sec-title">Awards</div>{d.awards.map((a, i) => <p key={i} className="rv4-award-item">{a}</p>)}</>}
        </div>
        <div className="rv4-right">
          <div className="rv4-sec-title">Skills</div>
          <SkillsSection skills={d.skills} style={ss.skills || 'dots'} textClass="rv4-text" />
          <div className="rv4-sec-title">Education</div>
          {d.education?.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <strong className="rv4-text" style={{ color: '#1a1a1a' }}>{e.degree}</strong>
              <div className="rv4-company">{e.school} Â· {e.year}</div>
            </div>
          ))}
          {d.languages?.length > 0 && <><div className="rv4-sec-title">Languages</div>{d.languages.map((l, i) => <p key={i} className="rv4-text">{l}</p>)}</>}
        </div>
      </div>
    </div>
  );
}

/* â”€â”€ T5: Grey Header, Two-Column â”€â”€ */
function T5({ d, initials, themeColor, ds }) {
  const ss = d.sectionStyle || {};
  return (
    <div className={`rv rv5 ${designClasses(ds)}`} style={themeVars(themeColor)}>
      <div className="rv5-header">
        <div className="rv5-photo"><span>{initials}</span></div>
        <div>
          <div className="rv5-name">{d.name?.toUpperCase()}</div>
          <div className="rv5-title">{d.title}</div>
          <div className="rv5-contacts"><span>{d.phone}</span><span>{d.email}</span><span>{d.location}</span></div>
        </div>
      </div>
      <div className="rv5-body">
        <div className="rv5-left">
          <div className="rv5-sec-title">Profile</div>
          <p className="rv5-text">{d.summary}</p>
          <div className="rv5-sec-title">Work Experience</div>
          <ExperienceSection experience={d.experience} style={ss.experience || 'default'} periodClass="rv5-exp-period" roleClass="rv5-text" companyClass="rv5-company" textClass="rv5-text" />
          {d.awards?.length > 0 && <><div className="rv5-sec-title">Awards</div>{d.awards.map((a, i) => <p key={i} className="rv5-award-item">{a}</p>)}</>}
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
          <SkillsSection skills={d.skills} style={ss.skills || 'bars'} barClass="rv5-skill-row" barFillClass="rv5-skill-fill" nameClass="rv5-skill-name" textClass="rv5-text" />
          {d.languages?.length > 0 && <><div className="rv5-sec-title">Languages</div>{d.languages.map((l, i) => <p key={i} className="rv5-text">{l}</p>)}</>}
        </div>
      </div>
    </div>
  );
}

/* â”€â”€ T6: Teal Header â”€â”€ */
function T6({ d, initials, themeColor, ds }) {
  const ss = d.sectionStyle || {};
  return (
    <div className={`rv rv6 ${designClasses(ds)}`} style={themeVars(themeColor)}>
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
          <SkillsSection skills={d.skills} style={ss.skills || 'dots'} textClass="rv6-text" />
          {d.languages?.length > 0 && <><div className="rv6-sec-title">Languages</div>{d.languages.map((l, i) => <p key={i} className="rv6-text">{l}</p>)}</>}
          {d.awards?.length > 0 && <><div className="rv6-sec-title">Awards</div>{d.awards.map((a, i) => <p key={i} className="rv6-award-item">{a}</p>)}</>}
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
          <ExperienceSection experience={d.experience} style={ss.experience || 'default'} periodClass="rv6-company" roleClass="rv6-text" companyClass="rv6-company" textClass="rv6-text" />
        </div>
      </div>
    </div>
  );
}

/* â”€â”€ T7: Dark Executive â”€â”€ */
function T7({ d, initials, themeColor, ds }) {
  const ss = d.sectionStyle || {};
  return (
    <div className={`rv rv7 ${designClasses(ds)}`} style={themeVars(themeColor)}>
      <div className="rv7-header">
        <div className="rv7-photo"><span>{initials}</span></div>
        <div>
          <div className="rv7-name">{d.name}</div>
          <div className="rv7-title">{d.title}</div>
          <div className="rv7-contacts">
            <span>âœ‰ {d.email}</span><span>ðŸ“ž {d.phone}</span><span>ðŸ“ {d.location}</span>
            {d.linkedin && <span>ðŸ”— {d.linkedin}</span>}
          </div>
        </div>
      </div>
      <div className="rv7-body">
        <div className="rv7-sec-title">Professional Summary</div>
        <p className="rv7-text">{d.summary}</p>
        <div className="rv7-sec-title">Experience</div>
        <ExperienceSection experience={d.experience} style={ss.experience || 'default'} periodClass="rv7-period" roleClass="rv7-text" companyClass="rv7-company" textClass="rv7-text" />
        <div className="rv7-two-col">
          <div>
            <div className="rv7-sec-title">Education</div>
            {d.education?.map((e, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <strong className="rv7-text">{e.degree}</strong>
                <div className="rv7-company">{e.school} Â· {e.year}</div>
              </div>
            ))}
            {d.awards?.length > 0 && <><div className="rv7-sec-title">Awards</div>{d.awards.map((a, i) => <p key={i} className="rv7-text">â€¢ {a}</p>)}</>}
          </div>
          <div>
            <div className="rv7-sec-title">Skills</div>
            <SkillsSection skills={d.skills} style={ss.skills || 'bars'} barClass="rv7-skill-row" barFillClass="rv7-skill-fill" nameClass="rv7-text" textClass="rv7-text" />
            {d.languages?.length > 0 && <><div className="rv7-sec-title">Languages</div>{d.languages.map((l, i) => <p key={i} className="rv7-text">{l}</p>)}</>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* â”€â”€ T8: Purple Creative â”€â”€ */
function T8({ d, initials, themeColor, ds }) {
  const ss = d.sectionStyle || {};
  return (
    <div className={`rv rv8 ${designClasses(ds)}`} style={themeVars(themeColor)}>
      <div className="rv8-sidebar">
        <div className="rv8-photo"><span>{initials}</span></div>
        <div className="rv8-name">{d.name}</div>
        <div className="rv8-title">{d.title}</div>
        <div className="rv8-divider" />
        <div className="rv8-sec-title">Contact</div>
        <p className="rv8-text">âœ‰ {d.email}</p>
        <p className="rv8-text">ðŸ“ž {d.phone}</p>
        <p className="rv8-text">ðŸ“ {d.location}</p>
        {d.linkedin && <p className="rv8-text">ðŸ”— {d.linkedin}</p>}
        <div className="rv8-sec-title">Skills</div>
        <SkillsSection skills={d.skills} style={ss.skills || 'dots'} textClass="rv8-text" />
        {d.languages?.length > 0 && <><div className="rv8-sec-title">Languages</div>{d.languages.map((l, i) => <p key={i} className="rv8-text">{l}</p>)}</>}
        {d.awards?.length > 0 && <><div className="rv8-sec-title">Awards</div>{d.awards.map((a, i) => <p key={i} className="rv8-text">â˜… {a}</p>)}</>}
      </div>
      <div className="rv8-main">
        <div className="rv8-sec-title-main">About Me</div>
        <p className="rv8-main-text">{d.summary}</p>
        <div className="rv8-sec-title-main">Experience</div>
        <ExperienceSection experience={d.experience} style={ss.experience || 'default'} periodClass="rv8-exp-period" roleClass="rv8-main-text" companyClass="rv8-company" textClass="rv8-main-text" />
        <div className="rv8-sec-title-main">Education</div>
        {d.education?.map((e, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <strong className="rv8-main-text">{e.degree}</strong>
            <div className="rv8-company">{e.school} Â· {e.year}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* â”€â”€ T9: Minimal White â”€â”€ */
function T9({ d, initials, themeColor, ds }) {
  const ss = d.sectionStyle || {};
  return (
    <div className={`rv rv9 ${designClasses(ds)}`} style={themeVars(themeColor)}>
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
        <ExperienceSection experience={d.experience} style={ss.experience || 'default'} periodClass="rv9-period" roleClass="rv9-text" companyClass="rv9-muted" textClass="rv9-text" />
        <div className="rv9-two-col">
          <div>
            <div className="rv9-sec-title">Education</div>
            {d.education?.map((e, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <strong className="rv9-text">{e.degree}</strong>
                <div className="rv9-muted">{e.school} Â· {e.year}</div>
              </div>
            ))}
            {d.awards?.length > 0 && <><div className="rv9-sec-title">Awards</div>{d.awards.map((a, i) => <p key={i} className="rv9-text">â€¢ {a}</p>)}</>}
          </div>
          <div>
            <div className="rv9-sec-title">Skills</div>
            <SkillsSection skills={d.skills} style={ss.skills || 'badges'} textClass="rv9-text" />
            {d.languages?.length > 0 && <><div className="rv9-sec-title">Languages</div>{d.languages.map((l, i) => <p key={i} className="rv9-text">{l}</p>)}</>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* â”€â”€ T10: Red Accent â”€â”€ */
function T10({ d, initials, themeColor, ds }) {
  const ss = d.sectionStyle || {};
  return (
    <div className={`rv rv10 ${designClasses(ds)}`} style={themeVars(themeColor)}>
      <div className="rv10-sidebar">
        <div className="rv10-photo"><span>{initials}</span></div>
        <div className="rv10-name">{d.name}</div>
        <div className="rv10-title">{d.title}</div>
        <div className="rv10-sec-title">Contact</div>
        <p className="rv10-text">âœ‰ {d.email}</p>
        <p className="rv10-text">ðŸ“ž {d.phone}</p>
        <p className="rv10-text">ðŸ“ {d.location}</p>
        {d.linkedin && <p className="rv10-text">ðŸ”— {d.linkedin}</p>}
        <div className="rv10-sec-title">Skills</div>
        <SkillsSection skills={d.skills} style={ss.skills || 'bars'} barClass="rv10-skill-row" barFillClass="rv10-skill-fill" nameClass="rv10-text" textClass="rv10-text" />
        {d.languages?.length > 0 && <><div className="rv10-sec-title">Languages</div>{d.languages.map((l, i) => <p key={i} className="rv10-text">{l}</p>)}</>}
      </div>
      <div className="rv10-main">
        <div className="rv10-sec-title-main">Profile</div>
        <p className="rv10-main-text">{d.summary}</p>
        <div className="rv10-sec-title-main">Experience</div>
        <ExperienceSection experience={d.experience} style={ss.experience || 'default'} periodClass="rv10-exp-period" roleClass="rv10-main-text" companyClass="rv10-company" textClass="rv10-main-text" />
        <div className="rv10-sec-title-main">Education</div>
        {d.education?.map((e, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <strong className="rv10-main-text">{e.degree}</strong>
            <div className="rv10-company">{e.school} Â· {e.year}</div>
          </div>
        ))}
        {d.awards?.length > 0 && <><div className="rv10-sec-title-main">Awards</div>{d.awards.map((a, i) => <p key={i} className="rv10-main-text">â€¢ {a}</p>)}</>}
      </div>
    </div>
  );
}

/* â”€â”€ T11: Green Nature â”€â”€ */
function T11({ d, initials, themeColor, ds }) {
  const ss = d.sectionStyle || {};
  return (
    <div className={`rv rv11 ${designClasses(ds)}`} style={themeVars(themeColor)}>
      <div className="rv11-header">
        <div className="rv11-photo"><span>{initials}</span></div>
        <div className="rv11-header-text">
          <div className="rv11-name">{d.name}</div>
          <div className="rv11-title">{d.title}</div>
        </div>
        <div className="rv11-header-contact">
          <p className="rv11-contact">âœ‰ {d.email}</p>
          <p className="rv11-contact">ðŸ“ž {d.phone}</p>
          <p className="rv11-contact">ðŸ“ {d.location}</p>
          {d.linkedin && <p className="rv11-contact">ðŸ”— {d.linkedin}</p>}
        </div>
      </div>
      <div className="rv11-body">
        <div className="rv11-left">
          <div className="rv11-sec-title">About</div>
          <p className="rv11-text">{d.summary}</p>
          <div className="rv11-sec-title">Skills</div>
          <SkillsSection skills={d.skills} style={ss.skills || 'badges'} textClass="rv11-text" />
          {d.languages?.length > 0 && <><div className="rv11-sec-title">Languages</div>{d.languages.map((l, i) => <p key={i} className="rv11-text">{l}</p>)}</>}
          {d.awards?.length > 0 && <><div className="rv11-sec-title">Awards</div>{d.awards.map((a, i) => <p key={i} className="rv11-text">ðŸ† {a}</p>)}</>}
        </div>
        <div className="rv11-right">
          <div className="rv11-sec-title">Experience</div>
          <ExperienceSection experience={d.experience} style={ss.experience || 'default'} periodClass="rv11-exp-period" roleClass="rv11-text" companyClass="rv11-company" textClass="rv11-text" />
          <div className="rv11-sec-title">Education</div>
          {d.education?.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <strong className="rv11-text">{e.degree}</strong>
              <div className="rv11-company">{e.school} Â· {e.year}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* â”€â”€ T12: Navy Classic â”€â”€ */
function T12({ d, initials, themeColor, ds }) {
  const ss = d.sectionStyle || {};
  return (
    <div className={`rv rv12 ${designClasses(ds)}`} style={themeVars(themeColor)}>
      <div className="rv12-top">
        <div className="rv12-photo"><span>{initials}</span></div>
        <div className="rv12-top-text">
          <div className="rv12-name">{d.name}</div>
          <div className="rv12-title">{d.title}</div>
          <div className="rv12-contacts">
            <span>âœ‰ {d.email}</span><span>ðŸ“ž {d.phone}</span><span>ðŸ“ {d.location}</span>
            {d.linkedin && <span>ðŸ”— {d.linkedin}</span>}
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
              <div className="rv12-muted">{e.school} Â· {e.year}</div>
            </div>
          ))}
          {d.languages?.length > 0 && <><div className="rv12-sec-title">Languages</div>{d.languages.map((l, i) => <p key={i} className="rv12-text">{l}</p>)}</>}
          {d.awards?.length > 0 && <><div className="rv12-sec-title">Awards</div>{d.awards.map((a, i) => <p key={i} className="rv12-text">â€¢ {a}</p>)}</>}
        </div>
        <div className="rv12-right">
          <div className="rv12-sec-title">Experience</div>
          <ExperienceSection experience={d.experience} style={ss.experience || 'default'} periodClass="rv12-exp-period" roleClass="rv12-text" companyClass="rv12-company" textClass="rv12-text" />
          <div className="rv12-sec-title">Skills</div>
          <SkillsSection skills={d.skills} style={ss.skills || 'badges'} textClass="rv12-text" />
        </div>
      </div>
    </div>
  );
}

export default GeneratedResume;

