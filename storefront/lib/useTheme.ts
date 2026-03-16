// lib/useTheme.ts
// Loads the full theme-config.json (colors + sections + footer + nav).
// Applies CSS custom properties AND returns the full typed config so pages
// can render banners, editorial grids, feature strips etc. dynamically.

import { useState, useEffect } from 'react';
import { api } from './api';
import { Store } from '@/types/store';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ThemeCtaBtnConfig {
  label: string;
  href: string;
  variant: 'solid' | 'outline' | 'ghost';
}

export interface HeroBannerSection {
  enabled: boolean;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  backgroundImage: string;
  backgroundOverlay?: string;
  contentAlign?: 'left' | 'center' | 'right';
  size: 'hero' | 'lg' | 'sm';
  cta?: ThemeCtaBtnConfig;
  ctaSecondary?: ThemeCtaBtnConfig;
}

export interface PromoBannerSection {
  enabled: boolean;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  backgroundImage: string;
  backgroundOverlay?: string;
  contentAlign?: 'left' | 'center' | 'right';
  size: 'hero' | 'lg' | 'sm';
  cta?: ThemeCtaBtnConfig;
}

export interface CategoryChip {
  label: string;
  slug: string;
}

export interface CategoryChipsSection {
  enabled: boolean;
  categories: CategoryChip[];
}

