import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../api';
import PageHeader from '../components/PageHeader.jsx';

export default function MessageThread({ profile }) {
  const { userId } = useParams();
  const [person, setPerson] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
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
    if (!body.trim()) return;
    setSending(true);
    try {
      const created = await apiFetch(`/api/messages/with/${userId}`, {
        method: 'POST',
        body: JSON.stringify({ body: body.trim() }),
      });
      setMessages((prev) => [...prev, created]);
      setBody('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  if (loading) return <div style={styles.page}><p style={styles.dim}>Loading…</p></div>;

  return (
    <div style={styles.page}>
      <PageHeader title={person ? person.display_name : 'Messages'} profile={profile} />
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
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} style={styles.form}>
        <input
          placeholder="Write a message…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          style={styles.input}
        />
        <button type="submit" disabled={sending || !body.trim()} style={styles.send}>
          {sending ? '…' : 'Send'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: { maxWidth: 640, margin: '0 auto', padding: '48px 24px 100px' },
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
    background: 'var(--gd-void)', paddingTop: 8,
  },
  input: {
    flex: 1, background: 'var(--gd-surface)', color: 'var(--gd-text)', border: '1px solid var(--gd-line)',
    borderRadius: 20, padding: '10px 16px', fontSize: 14, fontFamily: 'var(--gd-font-body)',
  },
  send: {
    background: 'var(--gd-gold)', border: 'none', borderRadius: 20, padding: '10px 20px',
    color: 'var(--gd-on-accent)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
  },
  dim: { color: 'var(--gd-text-dim)', fontSize: 14 },
  errorText: { color: 'var(--gd-error)', fontSize: 14, marginBottom: 12 },
};
