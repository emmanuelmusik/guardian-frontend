import React from 'react';
import PageHeader from '../components/PageHeader.jsx';

const SECTIONS = [
  {
    title: 'Getting around',
    body: "The bottom bar is your main navigation: Journal, Find People, My Community, Messages, and your Profile. Anything less frequent — Settings, Mentorship, Bible, Materials, and this FAQ — lives in the menu (top-right, next to the bell). The header hides when you scroll down and reappears when you scroll up, so it stays out of the way while you read.",
  },
  {
    title: 'Journal',
    body: "Your home screen. Record dreams, visions, intuitions, or notes — type or tap \"Speak instead\" to dictate. Filter by category or search across everything you've written. Each entry has Edit (fix the text), Share… (send it to a community, or search and pick any specific person you're connected with), and Delete.",
  },
  {
    title: 'Profiles',
    body: "Tap anyone's name anywhere in the app — a community member, a chat message, a comment — to see their profile: photo, username, bio, and a button to connect or message them, depending on your relationship with them.",
  },
  {
    title: 'Messages',
    body: 'Once you\'re connected with a mentor or fellow aspirant (a request they\'ve accepted), you can message them directly. Find the conversation from their profile, or from the Messages tab in the bottom bar.',
  },
  {
    title: 'My Community',
    body: "Join communities led by mentors, or create your own if you're a mentor. Requesting to join needs the mentor's approval before you see what's shared inside — or a mentor can invite you directly by searching your username, which you can then accept or decline from My Community. Once in, a community page has member list (with who's online), group chat (with photo/video/audio sharing), shared journal entries with feedback threads, study materials, and a video/audio call button. While on a call, you can navigate anywhere else in the app — it shrinks to a small floating bubble you can tap to expand back to full screen, or use to leave. Mentors can edit or delete the community, invite or remove members; anyone can leave on their own.",
  },
  {
    title: 'Mentorship',
    body: 'Browse and connect with mentors or aspirants, regardless of your own role — an aspirant can have more than one mentor, and two mentors can connect with each other too. Accept or decline requests coming your way, and see what your connections have shared with you.',
  },
  {
    title: 'Shared With You',
    body: 'Entries someone you\'re connected with chose to share directly with you, rather than with an entire community, show up here. Leave feedback the same way you would on anything shared in a community.',
  },
  {
    title: 'Find People',
    body: 'Search by username to find and connect with anyone in the app, mentor or aspirant, without needing to already share a community.',
  },
  {
    title: 'Bible',
    body: 'Pick a book and chapter from the dropdowns, choose a translation, and read. Jump straight to a specific verse with the verse picker.',
  },
  {
    title: 'Materials',
    body: "The app's featured library, split into tabs: Music (with a player that keeps playing as you browse elsewhere in the app — look for the mini player bar), Videos, YouTube, and PDF Books (opens right in the app, not a new tab). Only the app admin can add to it for now. Mentors can recommend items from here into their own community.",
  },
  {
    title: 'Notifications',
    body: 'The bell icon (top-right of every page) shows join requests, acceptances, new community posts, new messages, and call starts. Tap one to jump straight to what it\'s about.',
  },
  {
    title: 'Settings',
    body: 'Update your profile photo, bio, and username (chosen and required during signup — how others find and see you), switch between being an aspirant or a mentor, export your data, or delete your account.',
  },
  {
    title: 'Safety',
    body: "Tap Report on any profile, chat message, or comment to flag it for review. Block someone from their profile to stop them from messaging or connecting with you — manage blocked people anytime from Settings. Privacy Policy, Terms of Service, and Support contact are all linked from Settings.",
  },
];

export default function FAQ({ profile }) {
  return (
    <div style={styles.page}>
      <PageHeader title="How to use Guardian" profile={profile} />

      <hr className="gd-horizon" style={{ margin: '24px 0 32px' }} />

      {SECTIONS.map((s) => (
        <div key={s.title} style={styles.card}>
          <h3 style={styles.cardTitle}>{s.title}</h3>
          <p style={styles.cardBody}>{s.body}</p>
        </div>
      ))}
    </div>
  );
}

const styles = {
  page: { maxWidth: 640, margin: '0 auto', padding: '48px 24px 80px' },
  card: {
    background: 'var(--gd-surface)', border: '1px solid var(--gd-line)',
    borderRadius: 'var(--gd-radius)', padding: 20, marginBottom: 14,
  },
  cardTitle: {
    fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 18,
    color: 'var(--gd-text)', margin: '0 0 8px',
  },
  cardBody: { fontSize: 14, lineHeight: 1.6, color: 'var(--gd-text-dim)', margin: 0 },
};
