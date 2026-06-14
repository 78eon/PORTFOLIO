import crypto from 'crypto'

function sessionToken() {
  return crypto
    .createHmac('sha256', process.env.ADMIN_PASSWORD)
    .update('admin-session-v1')
    .digest('hex')
}

export function checkAuth(req) {
  return req.cookies?.admin_session === sessionToken()
}
