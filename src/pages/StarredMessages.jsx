import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';
import { formatMessageTime } from '../lib/relativeTime';
import { formatMessageText } from '../lib/formatText';
import PageHeader from '../components/PageHeader.jsx';

// Every message you've starred, across every conversation — the
// "bookmark for quick retrieval" piece of the messaging feature set.
export default function StarredMessages({ profile }) {
  const [messages, setMessages] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch('/api/messages/starred')
      .then(setMessages)
      .catch((err) => setError(err.message));
  }, []);

  async function unstar(id) {
    try {
      await apiFetch(`/api/messages/${id}/star`, { method: 'DELETE' });
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={styles.page}>
      <PageHeader title="Starred messages" profile={profile} />
      <Link to="/messages" style={styles.back}>← Back to messages</Link>

      {error && <p style={styles.errorText}>{error}</p>}
      {!messages ? (
        <p style={styles.dim}>Loading…</p>
      ) : messages.length === 0 ? (
        <p style={styles.dim}>Nothing starred yet. Long-press any message and choose "Star" to bookmark it here.</p>
      ) : (
        <div style={styles.list}>
          {messages.map((m) => {
            const otherId = m.sender_id === profile.id ? m.recipient_id : m.sender_id;
            return (
              <Link key={m.id} to={`/messages/${otherId}`} style={styles.item}>
                <div style={styles.itemBody}>
                  {m.deleted_for_everyone ? <span style={styles.deletedText}>This message was deleted</span> : formatMessageText(m.body || 'Media message')}
                </div>
                <div style={styles.itemMeta}>
                  <span>{formatMessageTime(m.created_at)}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); unstar(m.id); }}
                    style={styles.unstarButton}
                    title="Remove from starred"
                  >
                    ⭐
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 640, margin: '0 auto', padding: '48px 24px 100px' },
  back: { display: 'inline-block', color: 'var(--gd-text-dim)', fontSize: 13, textDecoration: 'none', marginBottom: 20 },
  dim: { color: 'var(--gd-text-dim)', fontSize: 14 },
  errorText: { color: 'var(--gd-error)', fontSize: 14, marginBottom: 12 },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  item: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, textDecoration: 'none',
    color: 'var(--gd-text)', background: 'var(--gd-surface)', border: '1px solid var(--gd-line)', borderRadius: 12,
    padding: '12px 14px',
  },
  itemBody: { fontSize: 14, lineHeight: 1.5, flex: 1 },
  deletedText: { fontStyle: 'italic', opacity: 0.7 },
  itemMeta: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, opacity: 0.75, flexShrink: 0 },
  unstarButton: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14 },
};
