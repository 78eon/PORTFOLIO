import db from '@/lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, email, message } = req.body

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'All fields are required.' })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' })
  }

  await db.query(
    'INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3)',
    [name.trim(), email.trim(), message.trim()]
  )

  res.status(201).json({ ok: true })
}
