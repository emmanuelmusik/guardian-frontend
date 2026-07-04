import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../api';
import PageHeader from '../components/PageHeader.jsx';
import { isOnline } from '../utils/formatUser';

export default function Profile({ profile: myProfile }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/api/users/${id}`)
      .then(setPerson)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function connect() {
    setConnecting(true);
    try {
      if (person.role === 'mentor') {
        await apiFetch('/api/connections', {
          method: 'POST',
          body: JSON.stringify({ mentor_id: person.id }),
        });
      } else {
        await apiFetch('/api/peer-connections', {
          method: 'POST',
          body: JSON.stringify({ recipient_id: person.id }),
        });
      }
      const refreshed = await apiFetch(`/api/users/${id}`);
      setPerson(refreshed);
    } catch (err) {
      setError(err.message);
    } finally {
      setConnecting(false);
    }
  }

  if (loading) return <div style={styles.page}><p style={styles.dim}>Loading profile…</p></div>;
  if (error) return <div style={styles.page}><p style={styles.errorText}>{error}</p></div>;
  if (!person) return null;

  const connected = person.myConnection?.status === 'accepted';
  const pending = person.myConnection?.status === 'pending';

  return (
    <div style={styles.page}>
      <PageHeader title="Profile" profile={myProfile} />

      <div style={styles.card}>
        <div style={styles.avatar}>
          {person.avatar_url ? (
            <img src={person.avatar_url} alt="" style={styles.avatarImg} />
          ) : (
            <span style={styles.avatarPlaceholder}>{(person.display_name || '?')[0].toUpperCase()}</span>
          )}
        </div>
        <h1 style={styles.name}>{person.display_name}</h1>
        {person.username && <p style={styles.username}>@{person.username}</p>}
        <div style={styles.metaRow}>
          <span style={styles.roleTag}>{person.role}</span>
          {isOnline(person.last_seen_at) && <span style={styles.onlineTag}>● Online</span>}
        </div>
        {person.bio && <p style={styles.bio}>{person.bio}</p>}

        {!person.isSelf && (
          <div style={styles.actions}>
            {connected && (
              <button onClick={() => navigate(`/messages/${person.id}`)} style={styles.primaryButton}>
                Message
              </button>
            )}
            {pending && <span style={styles.pendingTag}>Request pending</span>}
            {!connected && !pending && (
              <button onClick={connect} disabled={connecting} style={styles.primaryButton}>
                {connecting ? '…' : 'Connect'}
              </button>
            )}
          </div>
        )}
        {person.isSelf && (
          <Link to="/settings" style={styles.editLink}>Edit your profile →</Link>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 480, margin: '0 auto', padding: '48px 24px 80px' },
  card: {
    background: 'var(--gd-surface)', border: '1px solid var(--gd-line)',
    borderRadius: 'var(--gd-radius)', padding: 32, textAlign: 'center',
  },
  avatar: {
    width: 88, height: 88, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px',
    background: 'var(--gd-void)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '1px solid var(--gd-line)',
  },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  avatarPlaceholder: { fontFamily: 'var(--gd-font-display)', fontSize: 32, color: 'var(--gd-gold)' },
  name: { fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 24, margin: '0 0 4px' },
  username: { fontFamily: 'var(--gd-font-mono)', fontSize: 13, color: 'var(--gd-gold)', margin: '0 0 12px' },
  metaRow: { display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16 },
  roleTag: {
    fontFamily: 'var(--gd-font-mono)', fontSize: 11, color: 'var(--gd-violet)',
    textTransform: 'uppercase', border: '1px solid var(--gd-line)', borderRadius: 4, padding: '2px 8px',
  },
  onlineTag: { fontFamily: 'var(--gd-font-mono)', fontSize: 11, color: '#4CAF50' },
  bio: { fontSize: 14, lineHeight: 1.6, color: 'var(--gd-text-dim)', marginBottom: 20 },
  actions: { display: 'flex', justifyContent: 'center' },
  primaryButton: {
    background: 'var(--gd-gold)', border: 'none', borderRadius: 8, padding: '10px 24px',
    color: 'var(--gd-on-accent)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
  },
  pendingTag: {
    fontFamily: 'var(--gd-font-mono)', fontSize: 12, color: 'var(--gd-text-dim)', textTransform: 'uppercase',
  },
  editLink: { display: 'inline-block', marginTop: 8, color: 'var(--gd-violet)', fontSize: 13, textDecoration: 'none' },
  dim: { color: 'var(--gd-text-dim)', fontSize: 14 },
  errorText: { color: 'var(--gd-error)', fontSize: 14 },
};
