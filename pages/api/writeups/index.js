import db from '@/lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const { rows } = await db.query(
    'SELECT * FROM writeups WHERE published = true ORDER BY lab_date DESC'
  )
  res.json(rows)
}
