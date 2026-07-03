import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import UserLink from './UserLink.jsx';

export default function CommentThread({ entryId, currentUserId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editBody, setEditBody] = useState('');

  useEffect(() => {
    apiFetch(`/api/comments/entry/${entryId}`)
      .then(setComments)
      .finally(() => setLoading(false));
  }, [entryId]);

  async function post(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setPosting(true);
    try {
      const created = await apiFetch(`/api/comments/entry/${entryId}`, {
        method: 'POST',
        body: JSON.stringify({ body: body.trim() }),
      });
      setComments((prev) => [...prev, created]);
      setBody('');
    } finally {
      setPosting(false);
    }
  }

  function startEdit(c) {
    setEditingId(c.id);
    setEditBody(c.body);
  }

  async function saveEdit(id) {
    const updated = await apiFetch(`/api/comments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ body: editBody.trim() }),
    });
    setComments((prev) => prev.map((c) => (c.id === id ? updated : c)));
    setEditingId(null);
  }

  async function deleteComment(id) {
    if (!window.confirm('Delete this comment?')) return;
    await apiFetch(`/api/comments/${id}`, { method: 'DELETE' });
    setComments((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div style={styles.wrap}>
      {loading && <p style={styles.dim}>Loading feedback…</p>}
      {!loading &&
        comments.map((c) => (
          <div key={c.id} style={styles.comment}>
            <div style={styles.commentHeader}>
              <span style={styles.commentAuthor}><UserLink profile={{ ...c.profiles, id: c.author_id }} /></span>
              {c.author_id === currentUserId && editingId !== c.id && (
                <span style={styles.commentActions}>
                  <button onClick={() => startEdit(c)} style={styles.linkButton}>Edit</button>
                  <button onClick={() => deleteComment(c.id)} style={styles.linkButtonDanger}>Delete</button>
                </span>
              )}
            </div>
            {editingId === c.id ? (
              <div style={styles.editRow}>
                <input value={editBody} onChange={(e) => setEditBody(e.target.value)} style={styles.editInput} />
                <button onClick={() => saveEdit(c.id)} style={styles.linkButton}>Save</button>
                <button onClick={() => setEditingId(null)} style={styles.linkButton}>Cancel</button>
              </div>
            ) : (
              <p style={styles.commentBody}>{c.body}</p>
            )}
          </div>
        ))}
      {!loading && comments.length === 0 && <p style={styles.dim}>No feedback yet.</p>}

      <form onSubmit={post} style={styles.form}>
        <input
          placeholder="Leave feedback…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          style={styles.input}
        />
        <button type="submit" disabled={posting || !body.trim()} style={styles.send}>
          {posting ? '…' : 'Send'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  wrap: {
    marginTop: 12,
    paddingTop: 12,
    borderTop: '1px solid var(--gd-line)',
  },
  comment: { marginBottom: 10 },
  commentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  commentAuthor: {
    fontFamily: 'var(--gd-font-mono)',
    fontSize: 11,
    color: 'var(--gd-violet)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  commentActions: { display: 'flex', gap: 8 },
  linkButton: {
    background: 'transparent', border: 'none', color: 'var(--gd-text-dim)',
    fontSize: 11, cursor: 'pointer', padding: 0, fontFamily: 'var(--gd-font-mono)',
  },
  linkButtonDanger: {
    background: 'transparent', border: 'none', color: 'var(--gd-error)',
    fontSize: 11, cursor: 'pointer', padding: 0, fontFamily: 'var(--gd-font-mono)',
  },
  commentBody: {
    fontSize: 13,
    lineHeight: 1.5,
    color: 'var(--gd-text)',
    margin: '2px 0 0',
  },
  editRow: { display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' },
  editInput: {
    flex: 1, background: 'var(--gd-void)', color: 'var(--gd-text)', border: '1px solid var(--gd-line)',
    borderRadius: 6, padding: '6px 8px', fontSize: 13, fontFamily: 'var(--gd-font-body)',
  },
  dim: { color: 'var(--gd-text-dim)', fontSize: 13, margin: '0 0 10px' },
  form: { display: 'flex', gap: 8, marginTop: 10 },
  input: {
    flex: 1,
    background: 'var(--gd-void)',
    color: 'var(--gd-text)',
    border: '1px solid var(--gd-line)',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 13,
    fontFamily: 'var(--gd-font-body)',
  },
  send: {
    background: 'var(--gd-gold)',
    border: 'none',
    borderRadius: 8,
    padding: '8px 16px',
    color: 'var(--gd-on-accent)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
