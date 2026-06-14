import db from '@/lib/db'
import { checkAuth } from '@/lib/authGuard'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'GET') {
    const { rows } = await db.query('SELECT * FROM writeups WHERE id = $1', [id])
    if (!rows.length) return res.status(404).json({ error: 'Not found' })
    return res.json(rows[0])
  }

  if (!checkAuth(req)) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'PATCH') {
    const {
      title, lab_date, category, overview,
      impact_confidentiality, impact_integrity, impact_availability,
      attack_vector, exploitation_walkthrough, mitigation, key_takeaways,
      tools_used, tags, refs, screenshots,
      cvss_score, difficulty, lab_environment, published,
    } = req.body

    const { rows } = await db.query(
      `UPDATE writeups SET
        title=$1, lab_date=$2, category=$3, overview=$4,
        impact_confidentiality=$5, impact_integrity=$6, impact_availability=$7,
        attack_vector=$8, exploitation_walkthrough=$9, mitigation=$10,
        key_takeaways=$11, tools_used=$12, tags=$13, refs=$14, screenshots=$15,
        cvss_score=$16, difficulty=$17, lab_environment=$18, published=$19
       WHERE id=$20 RETURNING *`,
      [
        title, lab_date, category, overview,
        impact_confidentiality || 'None',
        impact_integrity || 'None',
        impact_availability || 'None',
        attack_vector, exploitation_walkthrough, mitigation,
        key_takeaways || null,
        tools_used || [],
        tags || [],
        JSON.stringify(refs || []),
        JSON.stringify(screenshots || []),
        cvss_score || null,
        difficulty || null,
        lab_environment || null,
        published !== false,
        id,
      ]
    )
    if (!rows.length) return res.status(404).json({ error: 'Not found' })
    return res.json(rows[0])
  }

  if (req.method === 'DELETE') {
    await db.query('DELETE FROM writeups WHERE id = $1', [id])
    return res.status(204).end()
  }

  res.status(405).end()
}
