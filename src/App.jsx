import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { apiFetch } from './api';
import { NotificationsProvider } from './context/NotificationsContext.jsx';
import Toast from './components/Toast.jsx';
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

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = signed out
  const [profile, setProfile] = useState(undefined); // undefined = loading, null = signed out
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

  // Welcome toast, shown once right after an actual sign-in (not on
  // every page refresh where a session just gets restored silently).
  useEffect(() => {
    if (profile && justSignedIn.current) {
      setWelcomeMessage(`Welcome back, ${profile.display_name || 'friend'}.`);
      justSignedIn.current = false;
    }
  }, [profile]);

  // Heartbeat: lets other members see this user as "online" while the
  // app is open. Simple polling-based presence, not a live socket.
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
      <Toast message={welcomeMessage} onDismiss={() => setWelcomeMessage(null)} />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={session ? <Navigate to="/" /> : <Login />} />
          <Route
            path="/onboarding"
            element={
              !session ? (
                <Navigate to="/login" />
              ) : profile?.onboarded ? (
                <Navigate to="/" />
              ) : (
                <Onboarding onComplete={setProfile} />
              )
            }
          />
          <Route
            path="/"
            element={
              !session ? (
                <Navigate to="/login" />
              ) : !profile?.onboarded ? (
                <Navigate to="/onboarding" />
              ) : (
                <Journal session={session} profile={profile} />
              )
            }
          />
          <Route
            path="/admin/materials"
            element={
              !session ? (
                <Navigate to="/login" />
              ) : !profile?.onboarded ? (
                <Navigate to="/onboarding" />
              ) : (
                <AdminMaterials profile={profile} />
              )
            }
          />
          <Route
            path="/settings"
            element={
              !session ? (
                <Navigate to="/login" />
              ) : !profile?.onboarded ? (
                <Navigate to="/onboarding" />
              ) : (
                <Settings profile={profile} onUpdate={setProfile} />
              )
            }
          />
          <Route
            path="/communities"
            element={
              !session ? (
                <Navigate to="/login" />
              ) : !profile?.onboarded ? (
                <Navigate to="/onboarding" />
              ) : (
                <Communities profile={profile} />
              )
            }
          />
          <Route
            path="/communities/:id"
            element={
              !session ? (
                <Navigate to="/login" />
              ) : !profile?.onboarded ? (
                <Navigate to="/onboarding" />
              ) : (
                <CommunityDetail profile={profile} />
              )
            }
          />
          <Route
            path="/mentorship"
            element={
              !session ? (
                <Navigate to="/login" />
              ) : !profile?.onboarded ? (
                <Navigate to="/onboarding" />
              ) : (
                <Mentorship profile={profile} />
              )
            }
          />
          <Route
            path="/mentor-inbox"
            element={
              !session ? (
                <Navigate to="/login" />
              ) : !profile?.onboarded ? (
                <Navigate to="/onboarding" />
              ) : (
                <MentorInbox profile={profile} />
              )
            }
          />
          <Route
            path="/bible"
            element={
              !session ? (
                <Navigate to="/login" />
              ) : !profile?.onboarded ? (
                <Navigate to="/onboarding" />
              ) : (
                <Bible profile={profile} />
              )
            }
          />
          <Route
            path="/materials"
            element={
              !session ? (
                <Navigate to="/login" />
              ) : !profile?.onboarded ? (
                <Navigate to="/onboarding" />
              ) : (
                <Materials profile={profile} />
              )
            }
          />
          <Route
            path="/communities/:id/call"
            element={
              !session ? (
                <Navigate to="/login" />
              ) : !profile?.onboarded ? (
                <Navigate to="/onboarding" />
              ) : (
                <CommunityCall />
              )
            }
          />
          <Route
            path="/peer-inbox"
            element={
              !session ? (
                <Navigate to="/login" />
              ) : !profile?.onboarded ? (
                <Navigate to="/onboarding" />
              ) : (
                <PeerInbox profile={profile} />
              )
            }
          />
          <Route
            path="/find-people"
            element={
              !session ? (
                <Navigate to="/login" />
              ) : !profile?.onboarded ? (
                <Navigate to="/onboarding" />
              ) : (
                <FindPeople profile={profile} />
              )
            }
          />
          <Route
            path="/faq"
            element={
              !session ? (
                <Navigate to="/login" />
              ) : !profile?.onboarded ? (
                <Navigate to="/onboarding" />
              ) : (
                <FAQ profile={profile} />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </NotificationsProvider>
  );
}
