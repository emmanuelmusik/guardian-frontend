import React from 'react';
import { Play, Pause, X } from 'lucide-react';
import { useMusic } from '../context/MusicContext.jsx';

// Persists across navigation, same pattern as the floating call bubble —
// mounted once at the app level so switching pages doesn't stop playback.
export default function MiniMusicPlayer() {
  const { current, isPlaying, play, stop } = useMusic();
  if (!current) return null;

  return (
    <div style={styles.bar}>
      <button onClick={() => play(current)} style={styles.playButton} aria-label={isPlaying ? 'Pause' : 'Play'}>
        {isPlaying ? <Pause size={16} color="var(--gd-on-accent)" /> : <Play size={16} color="var(--gd-on-accent)" />}
      </button>
      <span style={styles.title}>{current.title}</span>
      <button onClick={stop} style={styles.closeButton} aria-label="Stop">
        <X size={16} />
      </button>
    </div>
  );
}

const styles = {
  bar: {
    position: 'fixed',
    bottom: 58,
    left: 0,
    right: 0,
    zIndex: 150,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'var(--gd-surface)',
    borderTop: '1px solid var(--gd-line)',
    padding: '10px 16px',
    maxWidth: 640,
    margin: '0 auto',
    boxShadow: '0 -4px 16px rgba(20,32,44,0.08)',
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'var(--gd-gold)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  },
  title: {
    flex: 1,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--gd-text)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: 'var(--gd-text-dim)',
    cursor: 'pointer',
    flexShrink: 0,
    display: 'flex',
  },
};
