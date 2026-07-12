import React, { useLayoutEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import NavMenu from './NavMenu.jsx';
import NotificationBell from './NotificationBell.jsx';
import { useHideOnScroll } from '../hooks/useHideOnScroll';

// Shared header used on every page: title on the left, notifications
// and the dropdown menu (navigation + sign out) top-right. Fixed to
// the top of the screen, hides on scroll down and reappears on scroll
// up — same pattern as Instagram's feed header.
export default function PageHeader({ title, subtitle, profile }) {
  const visible = useHideOnScroll();
  const headerRef = useRef(null);
  const [height, setHeight] = useState(84);

  useLayoutEffect(() => {
    if (headerRef.current) setHeight(headerRef.current.offsetHeight);
  }, [title, subtitle]);

  return (
    <>
      <div style={{ height }} />
      <header
        ref={headerRef}
        style={{
          ...styles.header,
          transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        }}
      >
        <div>
          <p style={styles.eyebrow}>Guardian</p>
          <h1 style={styles.heading}>{title}</h1>
          {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
        </div>
        <div style={styles.actions}>
          <NotificationBell />
          <NavMenu isAdmin={profile?.is_admin} onSignOut={() => supabase.auth.signOut()} />
        </div>
      </header>
    </>
  );
}

const styles = {
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px 24px',
    background: 'var(--gd-void)',
    borderBottom: '1px solid var(--gd-line)',
    transition: 'transform 200ms ease',
    maxWidth: 640,
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  actions: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: 'var(--gd-font-mono)',
    fontSize: 12,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--gd-gold)',
    margin: '0 0 6px',
  },
  heading: {
    fontFamily: 'var(--gd-font-display)',
    fontWeight: 500,
    fontSize: 26,
    margin: 0,
  },
  subtitle: {
    fontSize: 14,
    color: 'var(--gd-text-dim)',
    marginTop: 10,
    lineHeight: 1.6,
  },
};
