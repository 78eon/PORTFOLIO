import crypto from 'crypto'

// Token format: <64-char random hex>.<64-char HMAC signature>
// Random nonce makes every login unique; signature ties it to the password.
export function makeToken() {
  const id = crypto.randomBytes(32).toString('hex')
  const sig = crypto.createHmac('sha256', process.env.ADMIN_PASSWORD).update(id).digest('hex')
  return `${id}.${sig}`
}

export function checkAuth(req) {
  const cookie = req.cookies?.admin_session
  if (!cookie) return false
  const dot = cookie.lastIndexOf('.')
  if (dot === -1) return false
  const id = cookie.slice(0, dot)
  const sig = cookie.slice(dot + 1)
  if (id.length !== 64 || sig.length !== 64) return false
  const expected = crypto.createHmac('sha256', process.env.ADMIN_PASSWORD).update(id).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}
