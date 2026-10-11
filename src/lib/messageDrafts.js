// Unsent message text, kept per conversation thread so switching away
// and back (or a dropped connection) never loses what someone was
// typing. Mirrors the localStorage approach used by guestStore.js.

const PREFIX = 'guardian_dm_draft_';

export function getDraft(userId) {
  try {
    return localStorage.getItem(PREFIX + userId) || '';
  } catch {
    return '';
  }
}

export function setDraft(userId, text) {
  try {
    if (text) localStorage.setItem(PREFIX + userId, text);
    else localStorage.removeItem(PREFIX + userId);
  } catch {
    // localStorage can throw (private mode, quota) — a lost draft isn't fatal
  }
}

export function clearDraft(userId) {
  setDraft(userId, '');
}
