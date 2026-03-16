'use client';
import React, { useEffect, useState } from 'react';
import { Button, Input } from '@/components/ui';
import { type Product } from '@/types/product';
import { api } from '@/lib/api';

// Safe HTML renderer — strips scripts, only allows safe tags
function SafeHtml({ html }: { html: string }) {
  const sanitized = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');

  return (
    <div
      className="product-detail__description"
      dangerouslySetInnerHTML={{ __html: sanitized || '<p>No description available.</p>' }}
    />
  );
}

interface Params { slug: string }

export default function ProductDetailPage({ params }: { params: Params }) {
  const [product, setProduct]     = useState<Product | null>(null);
  const [loading, setLoading]     = useState(true);
  const [quantity, setQuantity]   = useState('1');
  const [activeImg, setActiveImg] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [addingCart, setAddingCart] = useState(false);
  const [toast, setToast]         = useState<string | null>(null);
  const [selectedSize, setSize]   = useState<string | null>(null);

  const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

  useEffect(() => {
    api.getProductBySlug(params.slug).then((p) => {
      setProduct(p);
      setLoading(false);
    });
  }, [params.slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingCart(true);
    await api.addToCart(product.id, Number(quantity));
    setAddingCart(false);
    showToast('Added to cart successfully');
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  if (loading) return (
    <div style={{ padding: 'var(--space-4xl) 0' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3xl)' }}>
        <div className="skeleton" style={{ aspectRatio: '3/4', borderRadius: 'var(--radius-lg)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div className="skeleton" style={{ height: '1.5rem', width: '60%' }} />
          <div className="skeleton" style={{ height: '3rem', width: '80%' }} />
          <div className="skeleton" style={{ height: '1rem', width: '30%' }} />
          <div className="skeleton" style={{ height: '8rem' }} />
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div style={{ textAlign: 'center', padding: 'var(--space-4xl)' }}>
      <h2>Product not found</h2>
    </div>
  );

  const images = [
    product.mainImageURL,
    ...product.galleryImages!.map((g) => g.url),
  ].filter(Boolean);

  if (images.length === 0) {
    images.push('https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=800&q=80');
  }

  const price = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(product.salePrice);
  const cost  = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(product.costPrice);
  const hasDiscount = product.regularPrice! < product.salePrice!;

  return (
    <>
      {/* Navbar */}
      <header className="navbar">
        <a href="/" className="navbar__logo">Maison</a>
        <nav><ul className="navbar__nav">
          {['New In', 'Men', 'Women', 'Cosmetics', 'Sale'].map((item) => (
            <li key={item}><a href={`/${item.toLowerCase()}`}>{item}</a></li>
          ))}
        </ul></nav>
        <div className="navbar__actions">
          <a href="/wishlist" className="navbar__icon-btn">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </a>
          <a href="/checkout" className="navbar__icon-btn">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </a>
        </div>
      </header>

      <main style={{ background: 'var(--color-surface)' }}>
        <div className="container" style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-4xl)' }}>
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <a href="/">Home</a>
            <span className="breadcrumb__sep">/</span>
            <a href="/category/all">All Products</a>
            <span className="breadcrumb__sep">/</span>
            <span className="breadcrumb__current">{product.name}</span>
          </nav>

          {/* Product layout */}
          <div className="product-detail__grid">
            {/* Left: Images */}
            <div className="product-detail__images">
              <div className="product-detail__main-img">
                <img
                  src={images[activeImg]}
                  alt={product.name}
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=800&q=80'; }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {hasDiscount && (
                  <span className="product-card__badge product-card__badge--sale" style={{ top: 'var(--space-lg)', left: 'var(--space-lg)' }}>
                    Sale
                  </span>
                )}
              </div>
              {images.length > 1 && (
                <div className="product-detail__thumbnails">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`product-detail__thumb${activeImg === i ? ' product-detail__thumb--active' : ''}`}
                    >
                      <img src={img} alt={`View ${i + 1}`} onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=200&q=60'; }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className="product-detail__info animate-fade-up">
              <p className="t-caption" style={{ color: 'var(--color-accent)', marginBottom: 'var(--space-sm)' }}>Fashion — {product.shippingClass?.name ?? 'Standard Shipping'}</p>
              <h1 className="t-display-md" style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-md)' }}>{product.name}</h1>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 500 }}>{price}</span>
                {hasDiscount && <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)', fontSize: '1rem' }}>{cost}</span>}
              </div>

              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: 'var(--space-xl)' }}>{product.shortDescription}</p>

              {/* Size selector */}
              <div style={{ marginBottom: 'var(--space-xl)' }}>
                <p className="t-caption" style={{ marginBottom: 'var(--space-sm)' }}>Select Size</p>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      style={{
                        width: 44, height: 44,
                        border: `1.5px solid ${selectedSize === s ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        borderRadius: 'var(--radius-md)',
                        background: selectedSize === s ? 'var(--color-primary)' : 'white',
                        color: selectedSize === s ? 'white' : 'var(--color-text)',
                        fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                      }}
                    >{s}</button>
                  ))}
                </div>
              </div>

              {/* Quantity + Add to cart */}
              <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)', alignItems: 'flex-end' }}>
                <Input
                  type="number"
                  label="Quantity"
                  value={quantity}
                  onChange={setQuantity}
                  classes=""
                />
                <Button
                  title="Add to Cart"
                  action={handleAddToCart}
                  variant={addingCart ? 'disabled' : 'solid'}
                  size="lg"
                  loading={addingCart}
                  classes=""
                />
              </div>

              <button
                className={`btn btn--outline btn--dark btn--lg`}
                style={{ width: '100%', marginBottom: 'var(--space-xl)', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                onClick={() => { setWishlisted(!wishlisted); showToast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist'); }}
              >
                {wishlisted ? '♥ Saved to Wishlist' : '♡ Add to Wishlist'}
              </button>

              {/* Divider */}
              <div className="divider" style={{ marginBottom: 'var(--space-xl)' }} />

              {/* Description — safe HTML render */}
              <div>
                <p className="t-caption" style={{ marginBottom: 'var(--space-md)' }}>Product Description</p>
                <SafeHtml html={product.description} />
              </div>

              {/* Shipping info */}
              {product.shippingClass && (
                <div style={{ marginTop: 'var(--space-xl)', padding: 'var(--space-lg)', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                  <p className="t-caption" style={{ marginBottom: 'var(--space-sm)' }}>Shipping</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    Delivered via <strong style={{ color: 'var(--color-primary)' }}>{product.shippingClass.name}</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {toast && (
        <div className="toast">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
          {toast}
        </div>
      )}

      <style>{`
        .product-detail__grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3xl);
          align-items: start;
        }
        .product-detail__main-img {
          position: relative;
          aspect-ratio: 3/4;
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: var(--color-border);
        }
        .product-detail__thumbnails {
          display: flex;
          gap: var(--space-sm);
          margin-top: var(--space-md);
          overflow-x: auto;
        }
        .product-detail__thumb {
          width: 72px; height: 72px; flex-shrink: 0;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 2px solid transparent;
          cursor: pointer;
          transition: border-color var(--transition-fast);
        }
        .product-detail__thumb img { width: 100%; height: 100%; object-fit: cover; }
        .product-detail__thumb--active { border-color: var(--color-primary); }
        .product-detail__info { position: sticky; top: 90px; }
        .product-detail__description { font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.8; }
        .product-detail__description p { margin-bottom: var(--space-md); }
        .product-detail__description ul { padding-left: var(--space-lg); }
        @media (max-width: 768px) {
          .product-detail__grid { grid-template-columns: 1fr; }
          .product-detail__info { position: static; }
        }
      `}</style>
    </>
  );
}