// Prefer the username people chose for themselves (shown Instagram-style
// with an @), falling back to their display name if they haven't set one.
export function nameFor(profile) {
  if (!profile) return 'Someone';
  return profile.username ? `@${profile.username}` : profile.display_name || 'Someone';
}

// Someone counts as "online" if we've heard from them in the last 2
// minutes — matches the ~30s heartbeat interval with slack for a missed beat.
export function isOnline(lastSeenAt) {
  if (!lastSeenAt) return false;
  return Date.now() - new Date(lastSeenAt).getTime() < 2 * 60 * 1000;
}
