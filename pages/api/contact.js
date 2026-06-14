import db from '@/lib/db'
import { rateLimit, getIP } from '@/lib/rateLimit'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const ip = getIP(req)
  if (await rateLimit(ip, { max: 3, windowMs: 60 * 60 * 1000 })) {
    return res.status(429).json({ error: 'Too many messages. Please wait an hour before trying again.' })
  }

  const { name, email, message } = req.body

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'All fields are required.' })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' })
  }

  if (message.trim().length > 2000) {
    return res.status(400).json({ error: 'Message must be under 2000 characters.' })
  }

  await db.query(
    'INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3)',
    [name.trim(), email.trim().toLowerCase(), message.trim()]
  )

  res.status(201).json({ ok: true })
}
