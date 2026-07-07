import React from 'react';
import { Link } from 'react-router-dom';

export default function Support() {
  return (
    <div style={styles.page}>
      <Link to="/" style={styles.back}>← Guardian</Link>
      <h1 style={styles.title}>Support</h1>

      <p style={styles.p}>
        Need help with Guardian, found a bug, or want to report a problem with the app? Reach out
        any time:
      </p>

      <a href="mailto:support@example.com" style={styles.emailButton}>support@example.com</a>

      <p style={{ ...styles.p, marginTop: 24 }}>
        For questions about how your data is handled, see our <Link to="/privacy" style={styles.link}>Privacy Policy</Link>.
        For our usage guidelines, see our <Link to="/terms" style={styles.link}>Terms of Service</Link>.
      </p>

      <p style={styles.p}>
        To report a safety concern about another user or something they've posted, use the
        "Report" option available on their profile or on the content itself within the app.
      </p>
    </div>
  );
}

const styles = {
  page: { maxWidth: 560, margin: '0 auto', padding: '48px 24px 80px', color: 'var(--gd-text)' },
  back: { display: 'inline-block', color: 'var(--gd-gold)', fontSize: 13, textDecoration: 'none', marginBottom: 24, fontFamily: 'var(--gd-font-mono)' },
  title: { fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 30, margin: '0 0 20px' },
  p: { fontSize: 14, lineHeight: 1.7, color: 'var(--gd-text)', marginBottom: 12 },
  link: { color: 'var(--gd-violet)' },
  emailButton: {
    display: 'inline-block', background: 'var(--gd-gold)', color: 'var(--gd-on-accent)',
    padding: '12px 24px', borderRadius: 8, fontWeight: 600, textDecoration: 'none', fontSize: 15,
  },
};
