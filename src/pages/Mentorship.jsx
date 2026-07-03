import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';
import PageHeader from '../components/PageHeader.jsx';

export default function Mentorship({ profile }) {
  const [mentors, setMentors] = useState([]);
  const [peers, setPeers] = useState([]);
  const [incomingPeerRequests, setIncomingPeerRequests] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      if (profile.role === 'aspirant') {
        const [mentorList, peerList, myPeerConnections] = await Promise.all([
          apiFetch('/api/connections/mentors'),
          apiFetch('/api/peer-connections/aspirants'),
          apiFetch('/api/peer-connections'),
        ]);
        setMentors(mentorList);
        setPeers(peerList);
        setIncomingPeerRequests(
          myPeerConnections.filter((c) => c.recipient_id === profile.id && c.status === 'pending')
        );
      } else {
        setRequests(await apiFetch('/api/connections'));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function requestMentor(mentorId) {
    try {
      await apiFetch('/api/connections', {
        method: 'POST',
        body: JSON.stringify({ mentor_id: mentorId }),
      });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function requestPeer(peerId) {
    try {
      await apiFetch('/api/peer-connections', {
        method: 'POST',
        body: JSON.stringify({ recipient_id: peerId }),
      });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function respondPeer(connectionId, status) {
    try {
      await apiFetch(`/api/peer-connections/${connectionId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function respond(id, status) {
    try {
      await apiFetch(`/api/connections/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  const pending = requests.filter((r) => r.status === 'pending');
  const accepted = requests.filter((r) => r.status === 'accepted');

  return (
    <div style={styles.page}>
      <PageHeader title="Fellowship" profile={profile} />

      <hr className="gd-horizon" style={{ margin: '24px 0 32px' }} />

      {error && <p style={styles.errorText}>{error}</p>}
      {loading && <p style={styles.dim}>Gathering…</p>}

      {!loading && profile.role === 'aspirant' && (
        <>
          {incomingPeerRequests.length > 0 && (
            <>
              <h3 style={styles.sectionTitle}>Requests to connect</h3>
              {incomingPeerRequests.map((r) => (
                <div key={r.id} style={styles.card}>
                  <h4 style={styles.cardTitle}>{r.requester?.display_name || 'A fellow aspirant'}</h4>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => respondPeer(r.id, 'accepted')} style={styles.actionButton}>Accept</button>
                    <button onClick={() => respondPeer(r.id, 'declined')} style={styles.declineButton}>Decline</button>
                  </div>
                </div>
              ))}
            </>
          )}

          <h3 style={styles.sectionTitle}>Find a mentor</h3>
          {mentors.length === 0 && <p style={styles.dim}>No mentors available yet.</p>}
          {mentors.map((m) => (
            <div key={m.id} style={styles.card}>
              <div>
                <h4 style={styles.cardTitle}>{m.display_name}</h4>
                {m.bio && <p style={styles.cardDesc}>{m.bio}</p>}
              </div>
              {m.connectionStatus === 'accepted' && <span style={styles.statusTag}>Connected</span>}
              {m.connectionStatus === 'pending' && <span style={styles.statusTagDim}>Requested</span>}
              {m.connectionStatus === 'declined' && <span style={styles.statusTagDim}>Declined</span>}
              {!m.connectionStatus && (
                <button onClick={() => requestMentor(m.id)} style={styles.actionButton}>Request</button>
              )}
            </div>
          ))}

          <h3 style={styles.sectionTitle}>Connect with a fellow aspirant</h3>
          {peers.length === 0 && <p style={styles.dim}>No fellow aspirants to connect with yet.</p>}
          {peers.map((p) => (
            <div key={p.id} style={styles.card}>
              <div>
                <h4 style={styles.cardTitle}>{p.display_name}</h4>
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
                <button onClick={() => requestPeer(p.id)} style={styles.actionButton}>Connect</button>
              )}
            </div>
          ))}

          {peers.some((p) => p.connection?.status === 'accepted') && (
            <Link to="/peer-inbox" style={styles.inboxLink}>See what fellow aspirants have shared with you →</Link>
          )}
        </>
      )}

      {!loading && profile.role === 'mentor' && (
        <>
          <h3 style={styles.sectionTitle}>Pending requests</h3>
          {pending.length === 0 && <p style={styles.dim}>No pending requests.</p>}
          {pending.map((r) => (
            <div key={r.id} style={styles.card}>
              <p style={styles.cardTitle}>Aspirant ID: {r.aspirant_id.slice(0, 8)}…</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => respond(r.id, 'accepted')} style={styles.actionButton}>Accept</button>
                <button onClick={() => respond(r.id, 'declined')} style={styles.declineButton}>Decline</button>
              </div>
            </div>
          ))}

          <h3 style={styles.sectionTitle}>Your aspirants</h3>
          {accepted.length === 0 && <p style={styles.dim}>No connections yet.</p>}
          {accepted.map((r) => (
            <div key={r.id} style={styles.card}>
              <p style={styles.cardTitle}>Aspirant ID: {r.aspirant_id.slice(0, 8)}…</p>
              <span style={styles.statusTag}>Connected</span>
            </div>
          ))}

          {accepted.length > 0 && (
            <Link to="/mentor-inbox" style={styles.inboxLink}>View what's been shared with you →</Link>
          )}
        </>
      )}
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
  inboxLink: { display: 'inline-block', marginTop: 12, color: 'var(--gd-violet)', fontSize: 14, textDecoration: 'none' },
  dim: { color: 'var(--gd-text-dim)', fontSize: 14 },
  errorText: { color: 'var(--gd-error)', fontSize: 14, marginBottom: 16 },
};
