import React from 'react';
import { Play, Pause, X, SkipBack, SkipForward } from 'lucide-react';
import { useMusic } from '../context/MusicContext.jsx';

// Persists across navigation, same pattern as the floating call bubble —
// mounted once at the app level so switching pages doesn't stop playback.
export default function MiniMusicPlayer() {
  const { current, isPlaying, queue, play, playNext, playPrevious, stop } = useMusic();
  if (!current) return null;

  return (
    <div style={styles.bar}>
      {queue.length > 1 && (
        <button onClick={playPrevious} style={styles.skipButton} aria-label="Previous">
          <SkipBack size={15} color="var(--gd-text-dim)" />
        </button>
      )}
      <button onClick={() => play(current)} style={styles.playButton} aria-label={isPlaying ? 'Pause' : 'Play'}>
        {isPlaying ? <Pause size={16} color="var(--gd-on-accent)" /> : <Play size={16} color="var(--gd-on-accent)" />}
      </button>
      {queue.length > 1 && (
        <button onClick={playNext} style={styles.skipButton} aria-label="Next">
          <SkipForward size={15} color="var(--gd-text-dim)" />
        </button>
      )}
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
    gap: 8,
    background: 'var(--gd-surface)',
    borderTop: '1px solid var(--gd-line)',
    padding: '10px 14px',
    maxWidth: 640,
    margin: '0 auto',
    boxShadow: '0 -4px 16px rgba(20,32,44,0.08)',
  },
  skipButton: {
    display: 'flex',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    flexShrink: 0,
    padding: 4,
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
