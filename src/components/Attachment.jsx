import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Attachment({ path, type }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    supabase.storage
      .from('community-media')
      .createSignedUrl(path, 3600) // expires in 1 hour — re-fetched each time the page loads
      .then(({ data }) => {
        if (!cancelled && data) setUrl(data.signedUrl);
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

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
