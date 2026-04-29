/**
 * Theme color parser â€” supports two modes:
 *
 * 1. Single-color:  "change theme to red"
 *                   "make the template blue"
 *    â†’ sets --tc, --tc-dark, --tc-light, --tc-accent
 *
 * 2. Multi-target:  "instead of black background make it white, instead of green text make it red"
 *                   "make background white and text red"
 *                   "change the header to navy, text to white"
 *    â†’ sets specific CSS vars: --bg, --bg-2, --text, --text-muted, --tc, etc.
 *
 * CSS vars used in Portfolio.css:
 *   --tc          primary accent (logo, buttons, borders, skill tags, section titles)
 *   --tc-dark     darker accent  (sidebar bg, gradients)
 *   --tc-light    light tint     (skill tag bg, card borders)
 *   --tc-accent   lighter accent (subtitles, tech tags)
 *   --bg          main page background
 *   --bg-2        secondary bg   (sidebar, header, cards, skills bar)
 *   --text        main text color
 *   --text-muted  muted / secondary text
 */

// â”€â”€ Color name â†’ hex â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const COLOR_HEX = {
  green:   '#16a34a', emerald: '#059669', teal:    '#0d9488', lime:    '#65a30d',
  blue:    '#2563eb', navy:    '#1e3a5f', sky:     '#0284c7', indigo:  '#4338ca',
  purple:  '#7c3aed', violet:  '#7c3aed',
  red:     '#dc2626', rose:    '#e11d48', pink:    '#db2777', crimson: '#dc143c',
  orange:  '#ea580c', amber:   '#d97706', yellow:  '#ca8a04', gold:    '#c9a84c',
  gray:    '#4b5563', grey:    '#4b5563', slate:   '#475569',
  black:   '#0d0d0d', white:   '#ffffff',
  brown:   '#92400e', maroon:  '#7f1d1d', cyan:    '#0891b2',
};

// â”€â”€ Full palette for single-color mode â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const COLOR_MAP = {
  green:   { main: '#16a34a', dark: '#14532d', light: '#dcfce7', accent: '#4ade80' },
  emerald: { main: '#059669', dark: '#064e3b', light: '#d1fae5', accent: '#34d399' },
  teal:    { main: '#0d9488', dark: '#134e4a', light: '#ccfbf1', accent: '#2dd4bf' },
  lime:    { main: '#65a30d', dark: '#365314', light: '#ecfccb', accent: '#a3e635' },
  blue:    { main: '#2563eb', dark: '#1e3a8a', light: '#dbeafe', accent: '#60a5fa' },
  navy:    { main: '#1e3a5f', dark: '#0f172a', light: '#e0f2fe', accent: '#93c5fd' },
  sky:     { main: '#0284c7', dark: '#0c4a6e', light: '#e0f2fe', accent: '#38bdf8' },
  indigo:  { main: '#4338ca', dark: '#1e1b4b', light: '#e0e7ff', accent: '#818cf8' },
  purple:  { main: '#7c3aed', dark: '#4c1d95', light: '#ede9fe', accent: '#a78bfa' },
  violet:  { main: '#7c3aed', dark: '#4c1d95', light: '#ede9fe', accent: '#a78bfa' },
  red:     { main: '#dc2626', dark: '#7f1d1d', light: '#fee2e2', accent: '#f87171' },
  rose:    { main: '#e11d48', dark: '#881337', light: '#ffe4e6', accent: '#fb7185' },
  pink:    { main: '#db2777', dark: '#831843', light: '#fce7f3', accent: '#f472b6' },
  crimson: { main: '#dc143c', dark: '#7f1d1d', light: '#fee2e2', accent: '#f87171' },
  orange:  { main: '#ea580c', dark: '#7c2d12', light: '#ffedd5', accent: '#fb923c' },
  amber:   { main: '#d97706', dark: '#78350f', light: '#fef3c7', accent: '#fbbf24' },
  yellow:  { main: '#ca8a04', dark: '#713f12', light: '#fef9c3', accent: '#facc15' },
  gold:    { main: '#c9a84c', dark: '#78350f', light: '#fef3c7', accent: '#fbbf24' },
  gray:    { main: '#4b5563', dark: '#1f2937', light: '#f3f4f6', accent: '#9ca3af' },
  grey:    { main: '#4b5563', dark: '#1f2937', light: '#f3f4f6', accent: '#9ca3af' },
  slate:   { main: '#475569', dark: '#1e293b', light: '#f1f5f9', accent: '#94a3b8' },
  black:   { main: '#1a1a1a', dark: '#000000', light: '#f5f5f5', accent: '#555555' },
  white:   { main: '#e5e7eb', dark: '#9ca3af', light: '#ffffff', accent: '#d1d5db' },
  brown:   { main: '#92400e', dark: '#451a03', light: '#fef3c7', accent: '#d97706' },
  maroon:  { main: '#7f1d1d', dark: '#450a0a', light: '#fee2e2', accent: '#ef4444' },
  cyan:    { main: '#0891b2', dark: '#164e63', light: '#cffafe', accent: '#22d3ee' },
};

