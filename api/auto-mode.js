import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

function adminAuth(req) {
  const pin = req.headers['x-admin-pin']
  return pin === '1202'
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    if (!adminAuth(req)) return res.status(401).json({ error: 'Unauthorized' })

    const { data: items, error: fetchErr } = await supabase.from('tracks').select('*')
    if (fetchErr) return res.status(500).json({ error: fetchErr.message })

    const updatedItems = items.map((t) => {
      if (t.status === 'Created' || t.status === 'Processing') return { ...t, status: 'In Transit', loc: 'At Sea' }
      if (t.status === 'In Transit') return { ...t, status: 'Customs', loc: 'Port' }
      if (t.status === 'Customs') return { ...t, status: 'Delivered', loc: t.dest || 'Destination' }
      return t
    })

    const { error: upsertErr } = await supabase.from('tracks').upsert(updatedItems)
    if (upsertErr) return res.status(500).json({ error: upsertErr.message })
    return res.json({ ok: true, tracks: updatedItems })
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) })
  }
}
