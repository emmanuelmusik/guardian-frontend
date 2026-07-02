import React from 'react';

const TYPE_GLYPH = { dream: '☾', vision: '✦', intuition: '◈', note: '—' };

export default function EntryCard({ entry }) {
  const date = new Date(entry.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div style={styles.card}>
      <div style={styles.meta}>
        <span style={styles.glyph}>{TYPE_GLYPH[entry.type] || '—'}</span>
        <span style={styles.type}>{entry.type}</span>
        <span style={styles.date}>{date}</span>
      </div>
      {entry.title && <h3 style={styles.title}>{entry.title}</h3>}
      <p style={styles.content}>{entry.content}</p>
      <span style={styles.visibility}>
        {entry.visibility === 'private' ? 'Private' : entry.visibility === 'mentor' ? 'Shared with mentor' : 'Shared with community'}
      </span>
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--gd-surface)',
    border: '1px solid var(--gd-line)',
    borderRadius: 'var(--gd-radius)',
    padding: 18,
    marginBottom: 14,
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  glyph: {
    color: 'var(--gd-gold)',
    fontSize: 14,
  },
  type: {
    fontFamily: 'var(--gd-font-mono)',
    fontSize: 11,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--gd-text-dim)',
  },
  date: {
    fontFamily: 'var(--gd-font-mono)',
    fontSize: 11,
    color: 'var(--gd-text-dim)',
    marginLeft: 'auto',
  },
  title: {
    fontFamily: 'var(--gd-font-display)',
    fontWeight: 500,
    fontSize: 18,
    margin: '0 0 6px',
    color: 'var(--gd-text)',
  },
  content: {
    fontSize: 14,
    lineHeight: 1.6,
    color: 'var(--gd-text)',
    margin: '0 0 10px',
    whiteSpace: 'pre-wrap',
  },
  visibility: {
    fontSize: 11,
    color: 'var(--gd-violet)',
    fontFamily: 'var(--gd-font-mono)',
  },
};
