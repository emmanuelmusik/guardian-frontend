import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { apiFetch } from './api';
import { NotificationsProvider } from './context/NotificationsContext.jsx';
import { CallProvider } from './context/CallContext.jsx';
import Toast from './components/Toast.jsx';
import BottomNav from './components/BottomNav.jsx';
import FloatingCall from './components/FloatingCall.jsx';
import Login from './pages/Login.jsx';
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

function Protected({ session, profile, children }) {
  if (!session) return <Navigate to="/login" />;
  if (!profile?.onboarded || !profile?.username) return <Navigate to="/onboarding" />;
  return children;
}

function AppRoutes({ session, profile, setProfile }) {
  const location = useLocation();
  const inCall = /^\/communities\/[^/]+\/call$/.test(location.pathname);
  const showBottomNav = session && profile?.onboarded && profile?.username && !inCall;

  return (
    <>
      <Routes>
        <Route path="/login" element={session ? <Navigate to="/" /> : <Login />} />
        <Route
          path="/onboarding"
          element={
            !session ? <Navigate to="/login" /> : (profile?.onboarded && profile?.username) ? <Navigate to="/" /> : <Onboarding profile={profile} onComplete={setProfile} />
          }
        />
        <Route path="/" element={<Protected session={session} profile={profile}><Journal session={session} profile={profile} /></Protected>} />
        <Route path="/admin/materials" element={<Protected session={session} profile={profile}><AdminMaterials profile={profile} /></Protected>} />
        <Route path="/settings" element={<Protected session={session} profile={profile}><Settings profile={profile} onUpdate={setProfile} /></Protected>} />
        <Route path="/communities" element={<Protected session={session} profile={profile}><Communities profile={profile} /></Protected>} />
        <Route path="/communities/:id" element={<Protected session={session} profile={profile}><CommunityDetail profile={profile} /></Protected>} />
        <Route path="/communities/:id/call" element={<Protected session={session} profile={profile}><CommunityCall /></Protected>} />
        <Route path="/mentorship" element={<Protected session={session} profile={profile}><Mentorship profile={profile} /></Protected>} />
        <Route path="/mentor-inbox" element={<Protected session={session} profile={profile}><MentorInbox profile={profile} /></Protected>} />
        <Route path="/peer-inbox" element={<Protected session={session} profile={profile}><PeerInbox profile={profile} /></Protected>} />
        <Route path="/bible" element={<Protected session={session} profile={profile}><Bible profile={profile} /></Protected>} />
        <Route path="/materials" element={<Protected session={session} profile={profile}><Materials profile={profile} /></Protected>} />
        <Route path="/find-people" element={<Protected session={session} profile={profile}><FindPeople profile={profile} /></Protected>} />
        <Route path="/faq" element={<Protected session={session} profile={profile}><FAQ profile={profile} /></Protected>} />
        <Route path="/profile/:id" element={<Protected session={session} profile={profile}><Profile profile={profile} /></Protected>} />
        <Route path="/messages" element={<Protected session={session} profile={profile}><Messages profile={profile} /></Protected>} />
        <Route path="/messages/:userId" element={<Protected session={session} profile={profile}><MessageThread profile={profile} /></Protected>} />
        <Route path="/shared-with-you" element={<Protected session={session} profile={profile}><SharedWithYou profile={profile} /></Protected>} />
      </Routes>
      <FloatingCall />
      {showBottomNav && <BottomNav profile={profile} />}
    </>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(undefined);
  const [welcomeMessage, setWelcomeMessage] = useState(null);
  const justSignedIn = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === 'SIGNED_IN') justSignedIn.current = true;
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      apiFetch('/api/profile').then(setProfile).catch(() => setProfile(null));
    } else if (session === null) {
      setProfile(null);
    }
  }, [session]);

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

  if (session === undefined || (session && profile === undefined)) {
    return <div className="gd-loading">Keeping watch…</div>;
  }

  return (
    <NotificationsProvider enabled={!!session}>
      <CallProvider>
        <Toast message={welcomeMessage} onDismiss={() => setWelcomeMessage(null)} />
        <BrowserRouter>
          <AppRoutes session={session} profile={profile} setProfile={setProfile} />
        </BrowserRouter>
      </CallProvider>
    </NotificationsProvider>
  );
}
