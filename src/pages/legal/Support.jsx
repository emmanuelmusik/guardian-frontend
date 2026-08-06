import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE;

export default function Support() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/support/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please email us directly instead.');
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={styles.page}>
      <Link to="/" style={styles.back}>← Guardian</Link>
      <h1 style={styles.title}>Support</h1>

      <p style={styles.p}>
        Need help with Guardian, found a bug, have a question, or want to report a problem?
        Send us a message below, or email us directly — we read everything and reply as
        quickly as we can.
      </p>

      <a href="mailto:emmanuelmusik7@gmail.com" style={styles.emailButton}>emmanuelmusik7@gmail.com</a>

      <h2 style={styles.h2}>Contact us</h2>

      {sent ? (
        <p style={styles.success}>
          ✓ Your message has been sent. We'll get back to you by email as soon as we can.
        </p>
      ) : (
        <form onSubmit={submit} style={styles.form}>
          <input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />
          <input
            type="email"
            placeholder="Your email (so we can reply)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <textarea
            placeholder="How can we help?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={5}
            style={{ ...styles.input, resize: 'vertical' }}
          />
          {error && <p style={styles.errorText}>{error}</p>}
          <button type="submit" disabled={sending || !email.trim() || !message.trim()} style={styles.submitButton}>
            {sending ? 'Sending…' : 'Send message'}
          </button>
        </form>
      )}

      <h2 style={styles.h2}>Common questions</h2>

      <p style={styles.p}>
        <strong>How do I delete my account?</strong><br />
        Open the app → Settings → Danger zone → Delete account. This permanently removes your
        account and all your data. More details on our <Link to="/delete-account" style={styles.link}>account deletion page</Link>.
      </p>

      <p style={styles.p}>
        <strong>How do I report someone or something inappropriate?</strong><br />
        Use the "Report" option available on any user's profile or on the content itself within
        the app. You can also block users from their profile.
      </p>

      <p style={styles.p}>
        <strong>How is my data handled?</strong><br />
        See our <Link to="/privacy" style={styles.link}>Privacy Policy</Link> for full details.
        Our usage guidelines are in the <Link to="/terms" style={styles.link}>Terms of Service</Link>.
      </p>

      <p style={styles.p}>
        <strong>Something in the app isn't working.</strong><br />
        Use the form above and describe what happened — including what device you're using and
        what you expected to happen. We'll look into it.
      </p>
    </div>
  );
}

const styles = {
  page: { maxWidth: 560, margin: '0 auto', padding: '48px 24px 80px', color: 'var(--gd-text)' },
  back: { display: 'inline-block', color: 'var(--gd-gold)', fontSize: 13, textDecoration: 'none', marginBottom: 24, fontFamily: 'var(--gd-font-mono)' },
  title: { fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 30, margin: '0 0 20px' },
  h2: { fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 20, margin: '32px 0 12px' },
  p: { fontSize: 14, lineHeight: 1.7, color: 'var(--gd-text)', marginBottom: 12 },
  link: { color: 'var(--gd-violet)' },
  emailButton: {
    display: 'inline-block', background: 'var(--gd-gold)', color: 'var(--gd-on-accent)',
    padding: '12px 24px', borderRadius: 8, fontWeight: 600, textDecoration: 'none', fontSize: 15,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  input: {
    width: '100%', boxSizing: 'border-box', background: 'var(--gd-surface)', color: 'var(--gd-text)',
    border: '1px solid var(--gd-line)', borderRadius: 8, padding: '11px 14px',
    fontSize: 14, fontFamily: 'var(--gd-font-body)',
  },
  submitButton: {
    background: 'var(--gd-gold)', border: 'none', borderRadius: 8, padding: '12px 24px',
    color: 'var(--gd-on-accent)', fontWeight: 600, fontSize: 15, cursor: 'pointer', alignSelf: 'flex-start',
  },
  success: {
    background: 'var(--gd-surface)', border: '1px solid var(--gd-gold)', borderRadius: 8,
    padding: '14px 16px', fontSize: 14, color: 'var(--gd-text)',
  },
  errorText: { color: 'var(--gd-error)', fontSize: 13, margin: 0 },
};
