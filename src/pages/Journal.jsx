import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { apiFetch, apiDownloadFile } from '../api';
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
  const location = useLocation();
  const targetEntryId = new URLSearchParams(location.search).get('entry');

  const [entries, setEntries] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState(false);

  async function exportAll() {
    setExporting(true);
    try {
      await apiDownloadFile('/api/entries/export', 'journal.pdf');
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  }

  useEffect(() => {
    loadEntries();
    apiFetch('/api/communities')
      .then((data) => setCommunities(data.filter((m) => m.status === 'accepted').map((m) => m.communities)))
      .catch(() => setCommunities([]));
    apiFetch('/api/messages/connections')
      .then(setConnections)
      .catch(() => setConnections([]));
  }, []);

  // Arriving from a "new feedback" notification: make sure the target
  // entry isn't hidden by an active filter, then scroll to it once it's
  // actually on the page.
  useEffect(() => {
    if (!targetEntryId || entries.length === 0) return;
    const target = entries.find((e) => e.id === targetEntryId);
    if (!target) return;

    if (activeCategory !== 'all' && target.type !== activeCategory) setActiveCategory('all');
    if (search.trim()) setSearch('');

    const scrollTimer = setTimeout(() => {
      document.getElementById(`entry-${targetEntryId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    return () => clearTimeout(scrollTimer);
  }, [targetEntryId, entries]); // eslint-disable-line react-hooks/exhaustive-deps

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

      <p style={styles.scripture}>
        "Write the vision down, make it plane, though it might tarry but it must surely come to pass."
      </p>

      <hr className="gd-horizon" style={{ marginBottom: 32 }} />

      <NewEntryForm onCreate={handleCreate} communities={communities} connections={connections} />

      {entries.length > 0 && (
        <button onClick={exportAll} disabled={exporting} style={styles.exportAllButton}>
          {exporting ? 'Preparing PDF…' : 'Export all entries as PDF'}
        </button>
      )}

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
          connections={connections}
          onUpdate={handleUpdateEntry}
          onDelete={handleDeleteEntry}
          currentUserId={profile?.id}
          autoExpandFeedback={entry.id === targetEntryId}
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
  scripture: {
    width: '100%',
    boxSizing: 'border-box',
    margin: '0 0 12px',
    fontFamily: 'var(--gd-font-display)',
    fontStyle: 'italic',
    fontSize: 15,
    lineHeight: 1.7,
    color: 'var(--gd-text-dim)',
  },
  exportAllButton: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    background: 'transparent',
    border: '1px solid var(--gd-line)',
    borderRadius: 8,
    padding: '10px 14px',
    color: 'var(--gd-violet)',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    marginBottom: 14,
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
