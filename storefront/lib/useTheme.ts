import { useEffect } from 'react';

const THEME_CACHE_KEY = 'maison_theme_config';
const THEME_CACHE_TTL = 60 * 60 * 1000; // 1 hour in ms

interface ThemeCacheEntry {
  config: Record<string, Record<string, string>>;
  cachedAt: number;
}

function applyTheme(config: Record<string, Record<string, string>>) {
  const root = document.documentElement;
  const { colors, typography, shadows } = config;

  if (colors) {
    const map: Record<string, string> = {
      primary:      '--color-primary',
      secondary:    '--color-secondary',
      accent:       '--color-accent',
      accentLight:  '--color-accent-light',
      surface:      '--color-surface',
      surfaceDark:  '--color-surface-dark',
      text:         '--color-text',
      textMuted:    '--color-text-muted',
      textInverse:  '--color-text-inverse',
      border:       '--color-border',
      borderDark:   '--color-border-dark',
      error:        '--color-error',
      success:      '--color-success',
      warning:      '--color-warning',
    };
    Object.entries(map).forEach(([key, cssVar]) => {
      if (colors[key]) root.style.setProperty(cssVar, colors[key]);
    });
  }

  if (typography) {
    if (typography.fontDisplay) root.style.setProperty('--font-display', typography.fontDisplay);
    if (typography.fontBody)    root.style.setProperty('--font-body',    typography.fontBody);
    if (typography.fontMono)    root.style.setProperty('--font-mono',    typography.fontMono);
  }

  if (shadows) {
    if (shadows.sm) root.style.setProperty('--shadow-sm', shadows.sm);
    if (shadows.md) root.style.setProperty('--shadow-md', shadows.md);
    if (shadows.lg) root.style.setProperty('--shadow-lg', shadows.lg);
    if (shadows.xl) root.style.setProperty('--shadow-xl', shadows.xl);
  }
}

async function fetchThemeConfig(): Promise<Record<string, Record<string, string>> | null> {
  try {
    const res = await fetch('/api/theme-config', { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function getCachedTheme(): Record<string, Record<string, string>> | null {
  try {
    const raw = sessionStorage.getItem(THEME_CACHE_KEY);
    if (!raw) return null;
    const entry: ThemeCacheEntry = JSON.parse(raw);
    const age = Date.now() - entry.cachedAt;
    if (age > THEME_CACHE_TTL) { sessionStorage.removeItem(THEME_CACHE_KEY); return null; }
    return entry.config;
  } catch {
    return null;
  }
}

function setCachedTheme(config: Record<string, Record<string, string>>) {
  try {
    const entry: ThemeCacheEntry = { config, cachedAt: Date.now() };
    sessionStorage.setItem(THEME_CACHE_KEY, JSON.stringify(entry));
  } catch {
    // sessionStorage may be unavailable (private mode)
  }
}

/**
 * useTheme — Loads theme config on mount:
 * 1. Checks sessionStorage cache
 * 2. Falls back to remote /api/theme-config
 * 3. Falls back to CSS :root defaults (no-op)
 *
 * Page load workflow per spec:
 * - Cache `theme` config and load styles
 * - If no theme config is found, use default (CSS :root vars)
 */
export function useTheme() {
  useEffect(() => {
    (async () => {
      // 1. Try cache
      const cached = getCachedTheme();
      if (cached) {
        applyTheme(cached);
        return;
      }

      // 2. Fetch remote
      const remote = await fetchThemeConfig();
      if (remote) {
        applyTheme(remote);
        setCachedTheme(remote);
        return;
      }

      // 3. Use defaults (CSS vars already set in globals.css — no action needed)
    })();
  }, []);
}

export default useTheme;