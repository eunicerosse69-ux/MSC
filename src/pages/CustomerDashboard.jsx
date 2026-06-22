import { Link } from 'react-router-dom';

export default function CustomerDashboard() {
  return (
    <div style={{ minHeight: '100vh', padding: 32, background: '#eef2ff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 860, background: '#ffffff', borderRadius: 20, boxShadow: '0 24px 80px rgba(15, 23, 42, 0.08)', padding: 36 }}>
        <h1 style={{ marginBottom: 12, color: '#0f172a' }}>Customer Dashboard</h1>
        <p style={{ marginBottom: 24, color: '#334155', lineHeight: 1.75 }}>
          Welcome back to your customer dashboard. From here, you can access shipment tracking, view your recent updates, and manage your account information.
        </p>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <Link to="/track" style={{ textDecoration: 'none' }}>
            <div style={{ padding: 24, borderRadius: 18, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a' }}>
              <h2 style={{ marginBottom: 12 }}>Track a Shipment</h2>
              <p style={{ margin: 0 }}>Quickly lookup your container or B/L number and view the latest status updates.</p>
            </div>
          </Link>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ padding: 24, borderRadius: 18, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a' }}>
              <h2 style={{ marginBottom: 12 }}>Return to Home</h2>
              <p style={{ margin: 0 }}>Browse services, schedules, and port details across the MSC Vienna network.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
