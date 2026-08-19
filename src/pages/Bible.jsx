import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { isGuest, createGuestEntry } from '../lib/guestStore';
import PageHeader from '../components/PageHeader.jsx';

const VERSIONS = [
  { value: 'kjv', label: 'King James Version' },
  { value: 'web', label: 'World English Bible' },
  { value: 'asv', label: 'American Standard Version' },
  { value: 'bbe', label: 'Bible in Basic English' },
  { value: 'ylt', label: "Young's Literal Translation" },
];

// Standard chapter counts per book — fixed textual structure, same
// across translations of the 66-book Protestant canon.
const OLD_TESTAMENT = [
  ['Genesis', 50], ['Exodus', 40], ['Leviticus', 27], ['Numbers', 36], ['Deuteronomy', 34],
  ['Joshua', 24], ['Judges', 21], ['Ruth', 4], ['1 Samuel', 31], ['2 Samuel', 24],
  ['1 Kings', 22], ['2 Kings', 25], ['1 Chronicles', 29], ['2 Chronicles', 36], ['Ezra', 10],
  ['Nehemiah', 13], ['Esther', 10], ['Job', 42], ['Psalms', 150], ['Proverbs', 31],
  ['Ecclesiastes', 12], ['Song of Solomon', 8], ['Isaiah', 66], ['Jeremiah', 52], ['Lamentations', 5],
  ['Ezekiel', 48], ['Daniel', 12], ['Hosea', 14], ['Joel', 3], ['Amos', 9],
  ['Obadiah', 1], ['Jonah', 4], ['Micah', 7], ['Nahum', 3], ['Habakkuk', 3],
  ['Zephaniah', 3], ['Haggai', 2], ['Zechariah', 14], ['Malachi', 4],
];

const NEW_TESTAMENT = [
  ['Matthew', 28], ['Mark', 16], ['Luke', 24], ['John', 21], ['Acts', 28],
  ['Romans', 16], ['1 Corinthians', 16], ['2 Corinthians', 13], ['Galatians', 6], ['Ephesians', 6],
  ['Philippians', 4], ['Colossians', 4], ['1 Thessalonians', 5], ['2 Thessalonians', 3], ['1 Timothy', 6],
  ['2 Timothy', 4], ['Titus', 3], ['Philemon', 1], ['Hebrews', 13], ['James', 5],
  ['1 Peter', 5], ['2 Peter', 3], ['1 John', 5], ['2 John', 1], ['3 John', 1],
  ['Jude', 1], ['Revelation', 22],
];

const ALL_BOOKS = [...OLD_TESTAMENT, ...NEW_TESTAMENT];
const CHAPTER_COUNT = Object.fromEntries(ALL_BOOKS);

