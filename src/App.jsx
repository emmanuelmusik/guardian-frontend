import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { apiFetch } from './api';
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
import CommunityCall from './pages/CommunityCall.jsx';

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = signed out
  const [profile, setProfile] = useState(undefined); // undefined = loading, null = signed out

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
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

  if (session === undefined || (session && profile === undefined)) {
    return <div className="gd-loading">Keeping watch…</div>;
  }

  return (
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
              <CommunityDetail />
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
              <MentorInbox />
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
              <Bible />
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
      </Routes>
    </BrowserRouter>
  );
}

