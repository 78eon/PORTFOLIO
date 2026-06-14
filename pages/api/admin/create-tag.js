import db from '@/lib/db'
import { checkAuth } from '@/lib/authGuard'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!checkAuth(req)) return res.status(401).json({ error: 'Unauthorized' })

  const { name, color } = req.body
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' })

  const { rows } = await db.query(
    'INSERT INTO tags (name, color) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING RETURNING *',
    [name.trim(), color || '#6b7280']
  )
  if (!rows.length) return res.status(409).json({ error: 'Tag already exists' })
  res.status(201).json(rows[0])
}
