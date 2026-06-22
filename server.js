import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const app = express();
app.use(cors());
app.use(express.json());

// Simple in-memory tracking store
let tracks = [];

async function dbGetAllTracks() {
  if (!supabase) return tracks;
  const { data, error } = await supabase.from('tracks').select('*');
  if (error) throw error;
  return data;
}

async function dbInsertTrack(item) {
  if (!supabase) {
    tracks.unshift(item);
    return item;
  }
  const { data, error } = await supabase.from('tracks').insert(item).select().single();
  if (error) throw error;
  return data;
}

async function dbUpdateTrack(id, updates) {
  if (!supabase) {
    const idx = tracks.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Not found');
    tracks[idx] = { ...tracks[idx], ...updates };
    return tracks[idx];
  }
  const { data, error } = await supabase.from('tracks').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

async function dbAutoMode() {
  const items = await dbGetAllTracks();
  const updatedItems = items.map((t) => {
    if (t.status === 'Created' || t.status === 'Processing') return { ...t, status: 'In Transit', loc: 'At Sea' };
    if (t.status === 'In Transit') return { ...t, status: 'Customs', loc: 'Port' };
    if (t.status === 'Customs') return { ...t, status: 'Delivered', loc: t.dest || 'Destination' };
    return t;
  });
  if (!supabase) {
    tracks = updatedItems;
  } else {
    const { error } = await supabase.from('tracks').upsert(updatedItems);
    if (error) throw error;
  }
  return updatedItems;
}

async function dbDeleteTrack(id) {
  if (!supabase) {
    const idx = tracks.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Not found');
    const [deleted] = tracks.splice(idx, 1);
    return deleted;
  }
  const { data, error } = await supabase.from('tracks').delete().eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// Admin single-login middleware (very simple)
function adminAuth(req, res, next) {
  const adminPin = req.headers['x-admin-pin'];
  if (adminPin === '1202') {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

// Create a tracking entry
app.post('/api/track', adminAuth, async (req, res) => {
  try {
    const { id, vessel, origin, dest, eta, status, loc } = req.body;
    const item = {
      id: id || `MSC-${Math.floor(Math.random() * 9000) + 1000}-XX`,
      vessel: vessel || '',
      origin: origin || '',
      dest: dest || '',
      eta: eta || '',
      status: status || 'Created',
      loc: loc || 'HQ',
    };
    const saved = await dbInsertTrack(item);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a tracking entry
app.put('/api/track/:id', adminAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await dbUpdateTrack(id, req.body);
    res.json(updated);
  } catch (err) {
    if (err.message === 'Not found') {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Delete a tracking entry
app.delete('/api/track/:id', adminAuth, async (req, res) => {
  try {
    const deleted = await dbDeleteTrack(req.params.id);
    res.json({ ok: true, deleted });
  } catch (err) {
    if (err.message === 'Not found') {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: err.message });
  }
});

// List tracks
app.get('/api/track', async (req, res) => {
  try {
    const allTracks = await dbGetAllTracks();
    res.json(allTracks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auto mode endpoint: generates random movement updates for all tracks
app.post('/api/auto-mode', adminAuth, async (req, res) => {
  try {
    const updatedTracks = await dbAutoMode();
    res.json({ ok: true, tracks: updatedTracks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API server listening on ${port}`));
