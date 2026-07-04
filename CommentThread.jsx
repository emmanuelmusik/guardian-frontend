import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';

export default function Attachment({ path, type }) {
  const [url, setUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  // The community id is the first folder segment of the storage path,
  // e.g. "abc-123/uuid-photo.png" -> "abc-123"
  const communityId = path.split('/')[0];

  useEffect(() => {
    let cancelled = false;
    apiFetch(`/api/communities/${communityId}/media-url?path=${encodeURIComponent(path)}`)
      .then((data) => {
        if (!cancelled) setUrl(data.url);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (failed) return <p style={styles.loading}>Attachment unavailable.</p>;
  if (!url) return <p style={styles.loading}>Loading attachment…</p>;

  if (type === 'image') return <img src={url} alt="Shared attachment" style={styles.media} />;
  if (type === 'video') return <video src={url} controls style={styles.media} />;
  if (type === 'audio') return <audio src={url} controls style={styles.audio} />;
  return null;
}

const styles = {
  media: {
    maxWidth: '100%',
    borderRadius: 8,
    marginTop: 8,
    display: 'block',
  },
  audio: {
    width: '100%',
    marginTop: 8,
  },
  loading: {
    fontSize: 12,
    color: 'var(--gd-text-dim)',
    marginTop: 8,
  },
};
