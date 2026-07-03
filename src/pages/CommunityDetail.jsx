import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiFetch, apiUpload } from '../api';
import CommentThread from '../components/CommentThread.jsx';
import Attachment from '../components/Attachment.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { nameFor, isOnline } from '../utils/formatUser';
import UserLink from '../components/UserLink.jsx';

const TYPE_GLYPH = { dream: '☾', vision: '✦', intuition: '◈', note: '—' };
const MAX_ATTACHMENT_MB = 25;
const MAX_ATTACHMENT_BYTES = MAX_ATTACHMENT_MB * 1024 * 1024;

export default function CommunityDetail({ profile }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [featuredLibrary, setFeaturedLibrary] = useState([]);
  const [selectedFeatured, setSelectedFeatured] = useState('');
  const [recommending, setRecommending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageBody, setMessageBody] = useState('');
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatError, setChatError] = useState(null);
  const [openThread, setOpenThread] = useState(null);
  const [editingCommunity, setEditingCommunity] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [communitySaving, setCommunitySaving] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [deletingCommunity, setDeletingCommunity] = useState(false);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const [joinRequests, setJoinRequests] = useState([]);

  useEffect(() => {
    load();
  }, [id]);

  // Poll for new chat messages every 8s so the discussion feels closer
  // to live without needing a full websocket setup
  useEffect(() => {
    if (!community || community.myStatus !== 'accepted') return;
    const interval = setInterval(async () => {
      try {
        const fresh = await apiFetch(`/api/communities/${id}/messages`);
        const currentIds = new Set(messagesRef.current.map((m) => m.id));
        if (fresh.length !== messagesRef.current.length || fresh.some((m) => !currentIds.has(m.id))) {
          setMessages(fresh);
        }
      } catch {
        // Skip a failed poll, retried next interval
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [community, id]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const c = await apiFetch(`/api/communities/${id}`);
      setCommunity(c);
      setEditName(c.name);
      setEditDescription(c.description || '');

      if (c.myStatus !== 'accepted') {
        setLoading(false);
        return;
      }

      const [m, e, s, msgs] = await Promise.all([
        apiFetch(`/api/communities/${id}/members`),
        apiFetch(`/api/entries/community/${id}`),
        apiFetch(`/api/study-materials/community/${id}`),
        apiFetch(`/api/communities/${id}/messages`),
      ]);
      setMembers(m);
      setEntries(e);
      setMaterials(s);
      setMessages(msgs);

      if (c.myRole === 'mentor') {
        const [library, requests] = await Promise.all([
          apiFetch('/api/featured-materials'),
          apiFetch(`/api/communities/${id}/join-requests`),
        ]);
        setFeaturedLibrary(library);
        setSelectedFeatured(library[0]?.id || '');
        setJoinRequests(requests);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function respondToJoinRequest(userId, status) {
    try {
      await apiFetch(`/api/communities/${id}/join-requests/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setJoinRequests((prev) => prev.filter((r) => r.user_id !== userId));
      if (status === 'accepted') {
        const m = await apiFetch(`/api/communities/${id}/members`);
        setMembers(m);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveCommunityEdit(e) {
    e.preventDefault();
    setCommunitySaving(true);
    try {
      const updated = await apiFetch(`/api/communities/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: editName.trim(), description: editDescription.trim() || null }),
      });
      setCommunity((prev) => ({ ...prev, ...updated }));
      setEditingCommunity(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCommunitySaving(false);
    }
  }

  async function leaveCommunity() {
    if (!window.confirm(`Leave ${community.name}?`)) return;
    setLeaving(true);
    try {
      await apiFetch(`/api/communities/${id}/members/${profile.id}`, { method: 'DELETE' });
      navigate('/communities');
    } catch (err) {
      setError(err.message);
      setLeaving(false);
    }
  }

  async function deleteCommunity() {
    if (!window.confirm(`Delete ${community.name} permanently? This can't be undone.`)) return;
    setDeletingCommunity(true);
    try {
      await apiFetch(`/api/communities/${id}`, { method: 'DELETE' });
      navigate('/communities');
    } catch (err) {
      setError(err.message);
      setDeletingCommunity(false);
    }
  }

  async function removeMember(userId) {
    if (!window.confirm('Remove this person from the community?')) return;
    try {
      await apiFetch(`/api/communities/${id}/members/${userId}`, { method: 'DELETE' });
      setMembers((prev) => prev.filter((m) => m.profiles.id !== userId));
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteMessage(messageId) {
    if (!window.confirm('Delete this message?')) return;
    try {
      await apiFetch(`/api/communities/${id}/messages/${messageId}`, { method: 'DELETE' });
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (err) {
      setChatError(err.message);
    }
  }

  function handleFileSelect(e) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > MAX_ATTACHMENT_BYTES) {
      setChatError(
        `That file is ${(selected.size / (1024 * 1024)).toFixed(1)} MB — attachments are limited to ${MAX_ATTACHMENT_MB} MB.`
      );
      e.target.value = '';
      setFile(null);
      return;
    }

    setChatError(null);
    setFile(selected);
  }

  async function recommendMaterial(e) {
    e.preventDefault();
    if (!selectedFeatured) return;
    setRecommending(true);
    try {
      const created = await apiFetch('/api/study-materials', {
        method: 'POST',
        body: JSON.stringify({ community_id: id, featured_material_id: selectedFeatured }),
      });
      setMaterials((prev) => [created, ...prev]);
    } catch (err) {
      setChatError(err.message);
    } finally {
      setRecommending(false);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!messageBody.trim() && !file) return;
    setSending(true);
    setChatError(null);
    try {
      let attachment_path = null;
      let attachment_type = null;

      if (file) {
        const uploaded = await apiUpload(`/api/communities/${id}/media`, file);
        attachment_path = uploaded.attachment_path;
        attachment_type = uploaded.attachment_type;
      }

      const created = await apiFetch(`/api/communities/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body: messageBody.trim(), attachment_path, attachment_type }),
      });
      setMessages((prev) => [...prev, created]);
      setMessageBody('');
      setFile(null);
    } catch (err) {
      setChatError(err.message);
    } finally {
      setSending(false);
    }
  }

  if (loading) return <div style={styles.page}><p style={styles.dim}>Gathering the community…</p></div>;
  if (error) return <div style={styles.page}><p style={styles.errorText}>{error}</p></div>;

  if (community && community.myStatus !== 'accepted') {
    return (
      <div style={styles.page}>
        <PageHeader title={community.name} profile={profile} />
        <Link to="/communities" style={styles.back}>← Back to My Community</Link>
        <div style={styles.pendingCard}>
          <p style={styles.pendingTitle}>Your request is awaiting approval</p>
          <p style={styles.dim}>
            The mentor of {community.name} needs to accept your request before you can see what's shared here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <PageHeader title={community.name} profile={profile} />
      <Link to="/communities" style={styles.back}>← Back to My Community</Link>

      {!editingCommunity && community.description && <p style={styles.desc}>{community.description}</p>}
      <p style={styles.mentorLine}>Led by <UserLink profile={{ ...community.profiles, id: community.mentor_id }} /></p>
      <Link to={`/communities/${id}/call`} style={styles.callButton}>📹 Join video/audio call</Link>

      {community.myRole === 'mentor' ? (
        <div style={styles.communityActions}>
          <button onClick={() => setEditingCommunity((v) => !v)} style={styles.textActionButton}>
            {editingCommunity ? 'Cancel edit' : 'Edit community'}
          </button>
          <button onClick={deleteCommunity} disabled={deletingCommunity} style={styles.textActionButtonDanger}>
            {deletingCommunity ? 'Deleting…' : 'Delete community'}
          </button>
        </div>
      ) : (
        <div style={styles.communityActions}>
          <button onClick={leaveCommunity} disabled={leaving} style={styles.textActionButtonDanger}>
            {leaving ? 'Leaving…' : 'Leave community'}
          </button>
        </div>
      )}

      {editingCommunity && (
        <form onSubmit={saveCommunityEdit} style={styles.editCommunityForm}>
          <input value={editName} onChange={(e) => setEditName(e.target.value)} style={styles.input} />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={2}
            style={{ ...styles.input, resize: 'vertical' }}
          />
          <button type="submit" disabled={communitySaving || !editName.trim()} style={styles.recommendButton}>
            {communitySaving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      )}

      <hr className="gd-horizon" style={{ margin: '24px 0 32px' }} />

      {community.myRole === 'mentor' && joinRequests.length > 0 && (
        <>
          <h3 style={styles.sectionTitle}>Join requests ({joinRequests.length})</h3>
          {joinRequests.map((r) => (
            <div key={r.user_id} style={styles.joinRequestCard}>
              <span style={styles.joinRequestName}><UserLink profile={r.profiles} /></span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => respondToJoinRequest(r.user_id, 'accepted')} style={styles.acceptButton}>
                  Accept
                </button>
                <button onClick={() => respondToJoinRequest(r.user_id, 'declined')} style={styles.declineButton}>
                  Decline
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      <h3 style={styles.sectionTitle}>Members ({members.length})</h3>
      <div style={styles.memberRow}>
        {members.map((m) => (
          <span key={m.profiles.id} style={styles.memberChip}>
            <span style={{ ...styles.onlineDot, ...(isOnline(m.profiles.last_seen_at) ? styles.onlineDotActive : {}) }} />
            <UserLink profile={m.profiles} />{m.role === 'mentor' ? ' · mentor' : ''}
            {community.myRole === 'mentor' && m.profiles.id !== community.mentor_id && m.role !== 'mentor' && (
              <button onClick={() => removeMember(m.profiles.id)} style={styles.removeMemberButton}>✕</button>
            )}
          </span>
        ))}
      </div>

      <h3 style={styles.sectionTitle}>Discussion</h3>
      <div style={styles.chatBox}>
        {messages.length === 0 && <p style={styles.dim}>No messages yet. Say something to the group.</p>}
        {messages.map((msg) => (
          <div key={msg.id} style={styles.chatMessage}>
            <span style={styles.chatAuthor}><UserLink profile={{ ...msg.profiles, id: msg.author_id }} /></span>
            <span style={styles.chatTime}>
              {new Date(msg.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </span>
            {(msg.author_id === profile?.id || community.myRole === 'mentor') && (
              <button onClick={() => deleteMessage(msg.id)} style={styles.deleteMessageButton}>Delete</button>
            )}
            {msg.body && <p style={styles.chatBody}>{msg.body}</p>}
            {msg.attachment_path && <Attachment path={msg.attachment_path} type={msg.attachment_type} />}
          </div>
        ))}
        {chatError && <p style={styles.errorText}>{chatError}</p>}
        <form onSubmit={sendMessage} style={styles.chatForm}>
          <input
            placeholder="Message the community…"
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            style={styles.chatInput}
          />
          <label style={styles.attachButton} title={`Attach a photo, video, or audio file (max ${MAX_ATTACHMENT_MB} MB)`}>
            📎
            <input
              type="file"
              accept="image/*,video/*,audio/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </label>
          <button type="submit" disabled={sending || (!messageBody.trim() && !file)} style={styles.chatSend}>
            {sending ? '…' : 'Send'}
          </button>
        </form>
        {file && (
          <p style={styles.filePreview}>
            {file.name} <button onClick={() => setFile(null)} style={styles.removeFile}>✕</button>
          </p>
        )}
      </div>

      <h3 style={styles.sectionTitle}>Shared entries</h3>
      {entries.length === 0 && <p style={styles.dim}>Nothing shared here yet.</p>}
      {entries.map((entry) => (
        <div key={entry.id} style={styles.entryCard}>
          <div style={styles.entryMeta}>
            <span style={styles.glyph}>{TYPE_GLYPH[entry.type] || '—'}</span>
            <span style={styles.entryAuthor}><UserLink profile={{ ...entry.profiles, id: entry.user_id }} /></span>
            <span style={styles.entryDate}>
              {new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
          {entry.title && <h4 style={styles.entryTitle}>{entry.title}</h4>}
          <p style={styles.entryContent}>{entry.content}</p>
          <button
            onClick={() => setOpenThread(openThread === entry.id ? null : entry.id)}
            style={styles.threadToggle}
          >
            {openThread === entry.id ? 'Hide feedback' : 'View feedback'}
          </button>
          {openThread === entry.id && <CommentThread entryId={entry.id} currentUserId={profile?.id} />}
        </div>
      ))}

      <h3 style={styles.sectionTitle}>Study materials</h3>

      {community.myRole === 'mentor' && (
        <form onSubmit={recommendMaterial} style={styles.recommendForm}>
          {featuredLibrary.length === 0 ? (
            <p style={styles.dim}>No featured materials in the library yet — check back once an admin adds some.</p>
          ) : (
            <>
              <select
                value={selectedFeatured}
                onChange={(e) => setSelectedFeatured(e.target.value)}
                style={styles.recommendSelect}
              >
                {featuredLibrary.map((m) => (
                  <option key={m.id} value={m.id}>{m.title} ({m.type})</option>
                ))}
              </select>
              <button type="submit" disabled={recommending} style={styles.recommendButton}>
                {recommending ? 'Adding…' : 'Recommend to community'}
              </button>
            </>
          )}
        </form>
      )}

      {materials.length === 0 && <p style={styles.dim}>Nothing added yet.</p>}
      {materials.map((mat) => (
        <a key={mat.id} href={mat.url} target="_blank" rel="noreferrer" style={styles.materialCard}>
          <span style={styles.materialType}>{mat.type}</span>
          <span style={styles.materialTitle}>{mat.title}</span>
        </a>
      ))}
    </div>
  );
}

const styles = {
  page: { maxWidth: 640, margin: '0 auto', padding: '48px 24px 80px' },
  back: { display: 'inline-block', color: 'var(--gd-text-dim)', fontSize: 13, textDecoration: 'none', marginBottom: 24 },
  eyebrow: {
    fontFamily: 'var(--gd-font-mono)', fontSize: 12, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: 'var(--gd-gold)', margin: '0 0 6px',
  },
  title: { fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 30, margin: 0 },
  desc: { fontSize: 14, color: 'var(--gd-text-dim)', lineHeight: 1.6, marginTop: 10 },
  mentorLine: { fontSize: 12, color: 'var(--gd-violet)', fontFamily: 'var(--gd-font-mono)', marginTop: 8 },
  pendingCard: {
    background: 'var(--gd-surface)', border: '1px solid var(--gd-line)', borderRadius: 'var(--gd-radius)',
    padding: 24, marginTop: 24,
  },
  pendingTitle: {
    fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 18, color: 'var(--gd-text)', margin: '0 0 10px',
  },
  joinRequestCard: {
    background: 'var(--gd-surface)', border: '1px solid var(--gd-gold-dim)', borderRadius: 'var(--gd-radius)',
    padding: 14, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
  },
  joinRequestName: { fontSize: 14, fontWeight: 500, color: 'var(--gd-text)' },
  acceptButton: {
    background: 'var(--gd-gold)', border: 'none', borderRadius: 8, padding: '8px 16px',
    color: 'var(--gd-on-accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  declineButton: {
    background: 'transparent', border: '1px solid var(--gd-line)', borderRadius: 8, padding: '8px 16px',
    color: 'var(--gd-text-dim)', fontSize: 13, cursor: 'pointer',
  },
  callButton: {
    display: 'inline-block', marginTop: 16, background: 'var(--gd-gold)', border: 'none',
    borderRadius: 8, padding: '10px 20px', color: 'var(--gd-on-accent)', fontWeight: 600,
    fontSize: 14, textDecoration: 'none',
  },
  communityActions: { display: 'flex', gap: 16, marginTop: 14 },
  textActionButton: {
    background: 'transparent', border: 'none', color: 'var(--gd-violet)',
    fontSize: 13, cursor: 'pointer', padding: 0, fontFamily: 'var(--gd-font-mono)',
  },
  textActionButtonDanger: {
    background: 'transparent', border: 'none', color: 'var(--gd-error)',
    fontSize: 13, cursor: 'pointer', padding: 0, fontFamily: 'var(--gd-font-mono)',
  },
  editCommunityForm: {
    display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16,
    background: 'var(--gd-surface)', border: '1px solid var(--gd-line)', borderRadius: 'var(--gd-radius)', padding: 16,
  },
  input: {
    background: 'var(--gd-void)', color: 'var(--gd-text)', border: '1px solid var(--gd-line)',
    borderRadius: 8, padding: '10px 12px', fontFamily: 'var(--gd-font-body)', fontSize: 14,
  },
  sectionTitle: {
    fontFamily: 'var(--gd-font-mono)', fontSize: 12, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: 'var(--gd-text-dim)', margin: '32px 0 14px',
  },
  memberRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  memberChip: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'var(--gd-surface)', border: '1px solid var(--gd-line)', borderRadius: 20,
    padding: '6px 14px', fontSize: 12, color: 'var(--gd-text)',
  },
  onlineDot: {
    width: 7, height: 7, borderRadius: '50%', background: 'var(--gd-line)', flexShrink: 0,
  },
  onlineDotActive: {
    background: '#4CAF50',
  },
  removeMemberButton: {
    background: 'transparent', border: 'none', color: 'var(--gd-error)',
    cursor: 'pointer', fontSize: 12, padding: 0, marginLeft: 2,
  },
  deleteMessageButton: {
    background: 'transparent', border: 'none', color: 'var(--gd-error)',
    cursor: 'pointer', fontSize: 11, padding: 0, marginLeft: 8, fontFamily: 'var(--gd-font-mono)',
  },
  chatBox: {
    background: 'var(--gd-surface)', border: '1px solid var(--gd-line)',
    borderRadius: 'var(--gd-radius)', padding: 18,
  },
  chatMessage: { marginBottom: 12 },
  chatAuthor: {
    fontFamily: 'var(--gd-font-mono)', fontSize: 11, color: 'var(--gd-violet)',
    textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  chatTime: {
    fontFamily: 'var(--gd-font-mono)', fontSize: 10, color: 'var(--gd-text-dim)', marginLeft: 8,
  },
  chatBody: { fontSize: 14, lineHeight: 1.5, color: 'var(--gd-text)', margin: '2px 0 0' },
  chatForm: { display: 'flex', gap: 8, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--gd-line)' },
  chatInput: {
    flex: 1, background: 'var(--gd-void)', color: 'var(--gd-text)', border: '1px solid var(--gd-line)',
    borderRadius: 8, padding: '10px 12px', fontSize: 14, fontFamily: 'var(--gd-font-body)',
  },
  chatSend: {
    background: 'var(--gd-gold)', border: 'none', borderRadius: 8, padding: '10px 18px',
    color: 'var(--gd-on-accent)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  attachButton: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 40, background: 'var(--gd-void)', border: '1px solid var(--gd-line)',
    borderRadius: 8, cursor: 'pointer', fontSize: 16,
  },
  filePreview: {
    fontSize: 12, color: 'var(--gd-text-dim)', marginTop: 8,
  },
  removeFile: {
    background: 'transparent', border: 'none', color: 'var(--gd-error)',
    cursor: 'pointer', fontSize: 12, marginLeft: 4,
  },
  entryCard: {
    background: 'var(--gd-surface)', border: '1px solid var(--gd-line)',
    borderRadius: 'var(--gd-radius)', padding: 18, marginBottom: 14,
  },
  entryMeta: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  glyph: { color: 'var(--gd-gold)', fontSize: 14 },
  entryAuthor: { fontSize: 13, color: 'var(--gd-text)', fontWeight: 500 },
  entryDate: {
    fontFamily: 'var(--gd-font-mono)', fontSize: 11, color: 'var(--gd-text-dim)', marginLeft: 'auto',
  },
  entryTitle: {
    fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 17, margin: '0 0 6px', color: 'var(--gd-text)',
  },
  entryContent: { fontSize: 14, lineHeight: 1.6, color: 'var(--gd-text)', margin: '0 0 10px', whiteSpace: 'pre-wrap' },
  threadToggle: {
    background: 'transparent', border: 'none', color: 'var(--gd-violet)',
    fontSize: 12, cursor: 'pointer', padding: 0, fontFamily: 'var(--gd-font-mono)',
  },
  materialCard: {
    display: 'flex', gap: 10, alignItems: 'center', background: 'var(--gd-surface)',
    border: '1px solid var(--gd-line)', borderRadius: 'var(--gd-radius)', padding: 14,
    marginBottom: 10, textDecoration: 'none', color: 'var(--gd-text)',
  },
  materialType: {
    fontFamily: 'var(--gd-font-mono)', fontSize: 10, color: 'var(--gd-gold)',
    textTransform: 'uppercase', border: '1px solid var(--gd-gold-dim)', borderRadius: 4, padding: '2px 6px',
  },
  materialTitle: { fontSize: 14 },
  recommendForm: {
    display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap',
  },
  recommendSelect: {
    flex: 1, minWidth: 200, background: 'var(--gd-void)', color: 'var(--gd-text)',
    border: '1px solid var(--gd-line)', borderRadius: 8, padding: '10px 12px',
    fontFamily: 'var(--gd-font-body)', fontSize: 14,
  },
  recommendButton: {
    background: 'var(--gd-gold)', border: 'none', borderRadius: 8, padding: '10px 18px',
    color: 'var(--gd-on-accent)', fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
  },
  dim: { color: 'var(--gd-text-dim)', fontSize: 14 },
  errorText: { color: 'var(--gd-error)', fontSize: 14 },
};
