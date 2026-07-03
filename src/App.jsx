import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { apiFetch } from './api';
import Login from './pages/Login.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Journal from './pages/Journal.jsx';

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
              <Journal session={session} />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