export interface FeaturedProductsSection {
  enabled: boolean;
  eyebrow?: string;
  title: string;
  body?: string;
  limit: number;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface EditorialCard {
  title: string;
  subtitle?: string;
  image: string;
  href: string;
  ctaLabel?: string;
}

export interface EditorialGridSection {
  enabled: boolean;
  eyebrow?: string;
  title: string;
  cards: EditorialCard[];
}

export interface FeatureStripItem {
  icon: string;
  label: string;
  desc: string;
}

export interface FeatureStripSection {
  enabled: boolean;
  items: FeatureStripItem[];
}

export interface NewsletterSection {
  enabled: boolean;
  title: string;
  subtitle?: string;
  placeholder?: string;
  ctaLabel?: string;
  backgroundStyle?: 'dark' | 'light' | 'accent';
}

export interface ThemeSections {
  heroBanner: HeroBannerSection;
  categoryChips: CategoryChipsSection;
  featuredProducts: FeaturedProductsSection;
  editorialGrid: EditorialGridSection;
  promoBanner: PromoBannerSection;
  secondaryBanner: PromoBannerSection;
  featureStrip: FeatureStripSection;
  newsletter: NewsletterSection;
}

export interface NavLink { label: string; href: string; }
export interface FooterLink { label: string; href: string; }
export interface FooterColumn { title: string; links: FooterLink[]; }
export interface FooterSocial { platform: string; href: string; }

export interface ThemeConfig {
  meta: {
    storeName: string;
    tagline: string;
    logoText: string;
    faviconURL?: string;
    supportEmail?: string;
  };
  colors: Record<string, string>;
  typography: Record<string, string>;
  spacing: Record<string, string>;
  radius: Record<string, string>;
  shadows: Record<string, string>;
  nav: { links: NavLink[] };
  sections: ThemeSections;
  footer: {
    tagline: string;
    columns: FooterColumn[];
    socials: FooterSocial[];
    copyright: string;
    footnote: string;
  };
}

// ─── Defaults (mirrors theme-config.json) used as fallback ───────────────────

const DEFAULT_CONFIG: ThemeConfig = {
  meta: { storeName: 'Lavada Cosmetics', tagline: '', logoText: 'Lavada' },
  colors: {
    primary: '#0A0A0A', secondary: '#1A1A1A', accent: '#C8A96E',
    accentLight: '#E8C98E', surface: '#F8F5F0', surfaceDark: '#121212',
    text: '#0A0A0A', textMuted: '#6B6B6B', textInverse: '#F8F5F0',
    border: '#E2DDD6', borderDark: '#2A2A2A',
    error: '#C0392B', success: '#27AE60', warning: '#E67E22',
    overlay: 'rgba(10,10,10,0.6)',
  },
  typography: {
    fontDisplay: "'Cormorant Garamond', Georgia, serif",
    fontBody: "'DM Sans', sans-serif",
    fontMono: "'DM Mono', monospace",
  },
  spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem', '2xl': '3rem', '3xl': '4rem', '4xl': '6rem' },
  radius: { sm: '2px', md: '4px', lg: '8px', xl: '16px', full: '9999px' },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.08)', md: '0 4px 16px rgba(0,0,0,0.1)',
    lg: '0 8px 32px rgba(0,0,0,0.15)', xl: '0 16px 48px rgba(0,0,0,0.2)',
  },
  nav: {
    links: [
      { label: 'New In', href: '/category/new-in' },
      { label: 'Men', href: '/category/men' },
      { label: 'Women', href: '/category/women' },
      { label: 'Cosmetics', href: '/category/cosmetics' },
      { label: 'Sale', href: '/category/sale' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  sections: {
    heroBanner: {
      enabled: true,
      eyebrow: 'New Season 2026',
      title: 'The New Season Awaits',
      subtitle: 'Discover curated collections that define modern luxury.',
      backgroundImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=85',
      backgroundOverlay: 'linear-gradient(135deg, rgba(10,10,10,0.75) 0%, rgba(10,10,10,0.35) 100%)',
      contentAlign: 'left',
      size: 'hero',
      cta: { label: 'Explore Collection', href: '/category/new-in', variant: 'outline' },
      ctaSecondary: { label: 'View Lookbook', href: '/blog', variant: 'ghost' },
    },
    categoryChips: {
      enabled: true,
      categories: [
        { label: 'All', slug: 'all' },
        { label: 'Men', slug: 'men' },
        { label: 'Women', slug: 'women' },
        { label: 'Accessories', slug: 'accessories' },
        { label: 'Cosmetics', slug: 'cosmetics' },
        { label: 'New Arrivals', slug: 'new-in' },
        { label: 'Sale', slug: 'sale' },
      ],
    },
    featuredProducts: {
      enabled: true,
      eyebrow: 'Featured',
      title: 'New Arrivals',
      body: 'Handpicked pieces from our latest collections.',
      limit: 8,
      ctaLabel: 'View All Products',
      ctaHref: '/category/all',
    },
    editorialGrid: {
      enabled: true,
      eyebrow: 'Shop by Category',
      title: 'Curated for You',
      cards: [
        { title: "Men's Collection", subtitle: 'Refined essentials', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700&q=80', href: '/category/men', ctaLabel: 'Shop Now' },
        { title: "Women's Collection", subtitle: 'Effortless elegance', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=700&q=80', href: '/category/women', ctaLabel: 'Shop Now' },
        { title: 'Beauty & Cosmetics', subtitle: 'Luxury skincare', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=700&q=80', href: '/category/cosmetics', ctaLabel: 'Explore' },
      ],
    },
    promoBanner: {
      enabled: true,
      eyebrow: 'New Collection',
      title: 'Luxury Cosmetics',
      subtitle: 'Where science meets artistry.',
      backgroundImage: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1400&q=80',
      backgroundOverlay: 'linear-gradient(135deg, rgba(10,10,10,0.75) 0%, rgba(10,10,10,0.35) 100%)',
      contentAlign: 'left',
      size: 'lg',
      cta: { label: 'Shop Beauty', href: '/category/cosmetics', variant: 'outline' },
    },
    secondaryBanner: {
      enabled: false,
      eyebrow: 'Limited Time',
      title: 'Summer Sale',
      subtitle: 'Up to 50% off selected styles.',
      backgroundImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=80',
      backgroundOverlay: 'linear-gradient(135deg, rgba(10,10,10,0.6) 0%, rgba(10,10,10,0.2) 100%)',
      contentAlign: 'center',
      size: 'sm',
      cta: { label: 'Shop Sale', href: '/category/sale', variant: 'solid' },
    },
    featureStrip: {
      enabled: true,
      items: [
        { icon: '🚚', label: 'Free Delivery',   desc: 'On orders over ₦15,000' },
        { icon: '↩️', label: 'Easy Returns',    desc: '30-day return policy' },
        { icon: '🔒', label: 'Secure Payment',  desc: 'SSL encrypted checkout' },
        { icon: '💎', label: 'Premium Quality', desc: 'Curated luxury pieces' },
      ],
    },
    newsletter: {
      enabled: false,
      title: 'Stay in the loop',
      subtitle: 'Get early access to new arrivals and exclusive offers.',
      placeholder: 'Your email address',
      ctaLabel: 'Subscribe',
      backgroundStyle: 'dark',
    },
  },
  footer: {
    tagline: 'Modern luxury fashion and cosmetics, crafted for those who live boldly.',
    columns: [
      { title: 'Shop',    links: [{ label: 'New In', href: '/category/new-in' }, { label: 'Men', href: '/category/men' }, { label: 'Women', href: '/category/women' }, { label: 'Cosmetics', href: '/category/cosmetics' }, { label: 'Sale', href: '/category/sale' }] },
      { title: 'Help',    links: [{ label: 'Track Order', href: '/profile/orders' }, { label: 'Returns', href: '/returns' }, { label: 'Shipping', href: '/shipping' }, { label: 'FAQ', href: '/faq' }, { label: 'Contact', href: '/contact' }] },
      { title: 'Company', links: [{ label: 'About', href: '/about' }, { label: 'Blog', href: '/blog' }, { label: 'Careers', href: '/careers' }, { label: 'Press', href: '/press' }, { label: 'Sustainability', href: '/sustainability' }] },
    ],
    socials: [{ platform: 'Instagram', href: 'https://instagram.com' }, { platform: 'Twitter', href: 'https://twitter.com' }, { platform: 'TikTok', href: 'https://tiktok.com' }],
    copyright: '© {year} Maison. All rights reserved.',
    footnote: 'Designed with intention.',
  },
};

// ─── CSS variable applicator ──────────────────────────────────────────────────

function applyThemeCSS(config: ThemeConfig) {
  const root = document.documentElement;

  const colorMap: Record<string, string> = {
    primary: '--color-primary', secondary: '--color-secondary',
    accent: '--color-accent', accentLight: '--color-accent-light',
    surface: '--color-surface', surfaceDark: '--color-surface-dark',
    text: '--color-text', textMuted: '--color-text-muted',
    textInverse: '--color-text-inverse', border: '--color-border',
    borderDark: '--color-border-dark', error: '--color-error',
    success: '--color-success', warning: '--color-warning',
    overlay: '--color-overlay',
  };
  Object.entries(colorMap).forEach(([key, cssVar]) => {
    if (config.colors[key]) root.style.setProperty(cssVar, config.colors[key]);
  });

  if (config.typography.fontDisplay) root.style.setProperty('--font-display', config.typography.fontDisplay);
  if (config.typography.fontBody)    root.style.setProperty('--font-body',    config.typography.fontBody);
  if (config.typography.fontMono)    root.style.setProperty('--font-mono',    config.typography.fontMono);

  const shadowMap: Record<string, string> = { sm: '--shadow-sm', md: '--shadow-md', lg: '--shadow-lg', xl: '--shadow-xl' };
  Object.entries(shadowMap).forEach(([key, cssVar]) => {
    if (config.shadows[key]) root.style.setProperty(cssVar, config.shadows[key]);
  });

  const spacingMap: Record<string, string> = {
    xs: '--space-xs', sm: '--space-sm', md: '--space-md', lg: '--space-lg',
    xl: '--space-xl', '2xl': '--space-2xl', '3xl': '--space-3xl', '4xl': '--space-4xl',
  };
  Object.entries(spacingMap).forEach(([key, cssVar]) => {
    if (config.spacing[key]) root.style.setProperty(cssVar, config.spacing[key]);
  });

  const radiusMap: Record<string, string> = { sm: '--radius-sm', md: '--radius-md', lg: '--radius-lg', xl: '--radius-xl', full: '--radius-full' };
  Object.entries(radiusMap).forEach(([key, cssVar]) => {
    if (config.radius[key]) root.style.setProperty(cssVar, config.radius[key]);
  });
}

// ─── Cache helpers ────────────────────────────────────────────────────────────

const CACHE_KEY = 'maison_theme_v2';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCache(): Store | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { config, cachedAt } = JSON.parse(raw);
    if (Date.now() - cachedAt > CACHE_TTL) { sessionStorage.removeItem(CACHE_KEY); return null; }
    return config as Store;
  } catch { return null; }
}

function setCache(config: Store) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ config, cachedAt: Date.now() })); }
  catch { /* private/storage full */ }
}

