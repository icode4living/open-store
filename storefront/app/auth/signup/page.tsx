'use client'
import { Button, Input } from "@/components/ui";
import { useState } from "react";
import {api} from "@/lib/api"
import { signIn } from "next-auth/react";
export default function SignUpPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '',phone:'' });
  const [loading, setLoading] = useState(false);

const handleSignUp = async () => {
  setLoading(true);

  try {
    const response = await fetch('/api/register-customer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        first_name: form.firstName, // Mapping frontend camelCase to backend snake_case
        last_name: form.lastName,
        phone: form.phone,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle 409 (Conflict), 403 (Forbidden), or 500 errors
      throw new Error(data.error || 'Registration failed');
    }

    // If the response is successful and contains an ID
    if (data && data.id) {
         const result = await signIn('credentials', { 
        email: form.email, 
        password: form.password, 
        redirect: false 
      });
if (result?.ok){
      window.location.replace('/');

}
    }
  } catch (error: any) {
    console.error("Sign up error:", error.message);
    // You might want to show a toast or alert here
    alert(error.message);
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="auth-page">
      <div className="auth-card animate-scale-in">
        <a href="/" className="auth-logo">Maison</a>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join Maison for exclusive access and benefits</p>

        <button className="auth-google-btn" onClick={() => {}}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign up with Google
        </button>

        <div className="auth-divider"><span>or</span></div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
          <Input type="text" label="First Name" placeholder="John" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
          <Input type="text" label="Last Name" placeholder="Doe" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <Input type="email" label="Email" placeholder="you@example.com" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Input type="text" label="Password" placeholder="Min. 8 characters" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
                  <Input type="text" label="Mobile Number" placeholder="090124678889" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />

        </div>

        <Button title="Create Account" action={handleSignUp} variant={loading ? 'disabled' : 'solid'} size="lg" loading={loading} classes="auth-submit-btn" />

        <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 'var(--space-lg)' }}>
          Already have an account? <a href="/auth/signin" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign In</a>
        </p>
      </div>

      <style>{`
        .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--color-surface); padding: var(--space-xl); }
        .auth-card { width: 100%; max-width: 440px; background: white; border-radius: var(--radius-xl); padding: var(--space-3xl); box-shadow: var(--shadow-xl); }
        .auth-logo { display: block; font-family: var(--font-display); font-size: 1.75rem; font-weight: 300; letter-spacing: 0.15em; text-transform: uppercase; text-align: center; margin-bottom: var(--space-2xl); }
        .auth-title { font-family: var(--font-display); font-size: 2rem; font-weight: 400; text-align: center; margin-bottom: var(--space-sm); }
        .auth-subtitle { text-align: center; color: var(--color-text-muted); font-size: 0.85rem; margin-bottom: var(--space-2xl); }
        .auth-google-btn { display: flex; align-items: center; justify-content: center; gap: var(--space-md); width: 100%; padding: 0.75rem; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.85rem; font-weight: 500; background: white; transition: all var(--transition-fast); margin-bottom: var(--space-lg); }
        .auth-google-btn:hover { background: var(--color-surface); }
        .auth-divider { position: relative; text-align: center; margin-bottom: var(--space-lg); }
        .auth-divider::before { content: ''; position: absolute; inset: 50% 0 auto; height: 1px; background: var(--color-border); }
        .auth-divider span { position: relative; padding: 0 var(--space-md); background: white; font-size: 0.75rem; color: var(--color-text-muted); }
        .auth-submit-btn { width: 100%; margin-top: var(--space-xl); }
      `}</style>
    </div>
  );
}