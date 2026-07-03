import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import PageHeader from '../components/PageHeader.jsx';

export default function Materials({ profile }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch('/api/featured-materials')
      .then(setMaterials)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={styles.page}>
      <PageHeader title="Materials" subtitle="The app's featured library. Mentors recommend from these into their own communities." profile={profile} />

      <hr className="gd-horizon" style={{ margin: '24px 0 32px' }} />

      {error && <p style={styles.errorText}>{error}</p>}
      {loading && <p style={styles.dim}>Loading…</p>}
      {!loading && materials.length === 0 && <p style={styles.dim}>Nothing in the library yet.</p>}

      {materials.map((m) => (
        <a key={m.id} href={m.url} target="_blank" rel="noreferrer" style={styles.card}>
          <span style={styles.typeTag}>{m.type}</span>
          <h4 style={styles.cardTitle}>{m.title}</h4>
          {m.description && <p style={styles.cardDesc}>{m.description}</p>}
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
  sub: { fontSize: 14, color: 'var(--gd-text-dim)', marginTop: 10, lineHeight: 1.6 },
  card: {
    display: 'block', background: 'var(--gd-surface)', border: '1px solid var(--gd-line)',
    borderRadius: 'var(--gd-radius)', padding: 16, marginBottom: 12, textDecoration: 'none', color: 'var(--gd-text)',
  },
  typeTag: {
    fontFamily: 'var(--gd-font-mono)', fontSize: 10, color: 'var(--gd-gold)', textTransform: 'uppercase',
    border: '1px solid var(--gd-gold-dim)', borderRadius: 4, padding: '2px 6px',
  },
  cardTitle: { fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 16, margin: '8px 0 4px' },
  cardDesc: { fontSize: 13, color: 'var(--gd-text-dim)', margin: 0, lineHeight: 1.5 },
  dim: { color: 'var(--gd-text-dim)', fontSize: 14 },
  errorText: { color: 'var(--gd-error)', fontSize: 14, marginBottom: 16 },
};
