import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch, apiUpload } from '../api';
import { supabase } from '../supabaseClient';
import { getDraft, setDraft, clearDraft } from '../lib/messageDrafts';
import { formatMessageTime } from '../lib/relativeTime';
import { formatMessageText } from '../lib/formatText';
import VoiceRecorder from '../components/VoiceRecorder.jsx';
import VoiceNotePlayer from '../components/VoiceNotePlayer.jsx';
import PageHeader from '../components/PageHeader.jsx';

const EDIT_WINDOW_MS = 15 * 60 * 1000;
const REACTION_CHOICES = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

function DmAttachment({ path, type, meta }) {
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
  if (type === 'voice_note') return <div style={{ marginTop: 6 }}><VoiceNotePlayer url={url} duration={meta?.duration} waveform={meta?.waveform} /></div>;
  if (type === 'audio') return <audio src={url} controls style={{ width: '100%', marginTop: 6 }} />;
  return null;
}

// Single gray tick: sent. Double gray: delivered. Double blue: read.
function Ticks({ status }) {
  if (!status || status === 'sent') return <span style={styles.tick}>✓</span>;
  const blue = status === 'read';
  return <span style={{ ...styles.tick, color: blue ? '#34b7f1' : 'inherit' }}>✓✓</span>;
}

export default function MessageThread({ profile }) {
  const { userId } = useParams();
  const [person, setPerson] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState(() => getDraft(userId));
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [theirTyping, setTheirTyping] = useState(false);
  const [theirOnline, setTheirOnline] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [menuFor, setMenuFor] = useState(null);
  const [forwardFor, setForwardFor] = useState(null);
  const [connections, setConnections] = useState(null);

  const [drag, setDrag] = useState({ id: null, dx: 0 });
  const [burstId, setBurstId] = useState(null);
  const [highlightId, setHighlightId] = useState(null);

  const bottomRef = useRef(null);
  const channelRef = useRef(null);
  const messageRefs = useRef({});
  const typingTimeoutRef = useRef(null);
  const theirTypingTimeoutRef = useRef(null);
  const longPressRef = useRef(null);
  const dragStartRef = useRef(null);
  const lastTapRef = useRef({ id: null, time: 0 });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      apiFetch(`/api/users/${userId}`),
      apiFetch(`/api/messages/with/${userId}`),
    ])
      .then(([p, m]) => {
        if (cancelled) return;
        setPerson(p);
        setMessages(m);
        setError(null);
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    setBody(getDraft(userId));
    setReplyTo(null);
    setEditingId(null);
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Realtime: new/edited/deleted messages, reactions, pins, typing, presence.
  useEffect(() => {
    if (!profile?.id) return;
    const pairKey = [profile.id, userId].sort().join('-');
    const channel = supabase.channel(`dm-${pairKey}`, {
      config: { presence: { key: profile.id } },
    });
    channelRef.current = channel;

    const belongsHere = (m) => (m.sender_id === userId && m.recipient_id === profile.id) ||
      (m.sender_id === profile.id && m.recipient_id === userId);

    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, (payload) => {
        const m = payload.new;
        if (!belongsHere(m)) return;
        setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
        if (m.recipient_id === profile.id) {
          apiFetch(`/api/messages/with/${userId}/read`, { method: 'PATCH' }).catch(() => {});
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'direct_messages' }, (payload) => {
        const m = payload.new;
        if (!belongsHere(m)) return;
        setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, ...m } : x)));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'message_reactions' }, () => {
        refreshQuietly();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pinned_messages' }, () => {
        refreshQuietly();
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload?.userId !== userId) return;
        setTheirTyping(true);
        clearTimeout(theirTypingTimeoutRef.current);
        theirTypingTimeoutRef.current = setTimeout(() => setTheirTyping(false), 3000);
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setTheirOnline(Boolean(state[userId]?.length));
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') channel.track({ online: true });
      });

    return () => {
      clearTimeout(theirTypingTimeoutRef.current);
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [profile?.id, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reactions/pins don't carry their full payload over broadcast, so on
  // that signal we just re-fetch the thread quietly (no loading spinner).
  function refreshQuietly() {
    apiFetch(`/api/messages/with/${userId}`).then(setMessages).catch(() => {});
  }

  const broadcastTyping = useCallback(() => {
    channelRef.current?.send({ type: 'broadcast', event: 'typing', payload: { userId: profile.id } });
  }, [profile?.id]);

  function handleBodyChange(e) {
    const value = e.target.value;
    setBody(value);
    if (!editingId) setDraft(userId, value); // don't let edit-in-progress text overwrite the real draft
    if (!typingTimeoutRef.current) {
      broadcastTyping();
      typingTimeoutRef.current = setTimeout(() => { typingTimeoutRef.current = null; }, 1000);
    }
  }

  async function send(e) {
    e.preventDefault();
    if (!body.trim() && !file) return;

    if (editingId) {
      try {
        const updated = await apiFetch(`/api/messages/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify({ body: body.trim() }),
        });
        setMessages((prev) => prev.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)));
        setEditingId(null);
        setBody('');
        clearDraft(userId);
      } catch (err) {
        setError(err.message);
      }
      return;
    }

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
        body: JSON.stringify({
          body: body.trim(),
          attachment_path,
          attachment_type,
          reply_to_message_id: replyTo?.id || null,
        }),
      });
      setMessages((prev) => (prev.some((x) => x.id === created.id) ? prev : [...prev, created]));
      setBody('');
      clearDraft(userId);
      setFile(null);
      setReplyTo(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  async function sendVoiceNote({ blob, duration, waveform }) {
    setSending(true);
    setError(null);
    try {
      const uploaded = await apiUpload(`/api/messages/with/${userId}/media`, blob, {
        filename: 'voice-note.webm',
        extraFields: { kind: 'voice_note', duration: String(duration), waveform: JSON.stringify(waveform) },
      });
      const created = await apiFetch(`/api/messages/with/${userId}`, {
        method: 'POST',
        body: JSON.stringify({
          body: '',
          attachment_path: uploaded.attachment_path,
          attachment_type: uploaded.attachment_type,
          media_meta: uploaded.media_meta,
          reply_to_message_id: replyTo?.id || null,
        }),
      });
      setMessages((prev) => (prev.some((x) => x.id === created.id) ? prev : [...prev, created]));
      setReplyTo(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  function startLongPress(messageId) {
    clearTimeout(longPressRef.current);
    longPressRef.current = setTimeout(() => setMenuFor(messageId), 450);
  }
  function cancelLongPress() {
    clearTimeout(longPressRef.current);
  }

  const SWIPE_REPLY_THRESHOLD = 44;
  const SWIPE_MAX = 60;

  // A message pinned to the right edge (yours) only has open space to
  // its LEFT; one pinned to the left edge (theirs) only has open space
  // to its RIGHT. So "swipe to reply" has to swipe toward whichever
  // side is actually open, or your own messages would just push off
  // the edge of the screen instead of revealing anything. `drag.dx`
  // below is always a non-negative "how far swiped" progress value in
  // that message's own natural direction — sign is resolved at render.
  function handleDragStart(e, messageId) {
    startLongPress(messageId);
    dragStartRef.current = { x: e.clientX, y: e.clientY, id: messageId };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function handleDragMove(e, messageId, mine) {
    const start = dragStartRef.current;
    if (!start || start.id !== messageId) return;
    const rawDx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const directional = mine ? -rawDx : rawDx; // leftward counts as progress for mine, rightward for theirs
    if (Math.abs(rawDx) > 8 || Math.abs(dy) > 8) cancelLongPress();
    if (directional > 8 && Math.abs(rawDx) > Math.abs(dy)) {
      setDrag({ id: messageId, dx: Math.min(directional - 8, SWIPE_MAX) });
    }
  }

  function handleDragEnd(e, message) {
    cancelLongPress();
    const start = dragStartRef.current;
    const wasThisMessage = start?.id === message.id;
    const thisDragDx = drag.id === message.id ? drag.dx : 0;
    dragStartRef.current = null;
    setDrag({ id: null, dx: 0 });

    if (wasThisMessage && thisDragDx >= SWIPE_REPLY_THRESHOLD) {
      startReply(message);
      lastTapRef.current = { id: null, time: 0 };
      return;
    }

    // A plain tap (no real drag) within 300ms of the previous tap on the
    // same bubble is a double-tap — WhatsApp/Instagram's quick-like
    // gesture. Anything that moved is a drag, not a tap, so it's ignored.
    if (wasThisMessage && thisDragDx < 8) {
      const now = Date.now();
      const last = lastTapRef.current;
      if (last.id === message.id && now - last.time < 300) {
        likeMessage(message);
        lastTapRef.current = { id: null, time: 0 };
      } else {
        lastTapRef.current = { id: message.id, time: now };
      }
    }
  }

  function likeMessage(message) {
    const alreadyLiked = (message.reactions || []).some((r) => r.user_id === profile.id && r.emoji === '❤️');
    react(message.id, '❤️');
    if (!alreadyLiked) {
      setBurstId(message.id);
      setTimeout(() => setBurstId((cur) => (cur === message.id ? null : cur)), 650);
    }
  }

  // WhatsApp lets you tap a quoted reply to jump straight to the
  // original message — scroll it into view and flash it briefly so
  // it's obvious which bubble it is.
  function jumpToMessage(messageId) {
    const el = messageRefs.current[messageId];
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightId(messageId);
    setTimeout(() => setHighlightId((cur) => (cur === messageId ? null : cur)), 1200);
  }

  async function react(messageId, emoji) {
    const msg = messages.find((m) => m.id === messageId);
    const already = (msg?.reactions || []).find((r) => r.user_id === profile.id && r.emoji === emoji);
    try {
      if (already) await apiFetch(`/api/messages/${messageId}/react`, { method: 'DELETE' });
      else await apiFetch(`/api/messages/${messageId}/react`, { method: 'POST', body: JSON.stringify({ emoji }) });
      refreshQuietly();
    } catch (err) {
      setError(err.message);
    }
    setMenuFor(null);
  }

  function startReply(message) {
    setReplyTo(message);
    setEditingId(null);
    setMenuFor(null);
  }

  function startEdit(message) {
    setEditingId(message.id);
    setBody(message.body || '');
    setReplyTo(null);
    setMenuFor(null);
  }

  async function deleteMessage(messageId, scope) {
    try {
      await apiFetch(`/api/messages/${messageId}?scope=${scope}`, { method: 'DELETE' });
      if (scope === 'me') setMessages((prev) => prev.filter((m) => m.id !== messageId));
      else refreshQuietly();
    } catch (err) {
      setError(err.message);
    }
    setMenuFor(null);
  }

  async function togglePin(message) {
    try {
      if (message.pinned) await apiFetch(`/api/messages/${message.id}/pin`, { method: 'DELETE' });
      else await apiFetch(`/api/messages/${message.id}/pin`, { method: 'POST' });
      refreshQuietly();
    } catch (err) {
      setError(err.message);
    }
    setMenuFor(null);
  }

  async function toggleStar(message) {
    try {
      if (message.starred) await apiFetch(`/api/messages/${message.id}/star`, { method: 'DELETE' });
      else await apiFetch(`/api/messages/${message.id}/star`, { method: 'POST' });
      refreshQuietly();
    } catch (err) {
      setError(err.message);
    }
    setMenuFor(null);
  }

  async function openForward(message) {
    setForwardFor(message);
    setMenuFor(null);
    if (!connections) {
      try {
        const list = await apiFetch('/api/messages/connections');
        setConnections(list.filter((c) => c.id !== profile.id));
      } catch {
        setConnections([]);
      }
    }
  }

  async function forwardTo(toUserId) {
    if (!forwardFor) return;
    try {
      await apiFetch(`/api/messages/${forwardFor.id}/forward`, { method: 'POST', body: JSON.stringify({ toUserId }) });
      setForwardFor(null);
      if (toUserId === userId) refreshQuietly();
    } catch (err) {
      setError(err.message);
    }
  }

  const pinnedMessage = useMemo(() => messages.find((m) => m.pinned), [messages]);

  if (loading) return <div style={styles.page}><p style={styles.dim}>Loading…</p></div>;

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes guardianHeartBurst {
          0% { transform: scale(0.4); opacity: 0; }
          35% { transform: scale(1.25); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
      <PageHeader
        title={person ? <Link to={`/profile/${person.id}`} style={styles.nameLink}>{person.display_name}</Link> : 'Messages'}
        profile={profile}
      />
      <Link to="/messages" style={styles.back}>← Back to messages</Link>
      <p style={styles.presenceLine}>
        {theirTyping ? 'Typing…' : theirOnline ? 'Online' : null}
      </p>

      {pinnedMessage && (
        <div style={styles.pinnedBanner}>
          📌 <span style={styles.pinnedText}>{pinnedMessage.deleted_for_everyone ? 'This message was deleted' : (pinnedMessage.body || 'Media message')}</span>
        </div>
      )}

      {error && <p style={styles.errorText}>{error}</p>}

      <div style={styles.thread}>
        {messages.map((m) => {
          const mine = m.sender_id === profile.id;
          const canEdit = mine && !m.deleted_for_everyone && (Date.now() - new Date(m.created_at).getTime() < EDIT_WINDOW_MS);
          const reactionCounts = {};
          (m.reactions || []).forEach((r) => { reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1; });

          const dragProgress = drag.id === m.id ? drag.dx : 0; // 0..SWIPE_MAX, direction resolved below
          const dragTranslate = mine ? -dragProgress : dragProgress;

          return (
            <div key={m.id} style={{ ...styles.bubbleRow, justifyContent: mine ? 'flex-end' : 'flex-start' }}>
              <div style={{ position: 'relative' }}>
                {dragProgress > 0 && (
                  <span
                    style={{
                      ...styles.swipeReplyIcon,
                      ...(mine ? { left: 'auto', right: -24 } : { left: -24, right: 'auto' }),
                      opacity: Math.min(1, dragProgress / SWIPE_REPLY_THRESHOLD),
                      transform: `translateY(-50%) scale(${0.6 + 0.4 * Math.min(1, dragProgress / SWIPE_REPLY_THRESHOLD)})`,
                    }}
                  >
                    ↩
                  </span>
                )}
                <div
                  ref={(el) => { messageRefs.current[m.id] = el; }}
                  style={{
                    ...styles.bubble,
                    ...(mine ? styles.bubbleMine : styles.bubbleTheirs),
                    ...(highlightId === m.id ? styles.bubbleHighlight : null),
                    transform: `translateX(${dragTranslate}px)`,
                    transition: dragProgress ? 'none' : 'transform 150ms ease-out, background-color 200ms ease-out',
                    touchAction: 'pan-y',
                  }}
                  onContextMenu={(e) => { e.preventDefault(); setMenuFor(m.id); }}
                  onPointerDown={(e) => handleDragStart(e, m.id)}
                  onPointerMove={(e) => handleDragMove(e, m.id, mine)}
                  onPointerUp={(e) => handleDragEnd(e, m)}
                  onPointerLeave={(e) => handleDragEnd(e, m)}
                >
                  {burstId === m.id && <span style={styles.heartBurst}>❤️</span>}
                  {m.forwarded_from_message_id && <div style={styles.forwardedTag}>↪ Forwarded</div>}
                  {m.reply_to && (
                    <div
                      style={styles.replyPreview}
                      onClick={(e) => { e.stopPropagation(); jumpToMessage(m.reply_to.id); }}
                    >
                      <div style={{ ...styles.replyPreviewSender, color: mine ? 'var(--gd-on-accent)' : 'var(--gd-gold)' }}>
                        {m.reply_to.sender_id === profile.id ? 'You' : (person?.display_name || 'Them')}
                      </div>
                      <div style={styles.replyPreviewText}>
                        {m.reply_to.deleted ? 'This message was deleted' : (m.reply_to.body || 'Media message')}
                      </div>
                    </div>
                  )}

                  {m.deleted_for_everyone ? (
                    <span style={styles.deletedText}>This message was deleted</span>
                  ) : (
                    <>
                      {m.body && <span>{formatMessageText(m.body)}</span>}
                      {m.attachment_path && <DmAttachment path={m.attachment_path} type={m.attachment_type} meta={m.media_meta} />}
                    </>
                  )}

                  <div style={{ ...styles.meta, justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                    {m.starred && <span title="Starred">⭐</span>}
                    {m.edited_at && !m.deleted_for_everyone && <span>Edited</span>}
                    <span>{formatMessageTime(m.created_at)}</span>
                    {mine && <Ticks status={m.status} />}
                  </div>
                </div>

                {Object.keys(reactionCounts).length > 0 && (
                  <div style={{ ...styles.reactionRow, justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                    {Object.entries(reactionCounts).map(([emoji, count]) => (
                      <button key={emoji} type="button" onClick={() => react(m.id, emoji)} style={styles.reactionPill}>
                        {emoji} {count > 1 ? count : ''}
                      </button>
                    ))}
                  </div>
                )}

                {menuFor === m.id && (
                  <div style={{ ...styles.menu, [mine ? 'right' : 'left']: 0 }}>
                    <div style={styles.emojiRow}>
                      {REACTION_CHOICES.map((emoji) => (
                        <button key={emoji} type="button" onClick={() => react(m.id, emoji)} style={styles.emojiButton}>{emoji}</button>
                      ))}
                    </div>
                    <button type="button" style={styles.menuItem} onClick={() => startReply(m)}>Reply</button>
                    <button type="button" style={styles.menuItem} onClick={() => openForward(m)}>Forward</button>
                    <button type="button" style={styles.menuItem} onClick={() => toggleStar(m)}>{m.starred ? 'Unstar' : 'Star'}</button>
                    <button type="button" style={styles.menuItem} onClick={() => togglePin(m)}>{m.pinned ? 'Unpin' : 'Pin'}</button>
                    {canEdit && <button type="button" style={styles.menuItem} onClick={() => startEdit(m)}>Edit</button>}
                    <button type="button" style={styles.menuItem} onClick={() => deleteMessage(m.id, 'me')}>Delete for me</button>
                    {mine && !m.deleted_for_everyone && (
                      <button type="button" style={{ ...styles.menuItem, color: 'var(--gd-error)' }} onClick={() => deleteMessage(m.id, 'everyone')}>Delete for everyone</button>
                    )}
                    <button type="button" style={styles.menuItem} onClick={() => setMenuFor(null)}>Close</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {replyTo && (
        <div style={styles.composerReply}>
          <div style={styles.composerReplyBody}>
            <div style={styles.composerReplySender}>
              {replyTo.sender_id === profile.id ? 'You' : (person?.display_name || 'Them')}
            </div>
            <div style={styles.composerReplyText}>
              {replyTo.deleted_for_everyone ? 'This message was deleted' : (replyTo.body || 'Media message')}
            </div>
          </div>
          <button type="button" onClick={() => setReplyTo(null)} style={styles.composerReplyClose}>✕</button>
        </div>
      )}
      {editingId && (
        <div style={styles.composerReply}>
          <div style={styles.composerReplyBody}>
            <div style={styles.composerReplySender}>Editing message</div>
          </div>
          <button type="button" onClick={() => { setEditingId(null); setBody(''); }} style={styles.composerReplyClose}>✕</button>
        </div>
      )}

      <form onSubmit={send} style={styles.form}>
        <label style={styles.attachButton} title="Attach a photo, video, or audio file">
          📎
          <input
            type="file"
            accept="image/*,video/*,audio/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={{ display: 'none' }}
          />
        </label>
        <input
          placeholder={editingId ? 'Edit your message…' : 'Write a message… (*bold* _italic_ ~strike~)'}
          value={body}
          onChange={handleBodyChange}
          style={styles.input}
        />
        {!body.trim() && !file && !editingId ? (
          <VoiceRecorder onRecorded={sendVoiceNote} onCancel={(msg) => msg && setError(msg)} />
        ) : (
          <button type="submit" disabled={sending || (!body.trim() && !file)} style={styles.send}>
            {sending ? '…' : editingId ? 'Save' : 'Send'}
          </button>
        )}
      </form>
      {file && <p style={styles.filePreview}>Attaching: {file.name} <button type="button" onClick={() => setFile(null)} style={styles.clearFile}>✕</button></p>}

      {forwardFor && (
        <div style={styles.modalOverlay} onClick={() => setForwardFor(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Forward message</h3>
            {!connections ? (
              <p style={styles.dim}>Loading…</p>
            ) : connections.length === 0 ? (
              <p style={styles.dim}>No connections to forward to.</p>
            ) : (
              <div style={styles.modalList}>
                {connections.map((c) => (
                  <button key={c.id} type="button" style={styles.modalListItem} onClick={() => forwardTo(c.id)}>
                    {c.display_name || c.username}
                  </button>
                ))}
              </div>
            )}
            <button type="button" style={styles.modalClose} onClick={() => setForwardFor(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 640, margin: '0 auto', padding: '48px 24px 100px' },
  nameLink: { color: 'inherit', textDecoration: 'none' },
  back: { display: 'inline-block', color: 'var(--gd-text-dim)', fontSize: 13, textDecoration: 'none', marginBottom: 4 },
  presenceLine: { fontSize: 12, color: 'var(--gd-text-dim)', minHeight: 16, margin: '0 0 8px' },
  pinnedBanner: {
    display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, background: 'var(--gd-surface)',
    border: '1px solid var(--gd-line)', borderRadius: 10, padding: '8px 12px', marginBottom: 12,
  },
  pinnedText: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  thread: { display: 'flex', flexDirection: 'column', gap: 3, minHeight: 200 },
  bubbleRow: { display: 'flex' },
  bubble: {
    maxWidth: '78%', padding: '6px 7px 6px 8px', borderRadius: 10, fontSize: 14.5, lineHeight: 1.35, cursor: 'pointer',
    boxShadow: '0 1px 1px rgba(0,0,0,0.06)', position: 'relative',
  },
  bubbleMine: { background: 'var(--gd-gold-soft)', color: 'var(--gd-on-accent)', borderBottomRightRadius: 2 },
  bubbleTheirs: {
    background: 'var(--gd-surface)', color: 'var(--gd-text)', borderBottomLeftRadius: 2,
  },
  // Brief flash applied when jumping to a message via its quoted reply.
  bubbleHighlight: { boxShadow: '0 0 0 2px var(--gd-gold)' },
  forwardedTag: { fontSize: 11, opacity: 0.7, fontStyle: 'italic', marginBottom: 2 },
  // WhatsApp-style quoted reply card: a colored left bar, the original
  // sender's name on top, the quoted text dimmed below — sitting inside
  // a slightly tinted rounded panel at the top of the bubble.
  replyPreview: {
    background: 'rgba(0,0,0,0.08)', borderLeft: '3px solid currentColor', borderRadius: 6,
    padding: '4px 8px', marginBottom: 4, overflow: 'hidden', maxWidth: '100%', cursor: 'pointer',
  },
  replyPreviewSender: { fontSize: 12.5, fontWeight: 700, marginBottom: 1 },
  replyPreviewText: {
    fontSize: 12.5, opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis',
    whiteSpace: 'nowrap', display: 'block',
  },
  deletedText: { fontStyle: 'italic', opacity: 0.7 },
  meta: {
    display: 'flex', gap: 3, alignItems: 'center', fontSize: 10.5, opacity: 0.7, marginTop: 2,
  },
  tick: { fontSize: 12, lineHeight: 1 },
  reactionRow: { display: 'flex', gap: 4, marginTop: 2 },
  reactionPill: {
    fontSize: 12, background: 'var(--gd-surface)', border: '1px solid var(--gd-line)', borderRadius: 12,
    padding: '2px 8px', cursor: 'pointer', boxShadow: '0 1px 1px rgba(0,0,0,0.06)',
  },
  heartBurst: {
    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 46, pointerEvents: 'none', animation: 'guardianHeartBurst 650ms ease-out forwards',
    textShadow: '0 2px 6px rgba(0,0,0,0.25)',
  },
  swipeReplyIcon: {
    position: 'absolute', left: -24, top: '50%', transform: 'translateY(-50%)',
    fontSize: 18, color: 'var(--gd-text-dim)', pointerEvents: 'none',
  },
  menu: {
    position: 'absolute', top: '100%', marginTop: 4, background: 'var(--gd-surface)', border: '1px solid var(--gd-line)',
    borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.2)', zIndex: 10, minWidth: 180, overflow: 'hidden',
  },
  emojiRow: { display: 'flex', gap: 4, padding: 8, borderBottom: '1px solid var(--gd-line)' },
  emojiButton: { fontSize: 18, background: 'transparent', border: 'none', cursor: 'pointer' },
  menuItem: {
    display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'transparent',
    border: 'none', borderBottom: '1px solid var(--gd-line)', cursor: 'pointer', fontSize: 13, color: 'var(--gd-text)',
  },
  // The bar that sits above the input while composing a reply or edit —
  // same quote-card language as the in-bubble preview, so it reads as
  // one continuous interaction.
  composerReply: {
    display: 'flex', alignItems: 'center', gap: 8, background: 'var(--gd-surface)',
    borderLeft: '4px solid var(--gd-gold)', borderRadius: 8, padding: '6px 10px 6px 12px', marginTop: 12,
  },
  composerReplyBody: { flex: 1, minWidth: 0 },
  composerReplySender: { fontSize: 12.5, fontWeight: 700, color: 'var(--gd-gold)', marginBottom: 1 },
  composerReplyText: { fontSize: 12.5, opacity: 0.75, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  composerReplyClose: {
    background: 'transparent', border: 'none', color: 'var(--gd-text-dim)', cursor: 'pointer',
    fontSize: 14, flexShrink: 0, padding: 4,
  },
  form: {
    display: 'flex', gap: 8, marginTop: 12, position: 'sticky', bottom: 16,
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
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 100,
  },
  modal: {
    background: 'var(--gd-surface)', borderRadius: 14, padding: 20, width: '85%', maxWidth: 360, maxHeight: '70vh', overflowY: 'auto',
  },
  modalTitle: { margin: '0 0 12px', fontSize: 16 },
  modalList: { display: 'flex', flexDirection: 'column', gap: 4 },
  modalListItem: {
    textAlign: 'left', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--gd-line)',
    background: 'transparent', color: 'var(--gd-text)', cursor: 'pointer', fontSize: 14,
  },
  modalClose: {
    marginTop: 16, width: '100%', padding: '10px 0', borderRadius: 8, border: '1px solid var(--gd-line)',
    background: 'transparent', color: 'var(--gd-text)', cursor: 'pointer', fontSize: 14,
  },
};
