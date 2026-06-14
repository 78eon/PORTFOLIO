const store = new Map()

export function rateLimit(ip, { max, windowMs }) {
  const now = Date.now()
  const entry = store.get(ip) || { count: 0, resetAt: now + windowMs }

  if (entry.resetAt < now) {
    entry.count = 1
    entry.resetAt = now + windowMs
  } else {
    entry.count++
  }

  store.set(ip, entry)
  return entry.count > max
}

export function getIP(req) {
  const fwd = req.headers['x-forwarded-for']
  return (fwd ? fwd.split(',')[0].trim() : req.socket?.remoteAddress) || 'unknown'
}
