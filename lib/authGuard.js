export function checkAuth(req) {
  return req.cookies?.admin_session === process.env.ADMIN_PASSWORD
}
