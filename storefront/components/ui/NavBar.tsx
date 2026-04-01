
'use client';
import { api } from '@/lib/api';
import { Product } from '@/types/product';
import { useSession } from 'next-auth/react';
import React, { useState, useEffect, useRef, useCallback } from 'react';
type Navs ={
  label: string;
  href:string;
}
type Category ={
  label:string;
  href:string;
  icon?: string;
}
export interface NavbarProps {
  cartCount?: number;
  wishlistCount?: number;
  category?:Category[];
  isLoginedIn?:boolean;
  navs?:Navs[];
}

const NAV_LINKS: Navs[] = [
  { label: 'New In',    href: '/category/new-in' },
  { label: 'Men',       href: '/category/men' },
  { label: 'Women',     href: '/category/women' },
  { label: 'Cosmetics', href: '/category/cosmetics' },
  { label: 'Sale',      href: '/category/sale' },
  { label: 'Blog',      href: '/blog' },
];

const CATEGORIES: Category[] = [
  { label: 'New Arrivals',  href: '/category/new-in',     icon: '✦' },
  { label: 'Men',           href: '/category/men',         icon: '👔' },
  { label: 'Women',         href: '/category/women',       icon: '👗' },
  { label: 'Accessories',   href: '/category/accessories', icon: '👜' },
  { label: 'Cosmetics',     href: '/category/cosmetics',   icon: '💄' },
  { label: 'Footwear',      href: '/category/footwear',    icon: '👟' },
  { label: 'Sale',          href: '/category/sale',        icon: '🏷️' },
];

const SIDEBAR_EXTRAS = [
  { label: 'My Profile',   href: '/profile',          icon: iconProfile() },
  { label: 'Wishlist',     href: '/profile/wishlist',          icon: iconHeart() },
  { label: 'My Orders',    href: '/profile/orders',    icon: iconBox() },
  { label: 'Blog',         href: '/blog',              icon: iconArticle() },
  { label: 'Sign In',      href: '/auth/login',       icon: iconLock() },
];

