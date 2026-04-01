'use client';
import React, { useEffect, useState } from 'react';
import { Navbar, MobileBottomNav } from '@/components/ui';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import { CustomerOrders } from '@/types/order';

const MOCK_ORDERS = [
  { id: 'ORD-0012', date: '2026-02-15', status: 'Delivered',  total: 22000, items: 2, img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=80&q=60' },
  { id: 'ORD-0009', date: '2026-01-28', status: 'In Transit', total: 12000, items: 1, img: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=80&q=60' },
  { id: 'ORD-0005', date: '2025-12-10', status: 'Delivered',  total: 34000, items: 3, img: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=80&q=60' },
];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Delivered:   { bg: '#e8f8f0', color: '#1d7a4a' },
  'In Transit':{ bg: '#fff8e6', color: '#b36b00' },
  Processing:  { bg: '#f0f4ff', color: '#2563eb' },
  Cancelled:   { bg: '#fef0f0', color: '#c0392b' },
};

const PROFILE_MENU = [
  {
    title: 'Shopping',
    items: [
      { label: 'My Orders',    href: '/profile/orders',   icon: iconBox(),     desc: 'Track your deliveries' },
      { label: 'Wishlist',     href: '/profile/wishlist',          icon: iconHeart(),   desc: '3 saved items' },
      { label: 'Cart',         href: '/checkout',          icon: iconCart(),    desc: '2 items pending' },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Shipping Addresses', href: '/profile/address',  icon: iconPin(),     desc: '1 saved address' },
      { label: 'Security',           href: '/profile/security', icon: iconLock(),    desc: 'Change password' },
      { label: 'Notifications',      href: '/profile/settings', icon: iconBell(),    desc: 'Manage preferences' },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'Help Center',  href: '/help',    icon: iconHelp(),   desc: 'FAQs & contact' },
      { label: 'Returns',      href: '/returns', icon: iconReturn(), desc: '30-day policy' },
    ],
  },
];

// ─── SVG icons ───────────────────────────────────
function iconBox()    { return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>; }
function iconHeart()  { return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>; }
function iconCart()   { return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>; }
function iconPin()    { return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
function iconLock()   { return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function iconBell()   { return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>; }
function iconHelp()   { return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function iconReturn() { return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.48"/></svg>; }
function iconEdit()   { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }

function formatNGN(n: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n);
}

const POINTS_PER_ORDER = 80;
const GOLD_TIER_TARGET = 500;

export default function ProfilePage() {
  const [cartCount,setCartCount] = useState<number>(0);
  const [wishlistCount,setWishlistCount] = useState<number>(0);
  const { data: session } = useSession();
  const [orders, setOrders] = useState<CustomerOrders[]>([]);

  const loyaltyPoints = orders.length * POINTS_PER_ORDER;
  const pointsToGold = Math.max(GOLD_TIER_TARGET - loyaltyPoints, 0);
  const loyaltyProgress = Math.min((loyaltyPoints / GOLD_TIER_TARGET) * 100, 100);

  //get cart, wishlist, and orders

  useEffect(()=>{
          if (!session?.user?.id) return;

api.getCart().then(cart => {

  setCartCount(cart?.items?.length || 0);
  })
api.getWishlist().then(wishlist => {
  setWishlistCount(wishlist?.items?.length || 0);
  })
 api.getOrders(session.user.id)
      .then((data) => {
        setOrders(data ?? []);
      })
      .catch((error) => {
      //  console.error('Failed to load orders:', error);
      });
  },[session?.user?.id]);

  return (
    <>
      <Navbar cartCount={cartCount} wishlistCount={wishlistCount} />

      <main style={{ background: 'var(--color-surface)', minHeight: '100vh', paddingBottom: 'var(--space-4xl)' }}>

        {/* ── Hero Profile Card ── */}
        <div className="profile-hero">
          <div className="container">
            <div className="profile-hero__inner">
              {/* Avatar */}
              <div className="profile-hero__avatar-wrap">
                <div className="profile-hero__avatar">AS</div>
                <button className="profile-hero__avatar-edit" aria-label="Change photo">
                  {iconEdit()}
                </button>
              </div>

              {/* Info */}
              {session?.user?.name && (
                <div className="profile-hero__info">
                  <h1 className="profile-hero__name">{session.user.name}</h1>
                  <p className="profile-hero__email">{session.user.email}</p>
                  <p className="profile-hero__member">{session.user.is_guest ? 'Guest' : 'Member'}</p>
                </div>
              )}

              {/* Edit button 
              <a href="/profile/edit" className="profile-hero__edit-btn hide-mobile">
                {iconEdit()} Edit Profile
              </a>*/}
            </div>

            {/* Stats */}
            <div className="profile-stats">
              {[
                { label: 'Orders', value: `${orders.length}` },
                { label: 'Wishlist', value: `${wishlistCount}` },
                { label: 'Points', value: `${loyaltyPoints}` },
              ].map((stat) => (
                <div key={stat.label} className="profile-stats__item">
                  <span className="profile-stats__value">{stat.value}</span>
                  <span className="profile-stats__label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container" style={{ paddingTop: 'var(--space-3xl)' }}>
          <div className="profile-layout">
            {/* ── Left/Main: Menu cards ── */}
            <div className="profile-main">
              {PROFILE_MENU.map((group) => (
                <div key={group.title} className="profile-menu-group animate-fade-up">
                  <p className="profile-menu-group__title">{group.title}</p>
                  <div className="profile-menu-group__card">
                    {group.items.map((item, idx) => (
                      <React.Fragment key={item.href}>
                        <a href={item.href} className="profile-menu-item">
                          <span className="profile-menu-item__icon">{item.icon}</span>
                          <span className="profile-menu-item__body">
                            <span className="profile-menu-item__label">{item.label}</span>
                            <span className="profile-menu-item__desc">{item.desc}</span>
                          </span>
                          <svg className="profile-menu-item__arrow" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                        </a>
                        {idx < group.items.length - 1 && <div className="profile-menu-divider" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}

              {/* Sign out */}
              <button
                className="profile-signout animate-fade-up"
                onClick={() => { window.location.href = '/auth/signin'; }}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign Out
              </button>
            </div>

            {/* ── Right: Recent orders widget ── */}
            <aside className="profile-sidebar animate-fade-up">
              <div className="profile-widget">
                <div className="profile-widget__header">
                  <p className="profile-widget__title">Recent Orders</p>
                  <a href="/profile/orders" className="profile-widget__see-all">See all →</a>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {orders.map((order, idx) => {
                    const s = STATUS_COLORS[order.status] ?? { bg: '#eee', color: '#555' };
                    return (
                      <React.Fragment key={order.id}>
                        <a href={`/profile/orders`} className="profile-order-item">

                          <div className="profile-order-item__info">
                            <p className="profile-order-item__id">{order.ublinvoiceID}</p>
                            <p className="profile-order-item__date">{new Date(order.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })} · {order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                            <span className="profile-order-item__status" style={{ background: s.bg, color: s.color }}>
                              {order.status}
                            </span>
                          </div>
                          <p className="profile-order-item__total">{formatNGN(order.total)}</p>
                        </a>
                        {idx < orders.length - 1 && <div style={{ height: 1, background: 'var(--color-border)', margin: '0 var(--space-md)' }} />}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Loyalty card */}
              <div className="profile-loyalty">
                <div className="profile-loyalty__top">
                  <p className="profile-loyalty__label">Loyalty Points</p>
                  <p className="profile-loyalty__value">{loyaltyPoints} pts</p>
                </div>
                <div className="profile-loyalty__bar-wrap">
                  <div className="profile-loyalty__bar">
                    <div className="profile-loyalty__bar-fill" style={{ width: `${loyaltyProgress}%` }} />
                  </div>
                  <p className="profile-loyalty__hint">
                    {orders.length === 0
                      ? 'Place your first order to start earning rewards'
                      : pointsToGold > 0
                        ? `${pointsToGold} pts to Gold tier`
                        : 'Gold tier unlocked'}
                  </p>
                </div>
                <a href="/profile/rewards" className="profile-loyalty__cta">View Rewards →</a>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <MobileBottomNav active="profile" cartCount={cartCount} wishlistCount={wishlistCount} />

      <style>{`
        /* ── Profile Hero ── */
        .profile-hero {
          background: var(--color-primary);
          padding: var(--space-2xl) 0 var(--space-3xl);
        }
        .profile-hero__inner {
          display: flex;
          align-items: center;
          gap: var(--space-xl);
          margin-bottom: var(--space-2xl);
        }
        .profile-hero__avatar-wrap {
          position: relative;
          flex-shrink: 0;
        }
        .profile-hero__avatar {
          width: 80px; height: 80px;
          border-radius: var(--radius-full);
          background: var(--color-accent);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 400;
          color: var(--color-primary);
          border: 3px solid rgba(255,255,255,0.2);
        }
        .profile-hero__avatar-edit {
          position: absolute;
          bottom: 0; right: 0;
          width: 26px; height: 26px;
          background: white;
          border-radius: var(--radius-full);
          display: flex; align-items: center; justify-content: center;
          color: var(--color-primary);
          box-shadow: var(--shadow-sm);
          transition: transform var(--transition-fast);
        }
        .profile-hero__avatar-edit:hover { transform: scale(1.1); }
        .profile-hero__info { flex: 1; }
        .profile-hero__name {
          font-family: var(--font-display);
          font-size: 1.6rem;
          font-weight: 400;
          color: white;
          line-height: 1.2;
        }
        .profile-hero__email {
          color: rgba(255,255,255,0.55);
          font-size: 0.82rem;
          margin-top: 2px;
        }
        .profile-hero__member {
          color: var(--color-accent);
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-top: var(--space-sm);
        }
        .profile-hero__edit-btn {
          display: flex; align-items: center; gap: var(--space-sm);
          padding: 0.5rem 1.2rem;
          border: 1.5px solid rgba(255,255,255,0.25);
          border-radius: var(--radius-md);
          color: rgba(255,255,255,0.8);
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: all var(--transition-fast);
          flex-shrink: 0;
          text-decoration: none;
        }
        .profile-hero__edit-btn:hover { border-color: white; color: white; background: rgba(255,255,255,0.08); }

        /* Stats */
        .profile-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          background: rgba(255,255,255,0.06);
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .profile-stats__item {
          display: flex; flex-direction: column; align-items: center;
          padding: var(--space-lg);
          border-right: 1px solid rgba(255,255,255,0.08);
          gap: 4px;
        }
        .profile-stats__item:last-child { border-right: none; }
        .profile-stats__value {
          font-family: var(--font-display);
          font-size: 1.6rem;
          font-weight: 400;
          color: white;
          line-height: 1;
        }
        .profile-stats__label {
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
        }

        /* Layout */
        .profile-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: var(--space-2xl);
          align-items: start;
        }

        /* Menu */
        .profile-menu-group { margin-bottom: var(--space-xl); }
        .profile-menu-group__title {
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--color-text-muted);
          margin-bottom: var(--space-sm);
          padding: 0 var(--space-sm);
        }
        .profile-menu-group__card {
          background: white;
          border-radius: var(--radius-xl);
          border: 1px solid var(--color-border);
          overflow: hidden;
        }
        .profile-menu-item {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
          padding: var(--space-lg) var(--space-xl);
          text-decoration: none;
          color: var(--color-text);
          transition: background var(--transition-fast);
        }
        .profile-menu-item:hover { background: var(--color-surface); }
        .profile-menu-item__icon {
          display: flex;
          width: 40px; height: 40px;
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          align-items: center; justify-content: center;
          color: var(--color-primary);
          flex-shrink: 0;
          transition: background var(--transition-fast);
        }
        .profile-menu-item:hover .profile-menu-item__icon { background: color-mix(in srgb, var(--color-accent) 15%, white); }
        .profile-menu-item__body { flex: 1; min-width: 0; }
        .profile-menu-item__label {
          display: block;
          font-weight: 500;
          font-size: 0.9rem;
          color: var(--color-primary);
        }
        .profile-menu-item__desc {
          display: block;
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin-top: 1px;
        }
        .profile-menu-item__arrow {
          color: var(--color-border);
          transition: transform var(--transition-fast), color var(--transition-fast);
          flex-shrink: 0;
        }
        .profile-menu-item:hover .profile-menu-item__arrow { transform: translateX(3px); color: var(--color-accent); }
        .profile-menu-divider { height: 1px; background: var(--color-border); margin: 0 var(--space-xl); }

        /* Sign out */
        .profile-signout {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-lg) var(--space-xl);
          background: white;
          border-radius: var(--radius-xl);
          border: 1px solid var(--color-border);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--color-error);
          width: 100%;
          transition: background var(--transition-fast);
          margin-top: var(--space-sm);
        }
        .profile-signout:hover { background: #fff0f0; }

        /* Sidebar widgets */
        .profile-sidebar { display: flex; flex-direction: column; gap: var(--space-xl); }
        .profile-widget {
          background: white;
          border-radius: var(--radius-xl);
          border: 1px solid var(--color-border);
          overflow: hidden;
        }
        .profile-widget__header {
          display: flex; justify-content: space-between; align-items: center;
          padding: var(--space-lg) var(--space-xl);
          border-bottom: 1px solid var(--color-border);
        }
        .profile-widget__title { font-weight: 600; font-size: 0.85rem; letter-spacing: 0.04em; }
        .profile-widget__see-all { font-size: 0.75rem; color: var(--color-accent); font-weight: 600; }
        .profile-widget__see-all:hover { color: var(--color-primary); }

        /* Order items */
        .profile-order-item {
          display: flex; align-items: center; gap: var(--space-md);
          padding: var(--space-md) var(--space-xl);
          text-decoration: none;
          color: inherit;
          transition: background var(--transition-fast);
        }
        .profile-order-item:hover { background: var(--color-surface); }
        .profile-order-item__img {
          width: 44px; height: 44px; border-radius: var(--radius-md);
          object-fit: cover; flex-shrink: 0; background: var(--color-border);
        }
        .profile-order-item__info { flex: 1; min-width: 0; }
        .profile-order-item__id { font-family: var(--font-mono); font-size: 0.78rem; font-weight: 600; }
        .profile-order-item__date { font-size: 0.72rem; color: var(--color-text-muted); margin-top: 1px; }
        .profile-order-item__status {
          display: inline-block;
          padding: 1px 6px;
          border-radius: var(--radius-full);
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-top: 3px;
        }
        .profile-order-item__total {
          font-family: var(--font-mono); font-size: 0.82rem; font-weight: 600;
          color: var(--color-primary); flex-shrink: 0;
        }

        /* Loyalty */
        .profile-loyalty {
          background: var(--color-primary);
          border-radius: var(--radius-xl);
          padding: var(--space-xl);
        }
        .profile-loyalty__top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-md); }
        .profile-loyalty__label { font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.5); }
        .profile-loyalty__value { font-family: var(--font-display); font-size: 1.5rem; color: var(--color-accent); }
        .profile-loyalty__bar-wrap { margin-bottom: var(--space-md); }
        .profile-loyalty__bar { height: 4px; background: rgba(255,255,255,0.1); border-radius: var(--radius-full); overflow: hidden; }
        .profile-loyalty__bar-fill { height: 100%; background: var(--color-accent); border-radius: var(--radius-full); transition: width 1s ease; }
        .profile-loyalty__hint { font-size: 0.7rem; color: rgba(255,255,255,0.4); margin-top: var(--space-sm); }
        .profile-loyalty__cta { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.06em; color: var(--color-accent); text-transform: uppercase; }

        @media (max-width: 900px) {
          .profile-layout { grid-template-columns: 1fr; }
          .profile-sidebar { order: -1; }
          .profile-stats { grid-template-columns: repeat(2, 1fr); }
          .profile-stats__item:nth-child(2) { border-right: none; }
          .profile-hero__edit-btn { display: none; }
        }
      `}</style>
    </>
  );
}