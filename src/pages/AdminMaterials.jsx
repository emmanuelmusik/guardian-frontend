import React, { useEffect, useState } from 'react';
import { apiFetch, apiUpload } from '../api';
import PageHeader from '../components/PageHeader.jsx';

const TYPES = [
  { value: 'pdf', label: 'PDF' },
  { value: 'audiobook', label: 'Audiobook' },
  { value: 'video', label: 'Video' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'voice_note', label: 'Voice note' },
];

export default function AdminMaterials({ profile }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [type, setType] = useState('pdf');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setMaterials(await apiFetch('/api/featured-materials'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addMaterial(e) {
    e.preventDefault();
    if (!title.trim() || (!url.trim() && !file)) return;
    setSaving(true);
    try {
      let finalUrl = url.trim();
      if (file) {
        setUploading(true);
        const uploaded = await apiUpload('/api/featured-materials/upload', file);
        finalUrl = uploaded.url;
        setUploading(false);
      }
      await apiFetch('/api/featured-materials', {
        method: 'POST',
        body: JSON.stringify({ type, title: title.trim(), url: finalUrl, description: description.trim() || null }),
      });
      setTitle('');
      setUrl('');
      setDescription('');
      setFile(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  async function removeMaterial(id) {
    try {
      await apiFetch(`/api/featured-materials/${id}`, { method: 'DELETE' });
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  if (!profile?.is_admin) {
    return (
      <div style={styles.page}>
        <PageHeader title="Admin" profile={profile} />
        <p style={styles.dim}>This page is only available to app admins.</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <PageHeader
        title="Featured materials"
        subtitle="These appear in the library mentors pick from when recommending materials to their community."
        profile={profile}
      />

      <hr className="gd-horizon" style={{ marginBottom: 32 }} />

      {error && <p style={styles.errorText}>{error}</p>}

      <form onSubmit={addMaterial} style={styles.card}>
        <div style={styles.row}>
          <select value={type} onChange={(e) => setType(e.target.value)} style={styles.input}>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ ...styles.input, flex: 1 }}
          />
        </div>
        <input
          placeholder="URL (or upload a file below instead)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={!!file}
          style={styles.input}
        />
        <div style={styles.fileRow}>
          <label style={styles.fileButton}>
            {file ? file.name : 'Or choose a file to upload'}
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ display: 'none' }}
            />
          </label>
          {file && (
            <button type="button" onClick={() => setFile(null)} style={styles.clearFileButton}>Clear</button>
          )}
        </div>
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          style={{ ...styles.input, resize: 'vertical' }}
        />
        <button type="submit" disabled={saving || !title.trim() || (!url.trim() && !file)} style={styles.primaryButton}>
          {uploading ? 'Uploading…' : saving ? 'Adding…' : 'Add to library'}
        </button>
      </form>

      <h3 style={styles.sectionTitle}>Library ({materials.length})</h3>
      {loading && <p style={styles.dim}>Loading…</p>}
      {materials.map((m) => (
        <div key={m.id} style={styles.listCard}>
          <div>
            <span style={styles.typeTag}>{m.type}</span>
            <h4 style={styles.listCardTitle}>{m.title}</h4>
            {m.description && <p style={styles.listCardDesc}>{m.description}</p>}
          </div>
          <button onClick={() => removeMaterial(m.id)} style={styles.removeButton}>Remove</button>
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
  sub: { fontSize: 14, color: 'var(--gd-text-dim)', marginTop: 10, lineHeight: 1.6 },
  card: {
    background: 'var(--gd-surface)', border: '1px solid var(--gd-line)', borderRadius: 'var(--gd-radius)',
    padding: 20, marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 10,
  },
  row: { display: 'flex', gap: 10 },
  fileRow: { display: 'flex', gap: 10, alignItems: 'center' },
  fileButton: {
    flex: 1, background: 'var(--gd-void)', border: '1px dashed var(--gd-line)', borderRadius: 8,
    padding: '10px 12px', fontSize: 13, color: 'var(--gd-text-dim)', cursor: 'pointer', textAlign: 'center',
  },
  clearFileButton: {
    background: 'transparent', border: 'none', color: 'var(--gd-error)', fontSize: 12, cursor: 'pointer',
  },
  input: {
    background: 'var(--gd-void)', color: 'var(--gd-text)', border: '1px solid var(--gd-line)',
    borderRadius: 8, padding: '10px 12px', fontFamily: 'var(--gd-font-body)', fontSize: 14,
  },
  primaryButton: {
    alignSelf: 'flex-start', background: 'var(--gd-gold)', border: 'none', borderRadius: 8,
    padding: '10px 20px', color: 'var(--gd-on-accent)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
  },
  sectionTitle: {
    fontFamily: 'var(--gd-font-mono)', fontSize: 12, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: 'var(--gd-text-dim)', margin: '0 0 14px',
  },
  listCard: {
    background: 'var(--gd-surface)', border: '1px solid var(--gd-line)', borderRadius: 'var(--gd-radius)',
    padding: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
  },
  typeTag: {
    fontFamily: 'var(--gd-font-mono)', fontSize: 10, color: 'var(--gd-gold)', textTransform: 'uppercase',
    border: '1px solid var(--gd-gold-dim)', borderRadius: 4, padding: '2px 6px',
  },
  listCardTitle: { fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 16, margin: '6px 0 4px' },
  listCardDesc: { fontSize: 13, color: 'var(--gd-text-dim)', margin: 0, lineHeight: 1.5 },
  removeButton: {
    background: 'transparent', border: '1px solid var(--gd-line)', borderRadius: 8, padding: '6px 12px',
    color: 'var(--gd-error)', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
  },
  dim: { color: 'var(--gd-text-dim)', fontSize: 14 },
  errorText: { color: 'var(--gd-error)', fontSize: 14, marginBottom: 16 },
};
