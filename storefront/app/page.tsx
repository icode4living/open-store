// app/page.tsx — Home Page
'use client';
import React, { useEffect, useState } from 'react';
import { Banner } from '@/components/ui';
import { ProductCard, type Product } from '@/components/ui';
import  useTheme  from '@/lib/useTheme';
import { api } from '@/lib/api';

const CATEGORIES = ['All', 'Men', 'Women', 'Accessories', 'Cosmetics', 'New Arrivals', 'Sale'];

const EDITORIAL_SECTIONS = [
  {
    title: "Men's Collection",
    subtitle: 'Refined essentials for the modern man',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700&q=80',
    href: '/category/men',
    accent: true,
  },
  {
    title: "Women's Collection",
    subtitle: 'Effortless elegance for every occasion',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=700&q=80',
    href: '/category/women',
  },
  {
    title: 'Beauty & Cosmetics',
    subtitle: 'Luxury skincare and cosmetics',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=700&q=80',
    href: '/category/cosmetics',
  },
];

export default function HomePage() {
  useTheme(); // loads & applies theme config

  const [products, setProducts]       = useState<Product[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeCategory, setCategory] = useState('All');
  const [wishlist, setWishlist]       = useState<Set<string>>(new Set());
  const [cartCount, setCartCount]     = useState(0);
  const [toast, setToast]             = useState<string | null>(null);

  useEffect(() => {
    api.getProducts().then((data) => {
      setProducts(data.data.products);
      setLoading(false);
    });
  }, []);

  const handleAddToCart = (product: Product) => {
    setCartCount((c) => c + 1);
    showToast(`${product.name} added to cart`);
  };

  const handleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(product.id) ? next.delete(product.id) : next.add(product.id);
      return next;
    });
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const visibleProducts = products.slice(0, 8);

  return (
    <>
      {/* ── Navbar ── */}
      <header className="navbar">
        <a href="/" className="navbar__logo">Maison</a>
        <nav>
          <ul className="navbar__nav">
            {['New In', 'Men', 'Women', 'Cosmetics', 'Sale', 'Blog'].map((item) => (
              <li key={item}><a href={`/${item.toLowerCase().replace(' ', '-')}`}>{item}</a></li>
            ))}
          </ul>
        </nav>
        <div className="navbar__actions">
          <button className="navbar__icon-btn hide-mobile" aria-label="Search">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </button>
          <a href="/auth/signin" className="navbar__icon-btn hide-mobile" aria-label="Account">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </a>
          <a href="/wishlist" className="navbar__icon-btn" aria-label="Wishlist">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </a>
          <a href="/checkout" className="navbar__icon-btn" aria-label="Cart">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            {cartCount > 0 && <span className="navbar__cart-count">{cartCount}</span>}
          </a>
        </div>
      </header>

      <main>
        {/* ── Hero Banner ── */}
        <Banner
          size="hero"
          title="The New Season Awaits"
          subtitle="Discover curated collections that define modern luxury — crafted for those who wear confidence effortlessly."
          cta={{ label: 'Explore Collection', href: '/category/new-in' }}
          backgroundImage="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=85"
        />

        {/* ── Category Chips ── */}
        <section className="section--sm">
          <div className="container">
            <div className="category-chips">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`category-chip${activeCategory === cat ? ' category-chip--active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured Products ── */}
        <section className="section section--cream">
          <div className="container">
            <div className="section-header stagger animate-fade-up">
              <p className="section-header__eyebrow">Featured</p>
              <h2 className="section-header__title">New Arrivals</h2>
              <p className="section-header__body">
                Handpicked pieces from our latest collections — where craftsmanship meets contemporary style.
              </p>
            </div>

            {loading ? (
              <div className="product-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{ aspectRatio: '3/4' }} className="skeleton" />
                ))}
              </div>
            ) : (
              <div className="product-grid stagger">
                {visibleProducts.map((product) => (
                  <div key={product.id} className="animate-fade-up">
                    <ProductCard
                      product={product}
                      onAddToCart={handleAddToCart}
                      onWishlistToggle={handleWishlist}
                      wishlisted={wishlist.has(product.id)}
                    />
                  </div>
                ))}
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: 'var(--space-3xl)' }}>
              <a href="/category/all" className="btn btn--outline btn--dark btn--lg">
                View All Products
              </a>
            </div>
          </div>
        </section>

        {/* ── Editorial Grid ── */}
        <section className="section">
          <div className="container">
            <div className="section-header section-header--center animate-fade-up">
              <p className="section-header__eyebrow">Shop by Category</p>
              <h2 className="section-header__title">Curated for You</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-lg)' }} className="editorial-grid">
              {EDITORIAL_SECTIONS.map((sec) => (
                <a
                  href={sec.href}
                  key={sec.title}
                  className="editorial-card"
                  style={{
                    position: 'relative',
                    display: 'block',
                    aspectRatio: '3/4',
                    overflow: 'hidden',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <img
                    src={sec.image}
                    alt={sec.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    className="editorial-card__img"
                  />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(10,10,10,0.7) 0%, transparent 60%)',
                    display: 'flex', alignItems: 'flex-end',
                    padding: 'var(--space-xl)',
                  }}>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 300, color: 'white', marginBottom: '0.25rem' }}>{sec.title}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: 'var(--space-md)' }}>{sec.subtitle}</p>
                      <span style={{
                        fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                        fontWeight: 600, color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '0.35rem'
                      }}>
                        Shop Now →
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── Promo Banner ── */}
        <Banner
          size="lg"
          title="Luxury Cosmetics"
          subtitle="Discover our exclusive beauty range — where science meets artistry."
          cta={{ label: 'Shop Beauty', href: '/category/cosmetics' }}
          backgroundImage="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1400&q=80"
        />

        {/* ── Features strip ── */}
        <section className="section--sm" style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-xl)', textAlign: 'center' }}>
              {[
                { icon: '🚚', label: 'Free Delivery', desc: 'On orders over ₦15,000' },
                { icon: '↩️', label: 'Easy Returns', desc: '30-day return policy' },
                { icon: '🔒', label: 'Secure Payment', desc: 'SSL encrypted checkout' },
                { icon: '💎', label: 'Premium Quality', desc: 'Curated luxury pieces' },
              ].map((f) => (
                <div key={f.label} style={{ padding: 'var(--space-lg) 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <span style={{ fontSize: '1.5rem' }}>{f.icon}</span>
                  <p style={{ fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{f.label}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="container">
          <div className="footer__grid">
            <div className="footer__brand">
              <div className="navbar__logo" style={{ color: 'var(--color-text-inverse)', fontSize: '1.75rem' }}>Maison</div>
              <p>Modern luxury fashion and cosmetics, crafted for those who live boldly and dress with intention.</p>
            </div>
            {[
              { title: 'Shop', links: ['New In', 'Men', 'Women', 'Cosmetics', 'Sale'] },
              { title: 'Help', links: ['Track Order', 'Returns', 'Shipping', 'FAQ', 'Contact'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press', 'Sustainability'] },
            ].map((col) => (
              <div key={col.title} className="footer__col">
                <h4>{col.title}</h4>
                <ul>{col.links.map((l) => <li key={l}><a href="#">{l}</a></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="footer__bottom">
            <p>© {new Date().getFullYear()} Maison. All rights reserved.</p>
            <p>Designed with intention.</p>
          </div>
        </div>
      </footer>

      {/* ── Toast ── */}
      {toast && (
        <div className="toast">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
          {toast}
        </div>
      )}

      <style>{`
        .editorial-card:hover .editorial-card__img { transform: scale(1.06); }
        @media (max-width: 768px) {
          .editorial-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 1024px) and (min-width: 769px) {
          .editorial-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .editorial-grid > *:last-child { grid-column: span 2; aspect-ratio: 16/7 !important; }
        }
      `}</style>
    </>
  );
}