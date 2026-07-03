import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { apiFetch } from '../api';
import { playCallChime } from '../utils/sound';

const NotificationsContext = createContext(null);

export function NotificationsProvider({ enabled, children }) {
  const [notifications, setNotifications] = useState([]);
  const seenIds = useRef(new Set());
  const firstLoad = useRef(true);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function poll() {
      try {
        const data = await apiFetch('/api/notifications');
        if (cancelled) return;

        if (!firstLoad.current) {
          // Anything new since the last poll, that's an unread call-start,
          // gets a chime — a cheap stand-in for a real push notification.
          const newCallStarts = data.filter(
            (n) => !seenIds.current.has(n.id) && n.type === 'call_started' && !n.read
          );
          if (newCallStarts.length > 0) playCallChime();
        }

        data.forEach((n) => seenIds.current.add(n.id));
        firstLoad.current = false;
        setNotifications(data);
      } catch {
        // Quietly skip a failed poll — retried on the next interval
      }
    }

    poll();
    const interval = setInterval(poll, 20000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [enabled]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markRead(id) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await apiFetch(`/api/notifications/${id}`, { method: 'PATCH' });
    } catch {
      // Best-effort — a failed mark-as-read isn't worth surfacing an error for
    }
  }

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext) || { notifications: [], unreadCount: 0, markRead: () => {} };
}
