import { Link } from 'react-router-dom';

export default function Sitemap() {
  return (
    <div style={{ padding: 32, maxWidth: 760, margin: '48px auto', background: '#fff', borderRadius: 16, boxShadow: '0 24px 60px rgba(0,0,0,0.07)', lineHeight: 1.7 }}>
      <h1>Sitemap</h1>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/admin">Admin</Link></li>
        <li><Link to="/track">Track</Link></li>
        <li><Link to="/privacy-policy">Privacy Policy</Link></li>
        <li><Link to="/cookie-policy">Cookie Policy</Link></li>
        <li><Link to="/carrier-liability">Carrier Liability</Link></li>
      </ul>
      <p>Use these links to access the main sections of the site.</p>
    </div>
  );
}