async function fetchRemoteConfig(): Promise<Store | null> {
  try {
    const res:Store  = await api.getStore()   //await fetch('/api/theme-config', { cache: 'no-store' });
    if (!res) throw new Error('not found');
    return await res as Store;
  } catch { return null; }
}

// Merge remote config on top of defaults so partial configs still work
function mergeConfig(remote: Partial<ThemeConfig>): ThemeConfig {
  return {
    ...DEFAULT_CONFIG,
    ...remote,
    meta:     { ...DEFAULT_CONFIG.meta,     ...(remote.meta ?? {}) },
    colors:   { ...DEFAULT_CONFIG.colors,   ...(remote.colors ?? {}) },
    typography: { ...DEFAULT_CONFIG.typography, ...(remote.typography ?? {}) },
    spacing:  { ...DEFAULT_CONFIG.spacing,  ...(remote.spacing ?? {}) },
    radius:   { ...DEFAULT_CONFIG.radius,   ...(remote.radius ?? {}) },
    shadows:  { ...DEFAULT_CONFIG.shadows,  ...(remote.shadows ?? {}) },
    nav:      { ...DEFAULT_CONFIG.nav,      ...(remote.nav ?? {}) },
    sections: { ...DEFAULT_CONFIG.sections, ...(remote.sections ?? {}) },
    footer:   { ...DEFAULT_CONFIG.footer,   ...(remote.footer ?? {}) },
  };
}

