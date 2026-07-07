import React, { useState } from 'react';
import { apiFetch } from '../api';

const REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'impersonation', label: 'Impersonation' },
  { value: 'other', label: 'Other' },
];

// A small overlay for reporting a user or a specific piece of content.
// Kept as one shared component so every report entry point (profile,
// chat message, comment) behaves identically.
export default function ReportModal({ reportedUserId, contentType = 'user', contentId, onClose }) {
  const [reason, setReason] = useState('spam');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch('/api/moderation/report', {
        method: 'POST',
        body: JSON.stringify({
          reported_user_id: reportedUserId || null,
          content_type: contentType,
          content_id: contentId || null,
          reason,
          details: details.trim() || null,
        }),
      });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {done ? (
          <>
            <p style={styles.title}>Report received</p>
            <p style={styles.dim}>Thank you — we'll look into this.</p>
            <button onClick={onClose} style={styles.primaryButton}>Close</button>
          </>
        ) : (
          <>
            <p style={styles.title}>Report</p>
            <select value={reason} onChange={(e) => setReason(e.target.value)} style={styles.select}>
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <textarea
              placeholder="Additional details (optional)"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              style={styles.textarea}
            />
            {error && <p style={styles.error}>{error}</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={submit} disabled={submitting} style={styles.primaryButton}>
                {submitting ? 'Sending…' : 'Submit report'}
              </button>
              <button onClick={onClose} style={styles.cancelButton}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(20,32,44,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 24,
  },
  modal: {
    background: 'var(--gd-surface)', borderRadius: 'var(--gd-radius)', padding: 24,
    maxWidth: 380, width: '100%',
  },
  title: { fontFamily: 'var(--gd-font-display)', fontWeight: 500, fontSize: 18, margin: '0 0 14px', color: 'var(--gd-text)' },
  select: {
    width: '100%', boxSizing: 'border-box', background: 'var(--gd-void)', color: 'var(--gd-text)',
    border: '1px solid var(--gd-line)', borderRadius: 8, padding: '10px 12px', fontSize: 14, marginBottom: 10,
  },
  textarea: {
    width: '100%', boxSizing: 'border-box', background: 'var(--gd-void)', color: 'var(--gd-text)',
    border: '1px solid var(--gd-line)', borderRadius: 8, padding: '10px 12px', fontSize: 14,
    marginBottom: 14, resize: 'vertical', fontFamily: 'var(--gd-font-body)',
  },
  primaryButton: {
    background: 'var(--gd-gold)', border: 'none', borderRadius: 8, padding: '10px 20px',
    color: 'var(--gd-on-accent)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
  },
  cancelButton: {
    background: 'transparent', border: '1px solid var(--gd-line)', borderRadius: 8, padding: '10px 20px',
    color: 'var(--gd-text-dim)', fontSize: 14, cursor: 'pointer',
  },
  dim: { color: 'var(--gd-text-dim)', fontSize: 14, marginBottom: 16 },
  error: { color: 'var(--gd-error)', fontSize: 13, marginBottom: 10 },
};
