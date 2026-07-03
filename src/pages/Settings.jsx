import React, { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../api';
import PageHeader from '../components/PageHeader.jsx';

export default function Settings({ profile, onUpdate }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const otherRole = profile.role === 'mentor' ? 'aspirant' : 'mentor';

  const [username, setUsername] = useState(profile.username || '');
  const [usernameStatus, setUsernameStatus] = useState(null); // 'checking' | 'available' | 'taken' | 'invalid' | null
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [usernameError, setUsernameError] = useState(null);
  const checkTimer = useRef(null);

  useEffect(() => {
    if (username === (profile.username || '')) {
      setUsernameStatus(null);
      return;
    }
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      setUsernameStatus(username ? 'invalid' : null);
      return;
    }
    setUsernameStatus('checking');
    clearTimeout(checkTimer.current);
    checkTimer.current = setTimeout(async () => {
      try {
        const data = await apiFetch(`/api/users/check-username?username=${encodeURIComponent(username)}`);
        setUsernameStatus(data.available ? 'available' : 'taken');
      } catch {
        setUsernameStatus(null);
      }
    }, 400);
    return () => clearTimeout(checkTimer.current);
  }, [username]); // eslint-disable-line react-hooks/exhaustive-deps

  async function switchRole() {
    setSaving(true);
    setError(null);
    try {
      const updated = await apiFetch('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify({ role: otherRole }),
      });
      onUpdate(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveUsername() {
    setUsernameSaving(true);
    setUsernameError(null);
    try {
      const updated = await apiFetch('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify({ username }),
      });
      onUpdate(updated);
      setUsernameStatus(null);
    } catch (err) {
      setUsernameError(err.message);
    } finally {
      setUsernameSaving(false);
    }
  }

  return (
    <div style={styles.page}>
      <PageHeader title="Settings" profile={profile} />

      <hr className="gd-horizon" style={{ margin: '24px 0 32px' }} />

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Username</h3>
        <p style={styles.cardBody}>
          {profile.username
            ? "This is how others find you when they search for you."
            : "Choose a username so people can find and connect with you, like on Instagram."}
        </p>
        <div style={styles.usernameRow}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="username"
            style={styles.usernameInput}
          />
          <button
            onClick={saveUsername}
            disabled={usernameSaving || usernameStatus !== 'available'}
            style={{ ...styles.switchButton, opacity: usernameStatus === 'available' ? 1 : 0.5 }}
          >
            {usernameSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
        {usernameStatus === 'checking' && <p style={styles.hint}>Checking…</p>}
        {usernameStatus === 'available' && <p style={styles.hintGood}>Available</p>}
        {usernameStatus === 'taken' && <p style={styles.error}>Already taken</p>}
        {usernameStatus === 'invalid' && (
          <p style={styles.error}>3-20 characters: lowercase letters, numbers, underscores</p>
        )}
        {usernameError && <p style={styles.error}>{usernameError}</p>}
      </div>

      <div style={{ ...styles.card, marginTop: 20 }}>
        <h3 style={styles.cardTitle}>Your role</h3>
        <p style={styles.cardBody}>
          You're currently walking this path as an <strong>{profile.role}</strong>.
          {profile.role === 'aspirant'
            ? ' Switching to mentor lets you create a community and receive what others choose to share with you.'
            : ' Switching to aspirant lets you record entries and share them with a mentor of your own.'}
        </p>
        <button onClick={switchRole} disabled={saving} style={styles.switchButton}>
          {saving ? 'Switching…' : `Switch to ${otherRole}`}
        </button>
        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 560, margin: '0 auto', padding: '48px 24px 80px' },
  card: {
    background: 'var(--gd-surface)',
    border: '1px solid var(--gd-line)',
    borderRadius: 'var(--gd-radius)',
    padding: 24,
  },
  cardTitle: {
    fontFamily: 'var(--gd-font-display)',
    fontWeight: 500,
    fontSize: 18,
    margin: '0 0 10px',
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 1.6,
    color: 'var(--gd-text-dim)',
    margin: '0 0 20px',
  },
  usernameRow: { display: 'flex', gap: 10 },
  usernameInput: {
    flex: 1,
    background: 'var(--gd-void)',
    color: 'var(--gd-text)',
    border: '1px solid var(--gd-line)',
    borderRadius: 8,
    padding: '10px 12px',
    fontFamily: 'var(--gd-font-mono)',
    fontSize: 14,
  },
  switchButton: {
    background: 'var(--gd-gold)',
    border: 'none',
    borderRadius: 8,
    padding: '11px 20px',
    color: 'var(--gd-on-accent)',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  hint: { fontSize: 12, color: 'var(--gd-text-dim)', marginTop: 8 },
  hintGood: { fontSize: 12, color: 'var(--gd-gold)', marginTop: 8 },
  error: {
    color: 'var(--gd-error)',
    fontSize: 13,
    marginTop: 12,
  },
};
