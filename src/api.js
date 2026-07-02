import { supabase } from './supabaseClient';

const API_BASE = import.meta.env.VITE_API_BASE;

// Wraps fetch to the Guardian backend, attaching the current user's
// Supabase access token so requireAuth on the server can verify it.
export async function apiFetch(path, options = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}