// â”€â”€ Target keyword groups â†’ CSS vars â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Order matters: more specific entries first
const TARGET_MAP = [
  { words: ['sidebar background', 'sidebar bg', 'header background', 'header bg',
            'card background', 'card bg', 'section background', 'panel background',
            'secondary background', 'secondary bg', 'nav background', 'navbar background'],
    vars: ['--bg-2'] },
  { words: ['background', 'bg', 'backdrop', 'page background'],
    vars: ['--bg'] },
  { words: ['muted text', 'secondary text', 'subtitle', 'subtext', 'description text',
            'paragraph', 'body text'],
    vars: ['--text-muted'] },
  { words: ['text', 'font color', 'font colour', 'content color', 'content colour'],
    vars: ['--text'] },
  { words: ['logo', 'brand', 'site name', 'brand name'],
    vars: ['--tc'] },
  { words: ['header', 'nav', 'navbar', 'navigation', 'top bar'],
    vars: ['--bg-2'] },
  { words: ['button', 'btn', 'cta', 'call to action'],
    vars: ['--tc'] },
  { words: ['accent', 'highlight', 'primary color', 'primary colour', 'theme color', 'theme colour'],
    vars: ['--tc', '--tc-dark', '--tc-light', '--tc-accent'] },
  { words: ['skill', 'tag', 'badge', 'chip', 'pill'],
    vars: ['--tc', '--tc-light'] },
  { words: ['border', 'divider', 'line', 'separator'],
    vars: ['--tc-light'] },
  { words: ['title', 'heading', 'section title'],
    vars: ['--tc'] },
  { words: ['link'],
    vars: ['--tc'] },
];

const COLOR_NAMES = Object.keys(COLOR_HEX);

// â”€â”€ Template default color roles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Maps template ID â†’ color family â†’ which CSS vars use that color by default
const TEMPLATE_COLOR_ROLES = {
  1: { // Dark Hacker: green accent, black/dark bg, light text
    green:   ['--tc', '--tc-accent', '--tc-light'],
    black:   ['--bg', '--bg-2'],
    white:   ['--text'],
    gray:    ['--text-muted'],
  },
  2: { // Clean Minimal Light: indigo/purple accent, white bg, dark text
    indigo:  ['--tc', '--tc-accent', '--tc-light'],
    purple:  ['--tc', '--tc-accent', '--tc-light'],
    white:   ['--bg', '--bg-2'],
    black:   ['--text'],
    gray:    ['--text-muted'],
  },
  3: { // Vibrant Gradient Creative: purple/blue gradient, white bg
    purple:  ['--tc', '--tc-dark', '--tc-accent', '--tc-light'],
    blue:    ['--tc', '--tc-dark', '--tc-accent', '--tc-light'],
    white:   ['--bg'],
    black:   ['--text'],
    gray:    ['--text-muted'],
  },
  4: { // Navy Executive: blue accent, dark navy bg
    blue:    ['--tc', '--tc-accent'],
    navy:    ['--bg', '--bg-2'],
    white:   ['--text'],
    gray:    ['--text-muted'],
    black:   ['--bg', '--bg-2'],
  },
  5: { // Sunset Bold: orange/red gradient, white bg
    orange:  ['--tc', '--tc-dark', '--tc-accent', '--tc-light'],
    red:     ['--tc', '--tc-dark', '--tc-accent', '--tc-light'],
    white:   ['--bg'],
    black:   ['--text'],
    gray:    ['--text-muted'],
  },
  6: { // Glass Dark: purple accent, near-black bg
    purple:  ['--tc', '--tc-dark', '--tc-accent', '--tc-light'],
    violet:  ['--tc', '--tc-dark', '--tc-accent', '--tc-light'],
    black:   ['--bg'],
    white:   ['--text'],
    gray:    ['--text-muted'],
  },
  7: { // Rose Minimal: rose/pink accent, white bg
    rose:    ['--tc', '--tc-dark', '--tc-accent', '--tc-light'],
    pink:    ['--tc', '--tc-dark', '--tc-accent', '--tc-light'],
    red:     ['--tc', '--tc-dark', '--tc-accent', '--tc-light'],
    white:   ['--bg', '--bg-2'],
    black:   ['--text'],
    gray:    ['--text-muted'],
  },
  8: { // Emerald Split: emerald/teal accent, dark sidebar
    emerald: ['--tc', '--tc-dark', '--tc-accent', '--tc-light'],
    green:   ['--tc', '--tc-dark', '--tc-accent', '--tc-light'],
    teal:    ['--tc', '--tc-dark', '--tc-accent', '--tc-light'],
    black:   ['--bg-2'],
    white:   ['--bg', '--text'],
    gray:    ['--text-muted'],
  },
};

