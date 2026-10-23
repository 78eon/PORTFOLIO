/* Run against a local preview: NODE_PATH=/tmp/neon-qa/node_modules node scripts/qa/cyber-explorer.cjs
 * QA_BASE_URL and QA_OUTPUT may override the defaults. No backend writes. */
const { chromium } = require('playwright')
const { AxeBuilder } = require('@axe-core/playwright')
const fs = require('node:fs')
const path = require('node:path')
const base = process.env.QA_BASE_URL || 'http://localhost:3100'
const output = process.env.QA_OUTPUT || 'docs/qa/webgl'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname))
  throw Error('This suite is for a local preview only.')
const domains = [
  'Threat Intel',
  'VAPT',
  'GRC',
  'Red / Blue / Purple',
  'Hacker Ethics',
  'Information Security',
  'SOC / Incident Response',
]
const checks = [],
  errors = [],
  profiles = []
function check(name, value) {
  checks.push({ name, passed: !!value })
  console.log(value ? 'PASS' : 'FAIL', name)
  if (!value) throw Error(name)
}
async function instrument(context) {
  await context.addInitScript(() => {
    window.__cyberQA = {
      frames: 0,
      draws: 0,
      createdBuffers: 0,
      deletedBuffers: 0,
      deletedPrograms: 0,
    }
    const raf = window.requestAnimationFrame
    window.requestAnimationFrame = (cb) =>
      raf.call(window, (t) => {
        window.__cyberQA.frames++
        cb(t)
      })
    const prototype = window.WebGL2RenderingContext?.prototype
    if (!prototype) return
    for (const [method, key] of [
      ['drawArrays', 'draws'],
      ['drawElements', 'draws'],
      ['createBuffer', 'createdBuffers'],
      ['deleteBuffer', 'deletedBuffers'],
      ['deleteProgram', 'deletedPrograms'],
    ]) {
      const original = prototype[method]
      prototype[method] = function (...args) {
        window.__cyberQA[key]++
        return original.apply(this, args)
      }
    }
  })
}
async function profile(page, label) {
  await page.waitForTimeout(800)
  const before = await page.evaluate(() => ({ ...window.__cyberQA }))
  await page.waitForTimeout(500)
  const after = await page.evaluate(() => ({ ...window.__cyberQA }))
  const sample = {
    label,
    frames: after.frames - before.frames,
    draws: after.draws - before.draws,
  }
  profiles.push(sample)
  return sample
}
;(async () => {
  fs.mkdirSync(output, { recursive: true })
  fs.mkdirSync('.impeccable/review/webgl', { recursive: true })
  const browser = await chromium.launch({
    args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'],
  })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  })
  await instrument(context)
  const page = await context.newPage()
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(base)
  if (await page.getByRole('button', { name: 'Decline', exact: true }).count())
    await page.getByRole('button', { name: 'Decline', exact: true }).click()
  check(
    'WebGL defers until exploration is visible',
    (await page.locator('.cyber-scene').count()) === 0
  )
  check(
    'static map is present before 3D loads',
    await page.locator('.cyber-fallback').isVisible()
  )
  await page.locator('#cyber-explorer').scrollIntoViewIfNeeded()
  await page
    .locator('.cyber-map-mode')
    .filter({ hasText: 'Interactive 3D' })
    .waitFor()
  check(
    'native WebGL renderer loads',
    (await page.locator('.cyber-scene canvas').count()) === 1
  )
  check('no iframe installed', (await page.locator('iframe').count()) === 0)
  check(
    'seven selectable domains',
    (await page
      .getByRole('group', { name: 'Cybersecurity domains', exact: true })
      .getByRole('button')
      .count()) === 7
  )
  const visibleProfile = await profile(page, 'visible ambient scene')
  check('ambient scene draws frames', visibleProfile.draws > 0)
  const startResources = await page.evaluate(() => ({ ...window.__cyberQA }))
  for (let cycle = 0; cycle < 3; cycle++)
    for (const name of domains) {
      await page
        .getByRole('group', { name: 'Cybersecurity domains', exact: true })
        .getByRole('button', { name, exact: true })
        .click()
      const nodes = page.locator('.cyber-node-button')
      check(
        `${name} exposes six concepts (cycle ${cycle + 1})`,
        (await nodes.count()) === 6
      )
      await nodes.last().click()
      check(
        `${name} node selection updates description (cycle ${cycle + 1})`,
        (await page.locator('.cyber-selection h4').innerText()) ===
          (await nodes.last().evaluate((el) => el.childNodes[1].textContent))
      )
      await page.waitForTimeout(60)
    }
  const endResources = await page.evaluate(() => ({ ...window.__cyberQA }))
  profiles.push({
    label: '21 domain rebuilds',
    createdBuffers: endResources.createdBuffers - startResources.createdBuffers,
    deletedBuffers: endResources.deletedBuffers - startResources.deletedBuffers,
    remainingBufferGrowth:
      endResources.createdBuffers -
      endResources.deletedBuffers -
      (startResources.createdBuffers - startResources.deletedBuffers),
  })
  check(
    'domain changes dispose old GPU buffers',
    endResources.deletedBuffers > startResources.deletedBuffers
  )
  check(
    'GPU buffer count remains bounded across domain changes',
    endResources.createdBuffers -
      endResources.deletedBuffers -
      (startResources.createdBuffers - startResources.deletedBuffers) <=
      8
  )
  await page
    .getByRole('group', { name: 'Cybersecurity domains', exact: true })
    .getByRole('button', { name: 'GRC', exact: true })
    .click()
  await page.getByRole('button', { name: /Risk matrix —/ }).click()
  check(
    'GRC qualitative matrix is accessible',
    (await page.getByRole('table').count()) === 1
  )
  const audit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze()
  fs.writeFileSync(
    path.join(output, 'axe.json'),
    JSON.stringify(audit.violations, null, 2)
  )
  check(
    'active GRC scene has zero axe violations',
    audit.violations.length === 0
  )
  await page
    .getByRole('group', { name: 'Cybersecurity domains', exact: true })
    .getByRole('button', { name: 'VAPT', exact: true })
    .click()
  check(
    'real research links come from published data',
    (await page.locator('.cyber-related a[href^="/writeups/"]').count()) > 0
  )
  await page
    .getByRole('group', { name: 'Cybersecurity domains', exact: true })
    .getByRole('button', { name: 'Threat Intel', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Pause ambient motion', exact: true })
    .click()
  const paused = await profile(page, 'ambient motion paused')
  check('pause stops idle draws', paused.draws === 0)
  const label = page.locator('[data-scene-label]').first()
  const beforeZoom = await label.getAttribute('style')
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click()
  await page.waitForTimeout(150)
  check(
    'HTML zoom control moves camera',
    (await label.getAttribute('style')) !== beforeZoom
  )
  await page.locator('.cyber-viewport').focus()
  const beforeKey = await label.getAttribute('style')
  await page.keyboard.press('ArrowLeft')
  await page.waitForTimeout(150)
  check(
    'keyboard camera orbit works',
    (await label.getAttribute('style')) !== beforeKey
  )
  await page.keyboard.press('Home')
  await page.waitForTimeout(800)
  await page.locator('.cyber-node-button').last().click()
  await page.locator('.cyber-viewport').scrollIntoViewIfNeeded()
  const box = await label.boundingBox()
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2 - 30)
  check(
    'pointer raycast selects a node',
    (await page
      .locator('.cyber-node-button')
      .first()
      .getAttribute('aria-pressed')) === 'true'
  )
  await page
    .getByRole('button', { name: 'Resume ambient motion', exact: true })
    .click()
  await page.locator('#contact').scrollIntoViewIfNeeded()
  check(
    'offscreen scene stops drawing',
    (await profile(page, 'explorer offscreen')).draws === 0
  )
  await page.locator('#cyber-explorer').scrollIntoViewIfNeeded()
  await page.evaluate(() => {
    window.__qaHidden = true
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => window.__qaHidden,
    })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  check(
    'hidden document stops drawing',
    (await profile(page, 'document hidden')).draws === 0
  )
  await page.evaluate(() => {
    window.__qaHidden = false
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await page
    .getByRole('button', { name: 'Use static map', exact: true })
    .click()
  check(
    'manual static mode unmounts WebGL',
    (await page.locator('.cyber-scene').count()) === 0
  )
  await page.locator('#contact').scrollIntoViewIfNeeded()
  await page.locator('#cyber-explorer').scrollIntoViewIfNeeded()
  check(
    'manual static choice survives scrolling',
    (await page.locator('.cyber-scene').count()) === 0
  )
  check(
    'static mode leaves concept selection functional',
    (await page.locator('.cyber-node-button').count()) === 6
  )
  await page.getByRole('button', { name: 'Explore in 3D', exact: true }).click()
  await page
    .locator('.cyber-map-mode')
    .filter({ hasText: 'Interactive 3D' })
    .waitFor()
  await page
    .locator('.cyber-scene canvas')
    .evaluate((el) =>
      el.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()
    )
  await page.getByText('The 3D context was lost.', { exact: false }).waitFor()
  check(
    'context loss restores static map',
    (await page.locator('.cyber-scene').count()) === 0
  )
  await page.getByRole('button', { name: 'Retry 3D view', exact: true }).click()
  await page
    .locator('.cyber-map-mode')
    .filter({ hasText: 'Interactive 3D' })
    .waitFor()
  check('context loss can recover with a new renderer', true)
  await page.locator('.cyber-viewport').scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  const beforeUnmount = await page.evaluate(
    () => window.__cyberQA.deletedPrograms
  )
  await page
    .locator('#primary-navigation')
    .getByRole('link', { name: 'Notes', exact: true })
    .click()
  await page.waitForURL('**/notes')
  await page.waitForTimeout(200)
  check(
    'route unmount disposes GPU programs',
    (await page.evaluate(() => window.__cyberQA.deletedPrograms)) >
      beforeUnmount
  )
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto(base)
    await page.locator('#cyber-explorer').scrollIntoViewIfNeeded()
    await page.waitForTimeout(650)
    check(
      `no page overflow at ${width}px`,
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    )
    check(
      `3D opt-in on small screens ${width}px`,
      width > 640 || (await page.locator('.cyber-scene').count()) === 0
    )
    await page.locator('#cyber-explorer').screenshot({
      path: `.impeccable/review/webgl/${width}.png`,
      animations: 'disabled',
    })
  }
  await context.close()
  const reduced = await browser.newContext({
    reducedMotion: 'reduce',
    viewport: { width: 1440, height: 1000 },
  })
  await instrument(reduced)
  const rp = await reduced.newPage()
  await rp.goto(base)
  await rp.locator('#cyber-explorer').scrollIntoViewIfNeeded()
  check(
    'reduced motion defaults to static map',
    (await rp.locator('.cyber-scene').count()) === 0
  )
  await rp.getByRole('button', { name: 'Explore in 3D', exact: true }).click()
  await rp
    .locator('.cyber-map-mode')
    .filter({ hasText: 'Interactive 3D' })
    .waitFor()
  check(
    'reduced-motion 3D draws only on demand',
    (await profile(rp, 'reduced-motion 3D')).draws === 0
  )
  await reduced.close()
  const unsupported = await browser.newContext()
  await unsupported.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type === 'webgl2' ? null : original.call(this, type, ...args)
    }
  })
  const up = await unsupported.newPage()
  await up.goto(base)
  await up.locator('#cyber-explorer').scrollIntoViewIfNeeded()
  await up
    .getByText('3D is unavailable in this browser.', { exact: false })
    .waitFor()
  await up
    .getByRole('group', { name: 'Cybersecurity domains', exact: true })
    .getByRole('button', { name: 'Information Security', exact: true })
    .click()
  check(
    'WebGL failure preserves HTML domain interaction',
    (await up.locator('.cyber-info h3').innerText()) === 'Information Security'
  )
  check(
    'WebGL failure preserves static graph',
    await up.locator('.cyber-fallback').isVisible()
  )
  await unsupported.close()
  const chunkFile = fs
    .readdirSync('.next/static/chunks')
    .find(
      (file) =>
        file.endsWith('.js') &&
        fs
          .readFileSync(path.join('.next/static/chunks', file), 'utf8')
          .includes('WebGL2 unavailable')
    )
  if (!chunkFile)
    throw Error(
      'Could not identify the optional scene chunk for failure testing'
    )
  const broken = await browser.newContext()
  const bp = await broken.newPage()
  await bp.route('**/' + chunkFile, (route) => route.abort())
  await bp.goto(base)
  await bp.locator('#cyber-explorer').scrollIntoViewIfNeeded()
  await bp.getByText('The 3D view could not load.', { exact: false }).waitFor()
  await bp
    .getByRole('group', { name: 'Cybersecurity domains', exact: true })
    .getByRole('button', { name: 'Hacker Ethics', exact: true })
    .click()
  check(
    'failed dynamic import preserves usable HTML concepts',
    (await bp.locator('.cyber-info h3').innerText()) === 'Hacker Ethics'
  )
  await broken.close()
  const nojs = await browser.newContext({ javaScriptEnabled: false })
  const np = await nojs.newPage()
  await np.goto(base)
  check(
    'server-rendered map survives without JavaScript',
    await np.locator('.cyber-fallback').isVisible()
  )
  check(
    'server-rendered concept explanation survives without JavaScript',
    (await np.locator('.cyber-selection').innerText()).includes(
      'fictional actor'
    )
  )
  await nojs.close()
  check('no hydration or runtime exceptions', errors.length === 0)
  fs.writeFileSync(
    path.join(output, 'checks.json'),
    JSON.stringify({ checks, errors, profiles }, null, 2)
  )
  await browser.close()
  console.log(`${checks.length} checks passed`)
})().catch((error) => {
  fs.mkdirSync(output, { recursive: true })
  fs.writeFileSync(
    path.join(output, 'checks.json'),
    JSON.stringify({ checks, errors, profiles, error: error.message }, null, 2)
  )
  console.error(error)
  process.exit(1)
})
