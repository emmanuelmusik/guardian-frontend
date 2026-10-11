import React, { useRef, useState, useCallback } from 'react';

// Hold the mic button to record, release to send. Drag/tap the lock that
// appears after ~1s to switch to hands-free recording (keeps going after
// you lift your finger) — closest web equivalent to WhatsApp's slide-to-lock.
// True "recording continues while you background the app" isn't possible
// from a web view without a native plugin, so this only covers
// foreground hold-to-record / lock, which covers the actual feature ask.
export default function VoiceRecorder({ onCancel, onRecorded }) {
  const [recording, setRecording] = useState(false);
  const [locked, setLocked] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [level, setLevel] = useState(0);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const waveformRef = useRef([]);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const timerRef = useRef(null);
  const startedAtRef = useRef(0);

  const MAX_SECONDS = 180; // "3 minutes max" per the product note

  const cleanupAudioGraph = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    audioCtxRef.current?.close?.().catch(() => {});
    audioCtxRef.current = null;
    analyserRef.current = null;
  }, []);

  const sampleLevel = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / data.length); // 0..~1
    setLevel(rms);
    waveformRef.current.push(Number(rms.toFixed(3)));
    rafRef.current = requestAnimationFrame(sampleLevel);
  }, []);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      waveformRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.start();
      mediaRecorderRef.current = recorder;

      startedAtRef.current = Date.now();
      setSeconds(0);
      setRecording(true);
      setLocked(false);

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
        setSeconds(elapsed);
        if (elapsed >= MAX_SECONDS) stop(true);
      }, 250);

      rafRef.current = requestAnimationFrame(sampleLevel);
    } catch {
      onCancel?.('Microphone access was denied or unavailable.');
    }
  }

  function lockNow() {
    setLocked(true);
  }

  function stop(send) {
    clearInterval(timerRef.current);
    cleanupAudioGraph();
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;

    recorder.onstop = () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setRecording(false);
      setLocked(false);

      if (!send) return;
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
      const duration = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
      // Downsample the waveform to ~40 bars so it's cheap to store/render.
      const raw = waveformRef.current;
      const bars = 40;
      const waveform = Array.from({ length: bars }, (_, i) => {
        const start = Math.floor((i / bars) * raw.length);
        const end = Math.max(start + 1, Math.floor(((i + 1) / bars) * raw.length));
        const slice = raw.slice(start, end);
        const avg = slice.length ? slice.reduce((a, b) => a + b, 0) / slice.length : 0;
        return Math.min(1, Number(avg.toFixed(3)));
      });
      onRecorded?.({ blob, duration, waveform });
    };
    recorder.stop();
  }

  function cancel() {
    clearInterval(timerRef.current);
    cleanupAudioGraph();
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = () => streamRef.current?.getTracks().forEach((t) => t.stop());
      recorder.stop();
    } else {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    }
    setRecording(false);
    setLocked(false);
    onCancel?.();
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  if (!recording) {
    return (
      <button
        type="button"
        style={styles.micButton}
        onPointerDown={start}
        onPointerUp={() => !locked && stop(true)}
        onPointerLeave={() => !locked && recording && stop(true)}
        title="Hold to record a voice note"
      >
        🎙️
      </button>
    );
  }

  return (
    <div style={styles.recordingBar}>
      <button type="button" onClick={cancel} style={styles.cancelButton} title="Cancel">✕</button>
      <span style={styles.dot} />
      <span style={styles.timer}>{mm}:{ss}</span>
      <div style={styles.levelMeter}><div style={{ ...styles.levelFill, width: `${Math.min(100, level * 180)}%` }} /></div>
      {!locked ? (
        <button type="button" onClick={lockNow} style={styles.lockButton} title="Lock to keep recording hands-free">🔒</button>
      ) : null}
      <button
        type="button"
        onPointerUp={locked ? undefined : () => stop(true)}
        onClick={locked ? () => stop(true) : undefined}
        style={styles.sendButton}
        title="Send voice note"
      >
        ➤
      </button>
    </div>
  );
}

const styles = {
  micButton: { fontSize: 20, background: 'transparent', border: 'none', cursor: 'pointer', flexShrink: 0 },
  recordingBar: {
    display: 'flex', alignItems: 'center', gap: 8, flex: 1, background: 'var(--gd-surface)',
    border: '1px solid var(--gd-line)', borderRadius: 20, padding: '6px 10px',
  },
  cancelButton: { background: 'transparent', border: 'none', color: 'var(--gd-error)', cursor: 'pointer', fontSize: 14 },
  dot: { width: 8, height: 8, borderRadius: '50%', background: 'var(--gd-error)', flexShrink: 0 },
  timer: { fontSize: 13, fontVariantNumeric: 'tabular-nums', minWidth: 36 },
  levelMeter: { flex: 1, height: 4, background: 'var(--gd-line)', borderRadius: 2, overflow: 'hidden' },
  levelFill: { height: '100%', background: 'var(--gd-gold)' },
  lockButton: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16 },
  sendButton: { background: 'var(--gd-gold)', border: 'none', borderRadius: '50%', width: 28, height: 28, color: 'var(--gd-on-accent)', cursor: 'pointer' },
};
