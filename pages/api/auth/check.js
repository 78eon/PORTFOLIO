export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { password } = req.body
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Wrong password' })
  }
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    `admin_session=${process.env.ADMIN_PASSWORD}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax${secure}`
  )
  res.json({ ok: true })
}
