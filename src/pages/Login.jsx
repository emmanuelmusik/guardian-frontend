import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, signInWithProvider } from '../supabaseClient';

export default function Login({ onGuest }) {
  const [error, setError] = useState(null);

  async function signInWithGoogle() {
    setError(null);
    try {
      await signInWithProvider('google');
    } catch (err) {
      setError(err.message);
    }
  }

  async function signInWithApple() {
    setError(null);
    try {
      await signInWithProvider('apple');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <p style={styles.eyebrow}>Guardian</p>
        <h1 style={styles.title}>A record kept<br />through the watches<br />of the night.</h1>
        <p style={styles.sub}>
          Dreams, visions, and quiet intuitions — held privately, or shared
          with a mentor when you're ready.
        </p>

        <hr style={styles.divider} />

        <button style={styles.googleButton} onClick={signInWithGoogle}>
          <GoogleIcon />
          Continue with Google
        </button>

        <button style={styles.appleButton} onClick={signInWithApple}>
          <AppleIcon />
          Continue with Apple
        </button>

        <button onClick={onGuest} style={styles.guestLink}>
          Continue without an account →
        </button>

        {error && <p style={styles.error}>{error}</p>}

        <p style={styles.legalRow}>
          <Link to="/privacy" style={styles.legalLink}>Privacy</Link>
          <span style={styles.legalDot}>·</span>
          <Link to="/terms" style={styles.legalLink}>Terms</Link>
          <span style={styles.legalDot}>·</span>
          <Link to="/support" style={styles.legalLink}>Support</Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.61z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.9v2.33A9 9 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.68 9c0-.59.1-1.17.27-1.7V4.97H.9A9 9 0 0 0 0 9c0 1.45.35 2.83.9 4.03l3.05-2.33z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .9 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 170 170" aria-hidden="true">
      <path
        fill="#fff"
        d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.197-2.12-9.973-3.17-14.34-3.17-4.58 0-9.492 1.05-14.746 3.17-5.262 2.13-9.501 3.24-12.742 3.35-4.929.21-9.842-1.96-14.746-6.52-3.13-2.73-7.045-7.41-11.735-14.04-5.032-7.08-9.169-15.29-12.41-24.65-3.471-10.11-5.211-19.9-5.211-29.378 0-10.857 2.345-20.221 7.045-28.068 3.693-6.303 8.606-11.275 14.755-14.925s12.793-5.51 19.948-5.629c3.915 0 9.049 1.211 15.429 3.591 6.362 2.388 10.447 3.599 12.238 3.599 1.339 0 5.877-1.416 13.57-4.239 7.275-2.618 13.415-3.702 18.445-3.275 13.63 1.1 23.87 6.473 30.68 16.153-12.19 7.386-18.22 17.731-18.1 31.002.11 10.337 3.86 18.939 11.23 25.769 3.34 3.17 7.07 5.62 11.22 7.36-.9 2.61-1.85 5.11-2.86 7.51zM119.11 7.24c0 8.102-2.96 15.667-8.86 22.669-7.12 8.324-15.732 13.134-25.071 12.375a25.222 25.222 0 0 1-.188-3.07c0-7.778 3.386-16.102 9.399-22.908 3.002-3.446 6.82-6.311 11.45-8.597 4.62-2.253 8.99-3.499 13.1-3.71.12 1.083.17 2.166.17 3.24z"
      />
    </svg>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundImage: `radial-gradient(ellipse 90% 70% at 50% 42%, rgba(234,246,255,0.6), rgba(234,246,255,0.25) 55%, transparent 100%), url('/login-hero.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  card: {
    maxWidth: 420,
    width: '100%',
    background: 'rgba(255,255,255,0.22)',
    backdropFilter: 'blur(22px) saturate(1.3)',
    WebkitBackdropFilter: 'blur(22px) saturate(1.3)',
    border: '1px solid rgba(255,255,255,0.35)',
    borderRadius: 20,
    padding: '32px 28px',
    boxShadow: '0 8px 32px rgba(20,32,44,0.15)',
  },
  eyebrow: {
    fontFamily: 'var(--gd-font-mono)',
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--gd-gold-dim)',
    margin: '0 0 16px',
  },
  title: {
    fontFamily: 'var(--gd-font-display)',
    fontWeight: 500,
    fontSize: 36,
    lineHeight: 1.15,
    color: 'var(--gd-text)',
    margin: 0,
    textShadow: '0 1px 12px rgba(255,255,255,0.5)',
  },
  sub: {
    fontSize: 15,
    lineHeight: 1.6,
    color: 'var(--gd-text-dim)',
    marginTop: 20,
    textShadow: '0 1px 8px rgba(255,255,255,0.4)',
  },
  divider: {
    border: 'none',
    height: 1,
    background: 'linear-gradient(90deg, var(--gd-line) 0%, var(--gd-gold-dim) 60%, var(--gd-gold) 100%)',
    margin: '32px 0',
  },
  googleButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    padding: '13px 20px',
    borderRadius: 12,
    border: '1px solid var(--gd-line)',
    background: 'var(--gd-surface)',
    color: 'var(--gd-text)',
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(20,32,44,0.08)',
  },
  appleButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    padding: '13px 20px',
    borderRadius: 12,
    border: 'none',
    background: '#000',
    color: '#fff',
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    marginTop: 10,
    boxShadow: '0 4px 16px rgba(20,32,44,0.08)',
  },
  guestLink: {
    background: 'transparent', border: 'none', color: 'var(--gd-text-dim)',
    fontSize: 13, cursor: 'pointer', marginTop: 14, textDecoration: 'underline',
    width: '100%', textAlign: 'center', padding: 4,
  },
  error: {
    color: 'var(--gd-error)',
    fontSize: 14,
    marginTop: 16,
  },
  legalRow: { marginTop: 20, fontSize: 12 },
  legalLink: { color: 'var(--gd-text-dim)', textDecoration: 'none' },
  legalDot: { color: 'var(--gd-text-dim)', margin: '0 8px' },
};
