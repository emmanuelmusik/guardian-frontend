import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../api';
import PageHeader from '../components/PageHeader.jsx';

export default function PdfViewer({ profile }) {
  const { id } = useParams();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch('/api/featured-materials')
      .then((list) => {
        const found = list.find((m) => m.id === id);
        if (!found) throw new Error('Material not found');
        setMaterial(found);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div style={styles.page}>
      <PageHeader title={material?.title || 'PDF'} profile={profile} />
      <Link to="/materials" style={styles.back}>← Back to Materials</Link>

      {loading && <p style={styles.dim}>Loading…</p>}
      {error && <p style={styles.errorText}>{error}</p>}

      {material && (
        <>
          <div style={styles.viewerWrap}>
            <iframe src={material.url} title={material.title} style={styles.viewer} />
          </div>
          <a href={material.url} target="_blank" rel="noreferrer" style={styles.fallbackLink}>
            Not displaying correctly? Open in a new tab →
          </a>
        </>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' },
  back: { display: 'inline-block', color: 'var(--gd-text-dim)', fontSize: 13, textDecoration: 'none', marginBottom: 20 },
  viewerWrap: {
    width: '100%',
    height: '75vh',
    border: '1px solid var(--gd-line)',
    borderRadius: 'var(--gd-radius)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  viewer: { width: '100%', height: '100%', border: 'none' },
  fallbackLink: { display: 'inline-block', color: 'var(--gd-violet)', fontSize: 13, textDecoration: 'none' },
  dim: { color: 'var(--gd-text-dim)', fontSize: 14 },
  errorText: { color: 'var(--gd-error)', fontSize: 14 },
};
