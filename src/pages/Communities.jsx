import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';
import PageHeader from '../components/PageHeader.jsx';

export default function Communities({ profile }) {
  const [mine, setMine] = useState([]);
  const [discover, setDiscover] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [mineData, discoverData] = await Promise.all([
        apiFetch('/api/communities'),
        apiFetch('/api/communities/discover'),
      ]);
      setMine(mineData);
      setDiscover(discoverData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function createCommunity(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      await apiFetch('/api/communities', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
      });
      setName('');
      setDescription('');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function joinCommunity(id) {
    try {
      await apiFetch(`/api/communities/${id}/join`, { method: 'POST' });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  const myCommunityIds = new Set(mine.map((m) => m.communities.id));
  const joinable = discover.filter((c) => !myCommunityIds.has(c.id));

  return (
    <div style={styles.page}>
      <PageHeader title="My Community" profile={profile} />

      <hr className="gd-horizon" style={{ margin: '24px 0 32px' }} />

      {error && <p style={styles.errorText}>{error}</p>}

      {profile.role === 'mentor' && (
        <form onSubmit={createCommunity} style={styles.card}>
          <h3 style={styles.cardTitle}>Start a community</h3>
          <input
            placeholder="Community name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />
          <textarea
            placeholder="What is this community for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            style={{ ...styles.input, resize: 'vertical' }}
          />
          <button type="submit" disabled={creating || !name.trim()} style={styles.primaryButton}>
            {creating ? 'Creating…' : 'Create community'}
          </button>
        </form>
      )}

      <h3 style={styles.sectionTitle}>Your communities</h3>
      {loading && <p style={styles.dim}>Gathering…</p>}
      {!loading && mine.length === 0 && (
        <p style={styles.dim}>You haven't joined a community yet.</p>
      )}
      {mine.map(({ role, communities: c }) => (
        <Link key={c.id} to={`/communities/${c.id}`} style={{ ...styles.listCard, textDecoration: 'none' }}>
          <div>
            <h4 style={styles.listCardTitle}>{c.name}</h4>
            {c.description && <p style={styles.listCardDesc}>{c.description}</p>}
          </div>
          <span style={styles.roleTag}>{role}</span>
        </Link>
      ))}

      <h3 style={styles.sectionTitle}>Discover</h3>
      {!loading && joinable.length === 0 && (
        <p style={styles.dim}>No new communities to join right now.</p>
      )}
      {joinable.map((c) => (
        <div key={c.id} style={styles.listCard}>
          <div>
            <h4 style={styles.listCardTitle}>{c.name}</h4>
            {c.description && <p style={styles.listCardDesc}>{c.description}</p>}
            <p style={styles.listCardMentor}>Led by {c.profiles?.display_name || 'a mentor'}</p>
          </div>
          <button onClick={() => joinCommunity(c.id)} style={styles.joinButton}>
            Join
          </button>
        </div>
      ))}
    </div>
  );
}

const styles = {
  page: { maxWidth: 640, margin: '0 auto', padding: '48px 24px 80px' },
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
  title: { fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 30, margin: 0 },
  card: {
    background: 'var(--gd-surface)',
    border: '1px solid var(--gd-line)',
    borderRadius: 'var(--gd-radius)',
    padding: 20,
    marginBottom: 32,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  cardTitle: { fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 18, margin: '0 0 4px' },
  input: {
    background: 'var(--gd-void)',
    color: 'var(--gd-text)',
    border: '1px solid var(--gd-line)',
    borderRadius: 8,
    padding: '10px 12px',
    fontFamily: 'var(--gd-font-body)',
    fontSize: 14,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    background: 'var(--gd-gold)',
    border: 'none',
    borderRadius: 8,
    padding: '10px 20px',
    color: 'var(--gd-on-accent)',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
  },
  sectionTitle: {
    fontFamily: 'var(--gd-font-mono)',
    fontSize: 12,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--gd-text-dim)',
    margin: '32px 0 14px',
  },
  listCard: {
    background: 'var(--gd-surface)',
    border: '1px solid var(--gd-line)',
    borderRadius: 'var(--gd-radius)',
    padding: 16,
    marginBottom: 12,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  listCardTitle: { fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 16, margin: '0 0 4px' },
  listCardDesc: { fontSize: 13, color: 'var(--gd-text-dim)', margin: '0 0 4px', lineHeight: 1.5 },
  listCardMentor: { fontSize: 12, color: 'var(--gd-violet)', margin: 0, fontFamily: 'var(--gd-font-mono)' },
  roleTag: {
    fontFamily: 'var(--gd-font-mono)',
    fontSize: 11,
    color: 'var(--gd-gold)',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  joinButton: {
    background: 'transparent',
    border: '1px solid var(--gd-gold)',
    borderRadius: 8,
    padding: '8px 16px',
    color: 'var(--gd-gold)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  dim: { color: 'var(--gd-text-dim)', fontSize: 14 },
  errorText: { color: 'var(--gd-error)', fontSize: 14, marginBottom: 16 },
};
