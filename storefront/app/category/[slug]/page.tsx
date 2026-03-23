'use client';
import React, { useEffect, useState } from 'react';
import { ProductCard, Input} from '@/components/ui';
import { api } from '@/lib/api';
import { Navbar, MobileBottomNav } from '@/components/ui';
import { useParams } from 'next/navigation'
import { Product } from '@/types/product';
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low–High', value: 'price-asc' },
  { label: 'Price: High–Low', value: 'price-desc' },
  { label: 'Popular', value: 'popular' },
];

export default function CategoryPage() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [sort, setSort]           = useState('newest');
  const [wishlist, setWishlist]   = useState<Set<string>>(new Set());
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount] = useState(3);
const params = useParams<{slug:string}>()
  const categoryTitle =  params.slug//.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  useEffect(() => {
    api.getProductByCategory(categoryTitle).then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, [categoryTitle]);

  const filtered = products
    .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.shortDescription?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'price-asc')  return a.salePrice - b.salePrice;
      if (sort === 'price-desc') return b.salePrice - a.salePrice;
      return 0;
    });

  return (
    <>
          <Navbar cartCount={cartCount} wishlistCount={wishlistCount} />

      {/* Page header */}
      <div style={{ background: 'var(--color-primary)', padding: 'var(--space-3xl) 0 var(--space-2xl)' }}>
        <div className="container">
          <nav className="breadcrumb">
            <a href="/" style={{ color: 'rgba(255,255,255,0.5)' }}>Home</a>
            <span className="breadcrumb__sep" style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="breadcrumb__current" style={{ color: 'white' }}>{categoryTitle}</span>
          </nav>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 300, color: 'white', marginTop: 'var(--space-md)' }}>
            {categoryTitle}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', marginTop: 'var(--space-sm)', fontSize: '0.9rem' }}>
            {filtered.length} product{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <main style={{ background: 'var(--color-surface)', paddingBottom: 'var(--space-4xl)' }}>
        <div className="container" style={{ paddingTop: 'var(--space-xl)' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'flex-end', marginBottom: 'var(--space-xl)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <Input
                type="search"
                placeholder="Search products…"
                value={search}
                onChange={setSearch}
                icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <label className="t-caption" style={{ whiteSpace: 'nowrap' }}>Sort by</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{ padding: '0.65rem var(--space-md)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', background: 'white', cursor: 'pointer' }}
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{ aspectRatio: '3/4' }} className="skeleton" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-4xl)' }}>
              <p style={{ fontSize: '3rem', marginBottom: 'var(--space-lg)' }}>🔍</p>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 'var(--space-md)' }}>No products found</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>Try adjusting your search or browse all products.</p>
            </div>
          ) : (
            <div className="product-grid stagger">
              {filtered.map((product) => (
                <a href={`/product/${product.slug}`} key={product.id} className="animate-fade-up" style={{ textDecoration: 'none' }}>
                  <ProductCard
                    product={product}
                    currency='NGN'
                    onAddToCart={() => setCartCount((c) => c + 1)}
                    onWishlistToggle={(p) => setWishlist((prev) => { const n = new Set(prev); n.has(p.id) ? n.delete(p.id) : n.add(p.id); return n; })}
                    wishlisted={wishlist.has(product.id)}
                  />
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

// ═══════════════════════════════════════════════
// 404 NOT FOUND PAGE
// ═══════════════════════════════════════════════
export function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column' }}>
      <header className="navbar">
        <a href="/" className="navbar__logo">Maison</a>
      </header>
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 'var(--space-4xl)' }}>
        <div className="animate-fade-up">
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(6rem, 20vw, 12rem)', fontWeight: 300, lineHeight: 1, color: 'var(--color-border)', marginBottom: 'var(--space-lg)' }}>404</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 400, marginBottom: 'var(--space-md)' }}>Page Not Found</h1>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: 400, margin: '0 auto var(--space-2xl)', lineHeight: 1.7 }}>
            The page you're looking for doesn't exist or has been moved. Let's get you back to shopping.
          </p>
          <a href="/" className="btn btn--solid btn--lg">Return Home</a>
        </div>
      </main>
    </div>
  );
}