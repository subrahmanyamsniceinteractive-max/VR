/**
 * Theme Management System for Meta Quest 3 3D Product Experience
 * Supports real-time dynamic CSS custom properties, Three.js studio lighting sync,
 * and persistent localStorage caching.
 */

export const THEME_PRESETS = [
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    description: 'Deep navy studio with electric blue accents',
    mainBg: '#08172B',
    secondaryBg: '#102744',
    accentColor: '#398BFF',
    textPrimary: '#F4F7FC',
    textSecondary: '#B5C5DA',
    sceneBg: '#08172B',
    glowColor: '#173B65',
    swatches: ['#08172B', '#102744', '#398BFF', '#F4F7FC']
  },
  {
    id: 'electric-blue',
    name: 'Electric Blue',
    description: 'High-contrast abyssal navy with vibrant cyan',
    mainBg: '#040D1A',
    secondaryBg: '#0A2142',
    accentColor: '#00D2FF',
    textPrimary: '#F0F8FF',
    textSecondary: '#8EC5FC',
    sceneBg: '#040D1A',
    glowColor: '#0D3F7C',
    swatches: ['#040D1A', '#0A2142', '#00D2FF', '#F0F8FF']
  },
  {
    id: 'ice-blue',
    name: 'Ice Blue',
    description: 'Crisp Nordic titanium blue daylight studio',
    mainBg: '#0B1E33',
    secondaryBg: '#17375E',
    accentColor: '#60C5FF',
    textPrimary: '#F2F9FF',
    textSecondary: '#B2D4F0',
    sceneBg: '#0B1E33',
    glowColor: '#255285',
    swatches: ['#0B1E33', '#17375E', '#60C5FF', '#F2F9FF']
  },
  {
    id: 'dark-graphite',
    name: 'Dark Graphite',
    description: 'Minimalist stealth obsidian with metallic silver',
    mainBg: '#111215',
    secondaryBg: '#1C1E24',
    accentColor: '#E5E7EB',
    textPrimary: '#F9FAFB',
    textSecondary: '#9CA3AF',
    sceneBg: '#111215',
    glowColor: '#2C2E38',
    swatches: ['#111215', '#1C1E24', '#E5E7EB', '#F9FAFB']
  },
  {
    id: 'clean-white',
    name: 'Clean White',
    description: 'High-key daylight industrial design laboratory',
    mainBg: '#F4F6F9',
    secondaryBg: '#FFFFFF',
    accentColor: '#0066FF',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    sceneBg: '#EDF1F7',
    glowColor: '#D9E4F2',
    swatches: ['#F4F6F9', '#FFFFFF', '#0066FF', '#0F172A']
  }
];

export const DEFAULT_THEME = THEME_PRESETS[0];

const STORAGE_KEY = 'quest3_theme_customizer_v1';

/**
 * Convert HEX color to comma-separated RGB string ("r, g, b")
 */
export function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return '8, 23, 43';
  let c = hex.replace('#', '').trim();
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  if (c.length !== 6) return '8, 23, 43';
  const num = parseInt(c, 16);
  if (isNaN(num)) return '8, 23, 43';
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

/**
 * Determine if a HEX color is light or dark based on relative luminance
 */
export function isLightColor(hex) {
  if (!hex || typeof hex !== 'string') return false;
  let c = hex.replace('#', '').trim();
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  if (c.length !== 6) return false;
  const num = parseInt(c, 16);
  if (isNaN(num)) return false;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55;
}

/**
 * Normalize a hex string (e.g. "398bff" -> "#398BFF")
 */
export function normalizeHex(val) {
  if (!val) return '';
  let str = val.trim();
  if (!str.startsWith('#')) str = '#' + str;
  return str.toUpperCase();
}

/**
 * Validate 3 or 6 digit hex color
 */
export function isValidHex(val) {
  if (!val) return false;
  return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val.trim());
}

/**
 * Apply theme to document :root CSS custom properties
 */
export function applyThemeToDom(theme) {
  if (!theme || typeof document === 'undefined') return;
  const root = document.documentElement;

  const mainBg = theme.mainBg || DEFAULT_THEME.mainBg;
  const secondaryBg = theme.secondaryBg || DEFAULT_THEME.secondaryBg;
  const accentColor = theme.accentColor || DEFAULT_THEME.accentColor;
  const textPrimary = theme.textPrimary || DEFAULT_THEME.textPrimary;
  const textSecondary = theme.textSecondary || DEFAULT_THEME.textSecondary;
  const sceneBg = theme.sceneBg || DEFAULT_THEME.sceneBg;
  const glowColor = theme.glowColor || DEFAULT_THEME.glowColor;

  // Primary hex variables
  root.style.setProperty('--bg-primary', mainBg);
  root.style.setProperty('--bg-secondary', secondaryBg);
  root.style.setProperty('--accent-color', accentColor);
  root.style.setProperty('--text-primary', textPrimary);
  root.style.setProperty('--text-secondary', textSecondary);
  root.style.setProperty('--scene-background', sceneBg);
  root.style.setProperty('--gradient-glow', glowColor);

  // RGB channel variables for alpha opacity in Tailwind and CSS
  root.style.setProperty('--bg-primary-rgb', hexToRgb(mainBg));
  root.style.setProperty('--bg-secondary-rgb', hexToRgb(secondaryBg));
  root.style.setProperty('--accent-rgb', hexToRgb(accentColor));
  root.style.setProperty('--glow-rgb', hexToRgb(glowColor));

  // Legacy compatibility aliases
  root.style.setProperty('--bg-main', mainBg);
  root.style.setProperty('--accent-blue', accentColor);

  // Adaptive light/dark UI handling
  const isLight = isLightColor(mainBg);
  if (isLight) {
    root.setAttribute('data-theme', 'light');
    root.style.setProperty('--shadow-rgb', '15, 23, 42');
    root.style.setProperty('--bg-light-tech', '#FFFFFF');
    root.style.setProperty('--text-light-tech', '#0F172A');
  } else {
    root.removeAttribute('data-theme');
    root.style.setProperty('--shadow-rgb', '8, 23, 43');
    root.style.setProperty('--bg-light-tech', '#EAF2FC');
    root.style.setProperty('--text-light-tech', '#08172B');
  }
}

/**
 * Load cached theme from localStorage with fallback to default
 */
export function getSavedTheme() {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.mainBg && parsed.accentColor) {
        return { ...DEFAULT_THEME, ...parsed };
      }
    }
  } catch (e) {
    console.warn('[ThemeManager] Could not read theme from storage:', e);
  }
  return DEFAULT_THEME;
}

/**
 * Persist theme to localStorage
 */
export function saveTheme(theme) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  } catch (e) {
    console.warn('[ThemeManager] Could not save theme to storage:', e);
  }
}
