import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase, isNativeApp } from './supabaseClient';
import { apiFetch } from './api';
import { NotificationsProvider } from './context/NotificationsContext.jsx';
import { CallProvider } from './context/CallContext.jsx';
import { MusicProvider } from './context/MusicContext.jsx';
import Toast from './components/Toast.jsx';
import BottomNav from './components/BottomNav.jsx';
import FloatingCall from './components/FloatingCall.jsx';
import MiniMusicPlayer from './components/MiniMusicPlayer.jsx';
import Login from './pages/Login.jsx';
import GuestJournal from './pages/GuestJournal.jsx';
import GuestGate from './pages/GuestGate.jsx';
import { isGuest, enterGuest, exitGuest, listGuestEntries, clearGuestEntries } from './lib/guestStore';
import Onboarding from './pages/Onboarding.jsx';
import Journal from './pages/Journal.jsx';
import Settings from './pages/Settings.jsx';
import Communities from './pages/Communities.jsx';
import CommunityDetail from './pages/CommunityDetail.jsx';
import Mentorship from './pages/Mentorship.jsx';
import MentorInbox from './pages/MentorInbox.jsx';
import AdminMaterials from './pages/AdminMaterials.jsx';
import Bible from './pages/Bible.jsx';
import Materials from './pages/Materials.jsx';
import CommunityCall from './pages/CommunityCall.jsx';
import PeerInbox from './pages/PeerInbox.jsx';
import FindPeople from './pages/FindPeople.jsx';
import FAQ from './pages/FAQ.jsx';
import Profile from './pages/Profile.jsx';
import Messages from './pages/Messages.jsx';
import MessageThread from './pages/MessageThread.jsx';
import SharedWithYou from './pages/SharedWithYou.jsx';
import PdfViewer from './pages/PdfViewer.jsx';
import PrivacyPolicy from './pages/legal/PrivacyPolicy.jsx';
import TermsOfService from './pages/legal/TermsOfService.jsx';
import Support from './pages/legal/Support.jsx';
import DeleteAccountInfo from './pages/legal/DeleteAccountInfo.jsx';
import PublicFeed from './pages/PublicFeed.jsx';

function Protected({ session, profile, children, guest, onLeaveGuest }) {
  if (!session && guest) return <GuestGate onSignIn={onLeaveGuest} />;
  if (!session) return <Navigate to="/login" />;
  if (!profile?.onboarded || !profile?.username) return <Navigate to="/onboarding" />;
  return children;
}

