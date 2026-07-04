import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';
import PageHeader from '../components/PageHeader.jsx';
import UserLink from '../components/UserLink.jsx';

export default function Mentorship({ profile }) {
  const [mentors, setMentors] = useState([]);
  const [aspirants, setAspirants] = useState([]);
  const [mentorConnections, setMentorConnections] = useState([]);
  const [peerConnections, setPeerConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [mentorList, aspirantList, myMentorConns, myPeerConns] = await Promise.all([
        apiFetch('/api/connections/mentors'),
        apiFetch('/api/peer-connections/aspirants'),
        apiFetch('/api/connections'),
        apiFetch('/api/peer-connections'),
      ]);
      setMentors(mentorList);
      setAspirants(aspirantList);
      setMentorConnections(myMentorConns);
      setPeerConnections(myPeerConns);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function connectMentor(mentorId) {
    try {
      await apiFetch('/api/connections', { method: 'POST', body: JSON.stringify({ mentor_id: mentorId }) });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function connectAspirant(aspirantId) {
    try {
      await apiFetch('/api/peer-connections', { method: 'POST', body: JSON.stringify({ recipient_id: aspirantId }) });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function respondMentorConnection(id, status) {
    try {
      await apiFetch(`/api/connections/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function respondPeerConnection(id, status) {
    try {
      await apiFetch(`/api/peer-connections/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  // Incoming requests: someone requested me as their mentor, or a peer
  // requested to connect with me — regardless of my own role.
  const incomingMentorRequests = mentorConnections.filter((c) => c.mentor_id === profile.id && c.status === 'pending');
  const incomingPeerRequests = peerConnections.filter((c) => c.recipient_id === profile.id && c.status === 'pending');
  const hasAcceptedMentorConnection = mentorConnections.some((c) => c.status === 'accepted');
  const hasAcceptedPeerConnection = peerConnections.some((c) => c.status === 'accepted');

  return (
    <div style={styles.page}>
      <PageHeader title="Mentorship" profile={profile} />

      <hr className="gd-horizon" style={{ margin: '24px 0 32px' }} />

      {error && <p style={styles.errorText}>{error}</p>}
      {loading && <p style={styles.dim}>Gathering…</p>}

      {!loading && (incomingMentorRequests.length > 0 || incomingPeerRequests.length > 0) && (
        <>
          <h3 style={styles.sectionTitle}>Requests to connect</h3>
          {incomingMentorRequests.map((r) => (
            <div key={`m-${r.id}`} style={styles.card}>
              <h4 style={styles.cardTitle}><UserLink profile={r.aspirant} /></h4>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => respondMentorConnection(r.id, 'accepted')} style={styles.actionButton}>Accept</button>
                <button onClick={() => respondMentorConnection(r.id, 'declined')} style={styles.declineButton}>Decline</button>
              </div>
            </div>
          ))}
          {incomingPeerRequests.map((r) => (
            <div key={`p-${r.id}`} style={styles.card}>
              <h4 style={styles.cardTitle}><UserLink profile={r.requester} /></h4>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => respondPeerConnection(r.id, 'accepted')} style={styles.actionButton}>Accept</button>
                <button onClick={() => respondPeerConnection(r.id, 'declined')} style={styles.declineButton}>Decline</button>
              </div>
            </div>
          ))}
        </>
      )}

      {!loading && (
        <>
          <h3 style={styles.sectionTitle}>Find a mentor</h3>
          {mentors.length === 0 && <p style={styles.dim}>No mentors available yet.</p>}
          {mentors.map((m) => (
            <div key={m.id} style={styles.card}>
              <div>
                <h4 style={styles.cardTitle}><UserLink profile={m} /></h4>
                {m.bio && <p style={styles.cardDesc}>{m.bio}</p>}
              </div>
              {m.connectionStatus === 'accepted' && <span style={styles.statusTag}>Connected</span>}
              {m.connectionStatus === 'pending' && <span style={styles.statusTagDim}>Requested</span>}
              {m.connectionStatus === 'declined' && <span style={styles.statusTagDim}>Declined</span>}
              {!m.connectionStatus && (
                <button onClick={() => connectMentor(m.id)} style={styles.actionButton}>Connect</button>
              )}
            </div>
          ))}

          <h3 style={styles.sectionTitle}>Connect with an aspirant</h3>
          {aspirants.length === 0 && <p style={styles.dim}>No aspirants to connect with yet.</p>}
          {aspirants.map((p) => (
            <div key={p.id} style={styles.card}>
              <div>
                <h4 style={styles.cardTitle}><UserLink profile={p} /></h4>
                {p.bio && <p style={styles.cardDesc}>{p.bio}</p>}
              </div>
              {p.connection?.status === 'accepted' && <span style={styles.statusTag}>Connected</span>}
              {p.connection?.status === 'pending' && p.connection?.initiatedByMe && (
                <span style={styles.statusTagDim}>Requested</span>
              )}
              {p.connection?.status === 'pending' && !p.connection?.initiatedByMe && (
                <span style={styles.statusTagDim}>Awaiting your reply above</span>
              )}
              {p.connection?.status === 'declined' && <span style={styles.statusTagDim}>Declined</span>}
              {!p.connection && (
                <button onClick={() => connectAspirant(p.id)} style={styles.actionButton}>Connect</button>
              )}
            </div>
          ))}

          {(hasAcceptedMentorConnection || hasAcceptedPeerConnection) && (
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
              {hasAcceptedMentorConnection && (
                <Link to="/mentor-inbox" style={styles.inboxLink}>What your connections have shared with you →</Link>
              )}
              {hasAcceptedPeerConnection && (
                <Link to="/peer-inbox" style={styles.inboxLink}>What fellow aspirants have shared with you →</Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 640, margin: '0 auto', padding: '48px 24px 80px' },
  sectionTitle: {
    fontFamily: 'var(--gd-font-mono)', fontSize: 12, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: 'var(--gd-text-dim)', margin: '32px 0 14px',
  },
  card: {
    background: 'var(--gd-surface)', border: '1px solid var(--gd-line)', borderRadius: 'var(--gd-radius)',
    padding: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
  },
  cardTitle: { fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 16, margin: '0 0 4px' },
  cardDesc: { fontSize: 13, color: 'var(--gd-text-dim)', margin: 0, lineHeight: 1.5 },
  actionButton: {
    background: 'var(--gd-gold)', border: 'none', borderRadius: 8, padding: '8px 16px',
    color: 'var(--gd-on-accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
  },
  declineButton: {
    background: 'transparent', border: '1px solid var(--gd-line)', borderRadius: 8, padding: '8px 16px',
    color: 'var(--gd-text-dim)', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
  },
  statusTag: {
    fontFamily: 'var(--gd-font-mono)', fontSize: 11, color: 'var(--gd-gold)',
    textTransform: 'uppercase', whiteSpace: 'nowrap',
  },
  statusTagDim: {
    fontFamily: 'var(--gd-font-mono)', fontSize: 11, color: 'var(--gd-text-dim)',
    textTransform: 'uppercase', whiteSpace: 'nowrap',
  },
  inboxLink: { display: 'inline-block', color: 'var(--gd-violet)', fontSize: 14, textDecoration: 'none' },
  dim: { color: 'var(--gd-text-dim)', fontSize: 14 },
  errorText: { color: 'var(--gd-error)', fontSize: 14, marginBottom: 16 },
};
