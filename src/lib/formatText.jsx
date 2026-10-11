import React from 'react';

// WhatsApp-style inline formatting: *bold*, _italic_, ~strikethrough~,
// `monospace`. Deliberately not a real Markdown parser — just enough to
// match what people expect from chat apps, and safe (renders as React
// elements, never raw HTML, so there's no injection risk).
//
// Also handles the "single emoji = show it big" rule: a message that,
// once trimmed, is made up of only emoji (and nothing else) renders at
// a larger size, same as WhatsApp/iMessage.

const EMOJI_ONLY_RE = /^(?:\p{Extended_Pictographic}|‍|️|\s)+$/u;
const TOKEN_RE = /(\*[^*\n]+\*|_[^_\n]+_|~[^~\n]+~|`[^`\n]+`)/g;

export function isEmojiOnly(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return false;
  // Cap length so a long run of emoji doesn't blow up the layout.
  return trimmed.length <= 12 && EMOJI_ONLY_RE.test(trimmed);
}

export function formatMessageText(text) {
  if (!text) return null;
  if (isEmojiOnly(text)) {
    return <span style={{ fontSize: 40, lineHeight: 1.2 }}>{text.trim()}</span>;
  }

  const parts = text.split(TOKEN_RE);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.length > 1 && part.startsWith('*') && part.endsWith('*')) {
      return <strong key={i}>{part.slice(1, -1)}</strong>;
    }
    if (part.length > 1 && part.startsWith('_') && part.endsWith('_')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.length > 1 && part.startsWith('~') && part.endsWith('~')) {
      return <s key={i}>{part.slice(1, -1)}</s>;
    }
    if (part.length > 1 && part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} style={{ fontFamily: 'monospace', background: 'rgba(127,127,127,0.15)', borderRadius: 4, padding: '1px 4px' }}>{part.slice(1, -1)}</code>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}
