
'use client';

import React, {
  useEffect, useState, useCallback, useRef, useMemo,
} from 'react';
import { Navbar, MobileBottomNav } from '@/components/ui/NavBar';
import { api } from '@/lib/api';
import {
  Cart,
  CartItem,
  cartSubtotal,
  cartItemCount,
  shippingCost,
  cartTotal,
  SHIPPING_THRESHOLD,
} from '@/types/cart';

// ─── Formatter ────────────────────────────────────────────────────────────────
const NGN = (n: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', minimumFractionDigits: 0,
  }).format(n);

// ─── Coupon map (replace with API in production) ──────────────────────────────
const COUPONS: Record<string, { rate: number; desc: string }> = {
  MAISON10: { rate: 0.10, desc: '10% off your order' },
  LUXURY20: { rate: 0.20, desc: '20% off your order' },
  WELCOME5: { rate: 0.05, desc: '5% welcome discount' },
};

// ═══════════════════════════════════════════════════════════════════
// QuantityStepper
// ═══════════════════════════════════════════════════════════════════
function QuantityStepper({
  value, min = 1, max = 99, onChange, disabled,
}: {
  value: number; min?: number; max?: number;
  onChange: (v: number) => void; disabled?: boolean;
}) {
  const [local, setLocal] = useState(String(value));
  useEffect(() => setLocal(String(value)), [value]);

  const commit = (raw: string) => {
    const n = parseInt(raw, 10);
    if (isNaN(n)) { setLocal(String(value)); return; }
    const clamped = Math.max(min, Math.min(max, n));
    setLocal(String(clamped));
    if (clamped !== value) onChange(clamped);
  };

  return (
    <div className="qty" aria-label="Quantity">
      <button className="qty__btn" onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min} aria-label="Decrease">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
      <input className="qty__val" type="number" min={min} max={max}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && commit((e.target as HTMLInputElement).value)}
        disabled={disabled} aria-label="Qty" />
      <button className="qty__btn" onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max} aria-label="Increase">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CartRow – single line item
