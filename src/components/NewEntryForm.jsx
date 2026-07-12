import React, { useEffect, useRef, useState } from 'react';
import ConnectionPicker from './ConnectionPicker.jsx';

const TYPES = [
  { value: 'dream', label: 'Dream' },
  { value: 'vision', label: 'Vision' },
  { value: 'intuition', label: 'Intuition' },
  { value: 'note', label: 'Note' },
];

export default function NewEntryForm({ onCreate, communities = [], connections = [] }) {
  const [type, setType] = useState('note');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [communityId, setCommunityId] = useState(communities[0]?.id || '');
  const [personId, setPersonId] = useState('');
  const [listening, setListening] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [saving, setSaving] = useState(false);
  const recognitionRef = useRef(null);
  const submitLockRef = useRef(false);
  const timerRef = useRef(null);
  const sessionBaseRef = useRef('');
  const sessionFinalRef = useRef('');
  const shouldContinueRef = useRef(false);

  // Browsers' built-in speech recognition doesn't add punctuation on its
  // own, so support saying it explicitly — a standard dictation pattern.
  function applyPunctuationCommands(text) {
    return text
      .replace(/\s*\bnew paragraph\b\s*/gi, '\n\n')
      .replace(/\s*\bnew line\b\s*/gi, '\n')
      .replace(/\s*\bfull stop\b\s*/gi, '. ')
      .replace(/\s*\bperiod\b\s*/gi, '. ')
      .replace(/\s*\bcomma\b\s*/gi, ', ')
      .replace(/\s*\bquestion mark\b\s*/gi, '? ')
      .replace(/\s*\bexclamation (mark|point)\b\s*/gi, '! ')
      .replace(/\s*\bcolon\b\s*/gi, ': ')
      .replace(/\s*\bsemicolon\b\s*/gi, '; ')
      .replace(/[ \t]+([.,!?;:])/g, '$1')
      .replace(/[ \t]{2,}/g, ' ');
  }

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  function startTimer() {
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
  }

  function stopTimer() {
    clearInterval(timerRef.current);
  }

  function formatElapsed(totalSeconds) {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function beginRecognitionSession() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalChunk = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalChunk += `${transcript} `;
        else interim += transcript;
      }
      if (finalChunk) sessionFinalRef.current += finalChunk;

      const combined = applyPunctuationCommands(
        [sessionBaseRef.current, sessionFinalRef.current, interim]
          .filter(Boolean)
          .join(' ')
          .replace(/\s+/g, ' ')
      );
      setContent(combined);
    };

    recognition.onend = () => {
      if (shouldContinueRef.current) {
        // Android's speech recognizer often ends a session after a brief
        // pause even with continuous:true — that's a hiccup, not the
        // person actually wanting to stop, so pick up right where the
        // transcript left off instead of losing it.
        sessionBaseRef.current = `${sessionBaseRef.current} ${sessionFinalRef.current}`.trim();
        sessionFinalRef.current = '';
        beginRecognitionSession();
      } else {
        setListening(false);
        stopTimer();
      }
    };

    recognition.onerror = (event) => {
      // Benign/expected on some Android builds — onend's restart logic
      // (above) handles recovering from these, nothing to surface here.
      if (event.error === 'no-speech' || event.error === 'aborted') return;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function startRecording() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input isn\'t supported in this browser. Try Chrome or Safari.');
      return;
    }

    sessionBaseRef.current = content;
    sessionFinalRef.current = '';
    shouldContinueRef.current = true;

    beginRecognitionSession();
    setListening(true);
    startTimer();
  }

  function stopRecording() {
    shouldContinueRef.current = false;
    recognitionRef.current?.stop();
    setListening(false);
    stopTimer();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim() || submitLockRef.current) return;
    if (visibility === 'person' && !personId) return;
    submitLockRef.current = true;
    setSaving(true);
    try {
      await onCreate({
        type,
        title: title.trim() || null,
        content,
        visibility,
        shared_community_id: visibility === 'community' ? communityId : null,
        shared_with_user_id: visibility === 'person' ? personId : null,
      });
      setTitle('');
      setContent('');
      setType('note');
      setVisibility('private');
      setPersonId('');
    } finally {
      setSaving(false);
      submitLockRef.current = false;
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.row}>
        <select value={type} onChange={(e) => setType(e.target.value)} style={styles.select}>
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <input
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.titleInput}
        />
      </div>

      <textarea
        placeholder="What did you see, hear, or sense?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={9}
        style={styles.textarea}
      />

      <div style={styles.row}>
        <select value={visibility} onChange={(e) => setVisibility(e.target.value)} style={styles.select}>
          <option value="private">Private</option>
          <option value="community" disabled={communities.length === 0}>
            Share with a community
          </option>
          <option value="person" disabled={connections.length === 0}>
            Share with someone
          </option>
        </select>
        {visibility === 'community' && (
          <select value={communityId} onChange={(e) => setCommunityId(e.target.value)} style={styles.select}>
            {communities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {visibility === 'person' && (
        <div style={styles.row}>
          <ConnectionPicker connections={connections} value={personId} onChange={setPersonId} />
        </div>
      )}

      {listening && (
        <div style={styles.recordingBar}>
          <span style={styles.recordingDot} />
          <span style={styles.recordingLabel}>Recording… {formatElapsed(recordingSeconds)}</span>
          <button type="button" onClick={stopRecording} style={styles.stopButton}>Stop</button>
        </div>
      )}
      {listening && (
        <p style={styles.punctuationHint}>
          Say "period", "comma", "question mark", "new line", or "new paragraph" to punctuate.
        </p>
      )}

      <div style={styles.row}>
        {!listening && (
          <button type="button" onClick={startRecording} style={styles.iconButton}>
            🎙 Speak instead
          </button>
        )}
        <button
          type="submit"
          disabled={saving || !content.trim() || (visibility === 'person' && !personId)}
          style={styles.submit}
        >
          {saving ? 'Recording…' : 'Record entry'}
        </button>
      </div>
    </form>
  );
}

const styles = {
  form: {
    background: 'var(--gd-surface)',
    border: '1px solid var(--gd-line)',
    borderRadius: 'var(--gd-radius)',
    padding: 20,
    marginBottom: 32,
  },
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  select: {
    background: 'var(--gd-void)',
    color: 'var(--gd-text)',
    border: '1px solid var(--gd-line)',
    borderRadius: 8,
    padding: '10px 12px',
    fontFamily: 'var(--gd-font-body)',
    fontSize: 14,
  },
  titleInput: {
    flex: 1,
    minWidth: 0,
    boxSizing: 'border-box',
    background: 'var(--gd-void)',
    color: 'var(--gd-text)',
    border: '1px solid var(--gd-line)',
    borderRadius: 8,
    padding: '10px 12px',
    fontFamily: 'var(--gd-font-body)',
    fontSize: 14,
  },
  textarea: {
    width: '100%',
    background: 'var(--gd-void)',
    color: 'var(--gd-text)',
    border: '1px solid var(--gd-line)',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'var(--gd-font-body)',
    fontSize: 14,
    lineHeight: 1.5,
    resize: 'vertical',
  },
  iconButton: {
    background: 'transparent',
    border: '1px solid var(--gd-line)',
    borderRadius: 8,
    padding: '10px 14px',
    color: 'var(--gd-text-dim)',
    fontSize: 13,
    cursor: 'pointer',
  },
  iconButtonActive: {
    borderColor: 'var(--gd-gold)',
    color: 'var(--gd-gold)',
  },
  recordingBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'var(--gd-void)',
    border: '1px solid var(--gd-error)',
    borderRadius: 8,
    padding: '10px 14px',
    marginBottom: 12,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: 'var(--gd-error)',
    animation: 'gd-recording-pulse 1.2s ease-in-out infinite',
    flexShrink: 0,
  },
  recordingLabel: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'var(--gd-font-mono)',
    color: 'var(--gd-text)',
  },
  stopButton: {
    background: 'var(--gd-error)',
    border: 'none',
    borderRadius: 8,
    padding: '6px 16px',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  punctuationHint: {
    fontSize: 11,
    color: 'var(--gd-text-dim)',
    marginTop: -4,
    marginBottom: 12,
  },
  submit: {
    marginLeft: 'auto',
    background: 'var(--gd-gold)',
    border: 'none',
    borderRadius: 8,
    padding: '10px 20px',
    color: 'var(--gd-on-accent)',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
  },
};
