import { useState } from 'react'
import { useRouter } from 'next/router'
import MarkdownEditor from './MarkdownEditor'

const CATEGORIES = ['Networking', 'Tool', 'Algorithm', 'Protocol', 'Security', 'OS', 'Other']

const inputCls = 'w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent)]/20 transition-all placeholder-[var(--muted)]'
const labelCls = 'block text-[var(--muted)] text-xs font-mono tracking-widest mb-2'

function TagInput({ value, onChange, placeholder }) {
  const [input, setInput] = useState('')
  function add(e) {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      const tag = input.trim().replace(/^,+|,+$/g, '')
      if (tag && !value.includes(tag)) onChange([...value, tag])
      setInput('')
    }
  }
  function remove(tag) { onChange(value.filter(t => t !== tag)) }
  return (
    <div className="border border-[var(--border)] rounded-lg bg-[var(--background)] p-3 focus-within:border-[var(--accent)]/50 transition-all">
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map(t => (
          <span key={t} className="inline-flex items-center gap-1.5 bg-[var(--surface)] border border-[var(--border)] text-[var(--secondary)] text-xs font-mono px-2.5 py-1 rounded-full">
            {t}
            <button type="button" onClick={() => remove(t)} className="text-[var(--muted)] hover:text-red-400 transition-colors">×</button>
          </span>
        ))}
      </div>
      <input aria-label="Add related tool"
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={add}
        placeholder={placeholder || 'Type and press Enter'}
        className="w-full bg-transparent text-white text-sm focus:outline-none placeholder-[var(--muted)]"
      />
    </div>
  )
}

function RefsInput({ value, onChange }) {
  function add() { onChange([...value, { label: '', url: '' }]) }
  function remove(i) { onChange(value.filter((_, idx) => idx !== i)) }
  function update(i, field, val) {
    const next = [...value]
    next[i] = { ...next[i], [field]: val }
    onChange(next)
  }
  return (
    <div className="space-y-2">
      {value.map((ref, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input type="text" aria-label="Reference label" value={ref.label} onChange={e => update(i, 'label', e.target.value)} placeholder="Label" className={`${inputCls} flex-1`} />
          <input type="url" aria-label="Reference URL" value={ref.url} onChange={e => update(i, 'url', e.target.value)} placeholder="https://…" className={`${inputCls} flex-[2]`} />
          <button type="button" onClick={() => remove(i)} className="text-[var(--muted)] hover:text-red-400 text-lg font-mono flex-shrink-0 transition-colors">×</button>
        </div>
      ))}
      <button type="button" onClick={add} className="text-[var(--accent)] text-xs font-mono hover:underline">+ Add reference</button>
    </div>
  )
}

