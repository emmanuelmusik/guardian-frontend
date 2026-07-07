import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div style={styles.page}>
      <Link to="/" style={styles.back}>← Guardian</Link>
      <h1 style={styles.title}>Privacy Policy</h1>
      <p style={styles.updated}>Last updated: July 2026</p>

      <p style={styles.p}>
        Guardian ("the app") is a journaling and community app for recording dreams, visions,
        and personal reflections, and optionally sharing them with mentors or communities you choose.
        This policy explains what information we collect, how it's used, and the choices you have.
      </p>

      <h2 style={styles.h2}>Information we collect</h2>
      <ul style={styles.ul}>
        <li>Account information from Google Sign-In: your name, email address, and profile photo.</li>
        <li>Content you create: journal entries, comments, community messages, and direct messages.</li>
        <li>Profile details you choose to add: username, bio, and profile photo.</li>
        <li>Basic usage information needed to run the app: when you were last active (used to show "online" status to people you're connected with), and device/browser information for security and debugging.</li>
        <li>Audio and video during calls, processed through our calling provider (LiveKit) to connect you with others — we do not record or store call audio/video ourselves.</li>
      </ul>

      <h2 style={styles.h2}>How we use your information</h2>
      <ul style={styles.ul}>
        <li>To operate the app's core features: your journal, communities, messaging, and calls.</li>
        <li>To show your content only to who you've chosen to share it with (a community, a specific connection, or kept private).</li>
        <li>To send in-app notifications about activity relevant to you (join requests, messages, calls). We do not send email or push notifications.</li>
        <li>To keep the app safe, including reviewing reports of content or user violations.</li>
      </ul>

      <h2 style={styles.h2}>What we don't do</h2>
      <ul style={styles.ul}>
        <li>We do not sell your personal information.</li>
        <li>We do not use your journal content to serve ads — Guardian does not display ads.</li>
        <li>We do not share your private entries with anyone you haven't explicitly chosen to share them with.</li>
      </ul>

      <h2 style={styles.h2}>Third-party services we use</h2>
      <p style={styles.p}>
        Guardian is built on Supabase (database and authentication), Railway (backend hosting),
        Vercel (app hosting), Google (sign-in), and LiveKit (video/audio calls). Each of these
        processes data only as needed to provide their part of the service.
      </p>

      <h2 style={styles.h2}>Your choices and rights</h2>
      <ul style={styles.ul}>
        <li>You can export a copy of your data at any time from Settings.</li>
        <li>You can delete your account and all associated data at any time from Settings — this is permanent and cannot be undone.</li>
        <li>You can block another user, which prevents them from messaging or connecting with you.</li>
        <li>You can report content or users that violate our guidelines.</li>
      </ul>

      <h2 style={styles.h2}>Children's privacy</h2>
      <p style={styles.p}>
        Guardian is not directed at children under 13, and we do not knowingly collect information from them.
      </p>

      <h2 style={styles.h2}>Changes to this policy</h2>
      <p style={styles.p}>
        If this policy changes materially, we'll update the date above and, where appropriate, notify you in the app.
      </p>

      <h2 style={styles.h2}>Contact</h2>
      <p style={styles.p}>
        Questions about this policy or your data can be sent to <a href="mailto:support@example.com" style={styles.link}>support@example.com</a>.
      </p>
    </div>
  );
}

const styles = {
  page: { maxWidth: 680, margin: '0 auto', padding: '48px 24px 80px', color: 'var(--gd-text)' },
  back: { display: 'inline-block', color: 'var(--gd-gold)', fontSize: 13, textDecoration: 'none', marginBottom: 24, fontFamily: 'var(--gd-font-mono)' },
  title: { fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 30, margin: '0 0 6px' },
  updated: { fontSize: 13, color: 'var(--gd-text-dim)', marginBottom: 28 },
  h2: { fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 18, margin: '28px 0 10px' },
  p: { fontSize: 14, lineHeight: 1.7, color: 'var(--gd-text)', marginBottom: 12 },
  ul: { paddingLeft: 20, margin: 0 },
  link: { color: 'var(--gd-violet)' },
};
