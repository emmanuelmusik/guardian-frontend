// Self-healing for stale browser caches: every page load (and
// periodically after), fetch version.json — which is never cached —
// and compare its build ID to the one baked into this running bundle.
// If they differ, a newer deploy exists and this copy is stale, so
// reload once with a cache-busting query to pull the fresh version.
//
// This removes the need for users to ever manually clear site data
// when a deploy doesn't reach their browser.

const RELOAD_FLAG = 'gd-version-reloaded';

async function checkVersion() {
  try {
    const response = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) return;
    const { buildId } = await response.json();

    if (buildId && buildId !== __BUILD_ID__) {
      // Guard against a reload loop if something is off (e.g. a CDN
      // serving mismatched files): only auto-reload once per session.
      if (sessionStorage.getItem(RELOAD_FLAG)) return;
      sessionStorage.setItem(RELOAD_FLAG, '1');
      window.location.replace(`${window.location.pathname}?fresh=${Date.now()}`);
    } else {
      sessionStorage.removeItem(RELOAD_FLAG);
    }
  } catch {
    // Offline or transient failure — try again on the next interval
  }
}

export function startVersionCheck() {
  checkVersion();
  // Re-check when the app is brought back to the foreground, which is
  // exactly when people "reopen" a stale tab on mobile
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkVersion();
  });
  setInterval(checkVersion, 5 * 60 * 1000);
}