// ─── SVG icon helpers ───────────────────────────
function iconProfile() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function iconHeart()   { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>; }
function iconBox()     { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>; }
function iconArticle() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>; }
function iconLock()    { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function iconSearch()  { return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>; }
function iconCart()    { return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>; }
function iconClose()   { return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function iconMenu()    { return <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="15" y2="18"/></svg>; }

// ─── Types ──────────────────────────────────────
interface SearchResult {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  salePrice: number;
  mainImageURL: string;
}

// ─── Debounce hook ───────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ═══════════════════════════════════════════════════
// LIVE SEARCH OVERLAY
// ═══════════════════════════════════════════════════
interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState<Product[]>([]);
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState(-1);
  const inputRef                = useRef<HTMLInputElement>(null);
  const debouncedQuery          = useDebounce(query, 280);

  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setFocused(-1);
    }
  }, [isOpen]);

  // Search on debounced query change
  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); return; }
    setLoading(true);
      const q = debouncedQuery.toLowerCase();

    // Replace with real API: api.searchProducts(debouncedQuery)

      api.productSearch(q).then(( data) => {
        /*const filtered = data.products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.shortDescription?.toLowerCase().includes(q) ||
            p.slug.toLowerCase().includes(q)
        );*/
       // console.log('Search results:', data);
        setResults(data);
        setLoading(false);
      
    
   }).catch((err) => {
      setResults([]);
      setLoading(false);
      console.error('Search error:', err);
    })
    }, [debouncedQuery]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') setFocused((f) => Math.min(f + 1, results.length - 1));
      if (e.key === 'ArrowUp')   setFocused((f) => Math.max(f - 1, -1));
      if (e.key === 'Enter' && focused >= 0 && results[focused]) {
        window.location.href = `/product/${results[focused].slug}`;
      }
    };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose, focused, results]);

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n);

  const QUICK_LINKS = ['New Arrivals', 'Men', 'Women', 'Cosmetics', 'Sale'];

  if (!isOpen) return null;

  return (
    <div className="search-overlay animate-fade-in" role="dialog" aria-label="Search">
      {/* Backdrop */}
      <div className="search-overlay__backdrop" onClick={onClose} />

      {/* Panel */}
      <div className="search-overlay__panel animate-fade-up">
        {/* Input row */}
        <div className="search-overlay__input-row">
          <span className="search-overlay__icon">{iconSearch()}</span>
          <input
            ref={inputRef}
            type="search"
            className="search-overlay__input"
            placeholder="Search products, categories…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setFocused(-1); }}
            autoComplete="off"
          />
          {query && (
            <button className="search-overlay__clear" onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }} aria-label="Clear">
              {iconClose()}
            </button>
          )}
          <button className="search-overlay__close-btn" onClick={onClose}>Cancel</button>
        </div>

        <div className="search-overlay__body">
          {/* Empty state — quick links */}
          {!query && (
            <div className="search-overlay__empty">
              <p className="search-overlay__section-title">Quick Links</p>
              <div className="search-overlay__quick-links">
                {QUICK_LINKS.map((link) => (
                  <a
                    key={link}
                    href={`/category/${link.toLowerCase().replace(' ', '-')}`}
                    className="search-overlay__quick-link"
                    onClick={onClose}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && query && (
            <div className="search-overlay__loading">
              <div className="search-overlay__spinner" />
              <span>Searching…</span>
            </div>
          )}

          {/* Results */}
          {!loading && query && results.length > 0 && (
            <div>
              <p className="search-overlay__section-title">
                {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
              </p>
              <ul className="search-overlay__results" role="listbox">
                {results.map((r, i) => (
                  <li key={r.id}>
                    <a
                      href={`/product/${r.slug}`}
                      className={`search-overlay__result${focused === i ? ' search-overlay__result--focused' : ''}`}
                      onClick={onClose}
                      onMouseEnter={() => setFocused(i)}
                      role="option"
                    >
                      <div className="search-overlay__result-img">
                        {r.mainImageURL
                          ? <img src={r.mainImageURL} alt={r.name} onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=80&q=60'; }} />
                          : <div style={{ background: 'var(--color-border)', width: '100%', height: '100%' }} />
                        }
                      </div>
                      <div className="search-overlay__result-info">
                        <p className="search-overlay__result-name">{r.name}</p>
                        <p className="search-overlay__result-desc">{r.shortDescription}</p>
                      </div>
                      <span className="search-overlay__result-price">{formatPrice(r.salePrice)}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="search-overlay__footer">
                <a
                  href={`/category/all?q=${encodeURIComponent(query)}`}
                  className="search-overlay__see-all"
                  onClick={onClose}
                >
                  See all results for &ldquo;{query}&rdquo; →
                </a>
              </div>
            </div>
          )}

          {/* No results */}
          {!loading && query && results.length === 0 && (
            <div className="search-overlay__no-results">
              <p style={{ fontSize: '2rem', marginBottom: 'var(--space-md)' }}>🔍</p>
              <p style={{ fontWeight: 600, marginBottom: 'var(--space-sm)' }}>No results found</p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                Try different keywords or browse our categories below.
              </p>
              <div className="search-overlay__quick-links" style={{ marginTop: 'var(--space-xl)' }}>
                {QUICK_LINKS.map((link) => (
                  <a key={link} href={`/category/${link.toLowerCase().replace(' ', '-')}`} className="search-overlay__quick-link" onClick={onClose}>{link}</a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MOBILE SIDEBAR DRAWER
// ═══════════════════════════════════════════════════
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function MobileSidebar({ isOpen, onClose }: SidebarProps) {
  // Prevent body scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`sidebar-backdrop${isOpen ? ' sidebar-backdrop--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside className={`sidebar-drawer${isOpen ? ' sidebar-drawer--open' : ''}`} aria-label="Navigation menu">
        {/* Header */}
        <div className="sidebar-drawer__header">
          <a href="/" className="sidebar-drawer__logo" onClick={onClose}>Lavada Cosmetics</a>
          <button className="sidebar-drawer__close" onClick={onClose} aria-label="Close menu">
            {iconClose()}
          </button>
        </div>

        {/* User strip */}
        <div className="sidebar-drawer__user">
          <div className="sidebar-drawer__avatar">A</div>
          <div>
            <p className="sidebar-drawer__user-name">Afolabi Samuel</p>
            <a href="/auth/login" className="sidebar-drawer__user-link" onClick={onClose}>Sign in / Register →</a>
          </div>
        </div>

        <div className="sidebar-drawer__scroll">
          {/* Categories */}
          <div className="sidebar-drawer__section">
            <p className="sidebar-drawer__section-title">Shop Categories</p>
            <ul className="sidebar-drawer__list">
              {CATEGORIES.map((cat) => (
                <li key={cat.href}>
                  <a href={cat.href} className="sidebar-drawer__item" onClick={onClose}>
                    <span className="sidebar-drawer__item-icon">{cat.icon}</span>
                    <span className="sidebar-drawer__item-label">{cat.label}</span>
                    <span className="sidebar-drawer__item-arrow">›</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-drawer__divider" />

          {/* Account / extras */}
          <div className="sidebar-drawer__section">
            <p className="sidebar-drawer__section-title">My Account</p>
            <ul className="sidebar-drawer__list">
              {SIDEBAR_EXTRAS.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="sidebar-drawer__item" onClick={onClose}>
                    <span className="sidebar-drawer__item-icon sidebar-drawer__item-icon--sm">{item.icon}</span>
                    <span className="sidebar-drawer__item-label">{item.label}</span>
                    <span className="sidebar-drawer__item-arrow">›</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sidebar-drawer__footer">
          <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', letterSpacing: '0.06em' }}>© {new Date().getFullYear()} Lavada Cosmetics</p>
        </div>
      </aside>
    </>
  );
}

// ═══════════════════════════════════════════════════
// MAIN NAVBAR EXPORT
// ═══════════════════════════════════════════════════
export function Navbar({ cartCount = 0, wishlistCount = 0, navs =NAV_LINKS , isLoginedIn=false}: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
return (
    <>
      <header className="navbar">
        {/* Hamburger — mobile only */}
        <button
          className="navbar__hamburger"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          {iconMenu()}
        </button>

        <a href="/" className="navbar__logo">Lavada Cosmetics</a>

        {/* Desktop nav */}
        <nav className="navbar__center">
          <ul className="navbar__nav">
            {navs.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Actions */}
        <div className="navbar__actions">
          <button
            className="navbar__icon-btn"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
          >
            {iconSearch()}
          </button>
          <a href={isLoginedIn ? "/profile" : "/auth/login"} className="navbar__icon-btn hide-mobile" aria-label="Account">
            {iconProfile()}
          </a>
          <a href="/profile/wishlist" className="navbar__icon-btn hide-mobile" aria-label="Wishlist">
            {iconHeart()}
            {wishlistCount > 0 && <span className="navbar__cart-count">{wishlistCount}</span>}
          </a>
          <a href="/cart" className="navbar__icon-btn" aria-label="Cart">
            {iconCart()}
            {cartCount > 0 && <span className="navbar__cart-count">{cartCount}</span>}
          </a>
        </div>
      </header>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <style>{NAVBAR_STYLES}</style>
    </>
    )
  
}

// ═══════════════════════════════════════════════════
// MOBILE BOTTOM NAV EXPORT
// ═══════════════════════════════════════════════════
interface BottomNavProps {
  active?: 'home' | 'search' | 'wishlist' | 'orders' | 'profile';
  cartCount?: number;
  wishlistCount?: number;
}

export function MobileBottomNav({ active, cartCount = 0, wishlistCount = 0 }: BottomNavProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  const items = [
    {
      key: 'home',
      label: 'Home',
      href: '/',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      key: 'search',
      label: 'Search',
      href: null,
      onClick: () => setSearchOpen(true),
      icon: iconSearch(),
    },
    {
      key: 'wishlist',
      label: 'Wishlist',
      href: '/wishlist',
      badge: wishlistCount,
      icon: iconHeart(),
    },
    {
      key: 'orders',
      label: 'Orders',
      href: '/profile/orders',
      icon: iconBox(),
    },
    {
      key: 'profile',
      label: 'Profile',
      href: '/profile',
      icon: iconProfile(),
    },
  ];

  return (
    <>
      <nav className="bottom-nav" aria-label="Mobile navigation">
        {items.map((item) => {
          const isActive = active === item.key;
          const content = (
            <>
              <span className={`bottom-nav__icon${isActive ? ' bottom-nav__icon--active' : ''}`}>
                {item.icon}
                {item.badge != null && item.badge > 0 && (
                  <span className="bottom-nav__badge">{item.badge}</span>
                )}
              </span>
              <span className={`bottom-nav__label${isActive ? ' bottom-nav__label--active' : ''}`}>
                {item.label}
              </span>
              {isActive && <span className="bottom-nav__dot" />}
            </>
          );

          return item.href ? (
            <a key={item.key} href={item.href} className="bottom-nav__item">
              {content}
            </a>
          ) : (
            <button key={item.key} className="bottom-nav__item" onClick={item.onClick}>
              {content}
            </button>
          );
        })}
      </nav>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

// ═══════════════════════════════════════════════════
// ALL STYLES
// ═══════════════════════════════════════════════════
const NAVBAR_STYLES = `
/* ── Hamburger — show only mobile ── */
.navbar__hamburger {
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px; height: 40px;
  border-radius: var(--radius-full);
  color: var(--color-text);
  transition: background var(--transition-fast);
  flex-shrink: 0;
}
.navbar__hamburger:hover { background: var(--color-border); }
@media (max-width: 768px) {
  .navbar__hamburger { display: flex; }
  .navbar__center { display: none !important; }
}

/* ══════════════════════════════════════
   SEARCH OVERLAY
══════════════════════════════════════ */
.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.search-overlay__backdrop {
  position: absolute;
  inset: 0;
  background: var(--color-overlay);
  backdrop-filter: blur(4px);
}
.search-overlay__panel {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 680px;
  background: white;
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}
.search-overlay__input-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-lg) var(--space-xl);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
.search-overlay__icon {
  color: var(--color-text-muted);
  display: flex;
  flex-shrink: 0;
}
.search-overlay__input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  font-family: var(--font-body);
  color: var(--color-text);
  background: transparent;
  min-width: 0;
}
.search-overlay__input::placeholder { color: var(--color-text-muted); }
.search-overlay__input::-webkit-search-cancel-button { display: none; }
.search-overlay__clear {
  display: flex;
  color: var(--color-text-muted);
  padding: 4px;
  border-radius: var(--radius-full);
  transition: background var(--transition-fast), color var(--transition-fast);
}
.search-overlay__clear:hover { background: var(--color-border); color: var(--color-text); }
.search-overlay__close-btn {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-md);
  flex-shrink: 0;
  transition: color var(--transition-fast);
}
.search-overlay__close-btn:hover { color: var(--color-primary); }

.search-overlay__body {
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: var(--space-lg) var(--space-xl) var(--space-xl);
}
.search-overlay__section-title {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: var(--space-md);
}
.search-overlay__quick-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}
.search-overlay__quick-link {
  padding: 0.4rem 1rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--color-text);
  transition: all var(--transition-fast);
}
.search-overlay__quick-link:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}
.search-overlay__loading {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  color: var(--color-text-muted);
  font-size: 0.85rem;
  padding: var(--space-xl) 0;
}
.search-overlay__spinner {
  width: 18px; height: 18px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
.search-overlay__results { list-style: none; display: flex; flex-direction: column; }
.search-overlay__result {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-sm);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
  text-decoration: none;
  color: inherit;
}
.search-overlay__result:hover,
.search-overlay__result--focused { background: var(--color-surface); }
.search-overlay__result-img {
  width: 52px; height: 52px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-border);
}
.search-overlay__result-img img { width: 100%; height: 100%; object-fit: cover; }
.search-overlay__result-info { flex: 1; min-width: 0; }
.search-overlay__result-name {
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.search-overlay__result-desc {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}
.search-overlay__result-price {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-primary);
  flex-shrink: 0;
}
.search-overlay__footer {
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
  margin-top: var(--space-sm);
}
.search-overlay__see-all {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-accent);
  letter-spacing: 0.04em;
  transition: color var(--transition-fast);
}
.search-overlay__see-all:hover { color: var(--color-primary); }
.search-overlay__no-results {
  text-align: center;
  padding: var(--space-2xl) 0;
}
.search-overlay__empty { padding: var(--space-sm) 0; }

@media (max-width: 768px) {
  .search-overlay__panel { max-width: 100%; border-radius: 0 0 var(--radius-lg) var(--radius-lg); }
}

/* ══════════════════════════════════════
   MOBILE SIDEBAR DRAWER
══════════════════════════════════════ */
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: var(--color-overlay);
  backdrop-filter: blur(2px);
  z-index: 500;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--transition-normal);
}
.sidebar-backdrop--visible {
  opacity: 1;
  pointer-events: all;
}
.sidebar-drawer {
  position: fixed;
  top: 0; left: 0; bottom: 0;
  width: min(320px, 85vw);
  background: white;
  z-index: 501;
  display: flex;
  flex-direction: column;
  transform: translateX(-100%);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-xl);
  overscroll-behavior: contain;
}
.sidebar-drawer--open { transform: translateX(0); }

.sidebar-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg) var(--space-xl);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
.sidebar-drawer__logo {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 300;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-primary);
}
.sidebar-drawer__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px; height: 36px;
  border-radius: var(--radius-full);
  color: var(--color-text-muted);
  transition: background var(--transition-fast), color var(--transition-fast);
}
.sidebar-drawer__close:hover { background: var(--color-border); color: var(--color-text); }

.sidebar-drawer__user {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg) var(--space-xl);
  background: var(--color-primary);
  flex-shrink: 0;
}
.sidebar-drawer__avatar {
  width: 40px; height: 40px;
  border-radius: var(--radius-full);
  background: var(--color-accent);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--color-primary);
  font-weight: 600;
  flex-shrink: 0;
}
.sidebar-drawer__user-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  line-height: 1.2;
}
.sidebar-drawer__user-link {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.55);
  letter-spacing: 0.04em;
  transition: color var(--transition-fast);
  display: inline-block;
  margin-top: 2px;
}
.sidebar-drawer__user-link:hover { color: var(--color-accent); }

.sidebar-drawer__scroll {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-bottom: var(--space-lg);
}
.sidebar-drawer__section { padding: var(--space-lg) var(--space-xl) 0; }
.sidebar-drawer__section-title {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: var(--space-sm);
  padding: var(--space-sm) 0;
}
.sidebar-drawer__list { list-style: none; }
.sidebar-drawer__item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: 0.75rem var(--space-sm);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 500;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.sidebar-drawer__item:hover { background: var(--color-surface); color: var(--color-primary); }
.sidebar-drawer__item-icon {
  font-size: 1.1rem;
  width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sidebar-drawer__item-icon--sm { color: var(--color-text-muted); }
.sidebar-drawer__item-label { flex: 1; }
.sidebar-drawer__item-arrow {
  color: var(--color-text-muted);
  font-size: 1.1rem;
  font-weight: 300;
}
.sidebar-drawer__divider {
  height: 1px;
  background: var(--color-border);
  margin: var(--space-lg) var(--space-xl);
}
.sidebar-drawer__footer {
  padding: var(--space-lg) var(--space-xl);
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

/* ══════════════════════════════════════
   MOBILE BOTTOM NAV
══════════════════════════════════════ */
.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 64px;
  background: rgba(255,255,255,0.97);
  backdrop-filter: blur(12px);
  border-top: 1px solid var(--color-border);
  z-index: 200;
  padding: 0 var(--space-sm);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
@media (max-width: 768px) { .bottom-nav { display: flex; } }

.bottom-nav__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  position: relative;
  padding: 6px 0;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color var(--transition-fast);
}
.bottom-nav__item:hover { color: var(--color-primary); }

.bottom-nav__icon {
  position: relative;
  display: flex;
  transition: transform var(--transition-fast);
}
.bottom-nav__icon--active {
  color: var(--color-primary);
  transform: translateY(-1px);
}
.bottom-nav__badge {
  position: absolute;
  top: -4px; right: -6px;
  width: 14px; height: 14px;
  background: var(--color-accent);
  color: var(--color-primary);
  font-size: 0.55rem;
  font-weight: 700;
  border-radius: var(--radius-full);
  display: flex; align-items: center; justify-content: center;
}
.bottom-nav__label {
  font-size: 0.6rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition: color var(--transition-fast);
}
.bottom-nav__label--active { color: var(--color-primary); font-weight: 700; }
.bottom-nav__dot {
  position: absolute;
  bottom: 2px;
  width: 4px; height: 4px;
  background: var(--color-accent);
  border-radius: var(--radius-full);
}

/* Add bottom padding to pages when bottom nav is shown */
@media (max-width: 768px) {
  body { padding-bottom: 64px; }
}
`;