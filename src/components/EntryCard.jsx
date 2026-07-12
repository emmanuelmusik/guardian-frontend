import React, { useEffect, useState } from 'react';
import { apiFetch, apiDownloadFile } from '../api';
import ConnectionPicker from './ConnectionPicker.jsx';
import CommentThread from './CommentThread.jsx';

const TYPE_GLYPH = { dream: '☾', vision: '✦', intuition: '◈', note: '—' };

export default function EntryCard({ entry, communities = [], connections = [], onUpdate, onDelete, currentUserId, autoExpandFeedback = false }) {
  const [editing, setEditing] = useState(false);
  const [editingText, setEditingText] = useState(false);
  const [editTitle, setEditTitle] = useState(entry.title || '');
  const [editContent, setEditContent] = useState(entry.content || '');
  const [textSaving, setTextSaving] = useState(false);
  const [visibility, setVisibility] = useState(entry.visibility);
  const [communityId, setCommunityId] = useState(entry.shared_community_id || communities[0]?.id || '');
  const [personId, setPersonId] = useState(entry.shared_with_user_id || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (autoExpandFeedback) setShowFeedback(true);
  }, [autoExpandFeedback]);

  const date = new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  async function saveSharing() {
    setSaving(true);
    try {
      const updated = await apiFetch(`/api/entries/${entry.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          visibility,
          shared_community_id: visibility === 'community' ? communityId : null,
          shared_with_user_id: visibility === 'person' ? personId : null,
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
    setPersonId(entry.shared_with_user_id || '');
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

  async function exportEntry() {
    setExporting(true);
    try {
      const filename = (entry.title || 'entry').replace(/[^a-zA-Z0-9._ -]/g, '').trim() || 'entry';
      await apiDownloadFile(`/api/entries/${entry.id}/export`, `${filename}.pdf`);
    } finally {
      setExporting(false);
    }
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
          : entry.visibility === 'person'
            ? 'Shared with someone'
            : 'Shared with community';

  return (
    <div id={`entry-${entry.id}`} style={{ ...styles.card, ...(autoExpandFeedback ? styles.cardHighlighted : {}) }}>
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
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => setEditingText(true)} style={styles.shareButton}>Edit</button>
            <button onClick={() => setEditing(true)} style={styles.shareButton}>Share…</button>
            {entry.visibility !== 'private' && (
              <button onClick={() => setShowFeedback((v) => !v)} style={styles.shareButton}>
                {showFeedback ? 'Hide feedback' : 'Feedback'}
              </button>
            )}
            <button onClick={exportEntry} disabled={exporting} style={styles.shareButton}>
              {exporting ? '…' : 'Export'}
            </button>
            <button onClick={handleDelete} disabled={deleting} style={styles.deleteButton}>
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      )}

      {showFeedback && <CommentThread entryId={entry.id} currentUserId={currentUserId} />}

      {editing && (
        <div style={styles.editRow}>
          <select value={visibility} onChange={(e) => setVisibility(e.target.value)} style={styles.select}>
            <option value="private">Private</option>
            <option value="community" disabled={communities.length === 0}>Share with a community</option>
            <option value="person" disabled={connections.length === 0}>Share with someone</option>
          </select>
          {visibility === 'community' && (
            <select value={communityId} onChange={(e) => setCommunityId(e.target.value)} style={styles.select}>
              {communities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
          {visibility === 'person' && (
            <ConnectionPicker connections={connections} value={personId} onChange={setPersonId} />
          )}
          <button
            onClick={saveSharing}
            disabled={saving || (visibility === 'person' && !personId)}
            style={styles.saveButton}
          >
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
  cardHighlighted: {
    borderColor: 'var(--gd-gold)',
    boxShadow: '0 0 0 3px var(--gd-gold-dim)',
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
