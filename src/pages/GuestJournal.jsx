import React, { useState } from 'react';
import {
  listGuestEntries, createGuestEntry, updateGuestEntry, deleteGuestEntry,
} from '../lib/guestStore';

const TYPE_GLYPH = { dream: '☾', vision: '✦', intuition: '◈', note: '—' };
const TYPES = ['dream', 'vision', 'intuition', 'note'];

export default function GuestJournal({ onSignIn }) {
  const [entries, setEntries] = useState(listGuestEntries());
  const [type, setType] = useState('note');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  function refresh() {
    setEntries(listGuestEntries());
  }

  function create(e) {
    e.preventDefault();
    if (!content.trim()) return;
    createGuestEntry({ type, title: title.trim(), content: content.trim() });
    setTitle('');
    setContent('');
    refresh();
  }

  function startEdit(entry) {
    setEditingId(entry.id);
    setEditContent(entry.content);
  }

  function saveEdit(id) {
    updateGuestEntry(id, { content: editContent });
    setEditingId(null);
    refresh();
  }

  function remove(id) {
    if (!window.confirm('Delete this entry?')) return;
    deleteGuestEntry(id);
    refresh();
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Journal</h1>
      <p style={styles.scripture}>
        "Write the vision down, make it plane, though it might tarry but it must surely come to pass."
      </p>
      <hr className="gd-horizon" style={{ margin: '20px 0 24px' }} />

      <div style={styles.guestBanner}>
        <p style={styles.guestBannerText}>
          Your entries are saved on this device only. Create a free account to back
          them up, record entries by voice, and share them with a mentor or community
          — everything here moves to your account automatically when you sign in.
        </p>
        <button onClick={onSignIn} style={styles.signInButton}>Sign in or create account</button>
      </div>

      <form onSubmit={create} style={styles.form}>
        <div style={styles.typeRow}>
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              style={{ ...styles.typeButton, ...(type === t ? styles.typeButtonActive : {}) }}
            >
              {TYPE_GLYPH[t]} {t}
            </button>
          ))}
        </div>
        <input
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
        />
        <textarea
          placeholder="What did you see, hear, or sense?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          style={{ ...styles.input, resize: 'vertical' }}
        />
        <button type="submit" disabled={!content.trim()} style={styles.saveButton}>
          Save entry
        </button>
      </form>

      {entries.length === 0 && (
        <p style={styles.dim}>Nothing recorded yet. Your first entry starts here.</p>
      )}

      {entries.map((entry) => (
        <div key={entry.id} style={styles.card}>
          <div style={styles.cardMeta}>
            <span style={styles.glyph}>{TYPE_GLYPH[entry.type] || '—'}</span>
            <span style={styles.cardType}>{entry.type}</span>
            <span style={styles.date}>
              {new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          {entry.title && <h4 style={styles.entryTitle}>{entry.title}</h4>}
          {editingId === entry.id ? (
            <>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
                style={{ ...styles.input, resize: 'vertical' }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => saveEdit(entry.id)} style={styles.saveButton}>Save</button>
                <button onClick={() => setEditingId(null)} style={styles.linkButton}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <p style={styles.content}>{entry.content}</p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => startEdit(entry)} style={styles.linkButton}>Edit</button>
                <button onClick={() => remove(entry.id)} style={{ ...styles.linkButton, color: 'var(--gd-error)' }}>Delete</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

const styles = {
  page: { maxWidth: 640, margin: '0 auto', padding: '48px 24px 100px' },
  title: { fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 28, margin: '0 0 10px', color: 'var(--gd-text)' },
  scripture: {
    width: '100%', margin: 0, fontFamily: 'var(--gd-font-display)', fontStyle: 'italic',
    fontSize: 15, lineHeight: 1.7, color: 'var(--gd-text-dim)',
  },
  guestBanner: {
    background: 'var(--gd-surface)', border: '1px solid var(--gd-gold)',
    borderRadius: 'var(--gd-radius)', padding: 16, marginBottom: 24,
  },
  guestBannerText: { fontSize: 13, lineHeight: 1.6, color: 'var(--gd-text)', margin: '0 0 12px' },
  signInButton: {
    background: 'var(--gd-gold)', border: 'none', borderRadius: 8, padding: '10px 18px',
    color: 'var(--gd-on-accent)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
  },
  form: {
    background: 'var(--gd-surface)', border: '1px solid var(--gd-line)',
    borderRadius: 'var(--gd-radius)', padding: 16, marginBottom: 24,
  },
  typeRow: { display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' },
  typeButton: {
    background: 'var(--gd-void)', border: '1px solid var(--gd-line)', borderRadius: 8,
    padding: '7px 12px', fontSize: 12, color: 'var(--gd-text-dim)', cursor: 'pointer',
  },
  typeButtonActive: { borderColor: 'var(--gd-gold)', color: 'var(--gd-gold)' },
  input: {
    width: '100%', boxSizing: 'border-box', background: 'var(--gd-void)', color: 'var(--gd-text)',
    border: '1px solid var(--gd-line)', borderRadius: 8, padding: '10px 12px',
    fontFamily: 'var(--gd-font-body)', fontSize: 14, marginBottom: 10,
  },
  saveButton: {
    background: 'var(--gd-gold)', border: 'none', borderRadius: 8, padding: '10px 20px',
    color: 'var(--gd-on-accent)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
  },
  card: {
    background: 'var(--gd-surface)', border: '1px solid var(--gd-line)',
    borderRadius: 'var(--gd-radius)', padding: 16, marginBottom: 14,
  },
  cardMeta: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13 },
  glyph: { color: 'var(--gd-gold)', fontSize: 14 },
  cardType: { fontFamily: 'var(--gd-font-mono)', fontSize: 11, color: 'var(--gd-text-dim)', textTransform: 'uppercase', letterSpacing: 1 },
  date: { fontFamily: 'var(--gd-font-mono)', fontSize: 11, color: 'var(--gd-text-dim)', marginLeft: 'auto' },
  entryTitle: { fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 16, margin: '0 0 6px', color: 'var(--gd-text)' },
  content: { fontSize: 14, lineHeight: 1.6, color: 'var(--gd-text)', margin: '0 0 10px', whiteSpace: 'pre-wrap' },
  linkButton: { background: 'transparent', border: 'none', color: 'var(--gd-violet)', fontSize: 12, cursor: 'pointer', padding: 0 },
  dim: { color: 'var(--gd-text-dim)', fontSize: 14 },
};
