import db from '@/lib/db'
import { checkAuth } from '@/lib/authGuard'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!checkAuth(req)) return res.status(401).json({ error: 'Unauthorized' })

  const { name, issuer, issue_date, expiry_date, credential_url, badge_url, sort_order } = req.body
  if (!name?.trim() || !issuer?.trim() || !issue_date) {
    return res.status(400).json({ error: 'Name, issuer and issue date are required' })
  }

  const { rows } = await db.query(
    `INSERT INTO certifications (name, issuer, issue_date, expiry_date, credential_url, badge_url, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [name.trim(), issuer.trim(), issue_date, expiry_date || null, credential_url || null, badge_url || null, sort_order || 0]
  )
  res.status(201).json(rows[0])
}
