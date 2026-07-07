import React from 'react';
import { Link } from 'react-router-dom';

export default function DeleteAccountInfo() {
  return (
    <div style={styles.page}>
      <Link to="/" style={styles.back}>← Guardian</Link>
      <h1 style={styles.title}>Deleting Your Account & Data</h1>

      <h2 style={styles.h2}>If you still have access to the app</h2>
      <p style={styles.p}>
        Open Guardian, go to <strong>Settings</strong>, scroll to the <strong>Danger zone</strong> section,
        type DELETE to confirm, and tap <strong>Delete my account</strong>. This immediately and
        permanently removes your profile, journal entries, messages, and everything else
        associated with your account. This cannot be undone.
      </p>

      <h2 style={styles.h2}>If you no longer have access to the app</h2>
      <p style={styles.p}>
        Email <a href="mailto:support@example.com" style={styles.link}>support@example.com</a> from
        the email address associated with your account, with the subject line "Delete my account,"
        and we'll delete your account and all associated data within 30 days.
      </p>

      <h2 style={styles.h2}>What gets deleted</h2>
      <p style={styles.p}>
        Your profile, journal entries, comments, community messages, direct messages, connections,
        and any uploaded photos or files. This is permanent.
      </p>
    </div>
  );
}

const styles = {
  page: { maxWidth: 560, margin: '0 auto', padding: '48px 24px 80px', color: 'var(--gd-text)' },
  back: { display: 'inline-block', color: 'var(--gd-gold)', fontSize: 13, textDecoration: 'none', marginBottom: 24, fontFamily: 'var(--gd-font-mono)' },
  title: { fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 26, margin: '0 0 20px' },
  h2: { fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 17, margin: '24px 0 8px' },
  p: { fontSize: 14, lineHeight: 1.7, color: 'var(--gd-text)', marginBottom: 12 },
  link: { color: 'var(--gd-violet)' },
};