// Color family aliases â€” maps any color name to a "family" key used in TEMPLATE_COLOR_ROLES
const COLOR_FAMILY = {
  green: 'green', lime: 'green', emerald: 'emerald', teal: 'teal',
  blue: 'blue', sky: 'blue', navy: 'navy', indigo: 'indigo',
  purple: 'purple', violet: 'violet',
  red: 'red', crimson: 'red', maroon: 'red',
  rose: 'rose', pink: 'pink',
  orange: 'orange', amber: 'orange',
  yellow: 'yellow', gold: 'yellow',
  gray: 'gray', grey: 'gray', slate: 'gray',
  black: 'black', white: 'white',
  brown: 'brown', cyan: 'cyan',
};

const INTENT_KEYWORDS = [
  'change', 'switch', 'set', 'make', 'use', 'apply', 'update',
  'colour', 'color', 'theme', 'instead', 'replace', 'turn', 'convert',
];

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function darken(hex, amount = 0.35) {
  const { r, g, b } = hexToRgb(hex);
  return `#${[r, g, b].map(c => Math.max(0, Math.round(c * (1 - amount))).toString(16).padStart(2, '0')).join('')}`;
}

function lighten(hex, amount = 0.75) {
  const { r, g, b } = hexToRgb(hex);
  return `#${[r, g, b].map(c => Math.min(255, Math.round(c + (255 - c) * amount)).toString(16).padStart(2, '0')).join('')}`;
}

function buildPalette(colorName) {
  if (COLOR_MAP[colorName]) return COLOR_MAP[colorName];
  const hex = COLOR_HEX[colorName];
  if (!hex) return null;
  return { main: hex, dark: darken(hex), light: lighten(hex), accent: lighten(hex, 0.4) };
}

/** Find ALL color names in a text, returning [{name, index}] sorted by position */
function findAllColors(text) {
  const results = [];
  for (const name of COLOR_NAMES) {
    const re = new RegExp(`\\b${name}\\b`, 'gi');
    let m;
    while ((m = re.exec(text)) !== null) {
      results.push({ name, index: m.index });
    }
  }
  return results.sort((a, b) => a.index - b.index);
}

/** Find which target group a clause refers to */
function findTarget(clause) {
  for (const entry of TARGET_MAP) {
    for (const word of entry.words) {
      if (clause.includes(word)) return entry.vars;
    }
  }
  return null;
}

/**
 * Parse a single clause like:
 *   "instead of black background make it white"
 *   "make the background white"
 *   "background to white"
 *   "change text to red"
 *
 * Returns { vars: [...], color: hex } or null
 */
function parseClause(clause) {
  const colors = findAllColors(clause);
  if (colors.length === 0) return null;

  const targetVars = findTarget(clause);

  // "instead of X <target> make it Y" or "instead of X <target> use Y"
  // â†’ X is old (ignore), Y is new color
  const insteadMatch = clause.match(/instead\s+of\s+\w+\s+([\w\s]+?)\s+(?:make\s+it|use|to|with)\s+(\w+)/);
  if (insteadMatch) {
    const targetWord = insteadMatch[1].trim();
    const newColorName = insteadMatch[2].trim();
    const newHex = COLOR_HEX[newColorName];
    if (newHex) {
      // Find target from the middle word
      const vars = findTarget(targetWord) || targetVars;
      if (vars) return { vars, color: newHex };
    }
  }

  // "X to Y" or "X into Y" pattern â€” last color is the new one
  if (colors.length >= 2) {
    // The LAST color mentioned is the new value
    const newColor = colors[colors.length - 1];
    const newHex = COLOR_HEX[newColor.name];
    if (targetVars && newHex) return { vars: targetVars, color: newHex };
    // Try to infer target from text between colors
    const between = clause.slice(colors[0].index + colors[0].name.length, newColor.index);
    const inferredVars = findTarget(between) || targetVars;
    if (inferredVars && newHex) return { vars: inferredVars, color: newHex };
  }

  // Single color + target
  if (colors.length === 1 && targetVars) {
    return { vars: targetVars, color: COLOR_HEX[colors[0].name] };
  }

  return null;
}

