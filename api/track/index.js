import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

function adminAuth(req) {
  const pin = req.headers['x-admin-pin']
  return pin === '1202'
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const headers = req.headers || {}
      if (headers['x-admin-pin'] && !adminAuth(req)) {
        return res.status(401).json({ error: 'Unauthorized' })
      }
      const { data, error } = await supabase.from('tracks').select('*')
      if (error) return res.status(500).json({ error: error.message })
      return res.json(data)
    }

    if (req.method === 'POST') {
      if (!adminAuth(req)) return res.status(401).json({ error: 'Unauthorized' })
      const item = req.body
      if (!item || !item.id) {
        // generate id if missing
        item.id = `MSC-${Math.floor(Math.random() * 9000) + 1000}-XX`
      }
      const { data, error } = await supabase.from('tracks').insert(item).select().single()
      if (error) return res.status(500).json({ error: error.message })
      return res.json(data)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) })
  }
}
