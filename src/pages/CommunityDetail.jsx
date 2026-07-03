import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../api';
import CommentThread from '../components/CommentThread.jsx';

const TYPE_GLYPH = { dream: '☾', vision: '✦', intuition: '◈', note: '—' };

export default function CommunityDetail() {
  const { id } = useParams();
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openThread, setOpenThread] = useState(null);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [c, m, e, s] = await Promise.all([
        apiFetch(`/api/communities/${id}`),
        apiFetch(`/api/communities/${id}/members`),
        apiFetch(`/api/entries/community/${id}`),
        apiFetch(`/api/study-materials/community/${id}`),
      ]);
      setCommunity(c);
      setMembers(m);
      setEntries(e);
      setMaterials(s);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div style={styles.page}><p style={styles.dim}>Gathering the community…</p></div>;
  if (error) return <div style={styles.page}><p style={styles.errorText}>{error}</p></div>;

  return (
    <div style={styles.page}>
      <Link to="/communities" style={styles.back}>← Back to communities</Link>

      <p style={styles.eyebrow}>Guardian</p>
      <h1 style={styles.title}>{community.name}</h1>
      {community.description && <p style={styles.desc}>{community.description}</p>}
      <p style={styles.mentorLine}>Led by {community.profiles?.display_name || 'a mentor'}</p>

      <hr className="gd-horizon" style={{ margin: '24px 0 32px' }} />

      <h3 style={styles.sectionTitle}>Members ({members.length})</h3>
      <div style={styles.memberRow}>
        {members.map((m) => (
          <span key={m.profiles.id} style={styles.memberChip}>
            {m.profiles.display_name}{m.role === 'mentor' ? ' · mentor' : ''}
          </span>
        ))}
      </div>

      <h3 style={styles.sectionTitle}>Shared entries</h3>
      {entries.length === 0 && <p style={styles.dim}>Nothing shared here yet.</p>}
      {entries.map((entry) => (
        <div key={entry.id} style={styles.entryCard}>
          <div style={styles.entryMeta}>
            <span style={styles.glyph}>{TYPE_GLYPH[entry.type] || '—'}</span>
            <span style={styles.entryAuthor}>{entry.profiles?.display_name || 'Someone'}</span>
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
            {openThread === entry.id ? 'Hide feedback' : 'View feedback'}
          </button>
          {openThread === entry.id && <CommentThread entryId={entry.id} />}
        </div>
      ))}

      <h3 style={styles.sectionTitle}>Study materials</h3>
      {materials.length === 0 && <p style={styles.dim}>Nothing added yet.</p>}
      {materials.map((mat) => (
        <a key={mat.id} href={mat.url} target="_blank" rel="noreferrer" style={styles.materialCard}>
          <span style={styles.materialType}>{mat.type}</span>
          <span style={styles.materialTitle}>{mat.title}</span>
        </a>
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
  desc: { fontSize: 14, color: 'var(--gd-text-dim)', lineHeight: 1.6, marginTop: 10 },
  mentorLine: { fontSize: 12, color: 'var(--gd-violet)', fontFamily: 'var(--gd-font-mono)', marginTop: 8 },
  sectionTitle: {
    fontFamily: 'var(--gd-font-mono)', fontSize: 12, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: 'var(--gd-text-dim)', margin: '32px 0 14px',
  },
  memberRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  memberChip: {
    background: 'var(--gd-surface)', border: '1px solid var(--gd-line)', borderRadius: 20,
    padding: '6px 14px', fontSize: 12, color: 'var(--gd-text)',
  },
  entryCard: {
    background: 'var(--gd-surface)', border: '1px solid var(--gd-line)',
    borderRadius: 'var(--gd-radius)', padding: 18, marginBottom: 14,
  },
  entryMeta: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  glyph: { color: 'var(--gd-gold)', fontSize: 14 },
  entryAuthor: { fontSize: 13, color: 'var(--gd-text)', fontWeight: 500 },
  entryDate: {
    fontFamily: 'var(--gd-font-mono)', fontSize: 11, color: 'var(--gd-text-dim)', marginLeft: 'auto',
  },
  entryTitle: {
    fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 17, margin: '0 0 6px', color: 'var(--gd-text)',
  },
  entryContent: { fontSize: 14, lineHeight: 1.6, color: 'var(--gd-text)', margin: '0 0 10px', whiteSpace: 'pre-wrap' },
  threadToggle: {
    background: 'transparent', border: 'none', color: 'var(--gd-violet)',
    fontSize: 12, cursor: 'pointer', padding: 0, fontFamily: 'var(--gd-font-mono)',
  },
  materialCard: {
    display: 'flex', gap: 10, alignItems: 'center', background: 'var(--gd-surface)',
    border: '1px solid var(--gd-line)', borderRadius: 'var(--gd-radius)', padding: 14,
    marginBottom: 10, textDecoration: 'none', color: 'var(--gd-text)',
  },
  materialType: {
    fontFamily: 'var(--gd-font-mono)', fontSize: 10, color: 'var(--gd-gold)',
    textTransform: 'uppercase', border: '1px solid var(--gd-gold-dim)', borderRadius: 4, padding: '2px 6px',
  },
  materialTitle: { fontSize: 14 },
  dim: { color: 'var(--gd-text-dim)', fontSize: 14 },
  errorText: { color: 'var(--gd-error)', fontSize: 14 },
};
