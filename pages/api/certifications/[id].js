import db from '@/lib/db'
import { checkAuth } from '@/lib/authGuard'

export default async function handler(req, res) {
  const { id } = req.query
  if (!checkAuth(req)) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'PATCH') {
    const { name, issuer, issue_date, expiry_date, credential_url, badge_url, sort_order } = req.body
    const { rows } = await db.query(
      `UPDATE certifications SET name=$1, issuer=$2, issue_date=$3, expiry_date=$4,
       credential_url=$5, badge_url=$6, sort_order=$7 WHERE id=$8 RETURNING *`,
      [name, issuer, issue_date, expiry_date || null, credential_url || null, badge_url || null, sort_order || 0, id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Not found' })
    return res.json(rows[0])
  }

  if (req.method === 'DELETE') {
    await db.query('DELETE FROM certifications WHERE id=$1', [id])
    return res.status(204).end()
  }

  res.status(405).end()
}