function AppRoutes({ session, profile, setProfile, guest, onStartGuest, onLeaveGuest }) {
  const location = useLocation();
  const inCall = /^\/communities\/[^/]+\/call$/.test(location.pathname);
  const showBottomNav = (session && profile?.onboarded && profile?.username && !inCall) || (!session && guest && !inCall);

  return (
    <>
      <Routes>
        <Route path="/login" element={(session || guest) ? <Navigate to="/" /> : <Login onGuest={onStartGuest} />} />
        <Route
          path="/onboarding"
          element={
            !session ? <Navigate to="/login" /> : (profile?.onboarded && profile?.username) ? <Navigate to="/" /> : <Onboarding profile={profile} onComplete={setProfile} />
          }
        />
        <Route path="/" element={
          session
            ? <Protected session={session} profile={profile}><Journal session={session} profile={profile} /></Protected>
            : guest
              ? <GuestJournal onSignIn={onLeaveGuest} />
              : <Navigate to="/login" />
        } />
        <Route path="/admin/materials" element={<Protected session={session} profile={profile} guest={guest} onLeaveGuest={onLeaveGuest}><AdminMaterials profile={profile} /></Protected>} />
        <Route path="/settings" element={<Protected session={session} profile={profile} guest={guest} onLeaveGuest={onLeaveGuest}><Settings profile={profile} onUpdate={setProfile} /></Protected>} />
        <Route path="/communities" element={<Protected session={session} profile={profile} guest={guest} onLeaveGuest={onLeaveGuest}><Communities profile={profile} /></Protected>} />
        <Route path="/communities/:id" element={<Protected session={session} profile={profile} guest={guest} onLeaveGuest={onLeaveGuest}><CommunityDetail profile={profile} /></Protected>} />
        <Route path="/communities/:id/call" element={<Protected session={session} profile={profile} guest={guest} onLeaveGuest={onLeaveGuest}><CommunityCall /></Protected>} />
        <Route path="/mentorship" element={<Protected session={session} profile={profile} guest={guest} onLeaveGuest={onLeaveGuest}><Mentorship profile={profile} /></Protected>} />
        <Route path="/mentor-inbox" element={<Protected session={session} profile={profile} guest={guest} onLeaveGuest={onLeaveGuest}><MentorInbox profile={profile} /></Protected>} />
        <Route path="/peer-inbox" element={<Protected session={session} profile={profile} guest={guest} onLeaveGuest={onLeaveGuest}><PeerInbox profile={profile} /></Protected>} />
        <Route path="/bible" element={
          session
            ? <Protected session={session} profile={profile}><Bible profile={profile} /></Protected>
            : guest
              ? <Bible profile={null} />
              : <Navigate to="/login" />
        } />
        <Route path="/materials" element={<Protected session={session} profile={profile} guest={guest} onLeaveGuest={onLeaveGuest}><Materials profile={profile} /></Protected>} />
        <Route path="/find-people" element={<Protected session={session} profile={profile} guest={guest} onLeaveGuest={onLeaveGuest}><FindPeople profile={profile} /></Protected>} />
        <Route path="/faq" element={<Protected session={session} profile={profile} guest={guest} onLeaveGuest={onLeaveGuest}><FAQ profile={profile} /></Protected>} />
        <Route path="/profile/:id" element={<Protected session={session} profile={profile} guest={guest} onLeaveGuest={onLeaveGuest}><Profile profile={profile} /></Protected>} />
        <Route path="/messages" element={<Protected session={session} profile={profile} guest={guest} onLeaveGuest={onLeaveGuest}><Messages profile={profile} /></Protected>} />
        <Route path="/messages/:userId" element={<Protected session={session} profile={profile} guest={guest} onLeaveGuest={onLeaveGuest}><MessageThread profile={profile} /></Protected>} />
        <Route path="/shared-with-you" element={<Protected session={session} profile={profile} guest={guest} onLeaveGuest={onLeaveGuest}><SharedWithYou profile={profile} /></Protected>} />
        <Route path="/materials/pdf/:id" element={<Protected session={session} profile={profile} guest={guest} onLeaveGuest={onLeaveGuest}><PdfViewer profile={profile} /></Protected>} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/support" element={<Support />} />
        <Route path="/delete-account" element={<DeleteAccountInfo />} />
        <Route path="/public" element={<Protected session={session} profile={profile} guest={guest} onLeaveGuest={onLeaveGuest}><PublicFeed profile={profile} /></Protected>} />
      </Routes>
      <FloatingCall />
      {!inCall && <MiniMusicPlayer />}
      {showBottomNav && <BottomNav profile={profile} guest={!session && guest} onSignIn={onLeaveGuest} />}
    </>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(undefined);
  const [welcomeMessage, setWelcomeMessage] = useState(null);
  const [guest, setGuest] = useState(isGuest());
  const justSignedIn = useRef(false);

  function startGuest() {
    enterGuest();
    setGuest(true);
  }

  function leaveGuest() {
    exitGuest();
    setGuest(false);
  }

  // When a guest signs in, move their on-device entries into their real
  // account, then clear the local copies and the guest flag.
  useEffect(() => {
    if (!session) return;
    const guestEntries = listGuestEntries();
    if (guestEntries.length === 0) {
      exitGuest();
      setGuest(false);
      return;
    }
    (async () => {
      for (const entry of guestEntries) {
        try {
          await apiFetch('/api/entries', {
            method: 'POST',
            body: JSON.stringify({
              type: entry.type,
              title: entry.title,
              content: entry.content,
              visibility: 'private',
            }),
          });
        } catch {
          // Leave the local copy in place if migration fails — retried next sign-in
          return;
        }
      }
      clearGuestEntries();
      exitGuest();
      setGuest(false);
    })();
  }, [session]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === 'SIGNED_IN') justSignedIn.current = true;
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Native apps only: OAuth sign-in happens out in the system browser
  // (Google requires this), then Supabase redirects to the app's own
  // deep link (love.guardian.app://auth-callback). This listener catches
  // that link when Android/iOS reopens the app, and exchanges the
  // returned code for a real session — completing sign-in *inside* the
  // app instead of stranding it in Chrome/Safari.
  useEffect(() => {
    if (!isNativeApp()) return;
    const appPlugin = window.Capacitor?.Plugins?.App;
    const browserPlugin = window.Capacitor?.Plugins?.Browser;

    const listeners = [];

    // Handles the auth-callback deep link. Also ALWAYS closes the in-app
    // browser sheet afterward — leaving it open made the app appear
    // frozen after sign-in (the session was set behind a sheet that
    // never dismissed).
    async function handleAuthUrl(url) {
      if (!url || !url.startsWith('love.guardian.app://auth-callback')) return;
      try {
        const codeMatch = url.match(/[?&]code=([^&#]+)/);
        if (codeMatch) {
          await supabase.auth.exchangeCodeForSession(decodeURIComponent(codeMatch[1]));
        } else {
          const tokenMatch = url.match(/access_token=([^&]+).*refresh_token=([^&]+)/);
          if (tokenMatch) {
            await supabase.auth.setSession({
              access_token: decodeURIComponent(tokenMatch[1]),
              refresh_token: decodeURIComponent(tokenMatch[2]),
            });
          }
        }
      } catch {
        // Fall through — closing the sheet still matters even on failure
      }
      try { await browserPlugin?.close?.(); } catch {}
    }

    // Deep link handler — catches the auth-callback URL on both platforms
    if (appPlugin) {
      const p = appPlugin.addListener('appUrlOpen', ({ url }) => handleAuthUrl(url));
      listeners.push(p);

      // Cold-start case: if the app was launched BY the deep link (e.g.
      // it was terminated during sign-in), the listener above never
      // fires — the URL arrives as the launch URL instead.
      appPlugin.getLaunchUrl?.().then((result) => {
        if (result?.url) handleAuthUrl(result.url);
      }).catch(() => {});
    }

    // On iOS, also try to refresh the session when the in-app browser
    // (SFSafariViewController) closes — catches cases where the deep
    // link fires before the listener is ready.
    if (browserPlugin) {
      const p = browserPlugin.addListener('browserFinished', async () => {
        const { data } = await supabase.auth.getSession();
        if (!data?.session) {
          await supabase.auth.refreshSession().catch(() => {});
        }
      });
      listeners.push(p);
    }

    return () => {
      listeners.forEach((p) => p.then((l) => l.remove()).catch(() => {}));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [profileError, setProfileError] = useState(null);
  const profileRetries = useRef(0);

  async function loadProfile() {
    try {
      const data = await apiFetch('/api/profile');
      setProfile(data);
      setProfileError(null);
      profileRetries.current = 0;
    } catch (err) {
      if (err.isSessionExpired) {
        // The refresh attempt inside apiFetch already failed, so there's
        // nothing left to retry — sign out cleanly and let them sign
        // back in, rather than showing a dead-end error.
        await supabase.auth.signOut();
        return;
      }
      if (profileRetries.current < 3) {
        profileRetries.current += 1;
        setTimeout(loadProfile, profileRetries.current * 1500);
      } else {
        setProfileError(err.message);
      }
    }
  }

  useEffect(() => {
    if (session) {
      profileRetries.current = 0;
      loadProfile();
    } else if (session === null) {
      setProfile(null);
      setProfileError(null);
    }
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (profile && justSignedIn.current) {
      setWelcomeMessage(`Welcome back, ${profile.display_name || 'friend'}.`);
      justSignedIn.current = false;
    }
  }, [profile]);

  useEffect(() => {
    if (!session) return;
    apiFetch('/api/profile/heartbeat', { method: 'POST' }).catch(() => {});
    const interval = setInterval(() => {
      apiFetch('/api/profile/heartbeat', { method: 'POST' }).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [session]);

  if (session && profileError) {
    return (
      <div className="gd-loading">
        <p style={{ marginBottom: 16 }}>Couldn't load your profile. {profileError}</p>
        <button
          onClick={() => {
            setProfileError(null);
            profileRetries.current = 0;
            loadProfile();
          }}
          style={{
            background: 'var(--gd-gold)', border: 'none', borderRadius: 8, padding: '10px 20px',
            color: 'var(--gd-on-accent)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  if (session === undefined || (session && profile === undefined)) {
    return <div className="gd-loading">Keeping watch…</div>;
  }

  return (
    <NotificationsProvider enabled={!!session}>
      <CallProvider>
        <MusicProvider>
          <Toast message={welcomeMessage} onDismiss={() => setWelcomeMessage(null)} />
          <BrowserRouter>
            <AppRoutes session={session} profile={profile} setProfile={setProfile} guest={guest} onStartGuest={startGuest} onLeaveGuest={leaveGuest} />
          </BrowserRouter>
        </MusicProvider>
      </CallProvider>
    </NotificationsProvider>
  );
}