// ═══════════════════════════════════════════════════════════════════
function CartRow({
  item, onUpdate, onRemove, onSave, updating, removing,
}: {
  item: CartItem;
  onUpdate: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onSave:   (id: string) => void;
  updating: boolean;
  removing: boolean;
}) {
  const p = item.product;
  const [imgErr, setImgErr] = useState(false);
  const busy = updating || removing;

  const src = !imgErr && p?.mainImageURL
    ? p.mainImageURL
    : 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=200&q=70';

  const lineTotal = (p?.salePrice ?? 0) * item.quantity;

  return (
    <div className={`crow${busy ? ' crow--busy' : ''}${removing ? ' crow--out' : ''}`} role="listitem">

      {/* Thumbnail */}
      <a href={`/product/${p?.slug ?? ''}`} className="crow__thumb">
        <img src={src} alt={p?.name ?? 'Product'} className="crow__img"
          onError={() => setImgErr(true)} loading="lazy" />
      </a>

      {/* Info */}
      <div className="crow__body">
        <div className="crow__top">
          <div className="crow__meta">
            <p className="crow__cat">Fashion</p>
            <a href={`/product/${p?.slug ?? ''}`} className="crow__name">{p?.name ?? 'Unknown'}</a>
            <p className="crow__desc">{p?.shortDescription}</p>
            {/* Mobile price */}
            <p className="crow__price-mobile">{NGN(p?.salePrice ?? 0)} <span>each</span></p>
          </div>
          {/* Desktop price + total */}
          <div className="crow__right">
            <p className="crow__unit">{NGN(p?.salePrice ?? 0)}</p>
            <p className="crow__unit-lbl">each</p>
            <div className="crow__total-wrap">
              {updating
                ? <span className="cspinner" />
                : <p className="crow__total">{NGN(lineTotal)}</p>
              }
            </div>
          </div>
        </div>

        <div className="crow__foot">
          <QuantityStepper value={item.quantity}
            onChange={(q) => onUpdate(item.productID, q)} disabled={busy} />

          <div className="crow__acts">
            <button className="crow__act crow__act--save" onClick={() => onSave(item.productID)} disabled={busy}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              Save for later
            </button>
            <span className="crow__sep">·</span>
            <button className="crow__act crow__act--del" onClick={() => onRemove(item.productID)} disabled={busy}>
              {removing ? <span className="cspinner" /> : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                  Remove
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SavedCard – "saved for later" item card
// ═══════════════════════════════════════════════════════════════════
function SavedCard({ item, onMoveToCart }: { item: CartItem; onMoveToCart: (id: string) => void }) {
  const p = item.product;
  const [imgErr, setImgErr] = useState(false);
  const src = !imgErr && p?.mainImageURL ? p.mainImageURL
    : 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=200&q=70';

  return (
    <div className="saved-card">
      <a href={`/product/${p?.slug ?? ''}`} className="saved-card__thumb">
        <img src={src} alt={p?.name} className="saved-card__img" onError={() => setImgErr(true)} />
      </a>
      <div className="saved-card__info">
        <a href={`/product/${p?.slug ?? ''}`} className="saved-card__name">{p?.name}</a>
        <p className="saved-card__price">{NGN(p?.salePrice ?? 0)}</p>
        <button className="btn btn--outline btn--dark btn--sm saved-card__cta"
          onClick={() => onMoveToCart(item.productID)}>Move to Cart</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CouponInput
// ═══════════════════════════════════════════════════════════════════
function CouponInput({
  onApply, appliedCode, appliedRate,
}: { onApply: (code: string, rate: number) => void; appliedCode: string; appliedRate: number }) {
  const [code, setCode]     = useState('');
  const [err, setErr]       = useState('');
  const [busy, setBusy]     = useState(false);

  const apply = async () => {
    if (!code.trim()) return;
    setBusy(true); setErr('');
    await new Promise((r) => setTimeout(r, 550));
    const entry = COUPONS[code.trim().toUpperCase()];
    if (entry) { onApply(code.trim().toUpperCase(), entry.rate); setCode(''); }
    else setErr('Invalid or expired code.');
    setBusy(false);
  };

  if (appliedCode) {
    return (
      <div className="coup-applied">
        <div className="coup-applied__left">
          <span className="coup-applied__tick">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
          </span>
          <div>
            <p className="coup-applied__code">{appliedCode}</p>
            <p className="coup-applied__desc">{COUPONS[appliedCode]?.desc}</p>
          </div>
        </div>
        <button className="coup-applied__remove" onClick={() => onApply('', 0)} aria-label="Remove coupon">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="coup">
      <p className="coup__lbl">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
          <line x1="7" y1="7" x2="7.01" y2="7"/>
        </svg>
        Apply coupon code
      </p>
      <div className="coup__row">
        <input className="coup__input" type="text" placeholder="e.g. MAISON10"
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setErr(''); }}
          onKeyDown={(e) => e.key === 'Enter' && apply()}
          disabled={busy} autoComplete="off" />
        <button className="btn btn--solid btn--sm coup__btn"
          onClick={apply} disabled={busy || !code.trim()}>
          {busy ? <span className="btn__loader" style={{ width: 12, height: 12, borderWidth: 2 }} /> : 'Apply'}
        </button>
      </div>
      {err && <p className="coup__err">{err}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ShippingProgress
// ═══════════════════════════════════════════════════════════════════
function ShippingBar({ subtotal }: { subtotal: number }) {
  const pct  = Math.min(100, Math.round((subtotal / SHIPPING_THRESHOLD) * 100));
  const left = Math.max(0, SHIPPING_THRESHOLD - subtotal);
  const free = subtotal >= SHIPPING_THRESHOLD;

  return (
    <div className="ship-bar">
      <div className="ship-bar__head">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={free ? 'var(--color-success)' : 'var(--color-accent)'} strokeWidth="1.5">
          <rect x="1" y="3" width="15" height="13"/>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
          <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
        <p className="ship-bar__msg">
          {free
            ? <strong style={{ color: 'var(--color-success)' }}>🎉 You've unlocked free shipping!</strong>
            : <>Add <strong>{NGN(left)}</strong> more for free delivery</>
          }
        </p>
      </div>
      <div className="ship-bar__track">
        <div className={`ship-bar__fill${free ? ' ship-bar__fill--done' : ''}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// OrderSummary sidebar
// ═══════════════════════════════════════════════════════════════════
function Summary({
  cart, couponCode, couponRate, onCoupon, onCheckout, checkingOut,
}: {
  cart: Cart; couponCode: string; couponRate: number;
  onCoupon: (c: string, r: number) => void;
  onCheckout: () => void; checkingOut: boolean;
}) {
  const items    = cart.items ?? [];
  const sub      = cartSubtotal(items);
  const discount = sub * couponRate;
  const ship     = shippingCost(sub);
  const total    = cartTotal(items, discount);
  const count    = cartItemCount(items);

  const lines = [
    { key: 'sub',  label: `Subtotal (${count} item${count !== 1 ? 's' : ''})`, val: sub,      muted: false },
    ...(discount > 0 ? [{ key: 'disc', label: `Discount (${Math.round(couponRate * 100)}%)`, val: -discount, muted: false }] : []),
    { key: 'ship', label: 'Shipping',                                            val: ship,     muted: true  },
  ];

  return (
    <aside className="summary">
      <h2 className="summary__title">Order Summary</h2>

      <div className="summary__lines">
        {lines.map((l) => (
          <div key={l.key} className="summary__line">
            <span className={`summary__ll${l.muted ? ' summary__ll--muted' : ''}`}>{l.label}</span>
            <span className="summary__lv" style={{
              color: l.val < 0 ? 'var(--color-success)' : l.muted ? 'var(--color-text-muted)' : 'inherit',
            }}>
              {l.val === 0 && l.key === 'ship'
                ? <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Free</span>
                : `${l.val < 0 ? '−' : ''}${NGN(Math.abs(l.val))}`}
            </span>
          </div>
        ))}
      </div>

      <div className="summary__div" />
      <div className="summary__total">
        <span>Total</span>
        <span>{NGN(total)}</span>
      </div>

      {/* Coupon */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <CouponInput onApply={onCoupon} appliedCode={couponCode} appliedRate={couponRate} />
      </div>

      {/* CTA */}
      <button
        className="btn btn--solid btn--lg summary__cta"
        onClick={onCheckout}
        disabled={checkingOut || items.length === 0}
      >
        {checkingOut ? (
          <><span className="btn__loader" /> Processing…</>
        ) : (
          <>
            Proceed to Checkout
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </>
        )}
      </button>

      {/* Trust */}
      <div className="summary__trust">
        {[
          ['🔒', 'SSL encrypted checkout'],
          ['↩️', '30-day easy returns'],
          ['💳', 'Paystack · Flutterwave'],
        ].map(([icon, txt]) => (
          <p key={txt} className="summary__trust-row"><span>{icon}</span>{txt}</p>
        ))}
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Skeleton
// ═══════════════════════════════════════════════════════════════════
function SkeletonRow() {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-lg)', padding: 'var(--space-xl)', background: 'white', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-sm)' }}>
      <div className="skeleton" style={{ width: 96, height: 120, borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="skeleton" style={{ height: 10, width: '28%', borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 16, width: '52%', borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 12, width: '38%', borderRadius: 4 }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <div className="skeleton" style={{ height: 38, width: 116, borderRadius: 'var(--radius-md)' }} />
          <div className="skeleton" style={{ height: 38, width: 72, borderRadius: 'var(--radius-md)' }} />
        </div>
      </div>
      <div className="skeleton" style={{ width: 72, height: 22, borderRadius: 4, flexShrink: 0, marginTop: 2 }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CartPage (default export)
// ═══════════════════════════════════════════════════════════════════
export default function CartPage() {
  const [cart, setCart]             = useState<Cart>({ id: '', items: [] });
  const [saved, setSaved]           = useState<CartItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [updating, setUpdating]     = useState<Record<string, boolean>>({});
  const [removing, setRemoving]     = useState<Record<string, boolean>>({});
  const [couponCode, setCouponCode] = useState('');
  const [couponRate, setCouponRate] = useState(0);
  const [toCheckout, setToCheckout] = useState(false);
  const [toast, setToast]           = useState<{ msg: string; type: 'ok' | 'err' | 'info' } | null>(null);
  const toastRef                    = useRef<ReturnType<typeof setTimeout>>();

  const items     = useMemo(() => cart.items ?? [], [cart]);
  const itemCount = useMemo(() => cartItemCount(items), [items]);
  const subtotal  = useMemo(() => cartSubtotal(items), [items]);

  // Load
  useEffect(() => {
    api.getCart().then((data ) => { setCart(data); 
        setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Toast
  const pop = useCallback((msg: string, type: 'ok' | 'err' | 'info' = 'ok') => {
    clearTimeout(toastRef.current);
    setToast({ msg, type });
    toastRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  // Update qty
  const handleUpdate = useCallback(async (id: string, qty: number) => {
    setUpdating((u) => ({ ...u, [id]: true }));
    try {
      const data  = await api.updateCartItem(id, qty);
      setCart(data);
    } catch { pop('Could not update quantity.', 'err'); }
    finally { setUpdating((u) => ({ ...u, [id]: false })); }
  }, [pop]);

  // Remove
  const handleRemove = useCallback(async (id: string) => {
    setRemoving((r) => ({ ...r, [id]: true }));
    await new Promise((r) => setTimeout(r, 180));
    try {
      const data  = await api.removeFromCart(id);
      setCart(data);
      pop('Item removed from cart');
    } catch {
      pop('Could not remove item.', 'err');
      setRemoving((r) => ({ ...r, [id]: false }));
    }
  }, [pop]);

  // Save for later
  const handleSave = useCallback(async (id: string) => {
    const item = items.find((i) => i.productID === id);
    if (!item) return;
    setRemoving((r) => ({ ...r, [id]: true }));
    await new Promise((r) => setTimeout(r, 180));
    try {
      const  data = await api.removeFromCart(id);
      setCart(data);
      setSaved((prev) => prev.find((i) => i.productID === id) ? prev : [...prev, item]);
      pop(`${item.product?.name ?? 'Item'} saved for later`, 'info');
    } catch {
      pop('Could not save item.', 'err');
      setRemoving((r) => ({ ...r, [id]: false }));
    }
  }, [items, pop]);

  // Move saved → cart
  const handleMoveToCart = useCallback(async (id: string) => {
    const s = saved.find((i) => i.productID === id);
    if (!s) return;
    try {
      const  data  = await api.addToCart(id, 1);
      setCart(data);
      setSaved((prev) => prev.filter((i) => i.productID !== id));
      pop(`${s.product?.name ?? 'Item'} moved to cart`);
    } catch { pop('Could not move item.', 'err'); }
  }, [saved, pop]);

  // Clear cart
  const handleClear = async () => {
    if (!confirm('Remove all items from your cart?')) return;
    await api.clearCart();
    setCart((c) => ({ ...c, items: [] }));
    pop('Cart cleared', 'info');
  };

  // Checkout
  const handleCheckout = async () => {
    if (items.length === 0) return;
    setToCheckout(true);
    await new Promise((r) => setTimeout(r, 700));
    window.location.href = '/checkout';
  };

  // Coupon
  const handleCoupon = useCallback((code: string, rate: number) => {
    setCouponCode(code); setCouponRate(rate);
    if (code) pop(`${code} applied — ${Math.round(rate * 100)}% off!`);
  }, [pop]);

  return (
    <>
      <Navbar cartCount={itemCount} />

      <main style={{ background: 'var(--color-surface)', minHeight: '100vh' }}>

        {/* ── Header ─────────────────────────────────────── */}
        <div className="cp-header">
          <div className="container">
            <nav className="breadcrumb">
              <a href="/" style={{ color: 'rgba(255,255,255,.45)' }}>Home</a>
              <span className="breadcrumb__sep" style={{ color: 'rgba(255,255,255,.2)' }}>/</span>
              <span className="breadcrumb__current" style={{ color: 'white' }}>Cart</span>
            </nav>
            <div className="cp-header__row">
              <div>
                <h1 className="cp-header__h1">Shopping Cart</h1>
                <p className="cp-header__sub">
                  {loading ? 'Loading…'
                    : itemCount === 0 ? 'Your cart is empty'
                    : `${itemCount} item${itemCount !== 1 ? 's' : ''}`}
                </p>
              </div>
              {items.length > 0 && !loading && (
                <button className="cp-header__clear" onClick={handleClear}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                  Clear cart
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="container cp-body">

          {/* Loading */}
          {loading && (
            <div className="cp-layout">
              <div>
                <div className="skeleton" style={{ height: 68, borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-lg)' }} />
                {[1,2,3].map((i) => <SkeletonRow key={i} />)}
              </div>
              <div className="skeleton" style={{ height: 480, borderRadius: 'var(--radius-xl)' }} />
            </div>
          )}

          {/* Empty */}
          {!loading && items.length === 0 && saved.length === 0 && (
            <div className="cp-empty animate-fade-up">
              <div className="cp-empty__icon">
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </div>
              <h2 className="cp-empty__title">Your cart is empty</h2>
              <p className="cp-empty__body">
                Looks like you haven't added anything yet.<br/>
                Explore our collections and find something you love.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="/category/all" className="btn btn--solid btn--lg">Browse Products</a>
                <a href="/wishlist" className="btn btn--outline btn--dark btn--lg">View Wishlist</a>
              </div>
            </div>
          )}

          {/* Cart + summary */}
          {!loading && items.length > 0 && (
            <div className="cp-layout">
              {/* Left */}
              <div className="cp-left">
                <ShippingBar subtotal={subtotal} />

                {/* Column heads — desktop */}
                <div className="cp-col-heads">
                  <span>Product</span>
                  <span className="cp-col-heads__price">Price</span>
                  <span className="cp-col-heads__total">Total</span>
                </div>

                <div role="list" className="cp-rows">
                  {items.map((item) => (
                    <CartRow
                      key={item.productID}
                      item={item}
                      onUpdate={handleUpdate}
                      onRemove={handleRemove}
                      onSave={handleSave}
                      updating={!!updating[item.productID]}
                      removing={!!removing[item.productID]}
                    />
                  ))}
                </div>

                <a href="/category/all" className="cp-back">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                  </svg>
                  Continue Shopping
                </a>
              </div>

              {/* Right */}
              <Summary
                cart={cart}
                couponCode={couponCode}
                couponRate={couponRate}
                onCoupon={handleCoupon}
                onCheckout={handleCheckout}
                checkingOut={toCheckout}
              />
            </div>
          )}

          {/* Saved for later */}
          {!loading && saved.length > 0 && (
            <div className="cp-saved animate-fade-up">
              <div className="cp-saved__head">
                <h2 className="cp-saved__title">
                  Saved for Later
                  <span className="cp-saved__badge">{saved.length}</span>
                </h2>
              </div>
              <div className="cp-saved__grid">
                {saved.map((item) => (
                  <SavedCard key={item.productID} item={item} onMoveToCart={handleMoveToCart} />
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      <MobileBottomNav cartCount={itemCount} />

      {/* Toast */}
      {toast && (
        <div className={`toast${toast.type === 'err' ? ' toast--error' : toast.type === 'info' ? ' toast--info' : ''}`}>
          {toast.type === 'err'
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
          }
          {toast.msg}
        </div>
      )}

      <style>{STYLES}</style>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
/* Page header */
.cp-header { background: var(--color-primary); padding: var(--space-2xl) 0 var(--space-xl); }
.cp-header__row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: var(--space-md); flex-wrap: wrap; gap: var(--space-md); }
.cp-header__h1 { font-family: var(--font-display); font-size: clamp(1.8rem,4vw,3rem); font-weight: 300; color: white; line-height: 1.1; }
.cp-header__sub { color: rgba(255,255,255,.45); font-size: .82rem; margin-top: var(--space-xs); }
.cp-header__clear { display: flex; align-items: center; gap: var(--space-sm); font-size: .7rem; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; color: rgba(255,255,255,.4); border: 1px solid rgba(255,255,255,.15); padding: .4rem .9rem; border-radius: var(--radius-md); transition: all var(--transition-fast); }
.cp-header__clear:hover { color: var(--color-error); border-color: var(--color-error); }

/* Body / layout */
.cp-body { padding-top: var(--space-3xl); padding-bottom: var(--space-4xl); }
.cp-layout { display: grid; grid-template-columns: 1fr 380px; gap: var(--space-3xl); align-items: start; }
.cp-left { display: flex; flex-direction: column; }

/* Shipping bar */
.ship-bar { background: white; border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-md) var(--space-lg); margin-bottom: var(--space-lg); }
.ship-bar__head { display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-sm); }
.ship-bar__msg { font-size: .82rem; color: var(--color-text-muted); }
.ship-bar__track { height: 5px; background: var(--color-border); border-radius: var(--radius-full); overflow: hidden; }
.ship-bar__fill { height: 100%; background: linear-gradient(90deg, var(--color-accent), var(--color-success)); border-radius: var(--radius-full); transition: width .7s cubic-bezier(.34,1.56,.64,1); }
.ship-bar__fill--done { background: var(--color-success); }

/* Column heads */
.cp-col-heads { display: flex; align-items: center; padding: 0 var(--space-md) var(--space-sm); font-size: .6rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--color-text-muted); border-bottom: 1px solid var(--color-border); margin-bottom: var(--space-sm); }
.cp-col-heads__price { margin-left: auto; margin-right: 110px; }
.cp-col-heads__total { width: 90px; text-align: right; }

/* Rows */
.cp-rows { display: flex; flex-direction: column; }

/* Cart row */
.crow { display: flex; gap: var(--space-lg); padding: var(--space-xl) var(--space-md); background: white; border-radius: var(--radius-lg); margin-bottom: var(--space-sm); border: 1px solid transparent; transition: opacity var(--transition-normal), transform var(--transition-normal), border-color var(--transition-fast), box-shadow var(--transition-fast); }
.crow:hover { box-shadow: var(--shadow-sm); border-color: var(--color-border); }
.crow--busy { opacity: .5; pointer-events: none; }
.crow--out  { opacity: 0; transform: translateX(18px); }

.crow__thumb { position: relative; width: 96px; flex-shrink: 0; aspect-ratio: 3/4; border-radius: var(--radius-md); overflow: hidden; background: var(--color-border); display: block; }
.crow__img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s ease; }
.crow__thumb:hover .crow__img { transform: scale(1.06); }

.crow__body { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between; gap: var(--space-md); }
.crow__top { display: flex; justify-content: space-between; gap: var(--space-md); }
.crow__meta { flex: 1; min-width: 0; }
.crow__cat { font-size: .62rem; letter-spacing: .1em; text-transform: uppercase; color: var(--color-accent); margin-bottom: 2px; }
.crow__name { font-family: var(--font-display); font-size: 1.05rem; font-weight: 400; color: var(--color-primary); text-decoration: none; display: block; line-height: 1.3; }
.crow__name:hover { color: var(--color-accent); }
.crow__desc { font-size: .77rem; color: var(--color-text-muted); margin-top: 3px; }
.crow__price-mobile { font-family: var(--font-mono); font-size: .85rem; font-weight: 600; color: var(--color-primary); display: none; margin-top: var(--space-sm); }
.crow__price-mobile span { color: var(--color-text-muted); font-weight: 400; font-family: var(--font-body); margin-left: 3px; }

.crow__right { text-align: right; flex-shrink: 0; }
.crow__unit { font-family: var(--font-mono); font-size: .85rem; font-weight: 500; color: var(--color-text-muted); }
.crow__unit-lbl { font-size: .62rem; color: var(--color-text-muted); margin-bottom: var(--space-sm); }
.crow__total-wrap { display: flex; justify-content: flex-end; min-height: 24px; }
.crow__total { font-family: var(--font-mono); font-size: 1rem; font-weight: 700; color: var(--color-primary); }

.crow__foot { display: flex; align-items: center; gap: var(--space-lg); flex-wrap: wrap; }
.crow__acts { display: flex; align-items: center; gap: var(--space-sm); }
.crow__sep { color: var(--color-border); }
.crow__act { display: flex; align-items: center; gap: 4px; font-size: .72rem; font-weight: 500; color: var(--color-text-muted); transition: color var(--transition-fast); }
.crow__act--save:hover:not(:disabled) { color: var(--color-accent); }
.crow__act--del:hover:not(:disabled)  { color: var(--color-error); }
.crow__act:disabled { opacity: .4; cursor: not-allowed; }

.cspinner { display: inline-block; width: 13px; height: 13px; border: 2px solid var(--color-border); border-top-color: var(--color-accent); border-radius: 50%; animation: spin .7s linear infinite; flex-shrink: 0; }

/* Quantity stepper */
.qty { display: flex; align-items: center; height: 36px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; background: white; }
.qty__btn { width: 34px; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); transition: background var(--transition-fast), color var(--transition-fast); flex-shrink: 0; }
.qty__btn:hover:not(:disabled) { background: var(--color-surface); color: var(--color-primary); }
.qty__btn:disabled { opacity: .35; cursor: not-allowed; }
.qty__val { width: 42px; text-align: center; border: none; border-left: 1px solid var(--color-border); border-right: 1px solid var(--color-border); font-family: var(--font-mono); font-size: .88rem; font-weight: 700; color: var(--color-primary); background: transparent; outline: none; height: 100%; padding: 0; -moz-appearance: textfield; }
.qty__val::-webkit-outer-spin-button, .qty__val::-webkit-inner-spin-button { -webkit-appearance: none; }
.qty__val:disabled { opacity: .45; }

/* Coupon */
.coup { background: var(--color-surface); border: 1.5px dashed var(--color-border); border-radius: var(--radius-lg); padding: var(--space-md) var(--space-lg); }
.coup__lbl { display: flex; align-items: center; gap: var(--space-sm); font-size: .68rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: var(--space-sm); }
.coup__row { display: flex; gap: var(--space-sm); }
.coup__input { flex: 1; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); padding: .5rem var(--space-md); font-family: var(--font-mono); font-size: .85rem; font-weight: 700; color: var(--color-primary); background: white; outline: none; letter-spacing: .06em; transition: border-color var(--transition-fast); }
.coup__input:focus { border-color: var(--color-accent); }
.coup__input::placeholder { font-family: var(--font-body); font-weight: 400; letter-spacing: 0; color: var(--color-text-muted); }
.coup__btn { flex-shrink: 0; min-width: 70px; }
.coup__err { color: var(--color-error); font-size: .75rem; margin-top: var(--space-sm); }

.coup-applied { display: flex; align-items: center; justify-content: space-between; background: #f0faf4; border: 1.5px solid var(--color-success); border-radius: var(--radius-lg); padding: var(--space-md) var(--space-lg); }
.coup-applied__left { display: flex; align-items: center; gap: var(--space-md); }
.coup-applied__tick { width: 28px; height: 28px; border-radius: var(--radius-full); background: var(--color-success); color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.coup-applied__code { font-family: var(--font-mono); font-weight: 700; font-size: .85rem; }
.coup-applied__desc { font-size: .72rem; color: var(--color-success); margin-top: 1px; }
.coup-applied__remove { display: flex; color: var(--color-text-muted); padding: 4px; border-radius: var(--radius-full); transition: background var(--transition-fast), color var(--transition-fast); }
.coup-applied__remove:hover { background: var(--color-border); color: var(--color-error); }

/* Order summary */
.summary { background: white; border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: var(--space-2xl); position: sticky; top: 90px; }
.summary__title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 400; margin-bottom: var(--space-xl); }
.summary__lines { display: flex; flex-direction: column; gap: var(--space-md); }
.summary__line { display: flex; justify-content: space-between; align-items: center; }
.summary__ll { font-size: .85rem; }
.summary__ll--muted { color: var(--color-text-muted); }
.summary__lv { font-family: var(--font-mono); font-size: .88rem; font-weight: 500; }
.summary__div { height: 1px; background: var(--color-border); margin: var(--space-lg) 0; }
.summary__total { display: flex; justify-content: space-between; align-items: baseline; font-family: var(--font-mono); font-size: 1.1rem; font-weight: 700; margin-bottom: var(--space-xl); }
.summary__cta { width: 100%; display: flex; align-items: center; justify-content: center; gap: var(--space-sm); margin-bottom: var(--space-xl); }
.summary__trust { display: flex; flex-direction: column; gap: var(--space-sm); }
.summary__trust-row { display: flex; align-items: center; gap: var(--space-sm); font-size: .74rem; color: var(--color-text-muted); }

/* Saved for later */
.cp-saved { margin-top: var(--space-3xl); }
.cp-saved__head { margin-bottom: var(--space-xl); }
.cp-saved__title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 400; display: flex; align-items: center; gap: var(--space-md); }
.cp-saved__badge { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; background: var(--color-primary); color: white; border-radius: var(--radius-full); font-size: .68rem; font-weight: 700; font-family: var(--font-body); }
.cp-saved__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(168px,1fr)); gap: var(--space-lg); }

.saved-card { background: white; border-radius: var(--radius-lg); border: 1px solid var(--color-border); overflow: hidden; transition: box-shadow var(--transition-fast); }
.saved-card:hover { box-shadow: var(--shadow-md); }
.saved-card__thumb { display: block; aspect-ratio: 3/4; overflow: hidden; background: var(--color-border); }
.saved-card__img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s ease; }
.saved-card__thumb:hover .saved-card__img { transform: scale(1.05); }
.saved-card__info { padding: var(--space-md); display: flex; flex-direction: column; gap: var(--space-sm); }
.saved-card__name { font-family: var(--font-display); font-size: .95rem; font-weight: 400; color: var(--color-primary); text-decoration: none; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.saved-card__name:hover { color: var(--color-accent); }
.saved-card__price { font-family: var(--font-mono); font-size: .88rem; font-weight: 600; }
.saved-card__cta { width: 100%; margin-top: var(--space-sm); }

/* Continue */
.cp-back { display: inline-flex; align-items: center; gap: var(--space-sm); font-size: .78rem; font-weight: 500; letter-spacing: .05em; text-transform: uppercase; color: var(--color-text-muted); margin-top: var(--space-xl); transition: color var(--transition-fast), gap var(--transition-fast); }
.cp-back:hover { color: var(--color-primary); gap: var(--space-md); }

/* Empty */
.cp-empty { text-align: center; padding: var(--space-4xl) var(--space-xl); max-width: 480px; margin: 0 auto; }
.cp-empty__icon { width: 96px; height: 96px; background: white; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-xl); color: var(--color-border); box-shadow: var(--shadow-md); }
.cp-empty__title { font-family: var(--font-display); font-size: 2rem; font-weight: 300; margin-bottom: var(--space-md); }
.cp-empty__body { color: var(--color-text-muted); line-height: 1.7; margin-bottom: var(--space-2xl); }

/* Toast variants */
.toast--error { background: var(--color-error); }
.toast--info  { background: #1d3461; }

/* Responsive */
@media (max-width: 1000px) {
  .cp-layout { grid-template-columns: 1fr; }
  .summary { position: static; order: -1; }
  .cp-col-heads { display: none; }
  .crow__right { display: none; }
  .crow__price-mobile { display: block; }
}
@media (max-width: 580px) {
  .crow { padding: var(--space-md); gap: var(--space-md); }
  .crow__thumb { width: 76px; }
  .summary { padding: var(--space-lg); }
  .cp-saved__grid { grid-template-columns: repeat(2,1fr); gap: var(--space-md); }
}
`;