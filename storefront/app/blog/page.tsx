'use client';
import { WPPost } from '@/types/blog';
import React, { useEffect, useState } from 'react';



// Fetches from WP REST API
async function fetchPosts(): Promise<WPPost[]> {
  try {
    const WP_URL = process.env.NEXT_PUBLIC_WP_URL || 'https://your-wordpress.com';
    const res = await fetch(`${WP_URL}/wp-json/wp/v2/posts?_embed&per_page=12`);
    if (!res.ok) throw new Error('WP fetch failed');
    return res.json();
  } catch {
    // Return mock data when WP not configured
    return MOCK_POSTS;
  }
}

const MOCK_POSTS: WPPost[] = [
  { id: 1, slug: 'style-guide-2026', title: { rendered: 'The Definitive Style Guide for 2026' }, excerpt: { rendered: '<p>Discover the key trends defining this season — from textured fabrics to bold accessories.</p>' }, date: '2026-02-20T10:00:00', _embedded: { 'wp:featuredmedia': [{ source_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' }] }, categories: [1] },
  { id: 2, slug: 'luxury-cosmetics-skincare', title: { rendered: 'Luxury Skincare: What Actually Works' }, excerpt: { rendered: '<p>A deep dive into the science behind premium skincare ingredients and why they matter.</p>' }, date: '2026-02-10T10:00:00', _embedded: { 'wp:featuredmedia': [{ source_url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80' }] }, categories: [2] },
  { id: 3, slug: 'menswear-essentials', title: { rendered: 'Menswear Essentials: Building a Capsule Wardrobe' }, excerpt: { rendered: '<p>10 key pieces every man needs to build a timeless, versatile wardrobe that works year-round.</p>' }, date: '2026-01-28T10:00:00', _embedded: { 'wp:featuredmedia': [{ source_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80' }] }, categories: [1] },
];

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, '').trim();
}

export default function BlogPage() {
  const [posts, setPosts]   = useState<WPPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts().then((data) => { setPosts(data); setLoading(false); });
  }, []);

  return (
    <>
      <header className="navbar">
        <a href="/" className="navbar__logo">Maison</a>
        <nav><ul className="navbar__nav">
          {['New In', 'Men', 'Women', 'Cosmetics', 'Blog'].map((item) => (
            <li key={item}><a href={`/${item.toLowerCase()}`}>{item}</a></li>
          ))}
        </ul></nav>
      </header>

      {/* Hero */}
      <div style={{ background: 'var(--color-primary)', padding: 'var(--space-4xl) 0 var(--space-3xl)' }}>
        <div className="container">
          <p className="t-caption" style={{ color: 'var(--color-accent)', marginBottom: 'var(--space-md)' }}>The Journal</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 7vw, 6rem)', fontWeight: 300, color: 'white', maxWidth: 700 }}>
            Style, Beauty & Culture
          </h1>
        </div>
      </div>

      <main style={{ background: 'var(--color-surface)', padding: 'var(--space-4xl) 0' }}>
        <div className="container">
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-xl)' }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  <div className="skeleton" style={{ height: 260 }} />
                  <div className="skeleton" style={{ height: '1rem', width: '80%' }} />
                  <div className="skeleton" style={{ height: '0.75rem', width: '60%' }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-xl)' }} className="blog-grid">
              {posts.map((post) => {
                const img = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
                return (
                  <a href={`/blog/${post.slug}`} key={post.id} style={{ display: 'block', textDecoration: 'none' }} className="blog-card animate-fade-up">
                    <div style={{ aspectRatio: '16/10', overflow: 'hidden', borderRadius: 'var(--radius-lg)', background: 'var(--color-border)', marginBottom: 'var(--space-lg)' }}>
                      {img && <img src={img} alt={post.title.rendered} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} className="blog-card__img" />}
                    </div>
                    <p className="t-caption" style={{ color: 'var(--color-accent)', marginBottom: 'var(--space-sm)' }}>
                      {new Date(post.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 400, marginBottom: 'var(--space-sm)', lineHeight: 1.3 }}
                      dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', lineHeight: 1.7 }}>{stripHtml(post.excerpt.rendered).slice(0, 120)}…</p>
                    <span style={{ display: 'inline-block', marginTop: 'var(--space-md)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-accent)' }}>Read More</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <style>{`
        .blog-card:hover .blog-card__img { transform: scale(1.05); }
        @media (max-width: 900px) { .blog-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 600px) { .blog-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}

export {
  MOCK_POSTS
}