import db from '@/lib/db'
import { checkAuth } from '@/lib/authGuard'

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!checkAuth(req)) return res.status(401).json({ error: 'Unauthorized' })

  const { title, note_date, category, summary, content, examples, tools_used, refs, published } = req.body
  if (!title || !note_date || !category) return res.status(400).json({ error: 'title, note_date, category required' })

  let base = slugify(title)
  let slug = base
  let suffix = 2
  while (true) {
    const { rows } = await db.query('SELECT id FROM notes WHERE slug = $1', [slug])
    if (!rows.length) break
    slug = `${base}-${suffix++}`
  }

  const { rows } = await db.query(
    `INSERT INTO notes (title, slug, note_date, category, summary, content, examples, tools_used, refs, published)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id, slug`,
    [
      title, slug, note_date, category,
      summary || '', content || '', examples || null,
      tools_used || [],
      JSON.stringify(refs || []),
      published !== false,
    ]
  )
  res.status(201).json(rows[0])
}
