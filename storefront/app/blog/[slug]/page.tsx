'use client'
import { WPPost } from "@/types/blog";
import { useEffect, useState } from "react";
import { MOCK_POSTS } from "../page";

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  const [post, setPost]     = useState<WPPost | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const WP_URL = process.env.NEXT_PUBLIC_WP_URL || '';
        const res  = await fetch(`${WP_URL}/wp-json/wp/v2/posts?slug=${params.slug}&_embed`);
        const data = await res.json();
        if (data[0]) { setPost(data[0]); setContent(data[0].content?.rendered ?? ''); }
      } catch {
        // Use mock
        const mock = MOCK_POSTS.find((p) => p.slug === params.slug);
        if (mock) { setPost(mock); setContent('<p>Full article content goes here from WordPress.</p>'); }
      } finally { setLoading(false); }
    })();
  }, [params.slug]);

  if (loading) return <div style={{ padding: 'var(--space-4xl)', textAlign: 'center' }}>Loading…</div>;
  if (!post) return <div style={{ padding: 'var(--space-4xl)', textAlign: 'center' }}>Post not found</div>;

  const img = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;

  return (
    <>
      <header className="navbar">
        <a href="/" className="navbar__logo">Maison</a>
        <nav><ul className="navbar__nav">
          {['Home', 'Blog', 'Shop'].map((item) => (
            <li key={item}><a href={`/${item.toLowerCase()}`}>{item}</a></li>
          ))}
        </ul></nav>
      </header>

      <main style={{ background: 'white' }}>
        {img && (
          <div style={{ height: '50vh', overflow: 'hidden' }}>
            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div className="container-sm" style={{ paddingTop: 'var(--space-3xl)', paddingBottom: 'var(--space-4xl)' }}>
          <nav className="breadcrumb">
            <a href="/">Home</a><span className="breadcrumb__sep">/</span>
            <a href="/blog">Journal</a><span className="breadcrumb__sep">/</span>
            <span className="breadcrumb__current" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
          </nav>

          <p className="t-caption" style={{ color: 'var(--color-accent)', margin: 'var(--space-xl) 0 var(--space-md)' }}>
            {new Date(post.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 300, lineHeight: 1.2, marginBottom: 'var(--space-2xl)' }}
            dangerouslySetInnerHTML={{ __html: post.title.rendered }} />

          <div className="divider" style={{ marginBottom: 'var(--space-2xl)' }} />

          {/* Safe-rendered WordPress content */}
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: content.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/on\w+="[^"]*"/gi, '') }}
          />
        </div>
      </main>

      <style>{`
        .blog-content { font-size: 1.05rem; line-height: 1.9; color: var(--color-text); }
        .blog-content p { margin-bottom: var(--space-lg); }
        .blog-content h2 { font-family: var(--font-display); font-size: 1.8rem; font-weight: 400; margin: var(--space-2xl) 0 var(--space-md); }
        .blog-content h3 { font-family: var(--font-display); font-size: 1.3rem; margin: var(--space-xl) 0 var(--space-sm); }
        .blog-content img { width: 100%; border-radius: var(--radius-lg); margin: var(--space-xl) 0; }
        .blog-content ul, .blog-content ol { padding-left: var(--space-xl); margin-bottom: var(--space-lg); }
        .blog-content li { margin-bottom: var(--space-sm); }
        .blog-content blockquote { border-left: 3px solid var(--color-accent); padding-left: var(--space-xl); font-family: var(--font-display); font-size: 1.25rem; color: var(--color-text-muted); margin: var(--space-2xl) 0; font-style: italic; }
        .blog-content a { color: var(--color-accent); text-decoration: underline; }
      `}</style>
    </>
  );
}