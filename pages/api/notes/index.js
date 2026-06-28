import db from '@/lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const { rows } = await db.query(
    'SELECT id, title, slug, note_date, category, summary FROM notes WHERE published = true ORDER BY note_date DESC'
  )
  res.json(rows)
}
