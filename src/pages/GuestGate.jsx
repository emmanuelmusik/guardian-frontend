import React from 'react';
import { Link } from 'react-router-dom';

// Shown to guests who navigate to an account-based part of Guardian.
// Journaling and the Bible work without an account; connecting with
// people, communities, messaging, and sharing genuinely require one.
export default function GuestGate({ onSignIn }) {
  return (
    <div style={styles.page}>
      <p style={styles.glyph}>✦</p>
      <h2 style={styles.title}>This part of Guardian needs an account</h2>
      <p style={styles.text}>
        Your journal and the Bible are open to everyone. Connecting with mentors,
        joining communities, messaging, and sharing entries are between real
        people — so they need an account to work.
      </p>
      <p style={styles.text}>
        Signing in is free, takes a few seconds with Google or Apple, and your
        entries on this device move to your account automatically.
      </p>
      <button onClick={onSignIn} style={styles.button}>Sign in or create account</button>
      <p style={styles.backRow}>
        <Link to="/" style={styles.link}>← Back to your journal</Link>
      </p>
    </div>
  );
}

const styles = {
  page: { maxWidth: 480, margin: '0 auto', padding: '80px 24px', textAlign: 'center' },
  glyph: { fontSize: 28, color: 'var(--gd-gold)', margin: '0 0 12px' },
  title: { fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 22, margin: '0 0 16px', color: 'var(--gd-text)' },
  text: { fontSize: 14, lineHeight: 1.7, color: 'var(--gd-text-dim)', margin: '0 0 14px' },
  button: {
    background: 'var(--gd-gold)', border: 'none', borderRadius: 8, padding: '12px 24px',
    color: 'var(--gd-on-accent)', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginTop: 8,
  },
  backRow: { marginTop: 20 },
  link: { color: 'var(--gd-violet)', fontSize: 13, textDecoration: 'none' },
};
