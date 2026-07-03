import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';
import { nameFor } from '../utils/formatUser';
import CommentThread from '../components/CommentThread.jsx';
import PageHeader from '../components/PageHeader.jsx';

const TYPE_GLYPH = { dream: '☾', vision: '✦', intuition: '◈', note: '—' };

export default function MentorInbox({ profile }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openThread, setOpenThread] = useState(null);

  useEffect(() => {
    apiFetch('/api/entries/shared-with-me')
      .then(setEntries)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={styles.page}>
      <PageHeader title="Shared with you" profile={profile} />
      <Link to="/mentorship" style={styles.back}>← Back to Mentorship</Link>

      <hr className="gd-horizon" style={{ margin: '24px 0 32px' }} />

      {error && <p style={styles.errorText}>{error}</p>}
      {loading && <p style={styles.dim}>Gathering…</p>}
      {!loading && entries.length === 0 && (
        <p style={styles.dim}>Nothing has been shared with you yet.</p>
      )}

      {entries.map((entry) => (
        <div key={entry.id} style={styles.entryCard}>
          <div style={styles.entryMeta}>
            <span style={styles.glyph}>{TYPE_GLYPH[entry.type] || '—'}</span>
            <span style={styles.entryAuthor}>{nameFor(entry.profiles)}</span>
            <span style={styles.entryDate}>
              {new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
          {entry.title && <h4 style={styles.entryTitle}>{entry.title}</h4>}
          <p style={styles.entryContent}>{entry.content}</p>
          <button
            onClick={() => setOpenThread(openThread === entry.id ? null : entry.id)}
            style={styles.threadToggle}
          >
            {openThread === entry.id ? 'Hide feedback' : 'Leave feedback'}
          </button>
          {openThread === entry.id && <CommentThread entryId={entry.id} currentUserId={profile?.id} />}
        </div>
      ))}
    </div>
  );
}

const styles = {
  page: { maxWidth: 640, margin: '0 auto', padding: '48px 24px 80px' },
  back: { display: 'inline-block', color: 'var(--gd-text-dim)', fontSize: 13, textDecoration: 'none', marginBottom: 24 },
  eyebrow: {
    fontFamily: 'var(--gd-font-mono)', fontSize: 12, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: 'var(--gd-gold)', margin: '0 0 6px',
  },
  title: { fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 30, margin: 0 },
  entryCard: {
    background: 'var(--gd-surface)', border: '1px solid var(--gd-line)',
    borderRadius: 'var(--gd-radius)', padding: 18, marginBottom: 14,
  },
  entryMeta: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  glyph: { color: 'var(--gd-gold)', fontSize: 14 },
  entryAuthor: { fontSize: 13, color: 'var(--gd-text)', fontWeight: 500 },
  entryDate: { fontFamily: 'var(--gd-font-mono)', fontSize: 11, color: 'var(--gd-text-dim)', marginLeft: 'auto' },
  entryTitle: { fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 17, margin: '0 0 6px', color: 'var(--gd-text)' },
  entryContent: { fontSize: 14, lineHeight: 1.6, color: 'var(--gd-text)', margin: '0 0 10px', whiteSpace: 'pre-wrap' },
  threadToggle: {
    background: 'transparent', border: 'none', color: 'var(--gd-violet)',
    fontSize: 12, cursor: 'pointer', padding: 0, fontFamily: 'var(--gd-font-mono)',
  },
  dim: { color: 'var(--gd-text-dim)', fontSize: 14 },
  errorText: { color: 'var(--gd-error)', fontSize: 14 },
};
