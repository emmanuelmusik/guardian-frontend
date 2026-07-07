import { supabase } from './supabaseClient';

const API_BASE = import.meta.env.VITE_API_BASE;

// The backend can take a while to respond to its very first request
// after sitting idle (a cold start) — long enough that a shorter
// timeout would misfire on something that's actually still working.
const TIMEOUT_MS = 25000;

function timeoutSignal(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

// Wraps fetch to the Guardian backend, attaching the current user's
// Supabase access token so requireAuth on the server can verify it.
// If the server rejects the token as expired, this tries refreshing
// the session once and retrying — a token going stale (e.g. after the
// phone puts the tab to sleep for a while) is normal and recoverable;
// it shouldn't require a manual retry that can never actually work.
export async function apiFetch(path, options = {}, _isRetry = false) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  const { signal, clear } = timeoutSignal(TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error("This is taking longer than expected — the server may be waking up. Please try again in a moment.");
    }
    throw new Error('Could not reach the server. Check your connection and try again.');
  } finally {
    clear();
  }

  if (response.status === 401 && !_isRetry) {
    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
    if (!refreshError && refreshed?.session) {
      return apiFetch(path, options, true);
    }
    const sessionError = new Error('Your session has expired. Please sign in again.');
    sessionError.isSessionExpired = true;
    throw sessionError;
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

// Downloads a binary file response (e.g. a generated PDF), triggering
// the browser's normal save dialog, rather than parsing it as JSON.
export async function apiDownloadFile(path, filename) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  const response = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Download failed: ${response.status}`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Multipart upload to the Guardian backend (files can't go through
// JSON, so this skips the Content-Type header and sends FormData).
export async function apiUpload(path, file) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Upload failed: ${response.status}`);
  }

  return response.json();
}
