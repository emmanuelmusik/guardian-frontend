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

// Opens OAuth sign-in correctly in both web and native contexts.
// On iOS/iPadOS, Capacitor's WKWebView blocks external navigation by default,
// so we must get the OAuth URL from Supabase first, then open it via the
// Capacitor Browser plugin (which opens a proper in-app SFSafariViewController)
// rather than trying to navigate the WebView directly, which is what was
// causing the "unresponsive" behavior Apple's reviewer saw on iPad.
export async function signInWithProvider(provider) {
  if (isNativeApp()) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: authRedirectUrl(),
        skipBrowserRedirect: true,
      },
    });
    if (error) throw error;
    if (data?.url) {
      // Use Capacitor's Browser plugin via the global Plugins object —
      // imported this way (not via `import @capacitor/browser`) so Vite
      // doesn't try to bundle a native-only package into the web build.
      const Browser = window.Capacitor?.Plugins?.Browser;
      if (Browser) {
        await Browser.open({ url: data.url });
      } else {
        // Fallback: let the system handle it
        window.location.href = data.url;
      }
    }
  } else {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: authRedirectUrl() },
    });
    if (error) throw error;
  }
}