export default function Bible({ profile }) {
  const [book, setBook] = useState('John');
  const [chapter, setChapter] = useState(3);
  const [version, setVersion] = useState('kjv');
  const [passage, setPassage] = useState(null);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  // Verses picked for saving to the journal (a Set of verse numbers).
  // Separate from selectedVerse, which is just the "jump to" highlight.
  const [picked, setPicked] = useState(new Set());
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [draftTitle, setDraftTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const longPressTimer = useRef(null);

  function togglePicked(verseNum) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(verseNum)) next.delete(verseNum);
      else next.add(verseNum);
      return next;
    });
  }

  // Long-press (or right-click on desktop) starts verse selection —
  // a plain tap still just highlights, as before.
  function startLongPress(verseNum) {
    longPressTimer.current = setTimeout(() => togglePicked(verseNum), 450);
  }
  function cancelLongPress() {
    clearTimeout(longPressTimer.current);
  }

  function pickedVersesText() {
    if (!passage?.verses) return '';
    const nums = Array.from(picked).sort((a, b) => a - b);
    const lines = nums.map((n) => {
      const v = passage.verses.find((x) => x.verse === n);
      return v ? `${n}. ${v.text.trim()}` : '';
    }).filter(Boolean);
    const label = nums.length === 1
      ? `${book} ${chapter}:${nums[0]}`
      : `${book} ${chapter}:${nums[0]}-${nums[nums.length - 1]}`;
    return `${lines.join('\n')}\n\n— ${label} (${VERSIONS.find(v => v.value === version)?.label || version})`;
  }

  function openSaveModal() {
    const nums = Array.from(picked).sort((a, b) => a - b);
    const label = nums.length === 1
      ? `${book} ${chapter}:${nums[0]}`
      : `${book} ${chapter}:${nums[0]}-${nums[nums.length - 1]}`;
    setDraftTitle(label);
    setDraftText(pickedVersesText());
    setShowSaveModal(true);
  }

  async function saveToJournal() {
    setSaving(true);
    try {
      if (isGuest()) {
        // Guests keep entries on-device — same as their journal
        createGuestEntry({ type: 'note', title: draftTitle.trim(), content: draftText });
      } else {
        await apiFetch('/api/entries', {
          method: 'POST',
          body: JSON.stringify({
            type: 'note',
            title: draftTitle.trim() || null,
            content: draftText,
            visibility: 'private',
          }),
        });
      }
      setShowSaveModal(false);
      setPicked(new Set());
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Reads the chapter (or just the picked verses, if any) aloud using
  // the device's built-in speech synthesis.
  function toggleSpeech() {
    if (!('speechSynthesis' in window)) {
      alert("Your browser doesn't support reading aloud.");
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const text = picked.size > 0
      ? Array.from(picked).sort((a, b) => a - b)
          .map((n) => passage?.verses?.find((v) => v.verse === n)?.text?.trim())
          .filter(Boolean).join(' ')
      : (passage?.verses || []).map((v) => v.text.trim()).join(' ') || passage?.text || '';
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  // Stop any narration when leaving the page or changing passage
  useEffect(() => {
    return () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); };
  }, []);

  const chapterOptions = useMemo(
    () => Array.from({ length: CHAPTER_COUNT[book] || 1 }, (_, i) => i + 1),
    [book]
  );

  useEffect(() => {
    // Reset chapter if it no longer fits the newly selected book
    if (chapter > (CHAPTER_COUNT[book] || 1)) setChapter(1);
  }, [book]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
  }, [book, chapter, version]); // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    setLoading(true);
    setError(null);
    setSelectedVerse(null);
    setPicked(new Set());
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeaking(false);
    try {
      const ref = `${book} ${chapter}`;
      const data = await apiFetch(`/api/bible/passage?ref=${encodeURIComponent(ref)}&version=${version}`);
      setPassage(data);
    } catch (err) {
      setError(err.message);
      setPassage(null);
    } finally {
      setLoading(false);
    }
  }

  function jumpToVerse(verseNum) {
    setSelectedVerse(verseNum);
    const el = document.getElementById(`verse-${verseNum}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <div style={styles.page}>
      <PageHeader title="Bible" profile={profile} />

      <hr className="gd-horizon" style={{ marginBottom: 24 }} />

      <div style={styles.pickerRow}>
        <select value={book} onChange={(e) => setBook(e.target.value)} style={styles.select}>
          <optgroup label="Old Testament">
            {OLD_TESTAMENT.map(([name]) => <option key={name} value={name}>{name}</option>)}
          </optgroup>
          <optgroup label="New Testament">
            {NEW_TESTAMENT.map(([name]) => <option key={name} value={name}>{name}</option>)}
          </optgroup>
        </select>

        <select value={chapter} onChange={(e) => setChapter(Number(e.target.value))} style={styles.select}>
          {chapterOptions.map((n) => <option key={n} value={n}>Chapter {n}</option>)}
        </select>

        <select value={version} onChange={(e) => setVersion(e.target.value)} style={styles.select}>
          {VERSIONS.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
        </select>
      </div>

      {error && <p style={styles.errorText}>Couldn't load that passage — try a different chapter or version.</p>}
      {loading && <p style={styles.dim}>Loading…</p>}

      {passage && !loading && passage.verses && (
        <div style={styles.pickerRow}>
          <select
            value={selectedVerse || ''}
            onChange={(e) => jumpToVerse(Number(e.target.value))}
            style={styles.select}
          >
            <option value="">Jump to verse…</option>
            {passage.verses.map((v) => (
              <option key={v.verse} value={v.verse}>Verse {v.verse}</option>
            ))}
          </select>
        </div>
      )}

      {passage && !loading && (
        <>
          <div style={styles.toolsRow}>
            <button onClick={toggleSpeech} style={styles.speakButton}>
              {speaking ? '⏹ Stop reading' : '🔊 Read aloud'}
            </button>
          </div>
          <p style={styles.pickHint}>
            Press and hold a verse to select it. Selected verses can be saved to your journal.
          </p>
        </>
      )}

      {passage && !loading && (
        <div style={styles.card}>
          <p style={styles.reference}>{passage.reference} · {passage.translation_name}</p>
          {passage.verses ? (
            passage.verses.map((v) => (
              <p
                key={v.verse}
                id={`verse-${v.verse}`}
                onClick={() => setSelectedVerse(v.verse === selectedVerse ? null : v.verse)}
                onTouchStart={() => startLongPress(v.verse)}
                onTouchEnd={cancelLongPress}
                onTouchMove={cancelLongPress}
                onMouseDown={() => startLongPress(v.verse)}
                onMouseUp={cancelLongPress}
                onMouseLeave={cancelLongPress}
                onContextMenu={(e) => { e.preventDefault(); togglePicked(v.verse); }}
                style={{
                  ...styles.verse,
                  ...(selectedVerse === v.verse ? styles.verseSelected : {}),
                  ...(picked.has(v.verse) ? styles.versePicked : {}),
                }}
              >
                <span style={styles.verseNum}>{v.verse}</span> {v.text.trim()}
              </p>
            ))
          ) : (
            <p style={styles.verse}>{passage.text}</p>
          )}
        </div>
      )}

      {picked.size > 0 && !showSaveModal && (
        <div style={styles.selectionBar}>
          <span style={styles.selectionCount}>
            {picked.size} verse{picked.size === 1 ? '' : 's'} selected
          </span>
          <button onClick={() => setPicked(new Set())} style={styles.clearButton}>Clear</button>
          <button onClick={openSaveModal} style={styles.saveButton}>Add to journal</button>
        </div>
      )}

      {showSaveModal && (
        <div style={styles.overlay} onClick={() => setShowSaveModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Add to your journal</h3>
            <input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="Title"
              style={styles.modalInput}
            />
            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              rows={10}
              style={styles.modalTextarea}
            />
            <p style={styles.modalHint}>
              Edit the text above however you like before saving — add your own thoughts, trim it down, anything.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={saveToJournal} disabled={saving || !draftText.trim()} style={styles.saveButton}>
                {saving ? 'Saving…' : 'Save entry'}
              </button>
              <button onClick={() => setShowSaveModal(false)} style={styles.clearButton}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  toolsRow: { display: 'flex', gap: 8, marginBottom: 10 },
  speakButton: {
    background: 'transparent', border: '1px solid var(--gd-line)', borderRadius: 8,
    padding: '8px 14px', color: 'var(--gd-violet)', fontSize: 13, cursor: 'pointer',
    marginBottom: 10,
  },
  pickHint: { fontSize: 12, color: 'var(--gd-text-dim)', margin: '0 0 12px', fontStyle: 'italic' },
  versePicked: {
    background: 'var(--gd-gold-dim, rgba(232,163,61,0.18))',
    borderRadius: 6,
    boxShadow: 'inset 3px 0 0 var(--gd-gold)',
  },
  selectionBar: {
    position: 'fixed', bottom: 70, left: 16, right: 16, zIndex: 200,
    maxWidth: 608, margin: '0 auto',
    background: 'var(--gd-surface)', border: '1px solid var(--gd-line)',
    borderRadius: 12, padding: '12px 14px',
    display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
    boxShadow: '0 6px 24px rgba(20,32,44,0.16)',
  },
  selectionCount: { flex: 1, fontSize: 13, color: 'var(--gd-text)', fontFamily: 'var(--gd-font-mono)' },
  clearButton: {
    background: 'transparent', border: '1px solid var(--gd-line)', borderRadius: 8,
    padding: '8px 14px', color: 'var(--gd-text-dim)', fontSize: 13, cursor: 'pointer',
  },
  saveButton: {
    background: 'var(--gd-gold)', border: 'none', borderRadius: 8, padding: '8px 16px',
    color: 'var(--gd-on-accent)', fontWeight: 600, fontSize: 13, cursor: 'pointer',
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(20,32,44,0.5)', zIndex: 300,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  modal: {
    background: 'var(--gd-surface)', borderRadius: 'var(--gd-radius)', padding: 20,
    width: '100%', maxWidth: 520, maxHeight: '85vh', overflowY: 'auto',
  },
  modalTitle: {
    fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 18,
    margin: '0 0 14px', color: 'var(--gd-text)',
  },
  modalInput: {
    width: '100%', boxSizing: 'border-box', background: 'var(--gd-void)', color: 'var(--gd-text)',
    border: '1px solid var(--gd-line)', borderRadius: 8, padding: '10px 12px',
    fontSize: 14, marginBottom: 10, fontFamily: 'var(--gd-font-body)',
  },
  modalTextarea: {
    width: '100%', boxSizing: 'border-box', background: 'var(--gd-void)', color: 'var(--gd-text)',
    border: '1px solid var(--gd-line)', borderRadius: 8, padding: '10px 12px',
    fontSize: 14, lineHeight: 1.6, resize: 'vertical', marginBottom: 8,
    fontFamily: 'var(--gd-font-body)',
  },
  modalHint: { fontSize: 12, color: 'var(--gd-text-dim)', margin: '0 0 14px' },
  page: { maxWidth: 640, margin: '0 auto', padding: '48px 24px 80px' },
  pickerRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 },
  select: {
    background: 'var(--gd-surface)', color: 'var(--gd-text)', border: '1px solid var(--gd-line)',
    borderRadius: 8, padding: '10px 12px', fontFamily: 'var(--gd-font-body)', fontSize: 14,
  },
  card: {
    background: 'var(--gd-surface)', border: '1px solid var(--gd-line)',
    borderRadius: 'var(--gd-radius)', padding: 24,
  },
  reference: {
    fontFamily: 'var(--gd-font-mono)', fontSize: 12, letterSpacing: '0.05em',
    textTransform: 'uppercase', color: 'var(--gd-violet)', margin: '0 0 16px',
  },
  verse: {
    fontFamily: 'var(--gd-font-display)', fontSize: 18, lineHeight: 1.8,
    color: 'var(--gd-text)', margin: '0 0 8px', cursor: 'pointer', borderRadius: 6, padding: '2px 6px',
  },
  verseSelected: {
    background: 'var(--gd-surface-raised)',
    boxShadow: '0 0 0 1px var(--gd-gold-dim)',
  },
  verseNum: {
    fontFamily: 'var(--gd-font-mono)', fontSize: 12, color: 'var(--gd-gold)', marginRight: 4,
  },
  dim: { color: 'var(--gd-text-dim)', fontSize: 14 },
  errorText: { color: 'var(--gd-error)', fontSize: 14, marginBottom: 16 },
};
