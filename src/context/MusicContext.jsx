import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const [current, setCurrent] = useState(null); // { id, title, url }
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [isPlaying, current]);

  function play(material) {
    if (current?.id === material.id) {
      setIsPlaying((p) => !p);
    } else {
      setCurrent(material);
      setIsPlaying(true);
    }
  }

  function stop() {
    setIsPlaying(false);
    setCurrent(null);
  }

  return (
    <MusicContext.Provider value={{ current, isPlaying, play, stop }}>
      {children}
      {current && (
        <audio ref={audioRef} src={current.url} onEnded={() => setIsPlaying(false)} />
      )}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  return useContext(MusicContext) || { current: null, isPlaying: false, play: () => {}, stop: () => {} };
}
