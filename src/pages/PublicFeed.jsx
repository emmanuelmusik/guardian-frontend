import React, { useEffect, useState } from 'react';
import { apiFetch, apiUpload } from '../api';
import PageHeader from '../components/PageHeader.jsx';
import UserLink from '../components/UserLink.jsx';

const TYPE_GLYPH = { dream: '☾', vision: '✦', intuition: '◈', note: '—' };

export default function PublicFeed({ profile }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [thought, setThought] = useState('');
  const [file, setFile] = useState(null);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [posts, entries] = await Promise.all([
        apiFetch('/api/public-posts'),
        apiFetch('/api/entries/public-feed'),
      ]);
      const merged = [
        ...posts.map((p) => ({ ...p, kind: 'post' })),
        ...entries.map((e) => ({ ...e, kind: 'entry' })),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setItems(merged);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function postThought(e) {
    e.preventDefault();
    if (!thought.trim()) return;
    setPosting(true);
    setPostError(null);
    try {
      let attachment_path = null;
      let attachment_type = null;
      if (file) {
        const uploaded = await apiUpload('/api/public-posts/media', file);
        attachment_path = uploaded.attachment_path;
        attachment_type = uploaded.attachment_type;
      }
      await apiFetch('/api/public-posts', {
        method: 'POST',
        body: JSON.stringify({ content: thought.trim(), attachment_path, attachment_type }),
      });
      setThought('');
      setFile(null);
      await load();
    } catch (err) {
      setPostError(err.message);
    } finally {
      setPosting(false);
    }
  }

  async function deletePost(id) {
    if (!window.confirm('Delete this post?')) return;
    await apiFetch(`/api/public-posts/${id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((i) => !(i.kind === 'post' && i.id === id)));
  }

  return (
    <div style={styles.page}>
      <PageHeader
        title="Public page 💭"
        subtitle="Share a thought, or a journal entry you've made public. Visible to everyone signed in to Guardian."
        profile={profile}
      />

      <hr className="gd-horizon" style={{ margin: '24px 0 32px' }} />

      <form onSubmit={postThought} style={styles.composer}>
        <textarea
          placeholder="Share a thought…"
          value={thought}
          onChange={(e) => setThought(e.target.value)}
          rows={3}
          style={styles.textarea}
        />
        <div style={styles.composerRow}>
          {profile?.is_subscriber ? (
            <label style={styles.fileButton}>
              {file ? file.name : '📎 Attach media'}
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
            </label>
          ) : (
            <span style={styles.subscriberNote}>Sharing media here is a subscriber feature.</span>
          )}
          <button type="submit" disabled={posting || !thought.trim()} style={styles.postButton}>
            {posting ? 'Posting…' : 'Post'}
          </button>
        </div>
        {postError && <p style={styles.errorText}>{postError}</p>}
      </form>

      {error && <p style={styles.errorText}>{error}</p>}
      {loading && <p style={styles.dim}>Gathering…</p>}
      {!loading && items.length === 0 && <p style={styles.dim}>Nothing shared publicly yet.</p>}

      {items.map((item) => (
        <div key={`${item.kind}-${item.id}`} style={styles.card}>
          <div style={styles.cardMeta}>
            {item.kind === 'entry' && <span style={styles.glyph}>{TYPE_GLYPH[item.type] || '—'}</span>}
            <UserLink profile={{ ...item.profiles, id: item.user_id }} />
            <span style={styles.date}>
              {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
            {item.kind === 'post' && item.user_id === profile?.id && (
              <button onClick={() => deletePost(item.id)} style={styles.deleteLink}>Delete</button>
            )}
          </div>
          {item.kind === 'entry' && item.title && <h4 style={styles.entryTitle}>{item.title}</h4>}
          <p style={styles.content}>{item.kind === 'entry' ? item.content : item.content}</p>
          {item.attachment_path && item.attachment_type === 'image' && (
            <img src={item.attachment_path} alt="" style={styles.media} />
          )}
          {item.attachment_path && item.attachment_type === 'video' && (
            <video src={item.attachment_path} controls style={styles.media} />
          )}
          {item.attachment_path && item.attachment_type === 'audio' && (
            <audio src={item.attachment_path} controls style={{ width: '100%' }} />
          )}
        </div>
      ))}
    </div>
  );
}

const styles = {
  page: { maxWidth: 640, margin: '0 auto', padding: '48px 24px 80px' },
  composer: {
    background: 'var(--gd-surface)', border: '1px solid var(--gd-line)',
    borderRadius: 'var(--gd-radius)', padding: 16, marginBottom: 28,
  },
  textarea: {
    width: '100%', boxSizing: 'border-box', background: 'var(--gd-void)', color: 'var(--gd-text)',
    border: '1px solid var(--gd-line)', borderRadius: 8, padding: '10px 12px',
    fontFamily: 'var(--gd-font-body)', fontSize: 14, resize: 'vertical', marginBottom: 10,
  },
  composerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  fileButton: {
    fontSize: 12, color: 'var(--gd-text-dim)', border: '1px dashed var(--gd-line)',
    borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
  },
  subscriberNote: { fontSize: 12, color: 'var(--gd-text-dim)', fontStyle: 'italic' },
  postButton: {
    background: 'var(--gd-gold)', border: 'none', borderRadius: 8, padding: '9px 20px',
    color: 'var(--gd-on-accent)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
  },
  card: {
    background: 'var(--gd-surface)', border: '1px solid var(--gd-line)',
    borderRadius: 'var(--gd-radius)', padding: 16, marginBottom: 14,
  },
  cardMeta: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13 },
  glyph: { color: 'var(--gd-gold)', fontSize: 14 },
  date: { fontFamily: 'var(--gd-font-mono)', fontSize: 11, color: 'var(--gd-text-dim)', marginLeft: 'auto' },
  deleteLink: { background: 'transparent', border: 'none', color: 'var(--gd-error)', fontSize: 11, cursor: 'pointer' },
  entryTitle: { fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 16, margin: '0 0 4px', color: 'var(--gd-text)' },
  content: { fontSize: 14, lineHeight: 1.6, color: 'var(--gd-text)', margin: '0 0 8px', whiteSpace: 'pre-wrap' },
  media: { width: '100%', borderRadius: 8, marginTop: 6 },
  dim: { color: 'var(--gd-text-dim)', fontSize: 14 },
  errorText: { color: 'var(--gd-error)', fontSize: 13, marginTop: 8 },
};
