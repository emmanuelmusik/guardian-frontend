import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';

const VERSIONS = [
  { value: 'kjv', label: 'King James Version' },
  { value: 'web', label: 'World English Bible' },
  { value: 'asv', label: 'American Standard Version' },
  { value: 'bbe', label: 'Bible in Basic English' },
  { value: 'ylt', label: "Young's Literal Translation" },
];

export default function Bible() {
  const [ref, setRef] = useState('John 3:16');
  const [version, setVersion] = useState('kjv');
  const [passage, setPassage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function lookup(e) {
    e?.preventDefault();
    if (!ref.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch(`/api/bible/passage?ref=${encodeURIComponent(ref.trim())}&version=${version}`);
      setPassage(data);
    } catch (err) {
      setError(err.message);
      setPassage(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <Link to="/" style={styles.back}>← Back to journal</Link>

      <p style={styles.eyebrow}>Guardian</p>
      <h1 style={styles.title}>Bible</h1>

      <hr className="gd-horizon" style={{ margin: '24px 0 32px' }} />

      <form onSubmit={lookup} style={styles.form}>
        <input
          placeholder="e.g. Psalm 23, John 3:16, Romans 8:28-30"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          style={{ ...styles.input, flex: 1 }}
        />
        <select value={version} onChange={(e) => setVersion(e.target.value)} style={styles.input}>
          {VERSIONS.map((v) => (
            <option key={v.value} value={v.value}>{v.label}</option>
          ))}
        </select>
        <button type="submit" disabled={loading || !ref.trim()} style={styles.button}>
          {loading ? '…' : 'Read'}
        </button>
      </form>

      {error && <p style={styles.errorText}>Couldn't find that passage — try a format like "John 3:16" or "Psalm 23".</p>}

      {passage && (
        <div style={styles.card}>
          <p style={styles.reference}>{passage.reference} · {passage.translation_name}</p>
          {passage.verses ? (
            passage.verses.map((v, i) => (
              <p key={i} style={styles.verse}>
                <span style={styles.verseNum}>{v.verse}</span> {v.text.trim()}
              </p>
            ))
          ) : (
            <p style={styles.verse}>{passage.text}</p>
          )}
        </div>
      )}
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
  form: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 },
  input: {
    background: 'var(--gd-surface)', color: 'var(--gd-text)', border: '1px solid var(--gd-line)',
    borderRadius: 8, padding: '10px 12px', fontFamily: 'var(--gd-font-body)', fontSize: 14,
  },
  button: {
    background: 'var(--gd-gold)', border: 'none', borderRadius: 8, padding: '10px 20px',
    color: 'var(--gd-on-accent)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
  },
  card: {
    background: 'var(--gd-surface)', border: '1px solid var(--gd-line)',
    borderRadius: 'var(--gd-radius)', padding: 24,
  },
  reference: {
    fontFamily: 'var(--gd-font-mono)', fontSize: 12, letterSpacing: '0.05em',
    textTransform: 'uppercase', color: 'var(--gd-violet)', margin: '0 0 16px',
  },
  verse: {
    fontFamily: 'var(--gd-font-display)', fontSize: 18, lineHeight: 1.8,
    color: 'var(--gd-text)', margin: '0 0 8px',
  },
  verseNum: {
    fontFamily: 'var(--gd-font-mono)', fontSize: 12, color: 'var(--gd-gold)', marginRight: 4,
  },
  errorText: { color: 'var(--gd-error)', fontSize: 14, marginBottom: 16 },
};
