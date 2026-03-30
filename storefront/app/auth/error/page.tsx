// app/auth/error/page.tsx
//
// NextAuth.js error page — rendered when NextAuth redirects to /auth/error?error=CODE
//
// • Decodes every NextAuth error code into a human-readable explanation
// • Shows a checklist of likely root causes per error type
// • In development: exposes raw URL params, full environment check, and
//   a copy-to-clipboard debug block for pasting into issues / Slack
// • In production: shows a polished user-facing error card with a
//   "Try again" flow and support contact
// • Safe: never leaks secrets — only reads public env vars
//
// NextAuth error codes reference:
//   https://next-auth.js.org/configuration/pages#error-page

'use client';

import React, { useEffect, useState, useCallback } from 'react';

// ─── NextAuth error code catalogue ───────────────────────────────────────────

interface ErrorInfo {
  title: string;
  summary: string;
  causes: string[];
  fixes: string[];
  severity: 'config' | 'user' | 'oauth' | 'server';
  docsUrl?: string;
}

const ERROR_CATALOGUE: Record<string, ErrorInfo> = {
  Configuration: {
    title: 'Server Configuration Error',
    summary: 'There is a problem with the server authentication configuration.',
    causes: [
      'NEXTAUTH_SECRET is missing or empty in .env',
      'NEXTAUTH_URL does not match the deployment URL',
      'A required provider client ID or secret is missing',
      'The [...nextauth].ts / route.ts file has a syntax error',
      'An adapter is configured but the database is unreachable',
    ],
    fixes: [
      'Set NEXTAUTH_SECRET to a strong random string (openssl rand -base64 32)',
      'Set NEXTAUTH_URL to the exact URL of your app (e.g. https://maison.ng)',
      'Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local',
      'Check server logs for the specific configuration error message',
    ],
    severity: 'config',
    docsUrl: 'https://next-auth.js.org/configuration/options',
  },

  AccessDenied: {
    title: 'Access Denied',
    summary: 'You do not have permission to sign in.',
    causes: [
      'A `signIn` callback returned false for this user',
      'The user\'s email domain is not in an allowed list',
      'The account was banned or deactivated',
      'Email verification is required but not completed',
    ],
    fixes: [
      'Check your signIn() callback in the NextAuth config',
      'If using allowedDomains, ensure the email domain is permitted',
      'Contact the site administrator if you believe this is an error',
    ],
    severity: 'user',
    docsUrl: 'https://next-auth.js.org/configuration/callbacks#sign-in-callback',
  },

  Verification: {
    title: 'Email Verification Failed',
    summary: 'The sign-in link is invalid, expired, or has already been used.',
    causes: [
      'The magic-link token has expired (default: 24 hours)',
      'The link was already used (one-time use)',
      'The EMAIL_SERVER or EMAIL_FROM env var is misconfigured',
      'The verification email was resent and the old link was opened',
    ],
    fixes: [
      'Request a new sign-in link from the sign-in page',
      'Check your spam / junk folder for the latest email',
      'Verify EMAIL_SERVER (e.g. smtp://user:pass@host:port) is correct',
      'Ensure EMAIL_FROM is set to a valid sender address',
    ],
    severity: 'user',
    docsUrl: 'https://next-auth.js.org/providers/email',
  },

  OAuthSignin: {
    title: 'OAuth Sign-In Error',
    summary: 'An error occurred while constructing the authorization URL.',
    causes: [
      'Invalid or malformed provider configuration',
      'GOOGLE_CLIENT_ID / GITHUB_ID etc. is not set or has extra whitespace',
      'The provider name in signIn() call does not match a configured provider',
      'The OAuth scope requested is not enabled on the provider dashboard',
    ],
    fixes: [
      'Double-check all provider env vars in .env.local',
      'Ensure the provider ID passed to signIn() exactly matches the config',
      'Verify requested scopes are enabled in the provider\'s OAuth app settings',
    ],
    severity: 'oauth',
    docsUrl: 'https://next-auth.js.org/providers/google',
  },

  OAuthCallback: {
    title: 'OAuth Callback Error',
    summary: 'An error occurred when handling the OAuth provider callback.',
    causes: [
      'The redirect URI registered on the provider does not match NEXTAUTH_URL',
      'The OAuth state parameter was tampered with or expired',
      'The authorization code has already been exchanged',
      'The provider returned an error in the callback (e.g. access_denied)',
      'CSRF cookie mismatch — the browser blocked the third-party cookie',
    ],
    fixes: [
      'Add the exact callback URL to your OAuth app: {NEXTAUTH_URL}/api/auth/callback/{provider}',
      'For Google: Authorized redirect URIs → https://your-domain.com/api/auth/callback/google',
      'Ensure NEXTAUTH_URL exactly matches the current domain (no trailing slash)',
      'Check if third-party cookies are blocked in the browser',
    ],
    severity: 'oauth',
    docsUrl: 'https://next-auth.js.org/configuration/providers/oauth',
  },

  OAuthCreateAccount: {
    title: 'OAuth Account Creation Failed',
    summary: 'Could not create a new user account using the OAuth profile.',
    causes: [
      'The database adapter threw an error during user creation',
      'A unique constraint violation (user with this email already exists with a different provider)',
      'The createUser() adapter method is not implemented',
      'The database is unreachable or the schema migration has not been run',
    ],
    fixes: [
      'Check database connection and run prisma db push / migrate',
      'Inspect server logs for the specific database error',
      'If the user exists with credentials, they must link accounts manually',
    ],
    severity: 'server',
  },

  EmailCreateAccount: {
    title: 'Email Account Creation Failed',
    summary: 'Could not create a new user account with this email address.',
    causes: [
      'Database adapter error during user creation',
      'Unique constraint — a user with this email already exists',
      'The createUser adapter method threw an exception',
    ],
    fixes: [
      'Check database logs for the constraint violation',
      'Try signing in instead of signing up',
      'Verify the database schema includes the required NextAuth tables',
    ],
    severity: 'server',
  },

  Callback: {
    title: 'Callback Error',
    summary: 'An error occurred in a NextAuth callback function.',
    causes: [
      'An unhandled exception was thrown inside jwt(), session(), or signIn() callback',
      'A callback returned an unexpected value or shape',
      'An async callback was not properly awaited',
      'A database call inside a callback failed',
    ],
    fixes: [
      'Wrap your callbacks in try/catch and log errors',
      'Check server logs for the stack trace',
      'Ensure all async callbacks return the correct shape',
      'Test callbacks in isolation with console.log',
    ],
    severity: 'server',
    docsUrl: 'https://next-auth.js.org/configuration/callbacks',
  },

  OAuthAccountNotLinked: {
    title: 'Account Not Linked',
    summary: 'This email is already registered with a different sign-in method.',
    causes: [
      'A user registered with email/password and is now trying to sign in with Google (or vice versa)',
      'allowDangerousEmailAccountLinking is false (the default, and correct setting)',
    ],
    fixes: [
      'Sign in using the original method (email/password or the first OAuth provider used)',
      'Add an account-linking flow in your app to let users connect multiple providers',
      'If you own the account: sign in with the original method, then link the new provider from your profile',
    ],
    severity: 'user',
    docsUrl: 'https://next-auth.js.org/configuration/providers/oauth#allowdangerousemailaccountlinking-option',
  },

  EmailSignin: {
    title: 'Email Sign-In Failed',
    summary: 'The magic-link email could not be sent.',
    causes: [
      'EMAIL_SERVER is not configured or the SMTP credentials are wrong',
      'The email provider (SendGrid, Mailgun, etc.) rejected the request',
      'The FROM address is not verified with the email provider',
      'Rate limit exceeded on the email service',
    ],
    fixes: [
      'Set EMAIL_SERVER=smtp://user:password@smtp.example.com:587',
      'Set EMAIL_FROM=noreply@yourdomain.com',
      'Verify the sender domain in SendGrid / AWS SES / Mailgun dashboard',
      'Check email service dashboard for bounce or block events',
    ],
    severity: 'config',
    docsUrl: 'https://next-auth.js.org/providers/email#configuration',
  },

  CredentialsSignin: {
    title: 'Sign-In Failed',
    summary: 'The credentials you entered are invalid.',
    causes: [
      'Wrong email or password entered by the user',
      'The authorize() function in the Credentials provider returned null',
      'The user account does not exist',
      'The password hash comparison failed',
    ],
    fixes: [
      'Double-check the email address and password',
      'Use "Forgot Password" to reset your credentials',
      'Ensure your authorize() function returns a user object on success, or null on failure',
    ],
    severity: 'user',
    docsUrl: 'https://next-auth.js.org/providers/credentials',
  },

  SessionRequired: {
    title: 'Authentication Required',
    summary: 'You must be signed in to access this page.',
    causes: [
      'The page or API route is protected and the user is not authenticated',
      'The session has expired',
      'middleware.ts redirected unauthenticated users to this error page',
    ],
    fixes: [
      'Sign in to access this resource',
      'Check your middleware.ts matcher configuration',
    ],
    severity: 'user',
  },

  Default: {
    title: 'Authentication Error',
    summary: 'An unexpected authentication error occurred.',
    causes: [
      'An unhandled exception occurred in the NextAuth request handler',
      'A network error prevented communication with an OAuth provider',
      'The NextAuth version may have a known issue',
    ],
    fixes: [
      'Check the server logs for a detailed stack trace',
      'Verify all required environment variables are set',
      'Try clearing cookies and signing in again',
      'Check https://github.com/nextauthjs/next-auth/issues for known bugs',
    ],
    severity: 'server',
    docsUrl: 'https://next-auth.js.org',
  },
};

