import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Users, MessageCircle, User, BookOpen, LogIn } from 'lucide-react';

// Instagram-style fixed bottom tab bar for primary navigation.
// Less-frequent destinations (Settings, Bible, Materials, Mentorship,
// FAQ) stay in the top-right dropdown menu instead of competing for
// space down here.
export default function BottomNav({ profile, guest, onSignIn }) {
  if (guest) {
    return (
      <nav style={styles.nav}>
        <NavLink to="/" end style={({ isActive }) => ({ ...styles.item, color: isActive ? 'var(--gd-gold)' : 'var(--gd-text-dim)' })}>
          <Home size={24} strokeWidth={1.8} />
        </NavLink>
        <NavLink to="/bible" style={({ isActive }) => ({ ...styles.item, color: isActive ? 'var(--gd-gold)' : 'var(--gd-text-dim)' })}>
          <BookOpen size={24} strokeWidth={1.8} />
        </NavLink>
        <button onClick={onSignIn} style={{ ...styles.item, background: 'transparent', border: 'none', color: 'var(--gd-text-dim)', cursor: 'pointer' }}>
          <LogIn size={24} strokeWidth={1.8} />
        </button>
      </nav>
    );
  }

  const items = [
    { to: '/', Icon: Home, exact: true },
    { to: '/find-people', Icon: Search },
    { to: '/communities', Icon: Users },
    { to: '/messages', Icon: MessageCircle },
    { to: profile?.id ? `/profile/${profile.id}` : '/settings', Icon: User },
  ];

  return (
    <nav style={styles.nav}>
      {items.map(({ to, Icon, exact }) => (
        <NavLink
          key={to}
          to={to}
          end={exact}
          style={({ isActive }) => ({
            ...styles.item,
            color: isActive ? 'var(--gd-gold)' : 'var(--gd-text-dim)',
          })}
        >
          <Icon size={24} strokeWidth={1.8} />
        </NavLink>
      ))}
    </nav>
  );
}

const styles = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 58,
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    background: 'var(--gd-surface)',
    borderTop: '1px solid var(--gd-line)',
    maxWidth: 640,
    margin: '0 auto',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    textDecoration: 'none',
  },
};
