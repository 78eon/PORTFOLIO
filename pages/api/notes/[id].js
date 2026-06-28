import db from '@/lib/db'
import { checkAuth } from '@/lib/authGuard'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'GET') {
    const { rows } = await db.query('SELECT * FROM notes WHERE id = $1', [id])
    if (!rows.length) return res.status(404).json({ error: 'Not found' })
    return res.json(rows[0])
  }

  if (!checkAuth(req)) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'PATCH') {
    const { title, note_date, category, summary, content, examples, tools_used, refs, published } = req.body
    const { rows } = await db.query(
      `UPDATE notes SET
        title=$1, note_date=$2, category=$3, summary=$4,
        content=$5, examples=$6, tools_used=$7, refs=$8, published=$9
       WHERE id=$10 RETURNING *`,
      [
        title, note_date, category, summary || '',
        content || '', examples || null,
        tools_used || [],
        JSON.stringify(refs || []),
        published !== false,
        id,
      ]
    )
    if (!rows.length) return res.status(404).json({ error: 'Not found' })
    return res.json(rows[0])
  }

  if (req.method === 'DELETE') {
    await db.query('DELETE FROM notes WHERE id = $1', [id])
    return res.status(204).end()
  }

  res.status(405).end()
}
