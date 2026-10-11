// Shared "10:42 AM" / "Yesterday" / "Mar 3" timestamp formatting for
// message bubbles and conversation previews.

export function formatMessageTime(iso) {
  const date = new Date(iso);
  const now = new Date();
  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return time;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday ${time}`;

  const sameYear = date.getFullYear() === now.getFullYear();
  const datePart = date.toLocaleDateString([], sameYear ? { month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' });
  return `${datePart} ${time}`;
}