// ─── Severity config ──────────────────────────────────────────────────────────

const SEVERITY_META = {
  config: {
    label: 'Configuration',
    color: '#e67e22',
    bg:    '#fff8f0',
    border:'#f5c088',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 0 0 4.93 19.07M19.07 19.07A10 10 0 0 0 4.93 4.93"/>
      </svg>
    ),
  },
  user: {
    label: 'User Action',
    color: '#2563eb',
    bg:    '#eff6ff',
    border:'#bfdbfe',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  oauth: {
    label: 'OAuth / Provider',
    color: '#7c3aed',
    bg:    '#f5f3ff',
    border:'#ddd6fe',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    ),
  },
  server: {
    label: 'Server Error',
    color: '#dc2626',
    bg:    '#fef2f2',
    border:'#fecaca',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
        <line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
      </svg>
    ),
  },
};

// ─── Env check (only reads public vars — no secrets exposed) ──────────────────

function getEnvChecks() {
  const isDev = process.env.NODE_ENV === 'development';
  return [
    {
      key: 'NEXT_PUBLIC_NEXTAUTH_URL (or NEXTAUTH_URL)',
      value: process.env.NEXT_PUBLIC_NEXTAUTH_URL ?? '(not accessible client-side)',
      ok: true, // can't read server env on client
      note: 'Must match your deployment URL exactly',
    },
    {
      key: 'NODE_ENV',
      value: process.env.NODE_ENV ?? 'unknown',
      ok: !!process.env.NODE_ENV,
      note: '',
    },
    {
      key: 'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
      value: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        ? `${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID.slice(0, 8)}…` 
        : '(not set)',
      ok: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      note: 'Required for Google OAuth',
    },
  ];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function copyToClipboard(text: string, cb: () => void) {
  navigator.clipboard.writeText(text).then(cb).catch(() => {
    // fallback
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    cb();
  });
}

function buildDebugReport(errorCode: string, info: ErrorInfo, url: string) {
  return [
    '## NextAuth Error Debug Report',
    '',
    `**Error Code:** \`${errorCode}\``,
    `**Error Title:** ${info.title}`,
    `**Severity:** ${info.severity}`,
    `**URL:** ${url}`,
    `**Timestamp:** ${new Date().toISOString()}`,
    `**User Agent:** ${typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}`,
    '',
    '### Summary',
    info.summary,
    '',
    '### Likely Causes',
    ...info.causes.map((c) => `- ${c}`),
    '',
    '### Suggested Fixes',
    ...info.fixes.map((f) => `- ${f}`),
    ...(info.docsUrl ? ['', `### Documentation`, info.docsUrl] : []),
  ].join('\n');
}

// ═══════════════════════════════════════════════════════════════════
// AuthErrorPage
// ═══════════════════════════════════════════════════════════════════

export default function AuthErrorPage() {
  const [errorCode, setErrorCode] = useState('Default');
  const [rawParams, setRawParams] = useState<Record<string, string>>({});
  const [fullUrl, setFullUrl]     = useState('');
  const [copied, setCopied]       = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [referrer, setReferrer]   = useState('');

  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code   = params.get('error') ?? 'Default';
    const all: Record<string, string> = {};
    params.forEach((v, k) => { all[k] = v; });

    setErrorCode(code);
    setRawParams(all);
    setFullUrl(window.location.href);
    setReferrer(document.referrer);
  }, []);

  const info     = ERROR_CATALOGUE[errorCode] ?? ERROR_CATALOGUE.Default;
  const severity = SEVERITY_META[info.severity];
  const envChecks = getEnvChecks();

  const handleCopyReport = useCallback(() => {
    const report = buildDebugReport(errorCode, info, fullUrl);
    copyToClipboard(report, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [errorCode, info, fullUrl]);

  return (
    <div className="ae-page">

      {/* Header */}
      <header className="ae-header">
        <a href="/" className="ae-logo">Maison</a>
        {isDev && (
          <span className="ae-env-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10"/>
            </svg>
            development
          </span>
        )}
      </header>

      <main className="ae-main">

        {/* ── Error card ── */}
        <div className="ae-card animate-scale-in">

          {/* Severity badge */}
          <div
            className="ae-severity"
            style={{ background: severity.bg, border: `1px solid ${severity.border}`, color: severity.color }}
          >
            <span style={{ color: severity.color }}>{severity.icon}</span>
            {severity.label} Error
          </div>

          {/* Error code pill */}
          <div className="ae-code-row">
            <code className="ae-code">{errorCode}</code>
            {info.docsUrl && (
              <a
                href={info.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ae-docs-link"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Docs
              </a>
            )}
          </div>

          <h1 className="ae-title">{info.title}</h1>
          <p className="ae-summary">{info.summary}</p>

          {/* ── Development debug panel ── */}
          {isDev && (
            <div className="ae-debug-panel">
              <button
                className="ae-debug-toggle"
                onClick={() => setShowDebug(!showDebug)}
                aria-expanded={showDebug}
              >
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2"
                  style={{ transform: showDebug ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}
                >
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
                Debug Information
                <span className="ae-debug-toggle__badge">DEV</span>
              </button>

              {showDebug && (
                <div className="ae-debug-body animate-fade-up">

                  {/* URL params */}
                  <div className="ae-debug-section">
                    <p className="ae-debug-label">URL Parameters</p>
                    <div className="ae-debug-kv">
                      <div className="ae-debug-kv__row">
                        <span className="ae-debug-kv__key">Full URL</span>
                        <code className="ae-debug-kv__val ae-debug-kv__val--break">{fullUrl}</code>
                      </div>
                      {Object.entries(rawParams).map(([k, v]) => (
                        <div key={k} className="ae-debug-kv__row">
                          <span className="ae-debug-kv__key">{k}</span>
                          <code className="ae-debug-kv__val">{v}</code>
                        </div>
                      ))}
                      {referrer && (
                        <div className="ae-debug-kv__row">
                          <span className="ae-debug-kv__key">Referrer</span>
                          <code className="ae-debug-kv__val ae-debug-kv__val--break">{referrer}</code>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Environment checks */}
                  <div className="ae-debug-section">
                    <p className="ae-debug-label">Environment Variables (public only)</p>
                    <div className="ae-debug-kv">
                      {envChecks.map((check) => (
                        <div key={check.key} className="ae-debug-kv__row">
                          <span className="ae-debug-kv__key ae-debug-kv__key--mono">{check.key}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <code className={`ae-debug-kv__val${check.ok ? '' : ' ae-debug-kv__val--warn'}`}>
                              {check.value}
                            </code>
                            {check.note && (
                              <span className="ae-debug-kv__note">{check.note}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="ae-debug-note">
                      ⚠️ Server-side env vars (NEXTAUTH_SECRET, GOOGLE_CLIENT_SECRET, etc.) are not readable on the client for security. Check them in your terminal / deployment dashboard.
                    </p>
                  </div>

                  {/* Expected callback URL */}
                  <div className="ae-debug-section">
                    <p className="ae-debug-label">Expected OAuth Callback URLs</p>
                    <div className="ae-debug-kv">
                      {['google', 'github', 'facebook'].map((provider) => (
                        <div key={provider} className="ae-debug-kv__row">
                          <span className="ae-debug-kv__key" style={{ textTransform: 'capitalize' }}>{provider}</span>
                          <code className="ae-debug-kv__val ae-debug-kv__val--break">
                            {typeof window !== 'undefined' ? `${window.location.origin}/api/auth/callback/${provider}` : `/api/auth/callback/${provider}`}
                          </code>
                        </div>
                      ))}
                    </div>
                    <p className="ae-debug-note">
                      Register each URL above in the respective OAuth provider's Authorized Redirect URIs / Callback URLs.
                    </p>
                  </div>

                  {/* Copy report button */}
                  <button className="ae-copy-btn" onClick={handleCopyReport}>
                    {copied ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        Copied to clipboard!
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                        Copy debug report to clipboard
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Likely causes ── */}
          <div className="ae-section">
            <h2 className="ae-section__title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Likely Causes
            </h2>
            <ul className="ae-list ae-list--causes">
              {info.causes.map((c, i) => (
                <li key={i} className="ae-list__item">
                  <span className="ae-list__bullet ae-list__bullet--cause" />
                  {c}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Suggested fixes ── */}
          <div className="ae-section">
            <h2 className="ae-section__title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
              How to Fix It
            </h2>
            <ol className="ae-list ae-list--fixes">
              {info.fixes.map((f, i) => (
                <li key={i} className="ae-list__item">
                  <span className="ae-list__num">{i + 1}</span>
                  {f}
                </li>
              ))}
            </ol>
          </div>

          {/* ── Actions ── */}
          <div className="ae-actions">
            <a href="/auth/signin" className="btn btn--solid btn--lg ae-btn-primary">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Try signing in again
            </a>
            <a href="/" className="btn btn--outline btn--dark btn--lg">
              Back to Home
            </a>
          </div>

          {/* ── Support ── */}
          <p className="ae-support">
            Still having trouble?{' '}
            <a href="mailto:hello@maison.ng" className="ae-support__link">
              Contact support
            </a>
            {isDev && (
              <>
                {' · '}
                <a
                  href="https://github.com/nextauthjs/next-auth/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ae-support__link"
                >
                  NextAuth Issues ↗
                </a>
              </>
            )}
          </p>
        </div>

        {/* ── All error codes reference (dev only) ── */}
        {isDev && (
          <details className="ae-all-codes">
            <summary className="ae-all-codes__toggle">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              All NextAuth Error Codes Reference
            </summary>
            <div className="ae-all-codes__grid">
              {Object.entries(ERROR_CATALOGUE).map(([code, entry]) => {
                const sev = SEVERITY_META[entry.severity];
                const isActive = code === errorCode;
                return (
                  <a
                    key={code}
                    href={`?error=${code}`}
                    className={`ae-code-card${isActive ? ' ae-code-card--active' : ''}`}
                  >
                    <div className="ae-code-card__top">
                      <code className="ae-code-card__code">{code}</code>
                      <span
                        className="ae-code-card__sev"
                        style={{ color: sev.color, background: sev.bg }}
                      >
                        {sev.label}
                      </span>
                    </div>
                    <p className="ae-code-card__title">{entry.title}</p>
                    <p className="ae-code-card__desc">{entry.summary}</p>
                  </a>
                );
              })}
            </div>
          </details>
        )}

      </main>

      <style>{STYLES}</style>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');

:root {
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body: 'DM Sans', sans-serif;
  --font-mono: 'DM Mono', monospace;
  --color-primary: #0A0A0A;
  --color-accent: #C8A96E;
  --color-surface: #F8F5F0;
  --color-border: #E2DDD6;
  --color-text-muted: #6B6B6B;
  --color-error: #C0392B;
  --color-success: #27AE60;
  --space-sm: .5rem; --space-md: 1rem; --space-lg: 1.5rem;
  --space-xl: 2rem;  --space-2xl: 3rem; --space-3xl: 4rem;
  --radius-sm: 2px; --radius-md: 4px; --radius-lg: 8px;
  --radius-xl: 16px; --radius-full: 9999px;
  --shadow-md: 0 4px 16px rgba(0,0,0,.1);
  --shadow-xl: 0 16px 48px rgba(0,0,0,.15);
  --transition-fast: 150ms ease;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: var(--font-body); background: var(--color-surface); color: var(--color-primary); -webkit-font-smoothing: antialiased; }
a { text-decoration: none; color: inherit; }
button { cursor: pointer; font-family: inherit; background: none; border: none; }

/* ── Header ── */
.ae-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 var(--space-xl); height: 60px;
  background: rgba(248,245,240,.95); backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--color-border);
  position: sticky; top: 0; z-index: 10;
}
.ae-logo { font-family: var(--font-display); font-size: 1.4rem; font-weight: 300; letter-spacing: .15em; text-transform: uppercase; }
.ae-env-badge { display: flex; align-items: center; gap: 5px; font-size: .65rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #16a34a; background: #f0fdf4; border: 1px solid #86efac; border-radius: var(--radius-full); padding: .25rem .7rem; }

/* ── Layout ── */
.ae-main { min-height: calc(100vh - 60px); display: flex; flex-direction: column; align-items: center; padding: var(--space-3xl) var(--space-xl) var(--space-4xl); gap: var(--space-2xl); }

/* ── Main card ── */
.ae-card {
  width: 100%; max-width: 680px;
  background: white; border-radius: var(--radius-xl);
  border: 1px solid var(--color-border); box-shadow: var(--shadow-xl);
  padding: var(--space-2xl);
  display: flex; flex-direction: column; gap: var(--space-xl);
}

/* ── Severity badge ── */
.ae-severity {
  display: inline-flex; align-items: center; gap: var(--space-sm);
  font-size: .68rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
  padding: .3rem .9rem; border-radius: var(--radius-full);
  align-self: flex-start;
}

/* ── Code row ── */
.ae-code-row { display: flex; align-items: center; gap: var(--space-md); }
.ae-code {
  font-family: var(--font-mono); font-size: .95rem; font-weight: 700;
  background: #f4f4f5; color: #18181b;
  padding: .25rem .75rem; border-radius: var(--radius-md);
  letter-spacing: .04em;
}
.ae-docs-link {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: .72rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase;
  color: var(--color-accent); border: 1px solid var(--color-accent);
  padding: .2rem .6rem; border-radius: var(--radius-full);
  transition: background .15s, color .15s;
}
.ae-docs-link:hover { background: var(--color-accent); color: var(--color-primary); }

.ae-title   { font-family: var(--font-display); font-size: 1.75rem; font-weight: 400; line-height: 1.2; }
.ae-summary { font-size: .92rem; color: var(--color-text-muted); line-height: 1.7; }

/* ── Debug panel ── */
.ae-debug-panel {
  border: 1.5px solid #e0e7ff;
  border-radius: var(--radius-lg);
  background: #fafafa;
  overflow: hidden;
}
.ae-debug-toggle {
  display: flex; align-items: center; gap: var(--space-sm);
  width: 100%; padding: var(--space-md) var(--space-lg);
  font-size: .78rem; font-weight: 700; letter-spacing: .05em; text-transform: uppercase;
  color: #3730a3; background: #eef2ff;
  border-bottom: 1px solid #e0e7ff;
  transition: background .15s;
}
.ae-debug-toggle:hover { background: #e0e7ff; }
.ae-debug-toggle__badge {
  margin-left: auto;
  font-size: .58rem; font-weight: 800; letter-spacing: .1em;
  background: #4f46e5; color: white;
  padding: .15rem .5rem; border-radius: var(--radius-full);
}
.ae-debug-body { padding: var(--space-lg); display: flex; flex-direction: column; gap: var(--space-xl); }
.ae-debug-section { display: flex; flex-direction: column; gap: var(--space-sm); }
.ae-debug-label { font-size: .65rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #6b7280; border-bottom: 1px solid #e5e7eb; padding-bottom: var(--space-sm); }
.ae-debug-kv { display: flex; flex-direction: column; gap: 1px; background: #e5e7eb; border-radius: var(--radius-md); overflow: hidden; }
.ae-debug-kv__row { display: flex; align-items: flex-start; gap: var(--space-md); background: white; padding: var(--space-sm) var(--space-md); flex-wrap: wrap; }
.ae-debug-kv__key { font-size: .72rem; font-weight: 600; color: #374151; min-width: 120px; flex-shrink: 0; padding-top: 1px; }
.ae-debug-kv__key--mono { font-family: var(--font-mono); font-size: .65rem; }
.ae-debug-kv__val { font-family: var(--font-mono); font-size: .75rem; color: #111827; background: #f9fafb; padding: 1px 6px; border-radius: 4px; }
.ae-debug-kv__val--break { word-break: break-all; }
.ae-debug-kv__val--warn { color: #92400e; background: #fffbeb; }
.ae-debug-kv__note { font-size: .68rem; color: #6b7280; font-style: italic; }
.ae-debug-note { font-size: .72rem; color: #6b7280; margin-top: var(--space-sm); line-height: 1.6; background: #fffbeb; border: 1px solid #fde68a; border-radius: var(--radius-md); padding: var(--space-sm) var(--space-md); }

.ae-copy-btn {
  display: flex; align-items: center; gap: var(--space-sm);
  font-size: .75rem; font-weight: 600; letter-spacing: .04em;
  color: #4f46e5; background: #eef2ff; border: 1px solid #c7d2fe;
  padding: var(--space-sm) var(--space-lg); border-radius: var(--radius-md);
  align-self: flex-start; transition: all .15s;
}
.ae-copy-btn:hover { background: #e0e7ff; }

/* ── Sections ── */
.ae-section { display: flex; flex-direction: column; gap: var(--space-md); }
.ae-section__title {
  display: flex; align-items: center; gap: var(--space-sm);
  font-size: .7rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
  color: var(--color-text-muted); padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-border);
}

/* ── Lists ── */
.ae-list { display: flex; flex-direction: column; gap: var(--space-sm); list-style: none; }
.ae-list__item { display: flex; align-items: flex-start; gap: var(--space-md); font-size: .875rem; line-height: 1.6; color: #374151; }
.ae-list__bullet { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: .55em; }
.ae-list__bullet--cause { background: #f59e0b; }
.ae-list__num { display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; background: var(--color-primary); color: white; border-radius: 50%; font-size: .65rem; font-weight: 800; flex-shrink: 0; margin-top: .1em; }

/* ── Actions ── */
.ae-actions { display: flex; gap: var(--space-md); flex-wrap: wrap; }
.ae-btn-primary { display: flex; align-items: center; gap: var(--space-sm); }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-sm); font-family: var(--font-body); font-weight: 500; letter-spacing: .08em; text-transform: uppercase; border-radius: var(--radius-sm); transition: all .2s; white-space: nowrap; }
.btn--lg  { font-size: .72rem; padding: .875rem 2rem; min-height: 48px; border: 1.5px solid transparent; }
.btn--solid { background: var(--color-primary); color: white; border-color: var(--color-primary); }
.btn--solid:hover { background: var(--color-accent); border-color: var(--color-accent); color: var(--color-primary); }
.btn--outline.btn--dark { background: transparent; color: var(--color-primary); border-color: var(--color-primary); }
.btn--outline.btn--dark:hover { background: var(--color-primary); color: white; }

/* ── Support ── */
.ae-support { font-size: .78rem; color: var(--color-text-muted); text-align: center; padding-top: var(--space-md); border-top: 1px solid var(--color-border); }
.ae-support__link { color: var(--color-accent); font-weight: 500; }
.ae-support__link:hover { text-decoration: underline; }

/* ── All codes reference ── */
.ae-all-codes { width: 100%; max-width: 680px; }
.ae-all-codes__toggle {
  display: flex; align-items: center; gap: var(--space-sm);
  font-size: .72rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
  color: #4f46e5; padding: var(--space-md) var(--space-lg);
  background: #eef2ff; border: 1px solid #c7d2fe; border-radius: var(--radius-lg);
  cursor: pointer; list-style: none; transition: background .15s;
}
.ae-all-codes__toggle::-webkit-details-marker { display: none; }
details[open] .ae-all-codes__toggle { border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
.ae-all-codes__grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1px; background: #e0e7ff;
  border: 1px solid #c7d2fe; border-top: none;
  border-radius: 0 0 var(--radius-lg) var(--radius-lg); overflow: hidden;
}
.ae-code-card { background: white; padding: var(--space-lg); display: flex; flex-direction: column; gap: 5px; transition: background .15s; }
.ae-code-card:hover { background: #fafafa; }
.ae-code-card--active { background: #f0fdf4 !important; border: 2px solid var(--color-success) !important; }
.ae-code-card__top { display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm); }
.ae-code-card__code { font-family: var(--font-mono); font-size: .78rem; font-weight: 700; color: #3730a3; }
.ae-code-card__sev { font-size: .6rem; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; padding: .15rem .5rem; border-radius: var(--radius-full); }
.ae-code-card__title { font-weight: 600; font-size: .82rem; }
.ae-code-card__desc { font-size: .74rem; color: var(--color-text-muted); line-height: 1.5; }

/* ── Animations ── */
@keyframes scaleIn { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: scale(1); } }
@keyframes fadeUp  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-scale-in { animation: scaleIn .3s ease both; }
.animate-fade-up   { animation: fadeUp  .3s ease both; }

/* ── Responsive ── */
@media (max-width: 600px) {
  .ae-card { padding: var(--space-lg); }
  .ae-actions { flex-direction: column; }
  .ae-actions .btn { width: 100%; }
  .ae-debug-kv__row { flex-direction: column; gap: 4px; }
  .ae-all-codes__grid { grid-template-columns: 1fr; }
}
`;