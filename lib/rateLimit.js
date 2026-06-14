import db from './db'

export async function rateLimit(ip, { max, windowMs }) {
  const resetAt = new Date(Date.now() + windowMs)
  try {
    const { rows } = await db.query(
      `INSERT INTO rate_limits (ip, count, reset_at)
       VALUES ($1, 1, $2)
       ON CONFLICT (ip) DO UPDATE SET
         count    = CASE WHEN rate_limits.reset_at < NOW() THEN 1
                         ELSE rate_limits.count + 1 END,
         reset_at = CASE WHEN rate_limits.reset_at < NOW() THEN $2
                         ELSE rate_limits.reset_at END
       RETURNING count`,
      [ip, resetAt]
    )
    return rows[0].count > max
  } catch {
    return false
  }
}

export function getIP(req) {
  const fwd = req.headers['x-forwarded-for']
  return (fwd ? fwd.split(',')[0].trim() : req.socket?.remoteAddress) || 'unknown'
}
