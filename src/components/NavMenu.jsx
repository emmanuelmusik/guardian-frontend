import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Settings as SettingsIcon, Users, Compass, BookOpen, Library, Shield, LogOut, Search, NotebookPen } from 'lucide-react';

const ITEMS = [
  { to: '/', label: 'Journal', Icon: NotebookPen },
  { to: '/settings', label: 'Settings', Icon: SettingsIcon },
  { to: '/communities', label: 'My Community', Icon: Users },
  { to: '/mentorship', label: 'Fellowship', Icon: Compass },
  { to: '/find-people', label: 'Find People', Icon: Search },
  { to: '/bible', label: 'Bible', Icon: BookOpen },
  { to: '/materials', label: 'Materials', Icon: Library },
];

export default function NavMenu({ isAdmin, onSignOut }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const items = isAdmin ? [...ITEMS, { to: '/admin/materials', label: 'Admin', Icon: Shield }] : ITEMS;

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <button onClick={() => setOpen((o) => !o)} style={styles.trigger}>
        <Menu size={16} strokeWidth={2} />
        Menu
      </button>
      {open && (
        <div style={styles.dropdown}>
          {items.map(({ to, label, Icon }) => (
            <Link key={to} to={to} style={styles.item} onClick={() => setOpen(false)}>
              <Icon size={15} strokeWidth={2} />
              {label}
            </Link>
          ))}
          <div style={styles.divider} />
          <button
            style={styles.signOutItem}
            onClick={() => {
              setOpen(false);
              onSignOut?.();
            }}
          >
            <LogOut size={15} strokeWidth={2} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: { position: 'relative', display: 'inline-block' },
  trigger: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'var(--gd-surface)',
    border: '1px solid var(--gd-line)',
    borderRadius: 8,
    padding: '8px 14px',
    color: 'var(--gd-text)',
    fontSize: 13,
    cursor: 'pointer',
  },
  dropdown: {
    position: 'absolute',
    top: '110%',
    right: 0,
    minWidth: 200,
    zIndex: 10,
    background: 'var(--gd-surface)',
    border: '1px solid var(--gd-line)',
    borderRadius: 'var(--gd-radius)',
    boxShadow: '0 8px 24px rgba(20,32,44,0.12)',
    overflow: 'hidden',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    color: 'var(--gd-text)',
    fontSize: 14,
    textDecoration: 'none',
  },
  divider: {
    height: 1,
    background: 'var(--gd-line)',
    margin: '4px 0',
  },
  signOutItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: 'var(--gd-error)',
    fontSize: 14,
    fontFamily: 'var(--gd-font-body)',
    textAlign: 'left',
    cursor: 'pointer',
  },
};