export default function NoteForm({ initial, adminPath }) {
  const router = useRouter()
  const [form, setForm] = useState({
    title: initial?.title || '',
    note_date: initial?.note_date || new Date().toISOString().split('T')[0],
    category: initial?.category || 'Networking',
    summary: initial?.summary || '',
    content: initial?.content || '',
    examples: initial?.examples || '',
    tools_used: initial?.tools_used || [],
    refs: initial?.refs || [],
    published: initial?.published !== false,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(field, value) { setForm(f => ({ ...f, [field]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      let res
      if (initial?.id) {
        res = await fetch(`/api/notes/${initial.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      } else {
        res = await fetch('/api/admin/notes/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      }
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Save failed'); setSaving(false); return }
      router.push(`/${adminPath}/notes`)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Metadata */}
      <section>
        <h2 className="text-[var(--accent)] font-mono text-xs tracking-widest mb-5 flex items-center gap-3">
          <span>{'// METADATA'}</span>
          <span className="flex-1 h-px bg-gradient-to-r from-[var(--border)] to-transparent" />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label htmlFor="note-note_date" className={labelCls}>DATE *</label>
            <input type="date" id="note-note_date" value={form.note_date} onChange={e => set('note_date', e.target.value)} className={inputCls} required />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="note-category" className={labelCls}>CATEGORY *</label>
            <select id="note-category" value={form.category} onChange={e => set('category', e.target.value)} className={inputCls}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="md:col-span-1 flex items-center pt-5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.published} onChange={e => set('published', e.target.checked)} className="w-4 h-4 accent-[var(--accent)]" />
              <span className="text-[var(--secondary)] text-sm">Published</span>
            </label>
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="note-title" className={labelCls}>TITLE *</label>
          <input type="text" id="note-title" value={form.title} onChange={e => set('title', e.target.value)} className={inputCls} placeholder="e.g. How TCP/IP works, Nmap deep dive, RSA algorithm explained…" required />
        </div>
      </section>

      {/* Summary */}
      <section>
        <h2 className="text-[var(--accent)] font-mono text-xs tracking-widest mb-5 flex items-center gap-3">
          <span>{'// WHAT IS IT? (QUICK SUMMARY)'}</span>
          <span className="flex-1 h-px bg-gradient-to-r from-[var(--border)] to-transparent" />
        </h2>
        <label htmlFor="note-summary" className={labelCls}>SHORT DESCRIPTION *</label>
        <textarea
          rows={2}
          id="note-summary" value={form.summary}
          onChange={e => set('summary', e.target.value)}
          className={inputCls}
          placeholder="One or two sentences: what is this, why does it matter?"
          required
        />
      </section>

      {/* Main content */}
      <section>
        <h2 className="text-[var(--accent)] font-mono text-xs tracking-widest mb-5 flex items-center gap-3">
          <span>{'// HOW IT WORKS / DETAILS'}</span>
          <span className="flex-1 h-px bg-gradient-to-r from-[var(--border)] to-transparent" />
        </h2>
        <label htmlFor="note-content" className={labelCls}>IN-DEPTH NOTES — use the toolbar to format with headings, bold, code blocks, lists…</label>
        <MarkdownEditor
          id="note-content" value={form.content}
          onChange={v => set('content', v)}
          rows={14}
          placeholder={`Explain the concept in detail. Use ## Heading for sections.\n\nFor a tool: what is it used for, how is it proposed, what does each flag do?\nFor a port/protocol: what runs on it, how does the handshake work?\nFor an algorithm: steps, complexity, security relevance?`}
        />
      </section>

      {/* Examples */}
      <section>
        <h2 className="text-[var(--accent)] font-mono text-xs tracking-widest mb-5 flex items-center gap-3">
          <span>{'// PRACTICAL EXAMPLES / COMMANDS'}</span>
          <span className="flex-1 h-px bg-gradient-to-r from-[var(--border)] to-transparent" />
        </h2>
        <label htmlFor="note-examples" className={labelCls}>USAGE EXAMPLES (optional) — use ``` for code blocks</label>
        <MarkdownEditor
          id="note-examples" value={form.examples}
          onChange={v => set('examples', v)}
          rows={8}
          placeholder={`\`\`\`bash\nnmap -sV -p 80,443 target.com\n\`\`\`\n\nExplain what the output means, walk through the result step by step.`}
        />
      </section>

      {/* Tools */}
      <section>
        <h2 className="text-[var(--accent)] font-mono text-xs tracking-widest mb-5 flex items-center gap-3">
          <span>{'// RELATED TOOLS / TECHNOLOGIES'}</span>
          <span className="flex-1 h-px bg-gradient-to-r from-[var(--border)] to-transparent" />
        </h2>
        <TagInput value={form.tools_used} onChange={v => set('tools_used', v)} placeholder="nmap, wireshark, openssl… press Enter" />
      </section>

      {/* References */}
      <section>
        <h2 className="text-[var(--accent)] font-mono text-xs tracking-widest mb-5 flex items-center gap-3">
          <span>{'// REFERENCES'}</span>
          <span className="flex-1 h-px bg-gradient-to-r from-[var(--border)] to-transparent" />
        </h2>
        <RefsInput value={form.refs} onChange={v => set('refs', v)} />
      </section>

      {error && (
        <p className="text-red-400 text-sm font-mono bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</p>
      )}

      <div className="flex items-center gap-4 border-t border-[var(--border)] pt-6">
        <button
          type="submit"
          disabled={saving}
          className="bg-[var(--accent)] text-black font-bold text-sm px-8 py-3 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving…' : initial?.id ? 'Update Note' : 'Save Note'}
        </button>
        <button type="button" onClick={() => router.push(`/${adminPath}/notes`)} className="text-[var(--muted)] text-sm font-mono hover:text-white transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}
