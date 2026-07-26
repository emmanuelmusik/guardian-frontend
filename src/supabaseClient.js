import { createClient } from '@supabase/supabase-js';

// Use the PUBLISHABLE key here, never the secret key — this file ships to the browser.
// PKCE flow is set explicitly because the native apps complete sign-in via a
// deep link back into the app: the auth code returns via that link and gets
// exchanged for a session here, which requires PKCE rather than implicit flow.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: true,
    },
  }
);

// True when running inside the native Android/iOS app (Capacitor injects
// this bridge into the page), false in a regular browser.
export function isNativeApp() {
  return !!window.Capacitor?.isNativePlatform?.();
}

// Where OAuth should land after sign-in: the app's own deep link when
// native (so the session comes back into the app instead of stranding in
// Chrome/Safari), the normal web origin otherwise.
export function authRedirectUrl() {
  return isNativeApp() ? 'love.guardian.app://auth-callback' : window.location.origin;
}
