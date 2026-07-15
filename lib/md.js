// Lightweight markdown renderer — no external packages

function escape(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function renderMarkdown(raw) {
  if (!raw) return ''

  // 1. Fenced code blocks (preserve exactly, no further processing inside)
  const blocks = []
  let text = raw.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const idx = blocks.length
    blocks.push(
      `<pre class="md-pre"><code class="md-code-block${lang ? ` language-${lang}` : ''}">${escape(code.trim())}</code></pre>`
    )
    return `\x00BLOCK${idx}\x00`
  })

  // 2. Inline code
  text = text.replace(/`([^`\n]+)`/g, (_, c) => `<code class="md-code">${escape(c)}</code>`)

  // 3. Headings
  text = text.replace(/^#### (.+)$/gm, (_, t) => `<h4 id="${headingId(t)}" class="md-h4">${t}</h4>`)
  text = text.replace(/^### (.+)$/gm, (_, t) => `<h3 id="${headingId(t)}" class="md-h3">${t}</h3>`)
  text = text.replace(/^## (.+)$/gm,  (_, t) => `<h2 id="${headingId(t)}" class="md-h2">${t}</h2>`)
  text = text.replace(/^# (.+)$/gm,   (_, t) => `<h1 id="${headingId(t)}" class="md-h1">${t}</h1>`)

  // 4. Blockquote (single pass, handle consecutive lines)
  text = text.replace(/(^> .+\n?)+/gm, m => {
    const inner = m.replace(/^> ?/gm, '').trim()
    return `<blockquote class="md-blockquote">${inner}</blockquote>\n`
  })

  // 5. Unordered lists
  text = text.replace(/(^[-*] .+\n?)+/gm, m => {
    const items = m.trim().split('\n').map(l => `<li class="md-li">${l.replace(/^[-*] /, '')}</li>`).join('')
    return `<ul class="md-ul">${items}</ul>\n`
  })

  // 6. Ordered lists
  text = text.replace(/(^\d+\. .+\n?)+/gm, m => {
    const items = m.trim().split('\n').map(l => `<li class="md-li">${l.replace(/^\d+\. /, '')}</li>`).join('')
    return `<ol class="md-ol">${items}</ol>\n`
  })

  // 7. Horizontal rule
  text = text.replace(/^---$/gm, '<hr class="md-hr">')

  // 8. Bold + italic
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="md-strong">$1</strong>')
  text = text.replace(/\*(.+?)\*/g, '<em class="md-em">$1</em>')

  // 9. Links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
    (_, label, href) => `<a class="md-link" href="${escape(href)}" target="_blank" rel="noopener noreferrer">${label}</a>`)

  // 10. Paragraphs — split on blank lines
  const paras = text.split(/\n{2,}/)
  text = paras.map(block => {
    block = block.trim()
    if (!block) return ''
    // Don't wrap block-level elements
    if (/^\x00BLOCK|^<(h[1-6]|ul|ol|pre|blockquote|hr)/.test(block)) return block
    return `<p class="md-p">${block.replace(/\n/g, '<br>')}</p>`
  }).join('\n')

  // 11. Restore code blocks
  blocks.forEach((b, i) => { text = text.replace(`\x00BLOCK${i}\x00`, b) })

  return text
}

function headingId(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export function extractHeadings(raw) {
  if (!raw) return []
  return [...raw.matchAll(/^(#{2,3}) (.+)$/gm)].map(m => ({
    level: m[1].length,
    text: m[2],
    id: headingId(m[2]),
  }))
}

export function readingTime(raw) {
  if (!raw) return 1
  return Math.max(1, Math.ceil(raw.trim().split(/\s+/).length / 200))
}
