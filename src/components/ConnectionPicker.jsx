import React, { useState } from 'react';

// Lets someone type a name/username and pick a specific connected
// person to share an entry with — replaces the old separate
// "mentor" / "peer" categories with one unified, searchable choice.
export default function ConnectionPicker({ connections, value, onChange }) {
  const [query, setQuery] = useState('');

  const filtered = query
    ? connections.filter(
        (c) =>
          (c.username || '').toLowerCase().includes(query.toLowerCase()) ||
          (c.display_name || '').toLowerCase().includes(query.toLowerCase())
      )
    : connections;

  const selected = connections.find((c) => c.id === value);

  if (selected) {
    return (
      <div style={styles.selectedRow}>
        <span style={styles.selectedLabel}>
          Sharing with {selected.username ? `@${selected.username}` : selected.display_name}
        </span>
        <button type="button" onClick={() => onChange('')} style={styles.changeButton}>Change</button>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <input
        placeholder="Search your connections by username…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={styles.input}
      />
      <div style={styles.list}>
        {filtered.length === 0 && <p style={styles.empty}>No matches.</p>}
        {filtered.slice(0, 6).map((c) => (
          <button key={c.id} type="button" onClick={() => onChange(c.id)} style={styles.item}>
            {c.username ? `@${c.username}` : c.display_name}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrap: { width: '100%' },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    background: 'var(--gd-void)',
    color: 'var(--gd-text)',
    border: '1px solid var(--gd-line)',
    borderRadius: 8,
    padding: '8px 12px',
    fontFamily: 'var(--gd-font-mono)',
    fontSize: 13,
    marginBottom: 6,
  },
  list: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  item: {
    background: 'var(--gd-surface)',
    border: '1px solid var(--gd-line)',
    borderRadius: 20,
    padding: '6px 12px',
    fontSize: 12,
    color: 'var(--gd-text)',
    cursor: 'pointer',
  },
  empty: { fontSize: 12, color: 'var(--gd-text-dim)', margin: 0 },
  selectedRow: { display: 'flex', alignItems: 'center', gap: 10, width: '100%' },
  selectedLabel: { fontSize: 13, color: 'var(--gd-gold)', fontFamily: 'var(--gd-font-mono)' },
  changeButton: {
    background: 'transparent', border: 'none', color: 'var(--gd-text-dim)',
    fontSize: 12, cursor: 'pointer', textDecoration: 'underline',
  },
};