// â”€â”€ Public API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Returns true if the prompt is purely a color-change command (no resume/portfolio content).
 */
export function isColorChangeOnly(prompt) {
  if (!prompt) return false;
  const lower = prompt.trim().toLowerCase();
  const hasIntent = INTENT_KEYWORDS.some(kw => lower.includes(kw));
  const hasColor = COLOR_NAMES.some(c => new RegExp(`\\b${c}\\b`).test(lower));
  return hasIntent && hasColor && lower.length < 160;
}

/**
 * Parses "replace all X with Y" / "replace X colour with Y" patterns.
 * Returns a themeColor-compatible object with CSS var overrides, or null.
 *
 * @param {string} prompt
 * @param {number} templateId  â€” 1-8, used to look up which vars map to which color family
 */
export function parseColorReplace(prompt, templateId) {
  if (!prompt) return null;
  const lower = prompt.toLowerCase();

  // Must contain "replace" to use this parser
  if (!lower.includes('replace')) return null;

  const roles = TEMPLATE_COLOR_ROLES[templateId] || {};
  const overrides = {};

  // Match patterns like:
  //   "replace all green with red"
  //   "replace green colour with red"
  //   "replace all black color with white"
  //   "replace the green with red"
  //   "replace green colour by red"
  //   "replace green to red"
  const replaceRe = /replace\s+(?:all\s+|the\s+)?(\w+)(?:\s+colou?r)?\s+(?:with|by|to)\s+(\w+)/gi;
  let match;
  while ((match = replaceRe.exec(lower)) !== null) {
    const fromName = match[1].trim();
    const toName   = match[2].trim();
    const toHex    = COLOR_HEX[toName];
    if (!toHex) continue;

    // Find which CSS vars the "from" color controls in this template
    const family = COLOR_FAMILY[fromName] || fromName;
    const vars = roles[family] || roles[fromName];
    if (!vars) continue;

    vars.forEach(v => { overrides[v] = toHex; });
  }

  if (Object.keys(overrides).length === 0) return null;

  // Build a full palette object compatible with themeColor
  const tcHex = overrides['--tc'];
  const base = tcHex
    ? { main: tcHex, dark: darken(tcHex), light: lighten(tcHex), accent: lighten(tcHex, 0.4) }
    : { main: '#667eea', dark: '#4c1d95', light: '#ede9fe', accent: '#a78bfa' };

  return {
    main:   overrides['--tc']        || base.main,
    dark:   overrides['--tc-dark']   || base.dark,
    light:  overrides['--tc-light']  || base.light,
    accent: overrides['--tc-accent'] || base.accent,
    ...overrides,
  };
}

/**
 * Parses a prompt and returns a themeColor object, or null if no color intent.
 *
 * Single-color result:  { main, dark, light, accent }
 * Multi-target result:  { main, dark, light, accent, '--bg': '#fff', '--text': '#dc2626', ... }
 */
export function parseThemeColor(prompt) {
  if (!prompt) return null;
  const lower = prompt.toLowerCase();

  const hasIntent = INTENT_KEYWORDS.some(kw => lower.includes(kw));
  if (!hasIntent) return null;

  // â”€â”€ Multi-target parsing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Split on commas, semicolons, "and", "also", "but"
  const clauses = lower.split(/,|;|\band\b|\balso\b|\bbut\b/);
  const overrides = {};
  let hasMultiTarget = false;

  for (const clause of clauses) {
    const result = parseClause(clause.trim());
    if (result) {
      result.vars.forEach(v => { overrides[v] = result.color; });
      hasMultiTarget = true;
    }
  }

  if (hasMultiTarget && Object.keys(overrides).length > 0) {
    // Derive a base palette from the first --tc override or first color in prompt
    const tcHex = overrides['--tc'];
    const firstColorName = findAllColors(lower)[0]?.name;
    const base = tcHex
      ? { main: tcHex, dark: darken(tcHex), light: lighten(tcHex), accent: lighten(tcHex, 0.4) }
      : (firstColorName ? buildPalette(firstColorName) : null)
        || { main: '#667eea', dark: '#4c1d95', light: '#ede9fe', accent: '#a78bfa' };

    return {
      main:   overrides['--tc']       || base.main,
      dark:   overrides['--tc-dark']  || base.dark,
      light:  overrides['--tc-light'] || base.light,
      accent: overrides['--tc-accent']|| base.accent,
      ...overrides,
    };
  }

  // â”€â”€ Single-color fallback â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const colors = findAllColors(lower);
  if (colors.length === 0) return null;
  return buildPalette(colors[0].name);
}

