import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api';
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

      {passage && !loading && (
        <div style={styles.card}>
          <p style={styles.reference}>{passage.reference} · {passage.translation_name}</p>
          {passage.verses ? (
            passage.verses.map((v) => (
              <p
                key={v.verse}
                onClick={() => setSelectedVerse(v.verse === selectedVerse ? null : v.verse)}
                style={{
                  ...styles.verse,
                  ...(selectedVerse === v.verse ? styles.verseSelected : {}),
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
    </div>
  );
}

const styles = {
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
