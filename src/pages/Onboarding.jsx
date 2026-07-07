import React, { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../api';

const ROLES = [
  {
    value: 'aspirant',
    title: 'Aspirant',
    description: "Record dreams and visions, and share them with a mentor or community when you're ready.",
  },
  {
    value: 'mentor',
    title: 'Mentor',
    description: 'Guide a community of aspirants, offering feedback on what they choose to share with you.',
  },
];

export default function Onboarding({ profile, onComplete }) {
  const needsRole = !profile?.onboarded;
  const [step, setStep] = useState(needsRole ? 'role' : 'username');
  const [selectedRole, setSelectedRole] = useState(null);
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [slowSave, setSlowSave] = useState(false);
  const [error, setError] = useState(null);
  const checkTimer = useRef(null);
  const slowTimer = useRef(null);

  const usernameIsValidFormat = /^[a-z0-9_]{3,20}$/.test(username);

  useEffect(() => {
    if (!username) {
      setUsernameStatus(null);
      return;
    }
    if (!usernameIsValidFormat) {
      setUsernameStatus('invalid');
      return;
    }
    setUsernameStatus('checking');
    clearTimeout(checkTimer.current);
    checkTimer.current = setTimeout(async () => {
      try {
        const data = await apiFetch(`/api/users/check-username?username=${encodeURIComponent(username)}`);
        setUsernameStatus(data.available ? 'available' : 'taken');
      } catch {
        // The live check failed (e.g. a slow or unreachable server) —
        // don't block the person on this. The save step below still
        // enforces uniqueness properly and will show a clear error
        // if the name turns out to be taken.
        setUsernameStatus('unknown');
      }
    }, 400);
    return () => clearTimeout(checkTimer.current);
  }, [username]); // eslint-disable-line react-hooks/exhaustive-deps

  function continueToUsername() {
    if (!selectedRole) return;
    setStep('username');
  }

  async function finish() {
    if (!usernameIsValidFormat || usernameStatus === 'taken') return;
    setSaving(true);
    setSlowSave(false);
    setError(null);
    slowTimer.current = setTimeout(() => setSlowSave(true), 4000);
    try {
      const body = { username, onboarded: true };
      if (needsRole) body.role = selectedRole;
      const updated = await apiFetch('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      onComplete(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      clearTimeout(slowTimer.current);
      setSlowSave(false);
      setSaving(false);
    }
  }

  return (
    <div style={styles.page}>
      <p style={styles.eyebrow}>Guardian</p>

      {step === 'role' && (
        <>
          <h1 style={styles.title}>How will you walk this path?</h1>
          <p style={styles.sub}>
            You can be guided, or you can guide others. Choose what fits you now — this isn't permanent.
          </p>

          <div style={styles.options}>
            {ROLES.map((r) => (
              <button
                key={r.value}
                onClick={() => setSelectedRole(r.value)}
                style={{ ...styles.option, ...(selectedRole === r.value ? styles.optionSelected : {}) }}
              >
                <h3 style={styles.optionTitle}>{r.title}</h3>
                <p style={styles.optionDesc}>{r.description}</p>
              </button>
            ))}
          </div>

          <button onClick={continueToUsername} disabled={!selectedRole} style={{ ...styles.confirm, opacity: selectedRole ? 1 : 0.5 }}>
            Continue
          </button>
        </>
      )}

      {step === 'username' && (
        <>
          <h1 style={styles.title}>Choose a username</h1>
          <p style={styles.sub}>
            This is how others will find and see you — like on Instagram. You can't change this from here later, but you can update it anytime in Settings.
          </p>

          <input
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="username"
            autoFocus
            style={styles.usernameInput}
          />
          {usernameStatus === 'checking' && <p style={styles.hint}>Checking…</p>}
          {usernameStatus === 'available' && <p style={styles.hintGood}>Available</p>}
          {usernameStatus === 'taken' && <p style={styles.error}>Already taken</p>}
          {usernameStatus === 'unknown' && <p style={styles.hint}>Couldn't verify availability, but you can continue — we'll check when you save.</p>}
          {usernameStatus === 'invalid' && (
            <p style={styles.error}>3-20 characters: lowercase letters, numbers, underscores</p>
          )}
          {error && <p style={styles.error}>{error}</p>}
          {saving && slowSave && (
            <p style={styles.hint}>Still working — this can take a bit longer if the server just woke up. Hang tight…</p>
          )}

          <button
            onClick={finish}
            disabled={!usernameIsValidFormat || usernameStatus === 'taken' || saving}
            style={{ ...styles.confirm, opacity: usernameIsValidFormat && usernameStatus !== 'taken' ? 1 : 0.5 }}
          >
            {saving ? (slowSave ? 'Still saving…' : 'Saving…') : 'Continue'}
          </button>
        </>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 560, margin: '0 auto', padding: '64px 24px' },
  eyebrow: {
    fontFamily: 'var(--gd-font-mono)',
    fontSize: 12,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--gd-gold)',
    margin: '0 0 16px',
  },
  title: {
    fontFamily: 'var(--gd-font-display)',
    fontWeight: 500,
    fontSize: 32,
    margin: 0,
    lineHeight: 1.2,
  },
  sub: {
    color: 'var(--gd-text-dim)',
    fontSize: 15,
    lineHeight: 1.6,
    marginTop: 16,
    marginBottom: 32,
  },
  options: { display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 },
  option: {
    textAlign: 'left',
    background: 'var(--gd-surface)',
    border: '1px solid var(--gd-line)',
    borderRadius: 'var(--gd-radius)',
    padding: 20,
    cursor: 'pointer',
  },
  optionSelected: { borderColor: 'var(--gd-gold)', background: 'var(--gd-surface-raised)' },
  optionTitle: {
    fontFamily: 'var(--gd-font-display)',
    fontWeight: 500,
    fontSize: 20,
    margin: '0 0 6px',
    color: 'var(--gd-text)',
  },
  optionDesc: { fontSize: 14, lineHeight: 1.5, color: 'var(--gd-text-dim)', margin: 0 },
  usernameInput: {
    width: '100%',
    boxSizing: 'border-box',
    background: 'var(--gd-surface)',
    color: 'var(--gd-text)',
    border: '1px solid var(--gd-line)',
    borderRadius: 8,
    padding: '12px 14px',
    fontFamily: 'var(--gd-font-mono)',
    fontSize: 16,
    marginBottom: 8,
  },
  hint: { fontSize: 13, color: 'var(--gd-text-dim)', marginBottom: 20 },
  hintGood: { fontSize: 13, color: 'var(--gd-gold)', marginBottom: 20 },
  error: { fontSize: 13, color: 'var(--gd-error)', marginBottom: 20 },
  confirm: {
    width: '100%',
    background: 'var(--gd-gold)',
    border: 'none',
    borderRadius: 'var(--gd-radius)',
    padding: '14px 20px',
    color: 'var(--gd-on-accent)',
    fontWeight: 600,
    fontSize: 15,
    cursor: 'pointer',
    opacity: 1,
  },
};
