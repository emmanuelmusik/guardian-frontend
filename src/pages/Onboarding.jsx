import React, { useState } from 'react';
import { apiFetch } from '../api';

const ROLES = [
  {
    value: 'aspirant',
    title: 'Aspirant',
    description: "Record dreams and visions, and share them with a mentor or community when you're ready.",
  },
  {
    value: 'mentor',
    title: 'Mentor',
    description: 'Guide a community of aspirants, offering feedback on what they choose to share with you.',
  },
];

export default function Onboarding({ onComplete }) {
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  async function confirm() {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await apiFetch('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify({ role: selected, onboarded: true }),
      });
      onComplete(updated);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.page}>
      <p style={styles.eyebrow}>Guardian</p>
      <h1 style={styles.title}>How will you walk this path?</h1>
      <p style={styles.sub}>
        You can be guided, or you can guide others. Choose what fits you now — this isn't permanent.
      </p>

      <div style={styles.options}>
        {ROLES.map((r) => (
          <button
            key={r.value}
            onClick={() => setSelected(r.value)}
            style={{ ...styles.option, ...(selected === r.value ? styles.optionSelected : {}) }}
          >
            <h3 style={styles.optionTitle}>{r.title}</h3>
            <p style={styles.optionDesc}>{r.description}</p>
          </button>
        ))}
      </div>

      <button
        onClick={confirm}
        disabled={!selected || saving}
        style={{ ...styles.confirm, opacity: !selected || saving ? 0.5 : 1 }}
      >
        {saving ? 'Setting your path…' : 'Continue'}
      </button>
    </div>
  );
}

const styles = {
  page: { maxWidth: 560, margin: '0 auto', padding: '64px 24px' },
  eyebrow: {
    fontFamily: 'var(--gd-font-mono)',
    fontSize: 12,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--gd-gold)',
    margin: '0 0 16px',
  },
  title: {
    fontFamily: 'var(--gd-font-display)',
    fontWeight: 500,
    fontSize: 32,
    margin: 0,
    lineHeight: 1.2,
  },
  sub: {
    color: 'var(--gd-text-dim)',
    fontSize: 15,
    lineHeight: 1.6,
    marginTop: 16,
    marginBottom: 32,
  },
  options: { display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 },
  option: {
    textAlign: 'left',
    background: 'var(--gd-surface)',
    border: '1px solid var(--gd-line)',
    borderRadius: 'var(--gd-radius)',
    padding: 20,
    cursor: 'pointer',
  },
  optionSelected: { borderColor: 'var(--gd-gold)', background: 'var(--gd-surface-raised)' },
  optionTitle: {
    fontFamily: 'var(--gd-font-display)',
    fontWeight: 500,
    fontSize: 20,
    margin: '0 0 6px',
    color: 'var(--gd-text)',
  },
  optionDesc: { fontSize: 14, lineHeight: 1.5, color: 'var(--gd-text-dim)', margin: 0 },
  confirm: {
    width: '100%',
    background: 'var(--gd-gold)',
    border: 'none',
    borderRadius: 'var(--gd-radius)',
    padding: '14px 20px',
    color: 'var(--gd-void)',
    fontWeight: 600,
    fontSize: 15,
    cursor: 'pointer',
  },
};
