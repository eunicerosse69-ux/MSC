import { Link } from 'react-router-dom';

export default function CarrierLiability() {
  return (
    <div style={{ padding: 32, maxWidth: 760, margin: '48px auto', background: '#fff', borderRadius: 16, boxShadow: '0 24px 60px rgba(0,0,0,0.07)', lineHeight: 1.7 }}>
      <h1>Carrier Liability</h1>
      <p>
        This Carrier Liability statement describes the limits and responsibilities of our shipping services under applicable maritime law.
      </p>
      <p>
        Liability for loss or damage is subject to standard conventions, bill of lading terms, and the carrier's published conditions.
      </p>
      <Link to="/">Back to Home</Link>
    </div>
  );
}
