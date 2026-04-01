// app/wishlist/page.tsx — Wishlist Page
'use client';
import React, { useState, useEffect, use } from 'react';
import { Navbar, MobileBottomNav } from '@/components/ui';
import { ProductCard } from '@/components/ui';
import { Product } from '@/types/product';
import { Button } from '@/components/ui';
import { api } from '@/lib/api';
import { Wishlist } from '@/types/wislist';
import { useSession } from 'next-auth/react';
import useTheme from '@/lib/useTheme';

export default function WishlistPage() {
  const [product, setAllProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist]       = useState<Wishlist>();
  const [cartCount, setCartCount]     = useState(0);
  const [loading, setLoading]         = useState(true);
  const [toast, setToast]             = useState<string | null>(null);
  const { config, loading: themeLoading, store } = useTheme();
    const { data: session } = useSession();
  
useEffect(() => {
    api.getProducts().then((data) => {
      setAllProducts(data);
    }).catch((err)=>{
     // console.error(err)
    });
  }, []);
  useEffect(() => {
    api.getWishlist().then((data) => {
      if(!data) return; 
      setWishlist(data);
      // In a real app: load wishlist IDs from localStorage / API
      // For demo, pre-populate with first 3 items
     // setWish9list(new Set(data.products.slice(0, 3).map((p) => p.id)));
      setLoading(false);
    }).catch((err)=>{
      showToast(`Error loading wishlist`);
     setLoading(false);
    });
  }, []);
  

  //const wishlist.items.= wishlist.filter((p) => wishlist.has(p.id));
/*
  const handleRemove = (product: Product) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.delete(product.id);
      return next;
    });
    showToast(`${product.name} removed from wishlist`);
  };
  
  const handleMoveAllToCart = () => {
    setCartCount((c) => c + wishlist.items.length);
    showToast(`${wishlist.items.length} items added to cart`);
  };
  
  */

   const handleAddToCart = (product: Product) => {
      api.addToCart(product.id,1 ).then((data)=>{
      setCartCount((c) => c + 1);
      showToast(`${product.name} added to cart`);
  
      }).catch((err)=>{
        //console.error(err)
            showToast(`Error adding item to cart`);
  
      })
      
    };


  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  return (
    <>
      <Navbar cartCount={cartCount} wishlistCount={wishlist?.items.length} isLoginedIn={!!session?.user?.id} />

      <main style={{ background: 'var(--color-surface)', minHeight: '100vh' }}>
        {/* Page header */}
        <div style={{ background: 'var(--color-primary)', padding: 'var(--space-3xl) 0 var(--space-2xl)' }}>
          <div className="container">
            <nav className="breadcrumb">
              <a href="/" style={{ color: 'rgba(255,255,255,0.5)' }}>Home</a>
              <span className="breadcrumb__sep" style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
              <span className="breadcrumb__current" style={{ color: 'white' }}>Wishlist</span>
            </nav>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'var(--space-md)', flexWrap: 'wrap', gap: 'var(--space-lg)' }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 300, color: 'white' }}>
                  My Wishlist
                </h1>
                {wishlist &&
                <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 'var(--space-sm)', fontSize: '0.85rem' }}>
                  {loading ? '—' : `${wishlist?.items.length} saved item${wishlist?.items.length !== 1 ? 's' : ''}`}
                </p>}
              </div>
              {/*wishlist.items.length > 0 && !loading && (
                <Button
                  title="Move All to Cart"
                  action={handleMoveAllToCart}
                  variant="outline"
                  size="sm"
                  classes=""
                />
              )*/}
            </div>
          </div>
        </div>

        <div className="container" style={{ paddingTop: 'var(--space-3xl)', paddingBottom: 'var(--space-4xl)' }}>
          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ aspectRatio: '3/4' }} className="skeleton" />
              ))}
            </div>
          ) : wishlist?.items.length === 0 || !wishlist? (
            /* Empty state */
            <div className="wishlist-empty animate-fade-up">
              <div className="wishlist-empty__icon">
                <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, marginBottom: 'var(--space-md)' }}>
                Your wishlist is empty
              </h2>
              <p style={{ color: 'var(--color-text-muted)', maxWidth: 360, margin: '0 auto var(--space-2xl)', lineHeight: 1.7 }}>
                Save items you love by tapping the heart icon on any product. They'll appear here for easy access.
              </p>
              <a href="/category/all" className="btn btn--solid btn--lg">
                Start Shopping
              </a>
            </div>
          ) : (
            <>
              {/* Share / sort toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  Tap ♡ on any item to remove it from your wishlist
                </p>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: 'My Maison Wishlist', url: window.location.href });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      showToast('Wishlist link copied!');
                    }
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-muted)', transition: 'color var(--transition-fast)' }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  Share
                </button>
              </div>

              <div className="product-grid stagger">
                {wishlist?.items.map((item) => (
                  <div key={item.id} className="animate-fade-up">
                    <ProductCard
                      product={item.product}
                      onAddToCart={handleAddToCart}
                      onWishlistToggle={()=>/*handleRemove*/null}
                      wishlisted={true}
                      currency={store?.currency ||"NGN"}
                    />
                  </div>
                ))}
              </div>

              {/* You might also like */}
{wishlist?.items.length > 0 &&
              <div style={{ marginTop: 'var(--space-4xl)' }}>
                <div className="section-header">
                  <p className="section-header__eyebrow">Recommendations</p>
                  <h2 className="section-header__title">You Might Also Like</h2>
                </div>
                <div className="product-grid stagger">
                  {wishlist?.items.map
                    ((p) => product.find(e=> e.id !==p.product.id))
                    .slice(0, 4)
                    .map((products) => (
                      <div key={products?.id} className="animate-fade-up">
                        <ProductCard
                          product={products}
                          onAddToCart={handleAddToCart}
                          onWishlistToggle={(p) => {
                           
                              api.addToWishList(p.id).then(()=>{
                            showToast(`${p.name} added to wishlist`);
                              })
                          }}
                          wishlistlisted={false}
                        />
                      </div>
                    ))}
                </div>
              </div>
}
            </>
          )}
        </div>
      </main>

      <MobileBottomNav active="wishlist" cartCount={cartCount} wishlistCount={wishlist?.items.length || 0} />

      {toast && (
        <div className="toast">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
          {toast}
        </div>
      )}

      <style>{`
        .wishlist-empty {
          text-align: center;
          padding: var(--space-4xl) var(--space-xl);
          max-width: 480px;
          margin: 0 auto;
        }
        .wishlist-empty__icon {
          width: 96px; height: 96px;
          background: white;
          border-radius: var(--radius-full);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto var(--space-xl);
          color: var(--color-border);
          box-shadow: var(--shadow-md);
        }
      `}</style>
    </>
  );
}