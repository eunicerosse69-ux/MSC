import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

function adminAuth(req) {
  const pin = req.headers['x-admin-pin']
  return pin === '1202'
}

export default async function handler(req, res) {
  const { id } = req.query || {}
  try {
    if (req.method === 'PUT') {
      if (!adminAuth(req)) return res.status(401).json({ error: 'Unauthorized' })
      const updates = req.body || {}
      const { data, error } = await supabase.from('tracks').update(updates).eq('id', id).select().single()
      if (error) return res.status(500).json({ error: error.message })
      return res.json(data)
    }

    if (req.method === 'DELETE') {
      if (!adminAuth(req)) return res.status(401).json({ error: 'Unauthorized' })
      const { data, error } = await supabase.from('tracks').delete().eq('id', id).select().single()
      if (error) return res.status(500).json({ error: error.message })
      return res.json({ ok: true, deleted: data })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) })
  }
}
