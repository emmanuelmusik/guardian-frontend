import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import { apiFetch, apiUpload, apiDownloadFile } from '../api';
import PageHeader from '../components/PageHeader.jsx';

export default function Settings({ profile, onUpdate }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const otherRole = profile.role === 'mentor' ? 'aspirant' : 'mentor';

  const [username, setUsername] = useState(profile.username || '');
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [usernameError, setUsernameError] = useState(null);
  const checkTimer = useRef(null);

  const [bio, setBio] = useState(profile.bio || '');
  const [bioSaving, setBioSaving] = useState(false);
  const [bioSaved, setBioSaved] = useState(false);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState(null);

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

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
        setUsernameStatus('unknown');
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

  async function saveBio() {
    setBioSaving(true);
    try {
      const updated = await apiFetch('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify({ bio }),
      });
      onUpdate(updated);
      setBioSaved(true);
      setTimeout(() => setBioSaved(false), 2000);
    } finally {
      setBioSaving(false);
    }
  }

  async function handleAvatarSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    setAvatarError(null);
    try {
      const updated = await apiUpload('/api/profile/avatar', file);
      onUpdate(updated);
    } catch (err) {
      setAvatarError(err.message);
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  }

  async function exportData() {
    setExporting(true);
    setExportError(null);
    try {
      await apiDownloadFile('/api/profile/export', 'guardian-data-export.pdf');
    } catch (err) {
      setExportError(err.message);
    } finally {
      setExporting(false);
    }
  }

  async function deleteAccount() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await apiFetch('/api/profile', { method: 'DELETE' });
      await supabase.auth.signOut();
    } catch (err) {
      setDeleteError(err.message);
      setDeleting(false);
    }
  }

  return (
    <div style={styles.page}>
      <PageHeader title="Settings" profile={profile} />

      <hr className="gd-horizon" style={{ margin: '24px 0 32px' }} />

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Profile photo</h3>
        <div style={styles.avatarRow}>
          <div style={styles.avatarPreview}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" style={styles.avatarImg} />
            ) : (
              <span style={styles.avatarPlaceholder}>{(profile.display_name || '?')[0].toUpperCase()}</span>
            )}
          </div>
          <label style={styles.uploadButton}>
            {avatarUploading ? 'Uploading…' : 'Change photo'}
            <input type="file" accept="image/*" onChange={handleAvatarSelect} style={{ display: 'none' }} />
          </label>
        </div>
        {avatarError && <p style={styles.error}>{avatarError}</p>}
      </div>

      <div style={{ ...styles.card, marginTop: 20 }}>
        <h3 style={styles.cardTitle}>Bio</h3>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="A little about you…"
          rows={3}
          style={styles.textarea}
        />
        <button onClick={saveBio} disabled={bioSaving} style={styles.switchButton}>
          {bioSaving ? 'Saving…' : bioSaved ? 'Saved' : 'Save bio'}
        </button>
      </div>

      <div style={{ ...styles.card, marginTop: 20 }}>
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

      <div style={{ ...styles.card, marginTop: 20 }}>
        <h3 style={styles.cardTitle}>Your data</h3>
        <p style={styles.cardBody}>Download everything you've created — entries, comments, and community posts — as a PDF.</p>
        <button onClick={exportData} disabled={exporting} style={styles.switchButton}>
          {exporting ? 'Preparing…' : 'Export my data'}
        </button>
        {exportError && <p style={styles.error}>{exportError}</p>}
      </div>

      <div style={{ ...styles.card, marginTop: 20, borderColor: 'var(--gd-error)' }}>
        <h3 style={{ ...styles.cardTitle, color: 'var(--gd-error)' }}>Danger zone</h3>
        <p style={styles.cardBody}>
          Deleting your account permanently removes your profile, entries, and everything you've posted. This can't be undone.
        </p>
        <p style={styles.hint}>Type DELETE below to confirm.</p>
        <div style={styles.usernameRow}>
          <input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="DELETE"
            style={styles.usernameInput}
          />
          <button
            onClick={deleteAccount}
            disabled={deleteConfirmText !== 'DELETE' || deleting}
            style={styles.deleteButton}
          >
            {deleting ? 'Deleting…' : 'Delete my account'}
          </button>
        </div>
        {deleteError && <p style={styles.error}>{deleteError}</p>}
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
  cardTitle: { fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 18, margin: '0 0 10px' },
  cardBody: { fontSize: 14, lineHeight: 1.6, color: 'var(--gd-text-dim)', margin: '0 0 20px' },
  avatarRow: { display: 'flex', alignItems: 'center', gap: 16 },
  avatarPreview: {
    width: 64, height: 64, borderRadius: '50%', overflow: 'hidden',
    background: 'var(--gd-void)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '1px solid var(--gd-line)', flexShrink: 0,
  },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  avatarPlaceholder: { fontFamily: 'var(--gd-font-display)', fontSize: 24, color: 'var(--gd-gold)' },
  uploadButton: {
    background: 'transparent', border: '1px solid var(--gd-line)', borderRadius: 8,
    padding: '10px 18px', color: 'var(--gd-text)', fontSize: 14, cursor: 'pointer',
  },
  textarea: {
    width: '100%', boxSizing: 'border-box', background: 'var(--gd-void)', color: 'var(--gd-text)',
    border: '1px solid var(--gd-line)', borderRadius: 8, padding: '10px 12px',
    fontFamily: 'var(--gd-font-body)', fontSize: 14, marginBottom: 12, resize: 'vertical',
  },
  usernameRow: { display: 'flex', gap: 10 },
  usernameInput: {
    flex: 1, minWidth: 0, boxSizing: 'border-box', background: 'var(--gd-void)', color: 'var(--gd-text)', border: '1px solid var(--gd-line)',
    borderRadius: 8, padding: '10px 12px', fontFamily: 'var(--gd-font-mono)', fontSize: 14,
  },
  switchButton: {
    background: 'var(--gd-gold)', border: 'none', borderRadius: 8, padding: '11px 20px',
    color: 'var(--gd-on-accent)', fontWeight: 600, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap',
  },
  deleteButton: {
    background: 'var(--gd-error)', border: 'none', borderRadius: 8, padding: '11px 20px',
    color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap',
  },
  hint: { fontSize: 12, color: 'var(--gd-text-dim)', marginTop: 8, marginBottom: 8 },
  hintGood: { fontSize: 12, color: 'var(--gd-gold)', marginTop: 8 },
  error: { color: 'var(--gd-error)', fontSize: 13, marginTop: 12 },
};
