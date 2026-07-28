import React from 'react';

// The short explanatory line that sits under a page's title, above the
// gold horizon rule. Kept as its own component (rendered in normal page
// flow, not inside the fixed PageHeader) so every page matches the
// Journal page's placement and full-width layout exactly.
export default function PageIntro({ children }) {
  if (!children) return null;
  return <p style={styles.intro}>{children}</p>;
}

const styles = {
  intro: {
    width: '100%',
    boxSizing: 'border-box',
    margin: '-16px 0 12px',
    fontFamily: 'var(--gd-font-display)',
    fontStyle: 'italic',
    fontSize: 15,
    lineHeight: 1.7,
    color: 'var(--gd-text-dim)',
  },
};
