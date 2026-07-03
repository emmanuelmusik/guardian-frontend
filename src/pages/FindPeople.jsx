import React, { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../api';
import PageHeader from '../components/PageHeader.jsx';

export default function FindPeople({ profile }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionState, setActionState] = useState({}); // userId -> 'sending' | 'sent' | error string
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await apiFetch(`/api/users/search?q=${encodeURIComponent(query.trim())}`);
        setResults(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  async function connect(person) {
    setActionState((prev) => ({ ...prev, [person.id]: 'sending' }));
    try {
      if (person.role === 'mentor') {
        await apiFetch('/api/connections', {
          method: 'POST',
          body: JSON.stringify({ mentor_id: person.id }),
        });
      } else {
        await apiFetch('/api/peer-connections', {
          method: 'POST',
          body: JSON.stringify({ recipient_id: person.id }),
        });
      }
      setActionState((prev) => ({ ...prev, [person.id]: 'sent' }));
    } catch (err) {
      setActionState((prev) => ({ ...prev, [person.id]: err.message }));
    }
  }

  return (
    <div style={styles.page}>
      <PageHeader title="Find people" subtitle="Search by username to connect with a mentor or fellow aspirant." profile={profile} />

      <hr className="gd-horizon" style={{ margin: '24px 0 32px' }} />

      <input
        placeholder="Search by username…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={styles.input}
      />

      {loading && <p style={styles.dim}>Searching…</p>}

      {error && <p style={styles.errorText}>{error}</p>}

      {results.map((person) => {
        const state = actionState[person.id];
        return (
          <div key={person.id} style={styles.card}>
            <div>
              <h4 style={styles.cardTitle}>@{person.username}</h4>
              <p style={styles.cardSub}>{person.display_name} · {person.role}</p>
              {person.bio && <p style={styles.cardDesc}>{person.bio}</p>}
            </div>
            {state === 'sent' ? (
              <span style={styles.sentTag}>Requested</span>
            ) : (
              <button onClick={() => connect(person)} disabled={state === 'sending'} style={styles.connectButton}>
                {state === 'sending' ? '…' : person.role === 'mentor' ? 'Request mentor' : 'Connect'}
              </button>
            )}
            {state && state !== 'sent' && state !== 'sending' && <p style={styles.errorText}>{state}</p>}
          </div>
        );
      })}

      {!loading && query && results.length === 0 && !error && (
        <p style={styles.dim}>No one found with that username.</p>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 640, margin: '0 auto', padding: '48px 24px 80px' },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    background: 'var(--gd-surface)', color: 'var(--gd-text)', border: '1px solid var(--gd-line)',
    borderRadius: 8, padding: '10px 12px', fontFamily: 'var(--gd-font-mono)', fontSize: 14,
    marginBottom: 20,
  },
  card: {
    background: 'var(--gd-surface)', border: '1px solid var(--gd-line)', borderRadius: 'var(--gd-radius)',
    padding: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
  },
  cardTitle: { fontFamily: 'var(--gd-font-mono)', fontWeight: 600, fontSize: 15, color: 'var(--gd-gold)', margin: '0 0 4px' },
  cardSub: { fontSize: 13, color: 'var(--gd-text)', margin: '0 0 4px' },
  cardDesc: { fontSize: 13, color: 'var(--gd-text-dim)', margin: 0, lineHeight: 1.5 },
  connectButton: {
    background: 'var(--gd-gold)', border: 'none', borderRadius: 8, padding: '8px 16px',
    color: 'var(--gd-on-accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
  },
  sentTag: {
    fontFamily: 'var(--gd-font-mono)', fontSize: 11, color: 'var(--gd-gold)',
    textTransform: 'uppercase', whiteSpace: 'nowrap',
  },
  dim: { color: 'var(--gd-text-dim)', fontSize: 14 },
  errorText: { color: 'var(--gd-error)', fontSize: 13 },
};
