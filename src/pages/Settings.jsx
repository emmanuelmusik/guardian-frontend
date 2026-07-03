import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';

export default function Settings({ profile, onUpdate }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const otherRole = profile.role === 'mentor' ? 'aspirant' : 'mentor';

  async function switchRole() {
    setSaving(true);
    setError(null);
    try {
      const updated = await apiFetch('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify({ role: otherRole }),
      });
      onUpdate(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.page}>
      <Link to="/" style={styles.back}>← Back to journal</Link>

      <p style={styles.eyebrow}>Guardian</p>
      <h1 style={styles.title}>Settings</h1>

      <hr className="gd-horizon" style={{ margin: '24px 0 32px' }} />

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Your role</h3>
        <p style={styles.cardBody}>
          You're currently walking this path as an <strong>{profile.role}</strong>.
          {profile.role === 'aspirant'
            ? ' Switching to mentor lets you create a community and receive what others choose to share with you.'
            : ' Switching to aspirant lets you record entries and share them with a mentor of your own.'}
        </p>
        <button onClick={switchRole} disabled={saving} style={styles.switchButton}>
          {saving ? 'Switching…' : `Switch to ${otherRole}`}
        </button>
        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 560, margin: '0 auto', padding: '48px 24px 80px' },
  back: {
    display: 'inline-block',
    color: 'var(--gd-text-dim)',
    fontSize: 13,
    textDecoration: 'none',
    marginBottom: 24,
  },
  eyebrow: {
    fontFamily: 'var(--gd-font-mono)',
    fontSize: 12,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--gd-gold)',
    margin: '0 0 6px',
  },
  title: {
    fontFamily: 'var(--gd-font-display)',
    fontWeight: 500,
    fontSize: 30,
    margin: 0,
  },
  card: {
    background: 'var(--gd-surface)',
    border: '1px solid var(--gd-line)',
    borderRadius: 'var(--gd-radius)',
    padding: 24,
  },
  cardTitle: {
    fontFamily: 'var(--gd-font-display)',
    fontWeight: 500,
    fontSize: 18,
    margin: '0 0 10px',
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 1.6,
    color: 'var(--gd-text-dim)',
    margin: '0 0 20px',
  },
  switchButton: {
    background: 'var(--gd-gold)',
    border: 'none',
    borderRadius: 8,
    padding: '11px 20px',
    color: 'var(--gd-on-accent)',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
  },
  error: {
    color: 'var(--gd-error)',
    fontSize: 13,
    marginTop: 12,
  },
};
