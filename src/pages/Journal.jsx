import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings as SettingsIcon, Users, Compass, Shield, BookOpen } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { apiFetch } from '../api';
import NewEntryForm from '../components/NewEntryForm.jsx';
import EntryCard from '../components/EntryCard.jsx';

export default function Journal({ session, profile }) {
  const [entries, setEntries] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [hasMentor, setHasMentor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      <nav style={styles.nav}>
        <Link to="/settings" style={styles.navLink}>
          <SettingsIcon size={15} strokeWidth={2} />
          Settings
        </Link>
        <Link to="/communities" style={styles.navLink}>
          <Users size={15} strokeWidth={2} />
          My Community
        </Link>
        <Link to="/mentorship" style={styles.navLink}>
          <Compass size={15} strokeWidth={2} />
          Mentorship
        </Link>
        <Link to="/bible" style={styles.navLink}>
          <BookOpen size={15} strokeWidth={2} />
          Bible
        </Link>
        {profile?.is_admin && (
          <Link to="/admin/materials" style={styles.navLink}>
            <Shield size={15} strokeWidth={2} />
            Admin
          </Link>
        )}
      </nav>

      <hr className="gd-horizon" style={{ marginBottom: 32, marginTop: 12 }} />

      <NewEntryForm onCreate={handleCreate} communities={communities} hasMentor={hasMentor} />

      {loading && <p style={styles.dim}>Gathering your entries…</p>}
      {error && <p style={styles.errorText}>{error}</p>}
      {!loading && entries.length === 0 && (
        <p style={styles.dim}>Nothing recorded yet. What did you carry from last night?</p>
      )}

      {entries.map((entry) => (
        <EntryCard
          key={entry.id}
          entry={entry}
          communities={communities}
          hasMentor={hasMentor}
          onUpdate={handleUpdateEntry}
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
  nav: {
    display: 'flex',
    gap: 20,
    marginTop: 10,
  },
  navLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: 'var(--gd-text-dim)',
    fontSize: 13,
    textDecoration: 'none',
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
