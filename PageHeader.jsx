import React, { useRef, useState } from 'react';
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
  const [saving, setSaving] = useState(false);
  const recognitionRef = useRef(null);
  const submitLockRef = useRef(false);

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

    // Snapshot whatever was already typed before speaking started — the
    // browser's transcript is cumulative for the whole session, so each
    // update below replaces (not appends to) what's shown, layered on
    // top of this snapshot only.
    const baseContent = content;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(' ');
      setContent(baseContent ? `${baseContent} ${transcript}` : transcript);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
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

      <div style={styles.row}>
        <button
          type="button"
          onClick={toggleVoice}
          style={{ ...styles.iconButton, ...(listening ? styles.iconButtonActive : {}) }}
        >
          {listening ? '● Listening…' : '🎙 Speak instead'}
        </button>
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
