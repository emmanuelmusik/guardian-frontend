import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch, apiUpload } from '../api';
import PageHeader from '../components/PageHeader.jsx';

function DmAttachment({ path, type }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch(`/api/messages/media-url?path=${encodeURIComponent(path)}`)
      .then((data) => { if (!cancelled) setUrl(data.url); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [path]);

  if (!url) return <p style={{ fontSize: 12, opacity: 0.7, margin: '4px 0 0' }}>Loading attachment…</p>;
  if (type === 'image') return <img src={url} alt="" style={{ maxWidth: '100%', borderRadius: 8, marginTop: 6, display: 'block' }} />;
  if (type === 'video') return <video src={url} controls style={{ maxWidth: '100%', borderRadius: 8, marginTop: 6, display: 'block' }} />;
  if (type === 'audio') return <audio src={url} controls style={{ width: '100%', marginTop: 6 }} />;
  return null;
}

export default function MessageThread({ profile }) {
  const { userId } = useParams();
  const [person, setPerson] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    load();
    const interval = setInterval(load, 6000);
    return () => clearInterval(interval);
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function load() {
    try {
      const [p, m] = await Promise.all([
        apiFetch(`/api/users/${userId}`),
        apiFetch(`/api/messages/with/${userId}`),
      ]);
      setPerson(p);
      setMessages(m);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function send(e) {
    e.preventDefault();
    if (!body.trim() && !file) return;
    setSending(true);
    setError(null);
    try {
      let attachment_path = null;
      let attachment_type = null;
      if (file) {
        const uploaded = await apiUpload(`/api/messages/with/${userId}/media`, file);
        attachment_path = uploaded.attachment_path;
        attachment_type = uploaded.attachment_type;
      }
      const created = await apiFetch(`/api/messages/with/${userId}`, {
        method: 'POST',
        body: JSON.stringify({ body: body.trim(), attachment_path, attachment_type }),
      });
      setMessages((prev) => [...prev, created]);
      setBody('');
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  if (loading) return <div style={styles.page}><p style={styles.dim}>Loading…</p></div>;

  return (
    <div style={styles.page}>
      <PageHeader
        title={person ? <Link to={`/profile/${person.id}`} style={styles.nameLink}>{person.display_name}</Link> : 'Messages'}
        profile={profile}
      />
      <Link to="/messages" style={styles.back}>← Back to messages</Link>

      {error && <p style={styles.errorText}>{error}</p>}

      <div style={styles.thread}>
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              ...styles.bubbleRow,
              justifyContent: m.sender_id === profile.id ? 'flex-end' : 'flex-start',
            }}
          >
            <div style={{ ...styles.bubble, ...(m.sender_id === profile.id ? styles.bubbleMine : styles.bubbleTheirs) }}>
              {m.body}
              {m.attachment_path && <DmAttachment path={m.attachment_path} type={m.attachment_type} />}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} style={styles.form}>
        {profile?.is_subscriber ? (
          <label style={styles.attachButton} title="Attach a photo, video, or audio file">
            📎
            <input
              type="file"
              accept="image/*,video/*,audio/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ display: 'none' }}
            />
          </label>
        ) : (
          <span style={styles.attachButton} title="Sharing media is a subscriber feature">📎🔒</span>
        )}
        <input
          placeholder="Write a message…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          style={styles.input}
        />
        <button type="submit" disabled={sending || (!body.trim() && !file)} style={styles.send}>
          {sending ? '…' : 'Send'}
        </button>
      </form>
      {file && <p style={styles.filePreview}>Attaching: {file.name} <button type="button" onClick={() => setFile(null)} style={styles.clearFile}>✕</button></p>}
    </div>
  );
}

const styles = {
  page: { maxWidth: 640, margin: '0 auto', padding: '48px 24px 100px' },
  nameLink: { color: 'inherit', textDecoration: 'none' },
  back: { display: 'inline-block', color: 'var(--gd-text-dim)', fontSize: 13, textDecoration: 'none', marginBottom: 20 },
  thread: { display: 'flex', flexDirection: 'column', gap: 8, minHeight: 200 },
  bubbleRow: { display: 'flex' },
  bubble: {
    maxWidth: '75%', padding: '10px 14px', borderRadius: 16, fontSize: 14, lineHeight: 1.5,
  },
  bubbleMine: { background: 'var(--gd-gold)', color: 'var(--gd-on-accent)', borderBottomRightRadius: 4 },
  bubbleTheirs: {
    background: 'var(--gd-surface)', color: 'var(--gd-text)', border: '1px solid var(--gd-line)', borderBottomLeftRadius: 4,
  },
  form: {
    display: 'flex', gap: 8, marginTop: 20, position: 'sticky', bottom: 16,
    background: 'var(--gd-void)', paddingTop: 8, alignItems: 'center',
  },
  attachButton: {
    fontSize: 18, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center',
  },
  input: {
    flex: 1, minWidth: 0, boxSizing: 'border-box', background: 'var(--gd-surface)', color: 'var(--gd-text)', border: '1px solid var(--gd-line)',
    borderRadius: 20, padding: '10px 16px', fontSize: 14, fontFamily: 'var(--gd-font-body)',
  },
  send: {
    background: 'var(--gd-gold)', border: 'none', borderRadius: 20, padding: '10px 20px',
    color: 'var(--gd-on-accent)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
  },
  filePreview: { fontSize: 12, color: 'var(--gd-text-dim)', marginTop: 6 },
  clearFile: { background: 'transparent', border: 'none', color: 'var(--gd-error)', cursor: 'pointer', marginLeft: 6 },
  dim: { color: 'var(--gd-text-dim)', fontSize: 14 },
  errorText: { color: 'var(--gd-error)', fontSize: 14, marginBottom: 12 },
};
