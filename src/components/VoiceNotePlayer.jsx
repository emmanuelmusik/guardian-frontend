import React, { useEffect, useRef, useState } from 'react';

const SPEEDS = [1, 1.5, 2];

export default function VoiceNotePlayer({ url, duration = 0, waveform = [] }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const [speedIndex, setSpeedIndex] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    const onEnd = () => { setPlaying(false); setProgress(0); };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnd);
    };
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.pause();
    else audio.play();
    setPlaying(!playing);
  }

  function cycleSpeed() {
    const next = (speedIndex + 1) % SPEEDS.length;
    setSpeedIndex(next);
    if (audioRef.current) audioRef.current.playbackRate = SPEEDS[next];
  }

  const bars = waveform.length ? waveform : Array.from({ length: 30 }, () => 0.3);
  const activeBars = Math.floor(progress * bars.length);
  const mm = String(Math.floor(duration / 60)).padStart(2, '0');
  const ss = String(Math.floor(duration % 60)).padStart(2, '0');

  return (
    <div style={styles.row}>
      <audio ref={audioRef} src={url} preload="metadata" />
      <button type="button" onClick={toggle} style={styles.playButton}>{playing ? '⏸' : '▶'}</button>
      <div style={styles.bars}>
        {bars.map((v, i) => (
          <span
            key={i}
            style={{
              ...styles.bar,
              height: `${Math.max(3, v * 22)}px`,
              opacity: i <= activeBars ? 1 : 0.35,
            }}
          />
        ))}
      </div>
      <span style={styles.time}>{mm}:{ss}</span>
      <button type="button" onClick={cycleSpeed} style={styles.speedButton}>{SPEEDS[speedIndex]}x</button>
    </div>
  );
}

const styles = {
  row: { display: 'flex', alignItems: 'center', gap: 6, minWidth: 200 },
  playButton: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, flexShrink: 0 },
  bars: { display: 'flex', alignItems: 'center', gap: 2, flex: 1, height: 22 },
  bar: { width: 2, background: 'currentColor', borderRadius: 1, display: 'inline-block' },
  time: { fontSize: 11, opacity: 0.8, flexShrink: 0 },
  speedButton: {
    fontSize: 11, background: 'rgba(127,127,127,0.15)', border: 'none', borderRadius: 10,
    padding: '2px 6px', cursor: 'pointer', flexShrink: 0,
  },
};