// ─── Main hook ────────────────────────────────────────────────────────────────
// Returns the full ThemeConfig so pages can read sections.heroBanner, etc.
// CSS vars are applied as a side effect.

let _globalConfig: ThemeConfig | null = null; // in-memory singleton for SSR hydration
let _store: Store | null = null;
export function useTheme(): { config: ThemeConfig; loading: boolean, store: Store | null} {
  const [config, setConfig] = useState<ThemeConfig>(_globalConfig ?? DEFAULT_CONFIG);
  const [loading, setLoading] = useState(!_globalConfig);
const [store, setStore] = useState<Store | null>(_store)
  useEffect(() => {
    if (_globalConfig) { applyThemeCSS(_globalConfig); setLoading(false); return; }

    (async () => {
      // 1. Session cache
      const cached = getCache();
      if (cached) {
        _globalConfig = cached.theme as ThemeConfig;
        _store = store
        setStore(cached)
        setConfig(cached.theme as ThemeConfig);
        applyThemeCSS(cached.theme as ThemeConfig);
        setLoading(false);
        return;
      }

      // 2. Remote fetch
      const remote = await fetchRemoteConfig();
      const resolved = remote?.theme  ? mergeConfig(remote.theme as ThemeConfig) : DEFAULT_CONFIG;
     // const storeConfig = re
      _globalConfig = resolved;
      _store=remote
      setStore(store)
      setConfig(resolved);
      applyThemeCSS(resolved);
      setCache(remote!);
      setLoading(false);
    })();
  }, []);

  return { config, loading, store};
}

export { DEFAULT_CONFIG };
//export type { ThemeConfig };
export default useTheme;