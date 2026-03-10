'use client';
import React, { useState } from 'react';
import { Button, Input } from '@/components/ui';

const PROFILE_NAV = [
  { label: 'My Orders',        href: '/profile/orders',   icon: '📦' },
  { label: 'Wishlist',         href: '/profile/wishlist',  icon: '♡' },
  { label: 'Shipping Address', href: '/profile/address',   icon: '📍' },
  { label: 'Security',         href: '/profile/security',  icon: '🔒' },
];

export function ProfileLayout({ children, active }: { children: React.ReactNode; active: string }) {
  return (
    <>
      <header className="navbar">
        <a href="/" className="navbar__logo">Maison</a>
        <div className="navbar__actions">
          <a href="/auth/signin" style={{ fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Sign Out</a>
        </div>
      </header>
      <main style={{ background: 'var(--color-surface)', minHeight: '100vh', padding: 'var(--space-3xl) 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 'var(--space-3xl)', alignItems: 'start' }}>
            {/* Sidebar */}
            <aside>
              <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                <div style={{ padding: 'var(--space-xl)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-primary)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: 'var(--space-sm)' }}>A</div>
                  <p style={{ color: 'white', fontWeight: 600, fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Afolabi Samuel</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>samuelsamafolabi@outlook.com</p>
                </div>
                <nav>
                  {PROFILE_NAV.map((item) => (
                    <a key={item.href} href={item.href} style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                      padding: 'var(--space-md) var(--space-lg)',
                      fontSize: '0.82rem', fontWeight: active === item.label ? 600 : 400,
                      color: active === item.label ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      background: active === item.label ? 'var(--color-surface)' : 'transparent',
                      borderLeft: active === item.label ? '3px solid var(--color-accent)' : '3px solid transparent',
                      transition: 'all var(--transition-fast)',
                      textDecoration: 'none',
                    }}>
                      <span>{item.icon}</span> {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Content */}
            <div>{children}</div>
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .container > div { grid-template-columns: 1fr !important; }
          aside { display: none; }
        }
      `}</style>
    </>
  );
}
