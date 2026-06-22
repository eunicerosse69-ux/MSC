import { useState } from "react";

export default function Track() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipment, setShipment] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const searchTracking = async () => {
    const id = (trackingNumber || '').trim().toUpperCase();
    if (!id) return;

    // Try server first
    try {
      const res = await fetch('/api/track');
      if (res.ok) {
        const list = await res.json();
        const found = (list || []).find((s) => (s.id || s.trackingNumber || '').toUpperCase() === id);
        if (found) {
          setShipment(found);
          setNotFound(false);
          return;
        }
      }
    } catch (e) {
      // ignore and fallback to localStorage
    }

    const stored = JSON.parse(localStorage.getItem('tracks') || '[]');
    const foundLocal = (stored || []).find((s) => (s.id || s.trackingNumber || '').toUpperCase() === id);
    if (foundLocal) {
      setShipment(foundLocal);
      setNotFound(false);
      return;
    }

    setShipment(null);
    setNotFound(true);
  };

  return (
    <div style={{ padding: 18 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          placeholder="Tracking Number"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          style={{ padding: 8 }}
        />

        <button className="btn-primary" onClick={searchTracking}>Track</button>
      </div>

      {shipment ? (
        <div style={{ marginTop: 18 }}>
          <h3>{shipment.id || shipment.trackingNumber}</h3>
          <p>{shipment.status || 'Status unknown'}</p>
          <div>Location: {shipment.loc || '—'}</div>
          <div>Destination: {shipment.dest || '—'}</div>
          <div>ETA: {shipment.eta || '—'}</div>
        </div>
      ) : notFound ? (
        <div style={{ marginTop: 18 }}>No scan events found for this ID</div>
      ) : null}
    </div>
  );
}