import { createClient } from '@supabase/supabase-js';

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

export function isNativeApp() {
  return !!window.Capacitor?.isNativePlatform?.();
}

export function authRedirectUrl() {
  return isNativeApp() ? 'love.guardian.app://auth-callback' : window.location.origin;
}

// Opens OAuth sign-in correctly on every platform.
//
// iOS/iPadOS (Apple Guideline 4 — sign-in must not leave the app):
//   1st choice: Capacitor's Browser plugin -> SFSafariViewController,
//   an in-app sheet, returning via the app's deep link.
//   Fallback: run the whole OAuth flow inside the app's own WebView —
//   the auth domains (Google, Apple, Supabase) are in allowNavigation,
//   and the redirect lands back on the site origin where supabase-js
//   completes the session automatically. Either way, the user never
//   leaves the app.
//
// Android: unchanged — the flow that passed Google Play review
//   (system browser + deep link back into the app).
export async function signInWithProvider(provider) {
  const platform = window.Capacitor?.getPlatform?.() || 'web';

  if (platform === 'ios') {
    const Browser = window.Capacitor?.Plugins?.Browser;

    if (Browser) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: 'love.guardian.app://auth-callback',
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;
      if (data?.url) await Browser.open({ url: data.url });
      return;
    }

    // In-WebView flow: redirect back to the site itself, not the deep
    // link — the WebView stays on the OAuth pages (allowed domains) and
    // returns here, where detectSessionInUrl exchanges the code.
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
        skipBrowserRedirect: true,
      },
    });
    if (error) throw error;
    if (data?.url) window.location.href = data.url;
    return;
  }

  if (isNativeApp()) {
    // Android: approved working flow — external browser + deep link back
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: authRedirectUrl(),
        skipBrowserRedirect: true,
      },
    });
    if (error) throw error;
    if (data?.url) {
      const Browser = window.Capacitor?.Plugins?.Browser;
      if (Browser) {
        await Browser.open({ url: data.url });
      } else {
        window.location.href = data.url;
      }
    }
    return;
  }

  // Regular web browser
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: authRedirectUrl() },
  });
  if (error) throw error;
}
