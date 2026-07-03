import React, { useEffect } from 'react';

// A brief, auto-dismissing banner — used for the welcome-back message.
export default function Toast({ message, onDismiss, duration = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  if (!message) return null;

  return (
    <div style={styles.wrap}>
      <p style={styles.text}>{message}</p>
    </div>
  );
}

const styles = {
  wrap: {
    position: 'fixed',
    top: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    background: 'var(--gd-surface)',
    border: '1px solid var(--gd-gold-dim)',
    borderRadius: 'var(--gd-radius)',
    padding: '12px 20px',
    boxShadow: '0 8px 24px rgba(20,32,44,0.15)',
  },
  text: {
    margin: 0,
    fontSize: 14,
    color: 'var(--gd-text)',
    fontFamily: 'var(--gd-font-display)',
  },
};
