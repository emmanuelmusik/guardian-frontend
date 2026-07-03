import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LiveKitRoom, VideoConference, useParticipants, useRoomContext } from '@livekit/components-react';
import '@livekit/components-styles';
import { Maximize2, PhoneOff } from 'lucide-react';
import { useCall } from '../context/CallContext.jsx';

export default function FloatingCall() {
  const { activeCall, leaveCall } = useCall();
  const location = useLocation();
  const navigate = useNavigate();

  if (!activeCall) return null;

  const isFullView = location.pathname === `/communities/${activeCall.communityId}/call`;

  return (
    <div style={isFullView ? styles.fullWrap : styles.floatingWrap} data-lk-theme="default">
      <LiveKitRoom
        token={activeCall.token}
        serverUrl={activeCall.url}
        connect
        video={isFullView}
        audio
        style={{ height: '100%', width: '100%' }}
        onDisconnected={() => {
          leaveCall();
          navigate(`/communities/${activeCall.communityId}`);
        }}
      >
        {isFullView ? (
          <VideoConference />
        ) : (
          <MiniCallBubble
            communityName={activeCall.communityName}
            onExpand={() => navigate(`/communities/${activeCall.communityId}/call`)}
          />
        )}
      </LiveKitRoom>
    </div>
  );
}

function MiniCallBubble({ communityName, onExpand }) {
  const participants = useParticipants();
  const room = useRoomContext();

  return (
    <div style={styles.bubble}>
      <div style={styles.bubbleInfo} onClick={onExpand}>
        <span style={styles.bubbleDot} />
        <span style={styles.bubbleText}>
          {communityName} · {participants.length} in call
        </span>
      </div>
      <button onClick={onExpand} style={styles.iconButton} aria-label="Expand call">
        <Maximize2 size={15} color="var(--gd-on-accent)" />
      </button>
      <button onClick={() => room.disconnect()} style={styles.iconButton} aria-label="Leave call">
        <PhoneOff size={15} color="var(--gd-on-accent)" />
      </button>
    </div>
  );
}

const styles = {
  fullWrap: { position: 'fixed', inset: 0, zIndex: 200, background: '#000' },
  floatingWrap: {
    position: 'fixed',
    bottom: 70,
    right: 16,
    zIndex: 150,
    width: 240,
    borderRadius: 14,
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
  },
  bubble: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'var(--gd-gold)',
    padding: '10px 10px 10px 14px',
  },
  bubbleInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
    flex: 1,
    cursor: 'pointer',
  },
  bubbleDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#d63b3b',
    flexShrink: 0,
  },
  bubbleText: {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--gd-on-accent)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  iconButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 26,
    borderRadius: 8,
    background: 'rgba(20,32,44,0.15)',
    border: 'none',
    cursor: 'pointer',
    flexShrink: 0,
  },
};
