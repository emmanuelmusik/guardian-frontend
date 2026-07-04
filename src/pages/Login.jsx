import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Login() {
  const [error, setError] = useState(null);

  async function signInWithGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message);
  }

  return (
    <div style={styles.page}>
      <div style={styles.content}>
        <p style={styles.eyebrow}>Guardian</p>
        <h1 style={styles.title}>A record kept<br />through the watches<br />of the night.</h1>
        <p style={styles.sub}>
          Dreams, visions, and quiet intuitions — held privately, or shared
          with a mentor when you're ready.
        </p>

        <button style={styles.googleButton} onClick={signInWithGoogle}>
          <GoogleIcon />
          Continue with Google
        </button>

        {error && <p style={styles.error}>{error}</p>}
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

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    backgroundImage: `linear-gradient(to bottom, rgba(10,16,26,0.1) 0%, rgba(10,16,26,0.55) 45%, rgba(8,13,20,0.95) 80%), url('/login-hero.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: '0 28px 48px',
  },
  eyebrow: {
    fontFamily: 'var(--gd-font-mono)',
    fontSize: 12,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--gd-gold)',
    margin: 0,
  },
  title: {
    fontFamily: 'var(--gd-font-display)',
    fontWeight: 500,
    fontSize: 32,
    lineHeight: 1.2,
    color: '#F3EFE6',
    margin: 0,
    textShadow: '0 2px 16px rgba(0,0,0,0.4)',
  },
  sub: {
    fontSize: 15,
    lineHeight: 1.6,
    color: 'rgba(243,239,230,0.85)',
    margin: 0,
    maxWidth: 420,
  },
  googleButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    maxWidth: 420,
    padding: '14px 20px',
    borderRadius: 12,
    border: 'none',
    background: '#F3EFE6',
    color: '#1B2A3A',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
    marginTop: 8,
  },
  error: {
    color: '#E58A8A',
    fontSize: 14,
    margin: 0,
  },
};
