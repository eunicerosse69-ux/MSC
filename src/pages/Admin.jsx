import { useState, useEffect } from 'react';

export default function Admin() {
  // Use relative API base by default; override with VITE_API_BASE for separate deployments.
  const API_BASE = import.meta.env.VITE_API_BASE || '';
  const [pin, setPin] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [trackList, setTrackList] = useState([]);
  const [newTrack, setNewTrack] = useState('MSC-0000-XX');
  const [autoRunning, setAutoRunning] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin.trim() === '1202') {
      setLoggedIn(true);
    } else {
      alert('Invalid PIN');
    }
  };

  const startAutoMode = async () => {
    setAutoRunning(true);
    try {
      const res = await fetch(`${API_BASE}/api/auto-mode`, {
        method: 'POST',
        headers: { 'x-admin-pin': pin },
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const json = await res.json();
      if (json.tracks) {
        setTrackList(json.tracks);
      }
    } catch (e) {
      console.error('Auto mode failed:', e);
      alert('Auto mode error');
    }
    setAutoRunning(false);
  };

  const fetchTracks = async () => {
    try {
      const headers = {};
      if (pin) headers['x-admin-pin'] = pin;
      const res = await fetch(`${API_BASE}/api/track`, { headers });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const json = await res.json();
      setTrackList(json || []);
      localStorage.setItem('tracks', JSON.stringify(json || []));
      return json || [];
    } catch (e) {
      console.error('Admin fetchTracks failed:', e);
      const stored = JSON.parse(localStorage.getItem('tracks') || '[]');
      setTrackList(stored);
      return stored;
    }
  };

  const addTrack = async () => {
    const id = newTrack.trim().toUpperCase();
    if (!id) return;

    const item = { id, vessel: '', origin: '', status: 'Processing', eta: 'TBD', loc: 'HQ', dest: '' };

    // optimistic local update
    setTrackList((prev) => [item, ...prev]);
    setNewTrack('');

    try {
      const res = await fetch(`${API_BASE}/api/track`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-admin-pin': pin },
        body: JSON.stringify(item),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server error ${res.status}: ${errorText}`);
      }
      const json = await res.json();
      // replace optimistic item with server item
      setTrackList((list) => [json, ...list.filter((it) => it.id !== json.id)]);
      // persist locally
      localStorage.setItem('tracks', JSON.stringify([json, ...JSON.parse(localStorage.getItem('tracks') || '[]').filter((it) => it.id !== json.id)]));
    } catch (e) {
      // fallback: persist optimistic item
      const stored = JSON.parse(localStorage.getItem('tracks') || '[]');
      localStorage.setItem('tracks', JSON.stringify([item, ...stored]));
      alert(`Created locally (server unreachable): ${e.message || e}`);
    }
  };

  const updateMovement = async (idx, updates) => {
    const t = trackList[idx];
    if (!t) return;

    // local optimistic update
    const localUpdated = trackList.map((it, i) => (i === idx ? { ...it, ...updates } : it));
    setTrackList(localUpdated);
    localStorage.setItem('tracks', JSON.stringify(localUpdated));

    try {
      const res = await fetch(`${API_BASE}/api/track/${t.id}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json', 'x-admin-pin': pin },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server error ${res.status}: ${errorText}`);
      }
      const json = await res.json();
      setTrackList((list) => list.map((it) => (it.id === json.id ? json : it)));
      localStorage.setItem('tracks', JSON.stringify(JSON.parse(localStorage.getItem('tracks') || '[]').map((it) => (it.id === json.id ? json : it))));
    } catch (e) {
      console.error('Admin updateMovement failed:', e);
      alert(`Failed to sync with server: ${e.message || e}. Changes saved locally.`);
    }
  };

  const handleFieldChange = (idx, field, value) => {
    setTrackList((list) => list.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  };

  const saveTrack = (idx) => {
    const t = trackList[idx];
    if (!t) return;
    const updates = {
      vessel: t.vessel || '',
      origin: t.origin || '',
      dest: t.dest || '',
      eta: t.eta || '',
      loc: t.loc || '',
      status: t.status || 'Processing',
      moving: t.moving || false,
    };
    updateMovement(idx, updates);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard');
    } catch (e) {
      // ignore
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [undoVisible, setUndoVisible] = useState(false);
  const [lastDeleted, setLastDeleted] = useState(null);
  const [undoTimerId, setUndoTimerId] = useState(null);

  const promptDelete = (idx) => {
    const item = trackList[idx];
    if (!item) return;
    setPendingDelete({ idx, item });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const { idx, item } = pendingDelete;
    setShowDeleteModal(false);

    // remove locally
    const updated = trackList.filter((_, i) => i !== idx);
    setTrackList(updated);
    localStorage.setItem('tracks', JSON.stringify(updated));

    setLastDeleted(item);
    setUndoVisible(true);
    // start undo timer
    const id = setTimeout(() => {
      setUndoVisible(false);
      setLastDeleted(null);
      setUndoTimerId(null);
    }, 5000);
    setUndoTimerId(id);

    try {
      const res = await fetch(`${API_BASE}/api/track/${item.id}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': pin },
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Admin confirmDelete server delete failed:', res.status, errorText);
      }
    } catch (e) {
      console.error('Admin confirmDelete fetch error:', e);
    }

    setPendingDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPendingDelete(null);
  };

  const undoDelete = async () => {
    if (!lastDeleted) return;
    // cancel timer
    if (undoTimerId) clearTimeout(undoTimerId);
    // re-insert locally at top
    setTrackList((prev) => [lastDeleted, ...prev]);
    setUndoVisible(false);

    try {
      const res = await fetch(`${API_BASE}/api/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
        body: JSON.stringify(lastDeleted),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Admin undoDelete server insert failed:', res.status, errorText);
      }
    } catch (e) {
      console.error('Admin undoDelete fetch error:', e);
    }

    setLastDeleted(null);
  };

  const deleteTrack = async (idx) => {
    const t = trackList[idx];
    if (!t) return;

    // local remove
    const updated = trackList.filter((_, i) => i !== idx);
    setTrackList(updated);
    localStorage.setItem('tracks', JSON.stringify(updated));

    try {
      const headers = {};
      if (pin) headers['x-admin-pin'] = pin;
      const res = await fetch(`${API_BASE}/api/track/${t.id}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server error ${res.status}: ${errorText}`);
      }
    } catch (e) {
      console.error('Admin deleteTrack failed:', e);
      alert(`Deleted locally; server removal failed or unavailable: ${e.message || e}`);
    }
  };

  useEffect(() => {
    // load tracks from server, fallback to localStorage
    fetchTracks();
  }, []);

  return (
    <div style={{ padding: 28, minHeight: '100vh', background: '#87CEEB' }}>
      <h2>Admin</h2>
      {!loggedIn ? (
        <form onSubmit={handleLogin} style={{ maxWidth: 420 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>Admin PIN</label>
          <input value={pin} onChange={(e) => setPin(e.target.value)} type="password" maxLength={4} placeholder="Enter 4-digit PIN" style={{ width: '100%', padding: 8, marginBottom: 12 }} />
          <button type="submit" className="btn-primary">Sign in</button>
        </form>
      ) : (
        <div>
          <div style={{ marginBottom: 18 }}>
            <h3>Create tracking</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input value={newTrack} onChange={(e) => setNewTrack(e.target.value)} style={{ padding: 8, minWidth: 220 }} />
              <button className="btn-ghost" type="button" onClick={() => copyToClipboard(newTrack)} disabled={!newTrack.trim()}>Copy ID</button>
              <button className="btn-primary" type="button" onClick={addTrack}>Create</button>
              <button className="btn-ghost" type="button" onClick={startAutoMode} disabled={autoRunning}>{autoRunning ? 'Running...' : 'Auto Mode'}</button>
              <button className="btn-ghost" type="button" onClick={fetchTracks}>Refresh</button>
            </div>
          </div>

          <div>
            <h3>Active tracking</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {trackList.map((t, idx) => (
                <div key={t.id} style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 40, background: '#9289cd' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <strong>{t.id}</strong>
                      <button type="button" className="btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => copyToClipboard(t.id)}>Copy</button>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="btn-ghost" onClick={() => updateMovement(idx, { status: 'In Transit', loc: 'At Sea' })}>Transit</button>
                      <button className="btn-ghost" onClick={() => updateMovement(idx, { status: 'Customs', loc: 'Port' })}>Customs</button>
                      <button className="btn-ghost" onClick={() => updateMovement(idx, { status: 'Delivered', loc: t.dest || 'Destination' })}>Delivered</button>
                    </div>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12 }}>
                    <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <label style={{ fontSize: 12, minWidth: 90 }}>Vessel</label>
                        <input value={t.vessel || ''} onChange={(e) => handleFieldChange(idx, 'vessel', e.target.value)} style={{ padding: 6, flex: 1 }} />
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <label style={{ fontSize: 12, minWidth: 90 }}>Origin</label>
                        <input value={t.origin || ''} onChange={(e) => handleFieldChange(idx, 'origin', e.target.value)} style={{ padding: 6, flex: 1 }} />
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <label style={{ fontSize: 12, minWidth: 90 }}>Current Location</label>
                        <input value={t.loc || ''} onChange={(e) => handleFieldChange(idx, 'loc', e.target.value)} style={{ padding: 6, flex: 1 }} />
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <label style={{ fontSize: 12, minWidth: 90 }}>Status</label>
                        <select value={t.status || 'Processing'} onChange={(e) => handleFieldChange(idx, 'status', e.target.value)} style={{ padding: 6, flex: 1 }}>
                          <option>Processing</option>
                          <option>In Transit</option>
                          <option>Customs</option>
                          <option>Delivered</option>
                          <option>Delayed</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <label style={{ fontSize: 12 }}>Destination</label>
                      <input value={t.dest || ''} onChange={(e) => handleFieldChange(idx, 'dest', e.target.value)} style={{ padding: 6 }} />

                      <label style={{ fontSize: 12 }}>ETA</label>
                      <input value={t.eta || ''} onChange={(e) => handleFieldChange(idx, 'eta', e.target.value)} style={{ padding: 6 }} />
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                      <label style={{ fontSize: 12 }}>Movement</label>
                      <select value={t.moving ? 'Moving' : 'Stopped'} onChange={(e) => handleFieldChange(idx, 'moving', e.target.value === 'Moving')} style={{ padding: 6 }}>
                        <option>Stopped</option>
                        <option>Moving</option>
                      </select>

                      <button type="button" className="btn-primary" onClick={() => saveTrack(idx)}>Save</button>
                      <button type="button" className="btn-primary" onClick={() => promptDelete(idx)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {undoVisible ? (
        <div style={{ position: 'fixed', right: 20, bottom: 20, background: '#222', color: '#eee5e5', padding: 12, borderRadius: 8 }}>
          <span>Deleted</span>
          <button style={{ marginLeft: 12 }} onClick={undoDelete}>Undo</button>
        </div>
      ) : null}

      {showDeleteModal && pendingDelete ? (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
          <div style={{ background: '#f7f8ff', padding: 20, borderRadius: 8, maxWidth: 480, width: '90%' }}>
            <h3>Confirm delete</h3>
            <p>Delete tracking <strong>{pendingDelete.item.id}</strong>? This can be undone briefly after deletion.</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={cancelDelete}>Cancel</button>
              <button className="btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
