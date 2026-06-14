import db from '@/lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const { rows } = await db.query('SELECT * FROM tags ORDER BY name ASC')
  res.json(rows)
}
