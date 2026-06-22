import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div style={{ padding: 32, maxWidth: 760, margin: '48px auto', background: '#fff', borderRadius: 16, boxShadow: '0 24px 60px rgba(0,0,0,0.07)', lineHeight: 1.7 }}>
      <h1>Privacy Policy</h1>
      <p>
        This Privacy Policy explains how {"MSC EUROPEAN & SHORT SEA NETWORK VIENNA"} collects, uses, and protects your personal information when you use our website.
      </p>
      <p>
        We do not sell personal data and we process customer information only to provide shipment tracking, support, and operational services.
      </p>
      <p>
        For more details, contact our privacy team at privacy@mscshortsea.com.
      </p>
      <Link to="/">Back to Home</Link>
    </div>
  );
}
