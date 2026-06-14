import db from '@/lib/db'
import { checkAuth } from '@/lib/authGuard'

function toSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

async function uniqueSlug(base) {
  const { rows } = await db.query(
    "SELECT slug FROM writeups WHERE slug = $1 OR slug LIKE $2",
    [base, `${base}-%`]
  )
  const existing = new Set(rows.map(r => r.slug))
  if (!existing.has(base)) return base
  let i = 2
  while (existing.has(`${base}-${i}`)) i++
  return `${base}-${i}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!checkAuth(req)) return res.status(401).json({ error: 'Unauthorized' })

  const {
    title, lab_date, category, overview,
    impact_confidentiality, impact_integrity, impact_availability,
    attack_vector, exploitation_walkthrough, mitigation, key_takeaways,
    tools_used, tags, refs, screenshots,
    cvss_score, difficulty, lab_environment, published,
  } = req.body

  if (!title || !lab_date || !category || !overview || !attack_vector || !exploitation_walkthrough || !mitigation) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const slug = await uniqueSlug(toSlug(title))

  const { rows } = await db.query(
    `INSERT INTO writeups
      (title, slug, lab_date, category, overview,
       impact_confidentiality, impact_integrity, impact_availability,
       attack_vector, exploitation_walkthrough, mitigation, key_takeaways,
       tools_used, tags, refs, screenshots,
       cvss_score, difficulty, lab_environment, published)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
     RETURNING *`,
    [
      title, slug, lab_date, category, overview,
      impact_confidentiality || 'None',
      impact_integrity || 'None',
      impact_availability || 'None',
      attack_vector, exploitation_walkthrough, mitigation, key_takeaways || null,
      tools_used || [],
      tags || [],
      JSON.stringify(refs || []),
      JSON.stringify(screenshots || []),
      cvss_score || null,
      difficulty || null,
      lab_environment || null,
      published !== false,
    ]
  )

  res.status(201).json(rows[0])
}
