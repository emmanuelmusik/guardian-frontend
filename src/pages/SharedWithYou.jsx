import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import CommentThread from '../components/CommentThread.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { nameFor } from '../utils/formatUser';

const TYPE_GLYPH = { dream: '☾', vision: '✦', intuition: '◈', note: '—' };

export default function SharedWithYou({ profile }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSharerId, setSelectedSharerId] = useState(null);
  const [expandedEntryId, setExpandedEntryId] = useState(null);

  useEffect(() => {
    apiFetch('/api/entries/shared-with-user')
      .then(setEntries)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Group entries by who shared them
  const sharers = [];
  const bySharer = {};
  entries.forEach((entry) => {
    const sharerId = entry.user_id;
    if (!bySharer[sharerId]) {
      bySharer[sharerId] = { profile: entry.profiles, entries: [] };
      sharers.push(sharerId);
    }
    bySharer[sharerId].entries.push(entry);
  });

  const selectedSharer = selectedSharerId ? bySharer[selectedSharerId] : null;
  const expandedEntry = expandedEntryId
    ? selectedSharer?.entries.find((e) => e.id === expandedEntryId)
    : null;

  return (
    <div style={styles.page}>
      <PageHeader
        title="Shared with you"
        subtitle="Entries someone you're connected with has chosen to share directly with you."
        profile={profile}
      />

      <hr className="gd-horizon" style={{ margin: '24px 0 32px' }} />

      {error && <p style={styles.errorText}>{error}</p>}
      {loading && <p style={styles.dim}>Gathering…</p>}
      {!loading && entries.length === 0 && (
        <p style={styles.dim}>No one has shared an entry with you yet.</p>
      )}

      {/* Level 1: list of sharers */}
      {!loading && !selectedSharerId && sharers.map((sharerId) => {
        const { profile: sharerProfile, entries: theirEntries } = bySharer[sharerId];
        return (
          <button
            key={sharerId}
            onClick={() => setSelectedSharerId(sharerId)}
            style={styles.sharerCard}
          >
            <span style={styles.sharerName}>{nameFor(sharerProfile)}</span>
            <span style={styles.sharerCount}>{theirEntries.length}</span>
          </button>
        );
      })}

      {/* Level 2: list of entry titles from the selected sharer */}
      {selectedSharer && !expandedEntryId && (
        <>
          <button onClick={() => setSelectedSharerId(null)} style={styles.back}>← All sharers</button>
          <h3 style={styles.sectionTitle}>{nameFor(selectedSharer.profile)}</h3>
          {selectedSharer.entries.map((entry) => (
            <button
              key={entry.id}
              onClick={() => setExpandedEntryId(entry.id)}
              style={styles.titleCard}
            >
              <span style={styles.glyph}>{TYPE_GLYPH[entry.type] || '—'}</span>
              <span style={styles.titleText}>{entry.title || '(untitled)'}</span>
              <span style={styles.titleDate}>
                {new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </button>
          ))}
        </>
      )}

      {/* Level 3: expanded entry with full content and feedback thread */}
      {expandedEntry && (
        <>
          <button onClick={() => setExpandedEntryId(null)} style={styles.back}>
            ← Back to {nameFor(selectedSharer.profile)}'s entries
          </button>
          <div style={styles.entryCard}>
            <div style={styles.entryMeta}>
              <span style={styles.glyph}>{TYPE_GLYPH[expandedEntry.type] || '—'}</span>
              <span style={styles.entryDate}>
                {new Date(expandedEntry.created_at).toLocaleString(undefined, {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </span>
            </div>
            {expandedEntry.title && <h4 style={styles.entryTitle}>{expandedEntry.title}</h4>}
            <p style={styles.entryContent}>{expandedEntry.content}</p>
            <CommentThread entryId={expandedEntry.id} currentUserId={profile?.id} />
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 640, margin: '0 auto', padding: '48px 24px 80px' },
  back: {
    display: 'inline-block', background: 'transparent', border: 'none', color: 'var(--gd-text-dim)',
    fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 20, fontFamily: 'var(--gd-font-body)',
  },
  sectionTitle: {
    fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 20, margin: '0 0 16px', color: 'var(--gd-text)',
  },
  sharerCard: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%',
    background: 'var(--gd-surface)', border: '1px solid var(--gd-line)', borderRadius: 'var(--gd-radius)',
    padding: 16, marginBottom: 12, cursor: 'pointer', textAlign: 'left',
  },
  sharerName: { fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 16, color: 'var(--gd-text)' },
  sharerCount: {
    fontFamily: 'var(--gd-font-mono)', fontSize: 12, color: 'var(--gd-gold)',
    background: 'var(--gd-void)', borderRadius: 12, padding: '2px 10px',
  },
  titleCard: {
    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
    background: 'var(--gd-surface)', border: '1px solid var(--gd-line)', borderRadius: 'var(--gd-radius)',
    padding: 14, marginBottom: 10, cursor: 'pointer', textAlign: 'left',
  },
  glyph: { color: 'var(--gd-gold)', fontSize: 14 },
  titleText: { flex: 1, fontSize: 14, color: 'var(--gd-text)', fontFamily: 'var(--gd-font-display)' },
  titleDate: { fontFamily: 'var(--gd-font-mono)', fontSize: 11, color: 'var(--gd-text-dim)' },
  entryCard: {
    background: 'var(--gd-surface)', border: '1px solid var(--gd-line)',
    borderRadius: 'var(--gd-radius)', padding: 18,
  },
  entryMeta: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  entryDate: { fontFamily: 'var(--gd-font-mono)', fontSize: 11, color: 'var(--gd-text-dim)' },
  entryTitle: { fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 17, margin: '0 0 6px', color: 'var(--gd-text)' },
  entryContent: { fontSize: 14, lineHeight: 1.6, color: 'var(--gd-text)', margin: '0 0 10px', whiteSpace: 'pre-wrap' },
  dim: { color: 'var(--gd-text-dim)', fontSize: 14 },
  errorText: { color: 'var(--gd-error)', fontSize: 14 },
};
