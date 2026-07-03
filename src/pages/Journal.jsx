import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { apiFetch } from '../api';
import NewEntryForm from '../components/NewEntryForm.jsx';
import EntryCard from '../components/EntryCard.jsx';

export default function Journal({ session }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEntries();
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

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Guardian</p>
          <h1 style={styles.heading}>Your journal</h1>
        </div>
        <button style={styles.signOut} onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </header>

      <Link to="/settings" style={styles.settingsLink}>Settings</Link>

      <hr className="gd-horizon" style={{ marginBottom: 32, marginTop: 12 }} />

      <NewEntryForm onCreate={handleCreate} />

      {loading && <p style={styles.dim}>Gathering your entries…</p>}
      {error && <p style={styles.errorText}>{error}</p>}
      {!loading && entries.length === 0 && (
        <p style={styles.dim}>Nothing recorded yet. What did you carry from last night?</p>
      )}

      {entries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} />
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eyebrow: {
    fontFamily: 'var(--gd-font-mono)',
    fontSize: 12,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--gd-gold)',
    margin: '0 0 6px',
  },
  heading: {
    fontFamily: 'var(--gd-font-display)',
    fontWeight: 500,
    fontSize: 30,
    margin: 0,
  },
  signOut: {
    background: 'transparent',
    border: '1px solid var(--gd-line)',
    borderRadius: 8,
    padding: '8px 14px',
    color: 'var(--gd-text-dim)',
    fontSize: 13,
    cursor: 'pointer',
  },
  settingsLink: {
    display: 'inline-block',
    color: 'var(--gd-text-dim)',
    fontSize: 13,
    textDecoration: 'none',
    marginTop: 8,
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
