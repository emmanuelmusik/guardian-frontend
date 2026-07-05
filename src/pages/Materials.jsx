import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, Video as VideoIcon, Youtube, BookOpen, Play, Pause } from 'lucide-react';
import { apiFetch } from '../api';
import PageHeader from '../components/PageHeader.jsx';
import { useMusic } from '../context/MusicContext.jsx';

function getYouTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
    if (u.searchParams.get('v')) return u.searchParams.get('v');
    if (u.pathname.startsWith('/embed/')) return u.pathname.split('/embed/')[1];
    return null;
  } catch {
    return null;
  }
}

const TABS = [
  { key: 'music', label: 'Music', Icon: Music },
  { key: 'videos', label: 'Videos', Icon: VideoIcon },
  { key: 'youtube', label: 'YouTube', Icon: Youtube },
  { key: 'pdfs', label: 'PDF Books', Icon: BookOpen },
];

export default function Materials({ profile }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('music');
  const { current, isPlaying, play } = useMusic();

  useEffect(() => {
    apiFetch('/api/featured-materials')
      .then((data) => {
        setMaterials(data);
        const music = data.filter((m) => ['music', 'audiobook', 'voice_note'].includes(m.type));
        const videos = data.filter((m) => m.type === 'video');
        const youtube = data.filter((m) => m.type === 'youtube');
        const pdfs = data.filter((m) => m.type === 'pdf');
        if (music.length === 0) {
          if (videos.length > 0) setActiveTab('videos');
          else if (youtube.length > 0) setActiveTab('youtube');
          else if (pdfs.length > 0) setActiveTab('pdfs');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const music = materials.filter((m) => ['music', 'audiobook', 'voice_note'].includes(m.type));
  const videos = materials.filter((m) => m.type === 'video');
  const youtube = materials.filter((m) => m.type === 'youtube');
  const pdfs = materials.filter((m) => m.type === 'pdf');

  const counts = { music: music.length, videos: videos.length, youtube: youtube.length, pdfs: pdfs.length };

  return (
    <div style={styles.page}>
      <PageHeader
        title="Materials"
        subtitle="The app's featured library — mentors recommend from these into their own communities."
        profile={profile}
      />

      <hr className="gd-horizon" style={{ margin: '24px 0 20px' }} />

      {error && <p style={styles.errorText}>{error}</p>}
      {loading && <p style={styles.dim}>Loading…</p>}

      {!loading && (
        <>
          <div style={styles.tabRow}>
            {TABS.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{ ...styles.tab, ...(activeTab === key ? styles.tabActive : {}) }}
              >
                <Icon size={14} strokeWidth={2} />
                {label} <span style={styles.tabCount}>{counts[key]}</span>
              </button>
            ))}
          </div>

          {materials.length === 0 && <p style={styles.dim}>Nothing in the library yet.</p>}

          {activeTab === 'music' && (
            music.length === 0 ? <p style={styles.dim}>No music yet.</p> :
            music.map((m) => {
              const isThis = current?.id === m.id;
              return (
                <div key={m.id} style={styles.card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <button
                      onClick={() => play({ id: m.id, title: m.title, url: m.url })}
                      style={styles.playButton}
                      aria-label={isThis && isPlaying ? 'Pause' : 'Play'}
                    >
                      {isThis && isPlaying ? <Pause size={18} color="var(--gd-on-accent)" /> : <Play size={18} color="var(--gd-on-accent)" />}
                    </button>
                    <div>
                      <h4 style={styles.cardTitle}>{m.title}</h4>
                      {m.description && <p style={styles.cardDesc}>{m.description}</p>}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {activeTab === 'videos' && (
            videos.length === 0 ? <p style={styles.dim}>No videos yet.</p> :
            videos.map((m) => (
              <div key={m.id} style={styles.card}>
                <h4 style={styles.cardTitle}>{m.title}</h4>
                {m.description && <p style={styles.cardDesc}>{m.description}</p>}
                <video controls src={m.url} style={styles.videoPlayer} preload="metadata" />
              </div>
            ))
          )}

          {activeTab === 'youtube' && (
            youtube.length === 0 ? <p style={styles.dim}>No YouTube videos yet.</p> :
            youtube.map((m) => {
              const videoId = getYouTubeId(m.url);
              return (
                <div key={m.id} style={styles.card}>
                  <h4 style={styles.cardTitle}>{m.title}</h4>
                  {m.description && <p style={styles.cardDesc}>{m.description}</p>}
                  {videoId ? (
                    <div style={styles.youtubeWrap}>
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={m.title}
                        style={styles.youtubeFrame}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <a href={m.url} target="_blank" rel="noreferrer" style={styles.fallbackLink}>Watch on YouTube →</a>
                  )}
                </div>
              );
            })
          )}

          {activeTab === 'pdfs' && (
            pdfs.length === 0 ? <p style={styles.dim}>No PDF books yet.</p> :
            <div style={styles.pdfGrid}>
              {pdfs.map((m) => (
                <Link key={m.id} to={`/materials/pdf/${m.id}`} style={styles.pdfCard}>
                  <div style={styles.pdfCover}>
                    <BookOpen size={28} strokeWidth={1.5} color="var(--gd-gold)" />
                  </div>
                  <h4 style={styles.pdfTitle}>{m.title}</h4>
                  {m.description && <p style={styles.pdfDesc}>{m.description}</p>}
                  <span style={styles.pdfReadLink}>Read →</span>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 640, margin: '0 auto', padding: '48px 24px 140px' },
  tabRow: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  tab: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'var(--gd-surface)', border: '1px solid var(--gd-line)', borderRadius: 20,
    padding: '7px 14px', fontSize: 13, color: 'var(--gd-text-dim)', cursor: 'pointer',
  },
  tabActive: { borderColor: 'var(--gd-gold)', color: 'var(--gd-text)', background: 'var(--gd-surface-raised)' },
  tabCount: { fontFamily: 'var(--gd-font-mono)', fontSize: 11, color: 'var(--gd-gold)' },
  card: {
    background: 'var(--gd-surface)', border: '1px solid var(--gd-line)',
    borderRadius: 'var(--gd-radius)', padding: 18, marginBottom: 14,
  },
  cardTitle: { fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 16, margin: '0 0 4px', color: 'var(--gd-text)' },
  cardDesc: { fontSize: 13, color: 'var(--gd-text-dim)', margin: 0, lineHeight: 1.5 },
  playButton: {
    width: 44, height: 44, borderRadius: '50%', background: 'var(--gd-gold)', border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
  },
  videoPlayer: { width: '100%', borderRadius: 8, background: '#000', display: 'block' },
  youtubeWrap: { position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 8, overflow: 'hidden' },
  youtubeFrame: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' },
  fallbackLink: { color: 'var(--gd-violet)', fontSize: 13, textDecoration: 'none' },
  pdfGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14 },
  pdfCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
    background: 'var(--gd-surface)', border: '1px solid var(--gd-line)', borderRadius: 'var(--gd-radius)',
    padding: '20px 14px', textDecoration: 'none',
  },
  pdfCover: {
    width: 56, height: 56, borderRadius: 12, background: 'var(--gd-void)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  pdfTitle: { fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 14, color: 'var(--gd-text)', margin: '0 0 4px' },
  pdfDesc: { fontSize: 11, color: 'var(--gd-text-dim)', margin: '0 0 10px', lineHeight: 1.4 },
  pdfReadLink: { fontSize: 11, color: 'var(--gd-gold)', fontFamily: 'var(--gd-font-mono)', textTransform: 'uppercase' },
  dim: { color: 'var(--gd-text-dim)', fontSize: 14 },
  errorText: { color: 'var(--gd-error)', fontSize: 14, marginBottom: 16 },
};
