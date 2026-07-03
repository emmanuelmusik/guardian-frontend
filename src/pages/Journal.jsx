import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api';
import NewEntryForm from '../components/NewEntryForm.jsx';
import EntryCard from '../components/EntryCard.jsx';
import PageHeader from '../components/PageHeader.jsx';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'dream', label: 'Dreams' },
  { value: 'vision', label: 'Visions' },
  { value: 'intuition', label: 'Intuitions' },
  { value: 'note', label: 'Notes' },
];

export default function Journal({ session, profile }) {
  const [entries, setEntries] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [hasMentor, setHasMentor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadEntries();
    apiFetch('/api/communities')
      .then((data) => setCommunities(data.map((m) => m.communities)))
      .catch(() => setCommunities([]));
    apiFetch('/api/connections')
      .then((data) => setHasMentor(data.some((c) => c.status === 'accepted')))
      .catch(() => setHasMentor(false));
  }, []);

  async function loadEntries() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/api/entries');
      setEntries(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(payload) {
    const created = await apiFetch('/api/entries', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setEntries((prev) => [created, ...prev]);
  }

  function handleUpdateEntry(updated) {
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  }

  async function handleDeleteEntry(entryId) {
    await apiFetch(`/api/entries/${entryId}`, { method: 'DELETE' });
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
  }

  const counts = useMemo(() => {
    const c = { all: entries.length, dream: 0, vision: 0, intuition: 0, note: 0 };
    entries.forEach((e) => {
      if (c[e.type] !== undefined) c[e.type] += 1;
    });
    return c;
  }, [entries]);

  const visibleEntries = useMemo(() => {
    const term = search.trim().toLowerCase();
    return entries.filter((e) => {
      const matchesCategory = activeCategory === 'all' || e.type === activeCategory;
      const matchesSearch =
        !term ||
        (e.title && e.title.toLowerCase().includes(term)) ||
        (e.content && e.content.toLowerCase().includes(term));
      return matchesCategory && matchesSearch;
    });
  }, [entries, activeCategory, search]);

  return (
    <div style={styles.page}>
      <PageHeader title="Your journal" profile={profile} />

      <hr className="gd-horizon" style={{ marginBottom: 32 }} />

      <NewEntryForm onCreate={handleCreate} communities={communities} hasMentor={hasMentor} />

      <input
        placeholder="Search your entries…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.search}
      />

      <div style={styles.categoryRow}>
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setActiveCategory(c.value)}
            style={{
              ...styles.categoryChip,
              ...(activeCategory === c.value ? styles.categoryChipActive : {}),
            }}
          >
            {c.label} <span style={styles.categoryCount}>{counts[c.value] ?? 0}</span>
          </button>
        ))}
      </div>

      {loading && <p style={styles.dim}>Gathering your entries…</p>}
      {error && <p style={styles.errorText}>{error}</p>}
      {!loading && entries.length === 0 && (
        <p style={styles.dim}>Nothing recorded yet. What did you carry from last night?</p>
      )}
      {!loading && entries.length > 0 && visibleEntries.length === 0 && (
        <p style={styles.dim}>Nothing matches that search.</p>
      )}

      {visibleEntries.map((entry) => (
        <EntryCard
          key={entry.id}
          entry={entry}
          communities={communities}
          hasMentor={hasMentor}
          onUpdate={handleUpdateEntry}
          onDelete={handleDeleteEntry}
        />
      ))}
    </div>
  );
}

const styles = {
  page: {
    maxWidth: 640,
    margin: '0 auto',
    padding: '48px 24px 80px',
  },
  search: {
    width: '100%',
    background: 'var(--gd-surface)',
    color: 'var(--gd-text)',
    border: '1px solid var(--gd-line)',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 14,
    fontFamily: 'var(--gd-font-body)',
    marginBottom: 14,
  },
  categoryRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  categoryChip: {
    background: 'var(--gd-surface)',
    border: '1px solid var(--gd-line)',
    borderRadius: 20,
    padding: '6px 12px',
    fontSize: 13,
    color: 'var(--gd-text-dim)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  categoryChipActive: {
    borderColor: 'var(--gd-gold)',
    color: 'var(--gd-text)',
    background: 'var(--gd-surface-raised)',
  },
  categoryCount: {
    fontFamily: 'var(--gd-font-mono)',
    fontSize: 11,
    color: 'var(--gd-gold)',
  },
  dim: {
    color: 'var(--gd-text-dim)',
    fontSize: 14,
  },
  errorText: {
    color: 'var(--gd-error)',
    fontSize: 14,
  },
};
