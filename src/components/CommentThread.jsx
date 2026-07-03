import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';

export default function CommentThread({ entryId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);

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

  return (
    <div style={styles.wrap}>
      {loading && <p style={styles.dim}>Loading feedback…</p>}
      {!loading &&
        comments.map((c) => (
          <div key={c.id} style={styles.comment}>
            <span style={styles.commentAuthor}>{c.profiles?.display_name || 'Someone'}</span>
            <p style={styles.commentBody}>{c.body}</p>
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
  commentAuthor: {
    fontFamily: 'var(--gd-font-mono)',
    fontSize: 11,
    color: 'var(--gd-violet)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  commentBody: {
    fontSize: 13,
    lineHeight: 1.5,
    color: 'var(--gd-text)',
    margin: '2px 0 0',
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
