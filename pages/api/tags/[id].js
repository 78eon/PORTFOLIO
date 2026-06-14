import db from '@/lib/db'
import { checkAuth } from '@/lib/authGuard'

export default async function handler(req, res) {
  const { id } = req.query
  if (!checkAuth(req)) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'PATCH') {
    const { name, color } = req.body
    const { rows } = await db.query(
      'UPDATE tags SET name=$1, color=$2 WHERE id=$3 RETURNING *',
      [name, color, id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Not found' })
    return res.json(rows[0])
  }

  if (req.method === 'DELETE') {
    await db.query('DELETE FROM tags WHERE id=$1', [id])
    return res.status(204).end()
  }

  res.status(405).end()
}
