if (process.env.QA_DISPOSABLE !== '1' || !process.env.QA_PASSWORD)
  throw Error(
    'Use QA_DISPOSABLE=1 and QA_PASSWORD with the isolated local fixture server only.'
  )
const { request, chromium } = require('playwright')
const fs = require('fs')
;(async () => {
  const api = await request.newContext({ baseURL: 'http://localhost:3100' })
  const results = []
  const ok = (name, value) => {
    results.push({ name, passed: !!value })
    if (!value) throw Error(name)
  }
  ok(
    'unauthenticated write denied',
    (
      await api.patch('/api/writeups/00000000-0000-0000-0000-000000000000', {
        data: { category: 'Web' },
      })
    ).status() === 401
  )
  ok(
    'login API',
    (
      await api.post('/api/auth/check', {
        data: { password: process.env.QA_PASSWORD },
      })
    ).ok()
  )
  const specs = [
    {
      create: '/api/admin/create',
      resource: '/api/writeups/',
      data: {
        title: 'QA disposable CRUD ' + Date.now(),
        lab_date: '2026-10-01',
        category: 'Web',
        overview: 'Test',
        attack_vector: 'Test',
        exploitation_walkthrough: 'Test',
        mitigation: 'Test',
        published: false,
      },
      update: { category: 'Network' },
    },
    {
      create: '/api/admin/notes/create',
      resource: '/api/notes/',
      data: {
        title: 'QA disposable note ' + Date.now(),
        note_date: '2026-10-01',
        category: 'Protocol',
        summary: 'Test',
        content: '## Testing\n\nText',
        published: false,
      },
      update: {
        title: 'QA edited note',
        note_date: '2026-10-02',
        category: 'Tool',
        summary: 'Edited',
        content: 'Text',
        published: false,
      },
    },
    {
      create: '/api/admin/create-cert',
      resource: '/api/certifications/',
      data: {
        name: 'QA disposable credential',
        issuer: 'QA only',
        issue_date: '2026-01-01',
      },
      update: {
        name: 'QA edited credential',
        issuer: 'QA only',
        issue_date: '2026-02-01',
        sort_order: 1,
      },
    },
    {
      create: '/api/admin/create-tag',
      resource: '/api/tags/',
      data: { name: 'QA disposable tag ' + Date.now(), color: '#a4f4c4' },
      update: { name: 'QA edited tag ' + Date.now(), color: '#79d9e8' },
    },
  ]
  for (const s of specs) {
    const res = await api.post(s.create, { data: s.data })
    ok(s.create + ' create', res.status() === 201)
    const record = await res.json()
    try {
      ok(
        s.resource + ' update',
        (await api.patch(s.resource + record.id, { data: s.update })).ok()
      )
    } finally {
      ok(
        s.resource + ' delete',
        (await api.delete(s.resource + record.id)).status() === 204
      )
    }
  }
  const browser = await chromium.launch()
  const context = await browser.newContext({
    storageState: await api.storageState(),
  })
  const page = await context.newPage()
  await page.goto('http://localhost:3100/qa-admin/certifications')
  const name = page.locator('input[type=text]').first()
  await name.pressSequentially('QA focus test')
  ok(
    'certification form retains typing focus',
    (await name.inputValue()) === 'QA focus test' &&
      (await name.evaluate((el) => el === document.activeElement))
  )
  await page.goto('http://localhost:3100/qa-admin/notes/new')
  await page.getByTitle('Heading 2', { exact: true }).first().click()
  ok(
    'Markdown toolbar edits text',
    (await page.locator('textarea').nth(1).inputValue()).includes('##')
  )
  await page
    .getByRole('button', { name: 'Preview', exact: false })
    .first()
    .click()
  ok(
    'Markdown preview renders',
    await page.locator('.prose-note').first().isVisible()
  )
  await browser.close()
  await api.dispose()
  fs.writeFileSync(
    'docs/qa/webgl/admin-checks.json',
    JSON.stringify(results, null, 2)
  )
  console.log(JSON.stringify(results, null, 2))
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
