/**
 * PDF Design System
 * Single source of truth for all layout, spacing, typography,
 * and color constants used across the report.
 */

// ── Page geometry ─────────────────────────────────────────────────────────
const PAGE = {
  width:   595,
  height:  842,
  margin:  50,
  // Derived helpers
  get contentWidth()  { return this.width  - this.margin * 2; }, // 495
  get contentRight()  { return this.width  - this.margin; },     // 545
  get contentBottom() { return this.height - this.margin; },     // 792
};

// ── Spacing scale ─────────────────────────────────────────────────────────
const SP = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

// ── Typography ────────────────────────────────────────────────────────────
const FONT = {
  BOLD:       'Helvetica-Bold',
  REGULAR:    'Helvetica',
  size: {
    xxs: 5.5,
    xs:  6.5,
    sm:  7.5,
    md:  8.5,
    lg:  10,
    xl:  14,
    xxl: 20,
    h1:  28,
  },
};

// ── Color palette ─────────────────────────────────────────────────────────
const COLOR = {
  // Backgrounds
  bg:       '#07090F',
  surface:  '#0D1220',
  surface2: '#111827',
  overlay:  '#0A0F1A',

  // Brand
  primary:  '#38BDF8',
  violet:   '#818CF8',

  // Semantic
  success:  '#4ADE80',
  warning:  '#FBBF24',
  danger:   '#FB7185',

  // Text
  textPri:  '#E8F0FE',
  textMuted:'#64748B',
  white:    '#FFFFFF',

  // Borders
  border:   '#1E293B',
  borderAccent: '#1E3A4A',

  // Semantic backgrounds (for chips/badges)
  successBg: '#052E16',
  dangerBg:  '#2D0A0F',
  primaryBg: '#0C1E2E',
  warningBg: '#2D2000',
};

/**
 * Convert a hex color string to an [r, g, b] array (0-255).
 * Caches results to avoid repeated parsing.
 */
const _hexCache = {};
function hex(h) {
  if (_hexCache[h]) return _hexCache[h];
  const n = parseInt(h.replace('#', ''), 16);
  const result = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  _hexCache[h] = result;
  return result;
}

/** Map an ATS score to a semantic color. */
function scoreColor(s) {
  if (s >= 80) return COLOR.success;
  if (s >= 65) return COLOR.primary;
  if (s >= 45) return COLOR.warning;
  return COLOR.danger;
}

/** Map a section score to grade string and colors. */
function gradeInfo(val) {
  if (val >= 75) return { label: 'STRONG', bg: COLOR.successBg, fg: COLOR.success };
  if (val >= 55) return { label: 'OK',     bg: COLOR.primaryBg, fg: COLOR.primary  };
  return              { label: 'WEAK',   bg: COLOR.dangerBg,  fg: COLOR.danger   };
}

module.exports = { PAGE, SP, FONT, COLOR, hex, scoreColor, gradeInfo };
