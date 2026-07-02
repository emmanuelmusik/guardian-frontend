import React, { useRef, useState } from 'react';

const TYPES = [
  { value: 'dream', label: 'Dream' },
  { value: 'vision', label: 'Vision' },
  { value: 'intuition', label: 'Intuition' },
  { value: 'note', label: 'Note' },
];

export default function NewEntryForm({ onCreate }) {
  const [type, setType] = useState('note');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [listening, setListening] = useState(false);
  const [saving, setSaving] = useState(false);
  const recognitionRef = useRef(null);

  function toggleVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input isn\'t supported in this browser. Try Chrome or Safari.');
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(' ');
      setContent((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    try {
      await onCreate({ type, title: title.trim() || null, content, visibility: 'private' });
      setTitle('');
      setContent('');
      setType('note');
    } finally {
      setSaving(false);
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
        rows={4}
        style={styles.textarea}
      />

      <div style={styles.row}>
        <button
          type="button"
          onClick={toggleVoice}
          style={{ ...styles.iconButton, ...(listening ? styles.iconButtonActive : {}) }}
        >
          {listening ? '● Listening…' : '🎙 Speak instead'}
        </button>
        <button type="submit" disabled={saving || !content.trim()} style={styles.submit}>
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
  submit: {
    marginLeft: 'auto',
    background: 'var(--gd-gold)',
    border: 'none',
    borderRadius: 8,
    padding: '10px 20px',
    color: 'var(--gd-void)',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
  },
};
