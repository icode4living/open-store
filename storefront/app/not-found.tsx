export default function NotFoundPage() {
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