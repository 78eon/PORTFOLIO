import { makeToken } from '@/lib/authGuard'
import { rateLimit, getIP } from '@/lib/rateLimit'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const ip = getIP(req)
  if (await rateLimit(ip, { max: 5, windowMs: 15 * 60 * 1000 })) {
    return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' })
  }

  const { password } = req.body
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    await new Promise(r => setTimeout(r, 1000))
    return res.status(401).json({ error: 'Wrong password' })
  }

  const token = makeToken()
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    `admin_session=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict${secure}`
  )
  res.json({ ok: true })
}
