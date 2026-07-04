import React, { useState } from 'react';
import { apiFetch } from '../api';

const TYPE_GLYPH = { dream: '☾', vision: '✦', intuition: '◈', note: '—' };

export default function EntryCard({ entry, communities = [], hasMentor = false, peers = [], onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [editingText, setEditingText] = useState(false);
  const [editTitle, setEditTitle] = useState(entry.title || '');
  const [editContent, setEditContent] = useState(entry.content || '');
  const [textSaving, setTextSaving] = useState(false);
  const [visibility, setVisibility] = useState(entry.visibility);
  const [communityId, setCommunityId] = useState(entry.shared_community_id || communities[0]?.id || '');
  const [peerId, setPeerId] = useState(entry.shared_peer_id || peers[0]?.id || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const date = new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  async function saveSharing() {
    setSaving(true);
    try {
      const updated = await apiFetch(`/api/entries/${entry.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          visibility,
          shared_community_id: visibility === 'community' ? communityId : null,
          shared_peer_id: visibility === 'peer' ? peerId : null,
        }),
      });
      onUpdate?.(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setVisibility(entry.visibility);
    setCommunityId(entry.shared_community_id || communities[0]?.id || '');
    setPeerId(entry.shared_peer_id || peers[0]?.id || '');
    setEditing(false);
  }

  async function saveText() {
    setTextSaving(true);
    try {
      const updated = await apiFetch(`/api/entries/${entry.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: editTitle.trim() || null, content: editContent }),
      });
      onUpdate?.(updated);
      setEditingText(false);
    } finally {
      setTextSaving(false);
    }
  }

  function cancelTextEdit() {
    setEditTitle(entry.title || '');
    setEditContent(entry.content || '');
    setEditingText(false);
  }

  async function handleDelete() {
    if (!window.confirm('Delete this entry? This can\'t be undone.')) return;
    setDeleting(true);
    try {
      await onDelete?.(entry.id);
    } finally {
      setDeleting(false);
    }
  }

  const visibilityLabel =
    entry.visibility === 'private'
      ? 'Private'
      : entry.visibility === 'mentor'
        ? 'Shared with mentor'
        : entry.visibility === 'peer'
          ? 'Shared with a fellow aspirant'
          : 'Shared with community';

  return (
    <div style={styles.card}>
      <div style={styles.meta}>
        <span style={styles.glyph}>{TYPE_GLYPH[entry.type] || '—'}</span>
        <span style={styles.type}>{entry.type}</span>
        <span style={styles.date}>{date}</span>
      </div>
      {!editingText && (
        <>
          {entry.title && <h3 style={styles.title}>{entry.title}</h3>}
          <p style={styles.content}>{entry.content}</p>
        </>
      )}

      {editingText && (
        <div style={styles.textEditBlock}>
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Title (optional)"
            style={styles.textEditInput}
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={9}
            style={styles.textEditArea}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={saveText} disabled={textSaving || !editContent.trim()} style={styles.saveButton}>
              {textSaving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={cancelTextEdit} style={styles.cancelButton}>Cancel</button>
          </div>
        </div>
      )}

      {!editing && !editingText && (
        <div style={styles.footer}>
          <span style={styles.visibility}>{visibilityLabel}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setEditingText(true)} style={styles.shareButton}>Edit</button>
            <button onClick={() => setEditing(true)} style={styles.shareButton}>Share…</button>
            <button onClick={handleDelete} disabled={deleting} style={styles.deleteButton}>
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      )}

      {editing && (
        <div style={styles.editRow}>
          <select value={visibility} onChange={(e) => setVisibility(e.target.value)} style={styles.select}>
            <option value="private">Private</option>
            <option value="mentor" disabled={!hasMentor}>Share with mentor</option>
            <option value="peer" disabled={peers.length === 0}>Share with a fellow aspirant</option>
            <option value="community" disabled={communities.length === 0}>Share with a community</option>
          </select>
          {visibility === 'community' && (
            <select value={communityId} onChange={(e) => setCommunityId(e.target.value)} style={styles.select}>
              {communities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
          {visibility === 'peer' && (
            <select value={peerId} onChange={(e) => setPeerId(e.target.value)} style={styles.select}>
              {peers.map((p) => (
                <option key={p.id} value={p.id}>{p.display_name}</option>
              ))}
            </select>
          )}
          <button onClick={saveSharing} disabled={saving} style={styles.saveButton}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button onClick={cancelEdit} style={styles.cancelButton}>Cancel</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--gd-surface)',
    border: '1px solid var(--gd-line)',
    borderRadius: 'var(--gd-radius)',
    padding: 18,
    marginBottom: 14,
  },
  meta: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  glyph: { color: 'var(--gd-gold)', fontSize: 14 },
  type: {
    fontFamily: 'var(--gd-font-mono)',
    fontSize: 11,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--gd-text-dim)',
  },
  date: {
    fontFamily: 'var(--gd-font-mono)',
    fontSize: 11,
    color: 'var(--gd-text-dim)',
    marginLeft: 'auto',
  },
  title: {
    fontFamily: 'var(--gd-font-display)',
    fontWeight: 500,
    fontSize: 18,
    margin: '0 0 6px',
    color: 'var(--gd-text)',
  },
  content: {
    fontSize: 14,
    lineHeight: 1.6,
    color: 'var(--gd-text)',
    margin: '0 0 10px',
    whiteSpace: 'pre-wrap',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  visibility: {
    fontSize: 11,
    color: 'var(--gd-violet)',
    fontFamily: 'var(--gd-font-mono)',
  },
  shareButton: {
    background: 'transparent',
    border: '1px solid var(--gd-line)',
    borderRadius: 8,
    padding: '6px 12px',
    color: 'var(--gd-text-dim)',
    fontSize: 12,
    cursor: 'pointer',
  },
  deleteButton: {
    background: 'transparent',
    border: '1px solid var(--gd-line)',
    borderRadius: 8,
    padding: '6px 12px',
    color: 'var(--gd-error)',
    fontSize: 12,
    cursor: 'pointer',
  },
  editRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
    paddingTop: 10,
    borderTop: '1px solid var(--gd-line)',
  },
  select: {
    background: 'var(--gd-void)',
    color: 'var(--gd-text)',
    border: '1px solid var(--gd-line)',
    borderRadius: 8,
    padding: '8px 10px',
    fontFamily: 'var(--gd-font-body)',
    fontSize: 13,
  },
  saveButton: {
    background: 'var(--gd-gold)',
    border: 'none',
    borderRadius: 8,
    padding: '8px 16px',
    color: 'var(--gd-on-accent)',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
  },
  cancelButton: {
    background: 'transparent',
    border: 'none',
    color: 'var(--gd-text-dim)',
    fontSize: 13,
    cursor: 'pointer',
  },
  textEditBlock: {
    marginBottom: 10,
  },
  textEditInput: {
    width: '100%',
    boxSizing: 'border-box',
    background: 'var(--gd-void)',
    color: 'var(--gd-text)',
    border: '1px solid var(--gd-line)',
    borderRadius: 8,
    padding: '8px 10px',
    fontFamily: 'var(--gd-font-body)',
    fontSize: 14,
    marginBottom: 8,
  },
  textEditArea: {
    width: '100%',
    boxSizing: 'border-box',
    background: 'var(--gd-void)',
    color: 'var(--gd-text)',
    border: '1px solid var(--gd-line)',
    borderRadius: 8,
    padding: '8px 10px',
    fontFamily: 'var(--gd-font-body)',
    fontSize: 14,
    lineHeight: 1.5,
    marginBottom: 8,
    resize: 'vertical',
  },
};
