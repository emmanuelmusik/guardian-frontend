import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const [queue, setQueue] = useState([]); // [{ id, title, url }]
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const current = queue[currentIndex] || null;

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [isPlaying, current]);

  // Play a track. If a full list is given (e.g. everything in the Music
  // tab), that becomes the queue so playback continues into the next
  // song automatically; otherwise just play this one track on a loop.
  function play(material, list) {
    const playlist = list && list.length ? list : [material];
    const index = playlist.findIndex((m) => m.id === material.id);

    if (current?.id === material.id) {
      setIsPlaying((p) => !p);
      return;
    }

    setQueue(playlist);
    setCurrentIndex(index === -1 ? 0 : index);
    setIsPlaying(true);
  }

  function playNext() {
    if (queue.length === 0) return;
    setCurrentIndex((i) => (i + 1) % queue.length); // loops back to the start
    setIsPlaying(true);
  }

  function playPrevious() {
    if (queue.length === 0) return;
    setCurrentIndex((i) => (i - 1 + queue.length) % queue.length);
    setIsPlaying(true);
  }

  function stop() {
    setIsPlaying(false);
    setQueue([]);
    setCurrentIndex(0);
  }

  return (
    <MusicContext.Provider value={{ current, isPlaying, queue, play, playNext, playPrevious, stop }}>
      {children}
      {current && (
        <audio ref={audioRef} src={current.url} onEnded={playNext} />
      )}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  return (
    useContext(MusicContext) || {
      current: null, isPlaying: false, queue: [],
      play: () => {}, playNext: () => {}, playPrevious: () => {}, stop: () => {},
    }
  );
}
