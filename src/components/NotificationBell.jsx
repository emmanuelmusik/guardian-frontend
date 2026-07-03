import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useNotifications } from '../context/NotificationsContext.jsx';

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationBell() {
  const { notifications, unreadCount, markRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleOutsideClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  function handleClick(n) {
    markRead(n.id);
    setOpen(false);
    if (n.link) navigate(n.link);
  }

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <button onClick={() => setOpen((o) => !o)} style={styles.trigger} aria-label="Notifications">
        <Bell size={16} strokeWidth={2} />
        {unreadCount > 0 && <span style={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>
      {open && (
        <div style={styles.dropdown}>
          {notifications.length === 0 && <p style={styles.empty}>No notifications yet.</p>}
          {notifications.map((n) => (
            <button key={n.id} onClick={() => handleClick(n)} style={styles.item}>
              {!n.read && <span style={styles.dot} />}
              <div style={{ flex: 1 }}>
                <p style={styles.itemTitle}>{n.title}</p>
                {n.body && <p style={styles.itemBody}>{n.body}</p>}
                <p style={styles.itemTime}>{timeAgo(n.created_at)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: { position: 'relative', display: 'inline-block' },
  trigger: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    background: 'var(--gd-surface)',
    border: '1px solid var(--gd-line)',
    borderRadius: 8,
    color: 'var(--gd-text)',
    cursor: 'pointer',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    background: 'var(--gd-error)',
    color: '#fff',
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 3px',
  },
  dropdown: {
    position: 'absolute',
    top: '110%',
    right: 0,
    width: 300,
    maxHeight: 360,
    overflowY: 'auto',
    zIndex: 10,
    background: 'var(--gd-surface)',
    border: '1px solid var(--gd-line)',
    borderRadius: 'var(--gd-radius)',
    boxShadow: '0 8px 24px rgba(20,32,44,0.12)',
  },
  empty: { color: 'var(--gd-text-dim)', fontSize: 13, padding: 16, margin: 0 },
  item: {
    display: 'flex',
    gap: 8,
    width: '100%',
    textAlign: 'left',
    padding: '12px 14px',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid var(--gd-line)',
    cursor: 'pointer',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: 'var(--gd-gold)',
    marginTop: 6,
    flexShrink: 0,
  },
  itemTitle: { fontSize: 13, fontWeight: 600, color: 'var(--gd-text)', margin: 0 },
  itemBody: { fontSize: 12, color: 'var(--gd-text-dim)', margin: '2px 0 0' },
  itemTime: { fontSize: 11, fontFamily: 'var(--gd-font-mono)', color: 'var(--gd-text-dim)', margin: '4px 0 0' },
};
