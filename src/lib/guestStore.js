// Guest mode: using Guardian without an account (Apple Guideline 5.1.1
// requires that non-account features — journaling, Bible reading — work
// without registration). Guest entries live in localStorage on the
// device only. When the person later signs in, entries migrate to their
// real account automatically (see App.jsx) and the flag clears.

const GUEST_FLAG = 'guardian_guest';
const ENTRIES_KEY = 'guardian_guest_entries';

export function isGuest() {
  try {
    return localStorage.getItem(GUEST_FLAG) === 'true';
  } catch {
    return false;
  }
}

export function enterGuest() {
  try { localStorage.setItem(GUEST_FLAG, 'true'); } catch {}
}

export function exitGuest() {
  try { localStorage.removeItem(GUEST_FLAG); } catch {}
}

export function listGuestEntries() {
  try {
    return JSON.parse(localStorage.getItem(ENTRIES_KEY) || '[]');
  } catch {
    return [];
  }
}

function save(entries) {
  try { localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries)); } catch {}
}

export function createGuestEntry({ type = 'note', title = '', content = '' }) {
  const entries = listGuestEntries();
  const entry = {
    id: `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    title: title || null,
    content,
    created_at: new Date().toISOString(),
  };
  entries.unshift(entry);
  save(entries);
  return entry;
}

export function updateGuestEntry(id, patch) {
  const entries = listGuestEntries().map((e) => (e.id === id ? { ...e, ...patch } : e));
  save(entries);
}

export function deleteGuestEntry(id) {
  save(listGuestEntries().filter((e) => e.id !== id));
}

export function clearGuestEntries() {
  try { localStorage.removeItem(ENTRIES_KEY); } catch {}
}
