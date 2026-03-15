/**
 * Parses a user prompt and extracts a theme color if mentioned.
 * Returns an object with hex values for the theme, or null if no color found.
 *
 * Usage: parseThemeColor("change the theme colour to green")
 * Returns: { main: '#16a34a', dark: '#14532d', light: '#dcfce7', accent: '#4ade80' }
 */

const COLOR_MAP = {
  // Greens
  green:       { main: '#16a34a', dark: '#14532d', light: '#dcfce7', accent: '#4ade80' },
  emerald:     { main: '#059669', dark: '#064e3b', light: '#d1fae5', accent: '#34d399' },
  teal:        { main: '#0d9488', dark: '#134e4a', light: '#ccfbf1', accent: '#2dd4bf' },
  lime:        { main: '#65a30d', dark: '#365314', light: '#ecfccb', accent: '#a3e635' },
  // Blues
  blue:        { main: '#2563eb', dark: '#1e3a8a', light: '#dbeafe', accent: '#60a5fa' },
  navy:        { main: '#1e3a5f', dark: '#0f172a', light: '#e0f2fe', accent: '#93c5fd' },
  sky:         { main: '#0284c7', dark: '#0c4a6e', light: '#e0f2fe', accent: '#38bdf8' },
  indigo:      { main: '#4338ca', dark: '#1e1b4b', light: '#e0e7ff', accent: '#818cf8' },
  // Purples
  purple:      { main: '#7c3aed', dark: '#4c1d95', light: '#ede9fe', accent: '#a78bfa' },
  violet:      { main: '#7c3aed', dark: '#4c1d95', light: '#ede9fe', accent: '#a78bfa' },
  // Reds / Pinks
  red:         { main: '#dc2626', dark: '#7f1d1d', light: '#fee2e2', accent: '#f87171' },
  rose:        { main: '#e11d48', dark: '#881337', light: '#ffe4e6', accent: '#fb7185' },
  pink:        { main: '#db2777', dark: '#831843', light: '#fce7f3', accent: '#f472b6' },
  crimson:     { main: '#dc143c', dark: '#7f1d1d', light: '#fee2e2', accent: '#f87171' },
  // Oranges / Yellows
  orange:      { main: '#ea580c', dark: '#7c2d12', light: '#ffedd5', accent: '#fb923c' },
  amber:       { main: '#d97706', dark: '#78350f', light: '#fef3c7', accent: '#fbbf24' },
  yellow:      { main: '#ca8a04', dark: '#713f12', light: '#fef9c3', accent: '#facc15' },
  gold:        { main: '#c9a84c', dark: '#78350f', light: '#fef3c7', accent: '#fbbf24' },
  // Neutrals
  gray:        { main: '#4b5563', dark: '#1f2937', light: '#f3f4f6', accent: '#9ca3af' },
  grey:        { main: '#4b5563', dark: '#1f2937', light: '#f3f4f6', accent: '#9ca3af' },
  slate:       { main: '#475569', dark: '#1e293b', light: '#f1f5f9', accent: '#94a3b8' },
  black:       { main: '#1a1a1a', dark: '#000000', light: '#f5f5f5', accent: '#555555' },
  white:       { main: '#e5e7eb', dark: '#9ca3af', light: '#ffffff', accent: '#d1d5db' },
  // Browns
  brown:       { main: '#92400e', dark: '#451a03', light: '#fef3c7', accent: '#d97706' },
  maroon:      { main: '#7f1d1d', dark: '#450a0a', light: '#fee2e2', accent: '#ef4444' },
  // Cyans
  cyan:        { main: '#0891b2', dark: '#164e63', light: '#cffafe', accent: '#22d3ee' },
};

/**
 * @param {string} prompt
 * @returns {{ main: string, dark: string, light: string, accent: string } | null}
 */
export function parseThemeColor(prompt) {
  if (!prompt) return null;
  const lower = prompt.toLowerCase();

  // Match patterns like:
  // "change theme colour to green", "make it blue", "use red theme",
  // "theme color: purple", "set color to orange"
  const colorPattern = new RegExp(
    `(?:theme|color|colour|change|make|set|use|switch).*?\\b(${Object.keys(COLOR_MAP).join('|')})\\b|\\b(${Object.keys(COLOR_MAP).join('|')})\\b.*?(?:theme|color|colour)`,
    'i'
  );

  const match = lower.match(colorPattern);
  if (match) {
    const colorName = (match[1] || match[2])?.toLowerCase();
    if (colorName && COLOR_MAP[colorName]) return COLOR_MAP[colorName];
  }

  // Fallback: just check if any color word appears anywhere in the prompt
  for (const [name, palette] of Object.entries(COLOR_MAP)) {
    const wordBoundary = new RegExp(`\\b${name}\\b`, 'i');
    if (wordBoundary.test(lower)) return palette;
  }

  return null;
}
