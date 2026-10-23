if (process.env.QA_DISPOSABLE !== '1' || !process.env.QA_PASSWORD)
  throw Error(
    'Use QA_DISPOSABLE=1 and QA_PASSWORD with the isolated local fixture server only.'
  )
const { chromium, request } = require('playwright')
const { AxeBuilder } = require('@axe-core/playwright')
const fs = require('fs')
;(async () => {
  const browser = await chromium.launch()
  const api = await request.newContext({ baseURL: 'http://localhost:3100' })
  await api.post('/api/auth/check', {
    data: { password: process.env.QA_PASSWORD },
  })
  const context = await browser.newContext({
    storageState: await api.storageState(),
  })
  const page = await context.newPage()
  const results = []
  function check(name, value) {
    results.push({ name, passed: !!value })
    if (!value) throw Error(name)
  }
  for (const route of [
    '/privacy',
    '/qa-admin/certifications',
    '/qa-admin/tags',
    '/qa-admin/new',
    '/qa-admin/notes/new',
  ]) {
    await page.goto('http://localhost:3100' + route)
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze()
    results.push({
      name: 'axe ' + route,
      violations: axe.violations.map((x) => ({
        id: x.id,
        targets: x.nodes.map((n) => n.target),
      })),
    })
  }
  await page.goto('http://localhost:3100/writeups/qa-request-boundaries')
  const trigger = page.getByRole('button', { name: 'Expand QA evidence image' })
  await trigger.click()
  check('image dialog opens', await page.getByRole('dialog').isVisible())
  await page.keyboard.press('Escape')
  check(
    'image dialog Escape closes',
    !(await page.getByRole('dialog').isVisible())
  )
  check(
    'image dialog restores focus',
    await trigger.evaluate((el) => el === document.activeElement)
  )
  await page.goto('http://localhost:3100/')
  await page.keyboard.press('Tab')
  check(
    'skip link keyboard focus',
    await page
      .locator('.skip-link')
      .evaluate((el) => el === document.activeElement)
  )
  await page.keyboard.press('Enter')
  check(
    'skip link reaches main',
    await page.locator('main').evaluate((el) => el === document.activeElement)
  )
  const noJS = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  })
  const staticPage = await noJS.newPage()
  await staticPage.goto('http://localhost:3100/')
  check(
    'no-JS mobile navigation visible',
    await staticPage
      .getByRole('link', { name: 'About', exact: true })
      .isVisible()
  )
  check(
    'no-JS hero readable',
    await staticPage.getByRole('heading', { level: 1 }).isVisible()
  )
  await context.close()
  await noJS.close()
  await browser.close()
  await api.dispose()
  fs.writeFileSync(
    'docs/qa/webgl/accessibility-checks.json',
    JSON.stringify(results, null, 2)
  )
  console.log(JSON.stringify(results, null, 2))
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
