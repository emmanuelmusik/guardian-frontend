import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';
import PageHeader from '../components/PageHeader.jsx';
import { nameFor } from '../utils/formatUser';

export default function Messages({ profile }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch('/api/messages/conversations')
      .then(setConversations)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={styles.page}>
      <PageHeader title="Messages" profile={profile} />

      <hr className="gd-horizon" style={{ margin: '24px 0 32px' }} />

      {error && <p style={styles.errorText}>{error}</p>}
      {loading && <p style={styles.dim}>Gathering…</p>}
      {!loading && conversations.length === 0 && (
        <p style={styles.dim}>
          No conversations yet. Once you're connected with a mentor or fellow aspirant, you can message them here.
        </p>
      )}

      {conversations.map(({ profile: p, lastMessage, unreadCount }) => (
        <Link key={p.id} to={`/messages/${p.id}`} style={styles.card}>
          <div style={styles.avatar}>
            {p.avatar_url ? (
              <img src={p.avatar_url} alt="" style={styles.avatarImg} />
            ) : (
              <span style={styles.avatarPlaceholder}>{(p.display_name || '?')[0].toUpperCase()}</span>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={styles.name}>{nameFor(p)}</p>
            <p style={styles.preview}>
              {lastMessage ? lastMessage.body : 'Say hello…'}
            </p>
          </div>
          {unreadCount > 0 && <span style={styles.unreadBadge}>{unreadCount}</span>}
        </Link>
      ))}
    </div>
  );
}

const styles = {
  page: { maxWidth: 640, margin: '0 auto', padding: '48px 24px 80px' },
  card: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: 'var(--gd-surface)', border: '1px solid var(--gd-line)', borderRadius: 'var(--gd-radius)',
    padding: 14, marginBottom: 10, textDecoration: 'none', color: 'var(--gd-text)',
  },
  avatar: {
    width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
    background: 'var(--gd-void)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '1px solid var(--gd-line)',
  },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  avatarPlaceholder: { fontFamily: 'var(--gd-font-display)', fontSize: 16, color: 'var(--gd-gold)' },
  name: { fontSize: 14, fontWeight: 600, margin: '0 0 2px', color: 'var(--gd-text)' },
  preview: {
    fontSize: 13, color: 'var(--gd-text-dim)', margin: 0,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  unreadBadge: {
    background: 'var(--gd-gold)', color: 'var(--gd-on-accent)', fontSize: 11, fontWeight: 700,
    borderRadius: 10, minWidth: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0 6px', flexShrink: 0,
  },
  dim: { color: 'var(--gd-text-dim)', fontSize: 14, lineHeight: 1.6 },
  errorText: { color: 'var(--gd-error)', fontSize: 14 },
};
