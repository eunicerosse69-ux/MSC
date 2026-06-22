import { Link } from 'react-router-dom';

export default function CookiePolicy() {
  return (
    <div style={{ padding: 32, maxWidth: 760, margin: '48px auto', background: '#fff', borderRadius: 16, boxShadow: '0 24px 60px rgba(0,0,0,0.07)', lineHeight: 1.7 }}>
      <h1>Cookie Policy</h1>
      <p>
        We use cookies and similar technologies to improve site functionality, analyse traffic, and personalise content for our visitors.
      </p>
      <p>
        You can control or disable cookies through your browser settings. Disabling cookies may affect certain features of the site.
      </p>
      <Link to="/">Back to Home</Link>
    </div>
  );
}
