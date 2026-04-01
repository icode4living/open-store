// app/page.tsx — Home Page
// ALL content (banners, editorial cards, feature strip, category chips, footer)
// is read from useTheme() → config.sections so the CMS/API controls the page.
'use client';
import React, { useEffect, useState } from 'react';
import { ProductCard} from '@/components/ui/';
import { Navbar, MobileBottomNav } from '@/components/ui';
import {Product} from '@/types/product'
import useTheme, {
  type HeroBannerSection,
  type PromoBannerSection,
  type ThemeCtaBtnConfig,
} from '@/lib/useTheme';
import { api } from '@/lib/api';
import { Category } from '@/types/category';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

// ─── Shared section components ───────────────────────────────────────────────

/** Generic CTA button driven by ThemeCtaBtnConfig */
function ThemeBtn({ btn, extraClass = '' }: { btn: ThemeCtaBtnConfig; extraClass?: string }) {
  const variantClass =
    btn.variant === 'solid'   ? 'btn--solid' :
    btn.variant === 'ghost'   ? 'btn--ghost'  :
                                'btn--outline';
  return (
    <a href={btn.href} className={`btn ${variantClass} btn--lg ${extraClass}`}>
      {btn.label}
    </a>
  );
}

/** Hero / Promo banner driven entirely by section config */
function ThemeBanner({ section }: { section: HeroBannerSection | PromoBannerSection }) {
  const minHeightMap = { hero: '90vh', lg: '55vh', sm: '280px' } as const;
  const align = section.contentAlign ?? 'left';
  const alignStyle = align === 'center'
    ? { textAlign: 'center' as const, alignItems: 'center' as const }
    : align === 'right'
    ? { textAlign: 'right' as const, alignItems: 'flex-end' as const }
    : { textAlign: 'left' as const, alignItems: 'flex-start' as const };

  return (
    <section
      className="theme-banner"
      style={{
        minHeight: minHeightMap[section.size] ?? '55vh',
        backgroundImage: `url(${section.backgroundImage})`,
      }}
    >
      {/* Overlay */}
      <div
        className="theme-banner__overlay"
        style={{ background: section.backgroundOverlay ?? 'rgba(10,10,10,0.55)' }}
      />

      {/* Content */}
      <div
        className="theme-banner__content container animate-fade-up"
        style={{ display: 'flex', flexDirection: 'column', ...alignStyle }}
      >
        {section.eyebrow && (
          <p className="t-caption theme-banner__eyebrow">{section.eyebrow}</p>
        )}
        <h2
          className={`theme-banner__title ${section.size === 'hero' ? 't-display-xl' : section.size === 'lg' ? 't-display-lg' : 't-display-md'}`}
        >
          {section.title}
        </h2>
        {section.subtitle && (
          <p className="theme-banner__subtitle t-body-lg">{section.subtitle}</p>
        )}

        {/* CTAs */}
        {'cta' in section || 'ctaSecondary' in section ? (
          <div className="theme-banner__ctas">
            {section.cta && <ThemeBtn btn={section.cta} />}
            {'ctaSecondary' in section && (section as HeroBannerSection).ctaSecondary && (
              <ThemeBtn btn={(section as HeroBannerSection).ctaSecondary!} extraClass="btn--ghost" />
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { config, loading: themeLoading } = useTheme();
  const s = config.sections;

  const [products, setProducts]     = useState<Product[]>([]);
  const [prodLoading, setProdLoad]  = useState(true);
  const [activeCategory, setCategory] = useState('all');
  const [wishlist, setWishlist]     = useState<Set<string>>(new Set());
  const [cartCount, setCartCount]   = useState(0);
  const [toast, setToast]           = useState<string | null>(null);
  const [email, setEmail]           = useState('');
const [categories, setCategories] = useState<Category[]>([])
  const { data: session } = useSession();

  useEffect(() => {
    api.getProducts().then((data) => {
    //  console.log(data)
      setProducts(data as Product[]);
      setProdLoad(false);
    });
    //get categories
    api.getCategories().then((data)=>{
      setCategories(data as Category[])
    })

  }, []);

  const handleAddToCart = (product: Product) => {
    api.addToCart(product.id,1 ).then((data)=>{
    setCartCount((c) => c + 1);
    showToast(`${product.name} added to cart`);

    }).catch((err)=>{
      //console.error(err)
          showToast(`Error adding item to cart`);

    })
    
  };

  const handleWishlist = (id:string) => {
    /*setWishlist((prev) => {
      const next = new Set(prev);
      next.has(product.id) ? next.delete(product.id) : next.add(product.id);
      return next;
    });*/
    if (!session?.user?.id) return  showToast(`Login to create wishlist...`);
    api.addToWishList(id).then(()=>{
      showToast("Item added to cart")
    }).catch((err)=>{
      console.error(err)
      showToast("Error adding item to wishlist")
    })
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const visibleProducts = products.slice(0, s.featuredProducts.limit ?? 8);

  return (
    <>
      <Navbar cartCount={cartCount} wishlistCount={wishlist.size}  isLoginedIn={!!session} />

      <main>
        {/* ── 1. Hero Banner ─────────────────────────────────────── */}
        {s.heroBanner.enabled && <ThemeBanner section={s.heroBanner} />}

        {/* ── 2. Category Chips ──────────────────────────────────── */}
        {s.categoryChips.enabled && (
          <section className="section--sm">
            <div className="container">
              <div className="category-chips">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    className={`category-chip${activeCategory === cat.slug ? ' category-chip--active' : ''}`}
                    onClick={() => setCategory(cat.slug)}
                    href={`category/${cat.slug}`}
                 >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 3. Featured Products ───────────────────────────────── */}
        {s.featuredProducts.enabled && (
          <section className="section section--cream">
            <div className="container">
              <div className="section-header stagger animate-fade-up">
                {s.featuredProducts.eyebrow && (
                  <p className="section-header__eyebrow">{s.featuredProducts.eyebrow}</p>
                )}
                <h2 className="section-header__title">{s.featuredProducts.title}</h2>
                {s.featuredProducts.body && (
                  <p className="section-header__body">{s.featuredProducts.body}</p>
                )}
              </div>

              {prodLoading ? (
                <div className="product-grid">
                  {Array.from({ length: s.featuredProducts.limit }).map((_, i) => (
                    <div key={i} style={{ aspectRatio: '3/4' }} className="skeleton" />
                  ))}
                </div>
              ) : (
                <div className="product-grid stagger">
                  {visibleProducts.map((product) => (
                    <div key={product.id} className="animate-fade-up">
                      <ProductCard
                        product={product}
                        currency={'NGN'}
                        onAddToCart={handleAddToCart}
                        onWishlistToggle={()=>handleWishlist(product.id)}
                        wishlisted={wishlist.has(product.id)}
                      />
                    </div>
                  ))}
                </div>
              )}

              {s.featuredProducts.ctaHref && s.featuredProducts.ctaLabel && (
                <div style={{ textAlign: 'center', marginTop: 'var(--space-3xl)' }}>
                  <a href={s.featuredProducts.ctaHref} className="btn btn--outline btn--dark btn--lg">
                    {s.featuredProducts.ctaLabel}
                  </a>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── 4. Editorial Grid ──────────────────────────────────── */}
        {s.editorialGrid.enabled && s.editorialGrid.cards.length > 0 && (
          <section className="section">
            <div className="container">
              <div className="section-header section-header--center animate-fade-up">
                {s.editorialGrid.eyebrow && (
                  <p className="section-header__eyebrow">{s.editorialGrid.eyebrow}</p>
                )}
                <h2 className="section-header__title">{s.editorialGrid.title}</h2>
              </div>

              <div
                className="editorial-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${Math.min(s.editorialGrid.cards.length, 3)}, 1fr)`,
                  gap: 'var(--space-lg)',
                }}
              >
                {s.editorialGrid.cards.map((card) => (
                  <a
                    key={card.href}
                    href={card.href}
                    className="editorial-card"
                    style={{
                      position: 'relative', display: 'block',
                      aspectRatio: '3/4', overflow: 'hidden',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <img
                      src={card.image}
                      alt={card.title}
                      className="editorial-card__img"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    />
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to top, rgba(10,10,10,0.72) 0%, transparent 60%)',
                      display: 'flex', alignItems: 'flex-end',
                      padding: 'var(--space-xl)',
                    }}>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 300, color: 'white', marginBottom: '0.25rem' }}>
                          {card.title}
                        </h3>
                        {card.subtitle && (
                          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: 'var(--space-md)' }}>
                            {card.subtitle}
                          </p>
                        )}
                        <span style={{
                          fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                          fontWeight: 600, color: 'var(--color-accent)',
                        }}>
                          {card.ctaLabel ?? 'Shop Now'} →
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 5. Promo Banner ────────────────────────────────────── */}
        {s.promoBanner.enabled && <ThemeBanner section={s.promoBanner} />}

        {/* ── 6. Secondary Banner (optional, off by default) ─────── */}
        {s.secondaryBanner.enabled && <ThemeBanner section={s.secondaryBanner} />}

        {/* ── 7. Feature Strip ───────────────────────────────────── */}
        {s.featureStrip.enabled && s.featureStrip.items.length > 0 && (
          <section
            className="section--sm"
            style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}
          >
            <div className="container">
              <div
                className="feature-strip"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${s.featureStrip.items.length}, 1fr)`,
                  gap: 'var(--space-xl)',
                  textAlign: 'center',
                }}
              >
                {s.featureStrip.items.map((f) => (
                  <div
                    key={f.label}
                    style={{ padding: 'var(--space-lg) 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-sm)' }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{f.icon}</span>
                    <p style={{ fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{f.label}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 8. Newsletter (optional, off by default) ───────────── */}
        {s.newsletter.enabled && (
          <section
            className="section"
            style={{
              background: s.newsletter.backgroundStyle === 'dark'
                ? 'var(--color-primary)'
                : s.newsletter.backgroundStyle === 'accent'
                ? 'var(--color-accent)'
                : 'var(--color-surface)',
            }}
          >
            <div className="container" style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
              <h2
                className="t-display-md"
                style={{ color: s.newsletter.backgroundStyle === 'light' ? 'var(--color-primary)' : 'white', marginBottom: 'var(--space-md)' }}
              >
                {s.newsletter.title}
              </h2>
              {s.newsletter.subtitle && (
                <p style={{ color: s.newsletter.backgroundStyle === 'light' ? 'var(--color-text-muted)' : 'rgba(255,255,255,0.65)', marginBottom: 'var(--space-2xl)' }}>
                  {s.newsletter.subtitle}
                </p>
              )}
              <div style={{ display: 'flex', gap: 'var(--space-sm)', maxWidth: 420, margin: '0 auto' }}>
                <input
                  type="email"
                  placeholder={s.newsletter.placeholder ?? 'Your email'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  style={{ flex: 1 }}
                />
                <button
                  className="btn btn--solid btn--sm"
                  style={{ flexShrink: 0 }}
                  onClick={() => { showToast('Subscribed! 🎉'); setEmail(''); }}
                >
                  {s.newsletter.ctaLabel ?? 'Subscribe'}
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="container">
          <div className="footer__grid">
            <div className="footer__brand">
              <div className="navbar__logo" style={{ color: 'var(--color-text-inverse)', fontSize: '1.75rem' }}>
                {config.meta.logoText}
              </div>
              <p>{config.footer.tagline}</p>
              {/* Socials */}
              {config.footer.socials.length > 0 && (
                <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                  {config.footer.socials.map((s) => (
                    <a
                      key={s.platform}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(248,245,240,0.45)', textTransform: 'uppercase', transition: 'color 0.2s' }}
                    >
                      {s.platform}
                    </a>
                  ))}
                </div>
              )}
            </div>
            {config.footer.columns.map((col) => (
              <div key={col.title} className="footer__col">
                <h4>{col.title}</h4>
                <ul>
                  {col.links.map((l) => (
                    <li key={l.label}><a href={l.href}>{l.label}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="footer__bottom">
            <p>{config.footer.copyright.replace('{year}', String(new Date().getFullYear()))}</p>
            <p>{config.footer.footnote}</p>
          </div>
        </div>
      </footer>

      {/* ── Mobile Bottom Nav ── */}
      <MobileBottomNav active="home" cartCount={cartCount} wishlistCount={wishlist.size} />

      {/* ── Toast ── */}
      {toast && (
        <div className="toast">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
          {toast}
        </div>
      )}

      <style>{`
        /* ── Theme Banner ── */
        .theme-banner {
          position: relative;
          display: flex;
          align-items: center;
          background-color: var(--color-primary);
          background-size: cover;
          background-position: center;
          overflow: hidden;
        }
        .theme-banner__overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
        }
        .theme-banner__content {
          position: relative;
          z-index: 2;
          color: var(--color-text-inverse);
          padding-top: var(--space-3xl);
          padding-bottom: var(--space-3xl);
        }
        .theme-banner__eyebrow {
          color: var(--color-accent);
          margin-bottom: var(--space-md);
        }
        .theme-banner__title {
          color: var(--color-text-inverse);
          max-width: 800px;
        }
        .theme-banner__subtitle {
          max-width: 520px;
          margin-top: var(--space-lg);
          color: rgba(248,245,240,0.72);
          line-height: 1.7;
        }
        .theme-banner__ctas {
          display: flex;
          gap: var(--space-md);
          flex-wrap: wrap;
          margin-top: var(--space-2xl);
        }
        .btn--ghost {
          background: transparent;
          color: rgba(255,255,255,0.7);
          border: 1.5px solid rgba(255,255,255,0.25);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-size: 0.72rem;
          padding: 0.875rem 2rem;
          min-height: 52px;
          border-radius: var(--radius-sm);
          display: inline-flex; align-items: center; justify-content: center;
          transition: all var(--transition-normal);
          font-family: var(--font-body);
          font-weight: 500;
          white-space: nowrap;
        }
        .btn--ghost:hover {
          background: rgba(255,255,255,0.08);
          color: white;
          border-color: rgba(255,255,255,0.5);
        }
        /* Editorial */
        .editorial-card:hover .editorial-card__img { transform: scale(1.06); }
        @media (max-width: 768px) {
          .editorial-grid { grid-template-columns: 1fr !important; }
          .feature-strip { grid-template-columns: repeat(2, 1fr) !important; }
          .theme-banner__title { font-size: clamp(2rem, 10vw, 3rem); }
        }
        @media (max-width: 1024px) and (min-width: 769px) {
          .editorial-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .editorial-grid > *:last-child:nth-child(odd) { grid-column: span 2; aspect-ratio: 16/7 !important; }
        }
      `}</style>
    </>
  );
}