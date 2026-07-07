import React from 'react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div style={styles.page}>
      <Link to="/" style={styles.back}>← Guardian</Link>
      <h1 style={styles.title}>Terms of Service</h1>
      <p style={styles.updated}>Last updated: July 2026</p>

      <p style={styles.p}>
        By using Guardian, you agree to these terms. Please read them along with our
        <Link to="/privacy" style={styles.link}> Privacy Policy</Link>.
      </p>

      <h2 style={styles.h2}>Your account</h2>
      <p style={styles.p}>
        You're responsible for the activity on your account. You must be old enough to consent
        to use online services in your country. Provide accurate information and keep your
        account secure.
      </p>

      <h2 style={styles.h2}>Your content</h2>
      <p style={styles.p}>
        You own what you write and share on Guardian. By sharing an entry with a community or a
        specific person, you're granting them access to view it under the visibility you chose.
        You can delete your content or your entire account at any time.
      </p>

      <h2 style={styles.h2}>Acceptable use</h2>
      <p style={styles.p}>You agree not to use Guardian to:</p>
      <ul style={styles.ul}>
        <li>Harass, threaten, or abuse other users.</li>
        <li>Post spam, illegal content, or content that infringes someone else's rights.</li>
        <li>Impersonate another person or misrepresent your affiliation with anyone.</li>
        <li>Attempt to access other users' accounts or data without permission.</li>
      </ul>
      <p style={styles.p}>
        We may remove content or suspend accounts that violate these terms, including in response
        to reports from other users.
      </p>

      <h2 style={styles.h2}>Community and mentorship features</h2>
      <p style={styles.p}>
        Mentorship, community membership, and calls are provided to facilitate personal reflection
        and support. Guardian does not vet mentors for professional credentials — mentorship here
        is peer support, not licensed counseling, therapy, or medical advice.
      </p>

      <h2 style={styles.h2}>Termination</h2>
      <p style={styles.p}>
        You can delete your account at any time from Settings. We may suspend or terminate access
        for violations of these terms.
      </p>

      <h2 style={styles.h2}>Disclaimer</h2>
      <p style={styles.p}>
        Guardian is provided "as is." We work to keep it reliable, but we don't guarantee
        uninterrupted or error-free service.
      </p>

      <h2 style={styles.h2}>Changes</h2>
      <p style={styles.p}>
        We may update these terms from time to time. Continued use of the app after changes means
        you accept the updated terms.
      </p>

      <h2 style={styles.h2}>Contact</h2>
      <p style={styles.p}>
        Questions about these terms can be sent to <a href="mailto:support@example.com" style={styles.link}>support@example.com</a>.
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
