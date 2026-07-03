import React from 'react';
import { Link } from 'react-router-dom';
import { nameFor } from '../utils/formatUser';

// Wraps a person's name/username so it's clickable to their profile,
// anywhere it appears — member lists, chat, comments, entry authors.
export default function UserLink({ profile, style }) {
  if (!profile?.id) return <span style={style}>{nameFor(profile)}</span>;
  return (
    <Link to={`/profile/${profile.id}`} style={{ textDecoration: 'none', ...style }}>
      {nameFor(profile)}
    </Link>
  );
}
