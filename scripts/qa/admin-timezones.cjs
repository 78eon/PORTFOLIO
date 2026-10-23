const { chromium } = require('playwright')
const fs = require('node:fs')
if (process.env.QA_DISPOSABLE !== '1' || !process.env.QA_PASSWORD)
  throw Error(
    'Use the isolated local fixture server with QA_DISPOSABLE=1 and QA_PASSWORD.'
  )
;(async () => {
  const browser = await chromium.launch(),
    checks = []
  for (const timezoneId of ['UTC', 'Asia/Jerusalem', 'America/New_York']) {
    const context = await browser.newContext({ timezoneId })
    const login = await context.request.post(
      'http://localhost:3100/api/auth/check',
      { data: { password: process.env.QA_PASSWORD } }
    )
    if (!login.ok()) throw Error('Fixture login failed')
    const page = await context.newPage(),
      errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.goto('http://localhost:3100/qa-admin/messages')
    await page.waitForTimeout(350)
    const stamps = await page.locator('time').allTextContents()
    const passed =
      errors.length === 0 &&
      stamps.length > 0 &&
      stamps.every((s) => s.endsWith(' UTC'))
    checks.push({ timezoneId, passed, errors })
    if (!passed) throw Error('Timestamp hydration failed for ' + timezoneId)
    await context.close()
  }
  fs.writeFileSync(
    'docs/qa/webgl/admin-timezones.json',
    JSON.stringify(checks, null, 2)
  )
  await browser.close()
  console.log(checks)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
