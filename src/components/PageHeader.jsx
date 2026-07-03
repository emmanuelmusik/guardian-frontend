import React from 'react';
import { supabase } from '../supabaseClient';
import NavMenu from './NavMenu.jsx';
import NotificationBell from './NotificationBell.jsx';

// Shared header used on every page: title on the left, notifications
// and the dropdown menu (navigation + sign out) top-right, so no page
// is a dead end that only a "back" link can escape.
export default function PageHeader({ title, subtitle, profile }) {
  return (
    <header style={styles.header}>
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
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
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
    fontSize: 30,
    margin: 0,
  },
  subtitle: {
    fontSize: 14,
    color: 'var(--gd-text-dim)',
    marginTop: 10,
    lineHeight: 1.6,
    maxWidth: 440,
  },
};
