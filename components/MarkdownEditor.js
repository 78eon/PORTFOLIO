import { useState, useRef } from 'react'
import { renderMarkdown } from '@/lib/md'

// Insert/wrap text at textarea cursor
function applyWrap(el, before, after) {
  const s = el.selectionStart, e = el.selectionEnd
  const val = el.value
  const sel = val.slice(s, e) || 'text'
  const next = val.slice(0, s) + before + sel + after + val.slice(e)
  return { value: next, sel: [s + before.length, s + before.length + sel.length] }
}

function applyPrefix(el, prefix) {
  const s = el.selectionStart
  const val = el.value
  const lineStart = val.lastIndexOf('\n', s - 1) + 1
  const next = val.slice(0, lineStart) + prefix + val.slice(lineStart)
  return { value: next, sel: [s + prefix.length, s + prefix.length] }
}

const SEP = null

const TOOLS = [
  { label: 'H2',  title: 'Heading 2',    fn: el => applyPrefix(el, '## ') },
  { label: 'H3',  title: 'Heading 3',    fn: el => applyPrefix(el, '### ') },
  SEP,
  { label: 'B',   title: 'Bold',         fn: el => applyWrap(el, '**', '**'),   cls: 'font-bold' },
  { label: 'I',   title: 'Italic',       fn: el => applyWrap(el, '*', '*'),     cls: 'italic' },
  { label: '`',   title: 'Inline code',  fn: el => applyWrap(el, '`', '`'),    cls: 'font-mono' },
  SEP,
  { label: '```', title: 'Code block',   fn: el => applyWrap(el, '```\n', '\n```'), cls: 'font-mono text-[10px]' },
  { label: '•',   title: 'Bullet list',  fn: el => applyPrefix(el, '- ') },
  { label: '1.',  title: 'Ordered list', fn: el => applyPrefix(el, '1. '),      cls: 'font-mono' },
  { label: '>',   title: 'Blockquote',   fn: el => applyPrefix(el, '> ') },
  SEP,
  { label: '↗',  title: 'Link',         fn: el => applyWrap(el, '[', '](url)') },
  { label: '—',   title: 'Divider',      fn: el => applyPrefix(el, '---\n') },
]

export default function MarkdownEditor({ value, onChange, placeholder, rows = 12 }) {
  const [preview, setPreview] = useState(false)
  const ref = useRef()

  function apply(tool) {
    const el = ref.current
    if (!el) return
    const result = tool.fn(el)
    onChange(result.value)
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(...result.sel)
    }, 0)
  }

  return (
    <div className="rounded-xl overflow-hidden border border-[#1a1a30] focus-within:border-[#00ff9d]/30 transition-all">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-2 bg-[#0a0a16] border-b border-[#1a1a30] flex-wrap">
        {TOOLS.map((t, i) =>
          t === null
            ? <span key={i} className="inline-block w-px h-4 bg-[#1e293b] mx-1.5" />
            : (
              <button
                key={i}
                type="button"
                title={t.title}
                onClick={() => apply(t)}
                className={`min-w-[28px] h-7 px-2 rounded text-xs transition-all hover:bg-[#1a1a30] hover:text-white text-[#475569] ${t.cls || ''}`}
              >
                {t.label}
              </button>
            )
        )}
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setPreview(p => !p)}
          className={`text-xs font-mono px-3 py-1.5 rounded border transition-all ${
            preview
              ? 'bg-[#00ff9d] text-black border-[#00ff9d] font-bold'
              : 'border-[#1a1a30] text-[#475569] hover:text-white hover:border-[#2a2a50]'
          }`}
        >
          {preview ? '✎ Edit' : '👁 Preview'}
        </button>
      </div>

      {preview ? (
        <div
          className="min-h-[200px] p-5 bg-[#020615] prose-note overflow-auto"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(value) || '<p class="text-[#334155] text-sm font-mono">Nothing to preview yet.</p>' }}
        />
      ) : (
        <textarea
          ref={ref}
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full bg-[#020615] px-4 py-3 text-[#e2e8f0] text-sm font-mono focus:outline-none resize-y placeholder-[#1e293b] leading-relaxed"
        />
      )}

      {/* Status bar */}
      <div className="flex items-center gap-4 px-3 py-1.5 bg-[#0a0a16] border-t border-[#0f172a]">
        <span className="text-[#1e293b] text-[10px] font-mono">
          {value.length} chars · {value.trim().split(/\s+/).filter(Boolean).length} words
        </span>
        <span className="text-[#1e293b] text-[10px] font-mono">Markdown supported</span>
      </div>
    </div>
  )
}
