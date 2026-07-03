import React from 'react';
import PageHeader from '../components/PageHeader.jsx';

const SECTIONS = [
  {
    title: 'Journal',
    body: "Your home screen. Record dreams, visions, intuitions, or notes — type or tap \"Speak instead\" to dictate. Filter by category or search across everything you've written. Each entry has a \"Share…\" button to send it to a mentor, a fellow aspirant, or a community, and a Delete button for entries you no longer want.",
  },
  {
    title: 'My Community',
    body: "Join communities led by mentors, or create your own if you're a mentor. Requesting to join needs the mentor's approval before you see what's shared inside. Once in, a community page has member list, group chat (with photo/video/audio sharing), shared journal entries with feedback threads, study materials, and a video/audio call button.",
  },
  {
    title: 'Mentorship',
    body: 'As an aspirant: browse mentors and request guidance, or connect one-to-one with a fellow aspirant. As a mentor: accept or decline requests, and see what your aspirants have chosen to share with you.',
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
    body: "Browse the app's featured library of study resources. Mentors can recommend items from here into their own community.",
  },
  {
    title: 'Notifications',
    body: 'The bell icon (top-right of every page) shows join requests, acceptances, new community posts, and call starts. Tap one to jump straight to what it\'s about.',
  },
  {
    title: 'Settings',
    body: 'Set your username (how others find and see you), and switch between being an aspirant or a mentor at any time.',
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
