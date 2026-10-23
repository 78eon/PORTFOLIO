if (process.env.QA_DISPOSABLE !== '1' || !process.env.QA_PASSWORD)
  throw Error(
    'Use QA_DISPOSABLE=1 and QA_PASSWORD with the isolated local fixture server only.'
  )
const { chromium } = require('playwright')
const { AxeBuilder } = require('@axe-core/playwright')
const fs = require('fs')
;(async () => {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) =>
    errors.push({ url: page.url(), message: e.message })
  )
  await page.goto('http://localhost:3100/', { waitUntil: 'load' })
  await page.getByRole('button', { name: 'Decline', exact: true }).click()
  await page.screenshot({
    path: '/home/god/Desktop/portfolio/.impeccable/review/desktop.png',
    fullPage: true,
  })
  const checks = []
  const check = (name, value) => {
    checks.push({ name, passed: !!value })
    console.log('CHECK', name, !!value)
    if (!value) console.log('FAIL', name)
  }
  check(
    'published-only archive',
    (await page.locator('.research-grid .research-card').count()) === 3
  )
  await page.getByRole('button', { name: 'Network', exact: true }).click()
  check(
    'category filter',
    (await page.locator('.research-grid .research-card').count()) === 1
  )
  await page.getByRole('button', { name: 'Malware', exact: true }).click()
  check(
    'empty category',
    await page
      .getByRole('heading', { name: 'No Malware writeups yet.' })
      .isVisible()
  )
  await page.getByRole('button', { name: 'Show all research' }).click()
  check(
    'database certifications remain visible',
    (await page.locator('.certification').count()) === 3
  )
  check(
    'credential verification links remain available',
    (await page.locator('a.certification[href]').count()) === 3
  )
  const uploadDenied = await page.request.post(
    'http://localhost:3100/api/admin/upload-image',
    { data: {}, maxRedirects: 0 }
  )
  check(
    'upload endpoint rejects anonymous access',
    [301, 302, 303, 307, 308, 401, 403].includes(uploadDenied.status())
  )
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze()
  fs.writeFileSync(
    '/tmp/neon-axe-home.json',
    JSON.stringify(axe.violations, null, 2)
  )
  for (const width of [768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('http://localhost:3100/', { waitUntil: 'load' })
    check(
      'no horizontal overflow ' + width,
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    )
    await page.screenshot({
      path: `/home/god/Desktop/portfolio/.impeccable/review/${width === 390 ? 'mobile' : 'width-' + width}.png`,
      fullPage: true,
    })
  }
  await page.getByRole('button', { name: 'Open navigation' }).click()
  check(
    'mobile menu opens',
    await page.getByRole('link', { name: 'About', exact: true }).isVisible()
  )
  await page.keyboard.press('Escape')
  check(
    'mobile menu restores focus',
    await page
      .getByRole('button', { name: 'Open navigation' })
      .evaluate((el) => el === document.activeElement)
  )
  await page.emulateMedia({ reducedMotion: 'reduce' })
  check(
    'reduced motion CSS',
    await page
      .locator('.hero h1 span')
      .first()
      .evaluate((el) => getComputedStyle(el).animationName === 'none')
  )
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.getByLabel('Name (required)').fill('QA visitor')
  await page.getByLabel('Email (required)').fill('qa@example.com')
  await page.getByLabel('Message (required)').fill('Disposable QA message')
  await page.locator('.consent input').check()
  await page.route('**/api/contact', (route) =>
    route.fulfill({
      status: 502,
      contentType: 'text/html',
      body: '<h1>Bad gateway</h1>',
    })
  )
  await page.getByRole('button', { name: 'Send message', exact: true }).click()
  await page.locator('.form-error').waitFor()
  check(
    'non-JSON error recovery',
    (await page.getByLabel('Message (required)').inputValue()) ===
      'Disposable QA message'
  )
  await page.unroute('**/api/contact')
  await page.route('**/api/contact', (route) => route.abort())
  await page.getByRole('button', { name: 'Send message', exact: true }).click()
  await page.getByText('Could not connect.', { exact: false }).waitFor()
  check('network error recovery', true)
  await page.unroute('**/api/contact')
  await page.getByRole('button', { name: 'Send message', exact: true }).click()
  await page.getByRole('heading', { name: 'Message received.' }).waitFor()
  check('real contact API succeeds', true)
  for (const route of [
    '/notes',
    '/notes/qa-protocols',
    '/writeups/qa-request-boundaries',
    '/privacy',
    '/login',
  ]) {
    const res = await page.goto('http://localhost:3100' + route, {
      waitUntil: 'load',
    })
    check('route ' + route, res.status() === 200)
    const scan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze()
    fs.writeFileSync(
      '/tmp/neon-axe-' + route.replaceAll('/', '-') + '.json',
      JSON.stringify(scan.violations, null, 2)
    )
  }
  await page.goto('http://localhost:3100/qa-admin')
  check('admin auth redirect', page.url().includes('/login'))
  await page.getByLabel('PASSWORD').fill(process.env.QA_PASSWORD)
  await page.getByRole('button', { name: 'Access Admin' }).click()
  await page.waitForURL('**/qa-admin')
  check('login works', true)
  for (const route of [
    '/qa-admin',
    '/qa-admin/notes',
    '/qa-admin/certifications',
    '/qa-admin/tags',
    '/qa-admin/messages',
    '/qa-admin/new',
    '/qa-admin/notes/new',
  ]) {
    const res = await page.goto('http://localhost:3100' + route, {
      waitUntil: 'load',
    })
    check('admin route ' + route, res.status() === 200)
  }
  check('no browser exceptions', errors.length === 0)
  fs.writeFileSync(
    'docs/qa/webgl/portfolio-checks.json',
    JSON.stringify(
      {
        checks,
        errors,
        homeAxeViolations: axe.violations.map((x) => ({
          id: x.id,
          impact: x.impact,
          nodes: x.nodes.map((n) => n.target),
        })),
      },
      null,
      2
    )
  )
  console.log(
    JSON.stringify(
      { checks, errors, axe: axe.violations.map((x) => x.id) },
      null,
      2
    )
  )
  await browser.close()
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
