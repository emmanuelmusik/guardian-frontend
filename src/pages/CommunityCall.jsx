import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import { apiFetch } from '../api';

export default function CommunityCall() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [connection, setConnection] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch('/api/livekit/token', {
      method: 'POST',
      body: JSON.stringify({ community_id: id }),
    })
      .then((data) => {
        setConnection(data);
        // Fire-and-forget history log; a failure here shouldn't block joining
        apiFetch('/api/livekit/session-start', {
          method: 'POST',
          body: JSON.stringify({ community_id: id }),
        }).catch(() => {});
      })
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <div style={styles.page}>
        <p style={styles.errorText}>{error}</p>
        <Link to={`/communities/${id}`} style={styles.back}>← Back to community</Link>
      </div>
    );
  }

  if (!connection) {
    return (
      <div style={styles.page}>
        <p style={styles.dim}>Connecting to the call…</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', background: '#000' }} data-lk-theme="default">
      <LiveKitRoom
        token={connection.token}
        serverUrl={connection.url}
        connect
        video
        audio
        style={{ height: '100%' }}
        onDisconnected={() => navigate(`/communities/${id}`)}
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
}

const styles = {
  page: { maxWidth: 640, margin: '0 auto', padding: '48px 24px' },
  back: { display: 'inline-block', color: 'var(--gd-text-dim)', fontSize: 13, textDecoration: 'none', marginTop: 16 },
  dim: { color: 'var(--gd-text-dim)', fontSize: 14 },
  errorText: { color: 'var(--gd-error)', fontSize: 14 },
};
