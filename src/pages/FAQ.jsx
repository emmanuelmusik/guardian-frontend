import React from 'react';
import PageHeader from '../components/PageHeader.jsx';

const SECTIONS = [
  {
    title: 'Getting around',
    body: "The bottom bar is your main navigation: Journal, Find People, My Community, Messages, and your Profile. Anything less frequent — Settings, Mentorship, Bible, Materials, and this FAQ — lives in the menu (top-right, next to the bell). The header hides when you scroll down and reappears when you scroll up, so it stays out of the way while you read.",
  },
  {
    title: 'Journal',
    body: "Your home screen. Record dreams, visions, intuitions, or notes — type or tap \"Speak instead\" to dictate, with your words appearing live and automatically punctuated at natural pauses (not perfect, but no extra effort needed), plus a timer showing how long you've been recording; tap Stop when you're done. Filter by category or search across everything you've written. Each entry has Edit (fix the text), Share… (a community, a specific person, or publicly), Feedback (see comments people have left on anything you've shared), Export (download that one entry as a PDF), and Delete. There's also an \"Export all entries as PDF\" button above your entries.",
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
    body: 'Entries someone you\'re connected with chose to share directly with you. Organized by who shared it — tap a person to see their shared entries by title, then tap a title to read the full entry and any feedback thread. You get a notification whenever something new is shared with you, and whenever someone leaves feedback on one of your entries.',
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
    body: "The app's featured library, split into tabs: Music (tap play on any track and it plays through the whole list automatically, looping back to the start when it finishes — the mini player bar keeps playing as you browse elsewhere in the app), Videos, YouTube, and PDF Books (opens right in the app, not a new tab). Only the app admin can add to it for now. Mentors can recommend items from here into their own community.",
  },
  {
    title: 'Notifications',
    body: 'The bell icon (top-right of every page) shows join requests, acceptances, new community posts, new messages, and call starts. Tapping a "new feedback" notification jumps straight to that entry in your journal and opens its feedback thread automatically. Tap any notification to jump straight to what it\'s about.',
  },
  {
    title: 'Settings',
    body: 'Update your profile photo, bio, and username (chosen and required during signup — how others find and see you), switch between being an aspirant or a mentor, choose whether you get monthly journal emails and inactivity reminders, export your data, or delete your account.',
  },
  {
    title: 'Public Page',
    body: "Share a thought directly, or make one of your journal entries public, and it shows up here for every signed-in Guardian user to see — not connections-only, and not the open internet either. Subscribers can attach photos, videos, or audio to what they share here.",
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
