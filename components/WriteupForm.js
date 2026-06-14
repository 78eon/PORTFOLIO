import { useState, useEffect, useRef } from 'react'

const CATEGORIES = ['Web', 'Network', 'Malware', 'Forensics', 'CTF', 'Other']
const IMPACT_LEVELS = ['None', 'Low', 'Medium', 'High', 'Critical']
const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

const EMPTY_FORM = {
  title: '',
  lab_date: new Date().toISOString().split('T')[0],
  category: 'Web',
  published: true,
  overview: '',
  impact_confidentiality: 'None',
  impact_integrity: 'None',
  impact_availability: 'None',
  attack_vector: '',
  exploitation_walkthrough: '',
  mitigation: '',
  key_takeaways: '',
  tools_used: [],
  tags: [],
  refs: [],
  screenshots: [],
  cvss_score: '',
  difficulty: '',
  lab_environment: '',
}

async function uploadImage(file) {
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
  const res = await fetch('/api/admin/upload-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: base64, contentType: file.type, filename: file.name }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Upload failed')
  return json.url
}

function Field({ label, hint, children }) {
  return (
    <div className="mb-6">
      <label className="block text-[#aaa] text-xs font-mono tracking-widest mb-1">{label}</label>
      {hint && <p className="text-[#666] text-xs mb-2">{hint}</p>}
      {children}
    </div>
  )
}

const inputCls = 'w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00ff41] transition-colors'
const selectCls = `${inputCls} cursor-pointer`

function impactColor(level) {
  const map = { None: '#666', Low: '#3b82f6', Medium: '#f59e0b', High: '#f97316', Critical: '#ef4444' }
  return map[level] || '#666'
}

export default function WriteupForm({ initialData, onSubmit, submitLabel = 'Save Writeup' }) {
  const [form, setForm] = useState(() => {
    const base = { ...EMPTY_FORM, ...(initialData || {}) }
    // Normalise screenshots: old writeups may have screenshot_urls TEXT[]
    if (!base.screenshots?.length && initialData?.screenshot_urls?.length) {
      base.screenshots = initialData.screenshot_urls.map(url => ({ url, description: '' }))
    }
    return {
      ...base,
      tools_used: initialData?.tools_used || [],
      tags: initialData?.tags || [],
      refs: initialData?.refs || [],
      screenshots: base.screenshots || [],
      cvss_score: initialData?.cvss_score ?? '',
      difficulty: initialData?.difficulty || '',
      lab_environment: initialData?.lab_environment || '',
      key_takeaways: initialData?.key_takeaways || '',
    }
  })

  const [toolInput, setToolInput] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [availableTags, setAvailableTags] = useState([])
  const [tagDropdown, setTagDropdown] = useState(false)
  const tagRef = useRef(null)
  const [uploading, setUploading] = useState([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/tags').then(r => r.json()).then(setAvailableTags).catch(() => {})
  }, [])

  useEffect(() => {
    function onClick(e) {
      if (tagRef.current && !tagRef.current.contains(e.target)) setTagDropdown(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  // Tools
  function addTool(e) {
    if (e.key === 'Enter' && toolInput.trim()) {
      e.preventDefault()
      if (!form.tools_used.includes(toolInput.trim())) {
        set('tools_used', [...form.tools_used, toolInput.trim()])
      }
      setToolInput('')
    }
  }
  function removeTool(tool) { set('tools_used', form.tools_used.filter(t => t !== tool)) }

  // Tags
  const filteredTags = availableTags.filter(t =>
    t.name.toLowerCase().includes(tagInput.toLowerCase()) && !form.tags.includes(t.name)
  )
  function selectTag(name) {
    if (!form.tags.includes(name)) set('tags', [...form.tags, name])
    setTagInput('')
    setTagDropdown(false)
  }
  function addTagFromInput(e) {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      selectTag(tagInput.trim())
    }
    if (e.key === 'Escape') setTagDropdown(false)
  }
  function removeTag(tag) { set('tags', form.tags.filter(t => t !== tag)) }

  // References
  function addRef() { set('refs', [...form.refs, { label: '', url: '' }]) }
  function updateRef(i, field, value) {
    set('refs', form.refs.map((r, idx) => idx === i ? { ...r, [field]: value } : r))
  }
  function removeRef(i) { set('refs', form.refs.filter((_, idx) => idx !== i)) }

  // Screenshots
  function removeScreenshot(idx) {
    set('screenshots', form.screenshots.filter((_, i) => i !== idx))
  }
  function updateScreenshotDesc(idx, description) {
    set('screenshots', form.screenshots.map((s, i) => i === idx ? { ...s, description } : s))
  }

  async function handleFiles(e) {
    const files = Array.from(e.target.files)
    e.target.value = ''
    for (const file of files) {
      const uid = `${Date.now()}-${Math.random()}`
      setUploading(u => [...u, { id: uid, name: file.name }])
      try {
        const url = await uploadImage(file)
        setForm(f => ({ ...f, screenshots: [...f.screenshots, { url, description: '' }] }))
      } catch (err) {
        setError(`Failed to upload ${file.name}: ${err.message}`)
      } finally {
        setUploading(u => u.filter(item => item.id !== uid))
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        ...form,
        cvss_score: form.cvss_score === '' ? null : parseFloat(form.cvss_score),
      }
      await onSubmit(payload)
    } catch (err) {
      setError(err.message || 'Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Section 1 — Metadata */}
      <div className="border border-[#222] bg-[#0d0d0d] rounded-lg p-6 mb-6">
        <h2 className="text-[#00ff41] font-mono text-xs tracking-widest mb-4">{'// METADATA'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Field label="TITLE *">
              <input
                type="text"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                className={inputCls}
                placeholder="e.g. CVE-2024-XXXX — Zero-Day in Apache HTTP Server"
                required
              />
            </Field>
          </div>
          <Field label="LAB DATE *">
            <input
              type="date"
              value={form.lab_date}
              onChange={e => set('lab_date', e.target.value)}
              className={inputCls}
              required
            />
          </Field>
          <Field label="CATEGORY *">
            <select value={form.category} onChange={e => set('category', e.target.value)} className={selectCls}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="DIFFICULTY">
            <select value={form.difficulty} onChange={e => set('difficulty', e.target.value)} className={selectCls}>
              <option value="">— Select —</option>
              {DIFFICULTY_LEVELS.map(d => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="LAB ENVIRONMENT" hint="e.g. TryHackMe, HackTheBox, DVWA, local VM">
            <input
              type="text"
              value={form.lab_environment}
              onChange={e => set('lab_environment', e.target.value)}
              className={inputCls}
              placeholder="TryHackMe — Room name"
            />
          </Field>
        </div>

        {/* Tags */}
        <Field label="TAGS" hint="Type to search or create tags, press Enter to add">
          <div ref={tagRef} className="relative">
            <input
              type="text"
              value={tagInput}
              onChange={e => { setTagInput(e.target.value); setTagDropdown(true) }}
              onFocus={() => setTagDropdown(true)}
              onKeyDown={addTagFromInput}
              className={inputCls}
              placeholder="e.g. OWASP, SQLi, XSS, Privilege Escalation..."
            />
            {tagDropdown && (filteredTags.length > 0 || tagInput.trim()) && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-[#111] border border-[#333] rounded shadow-xl max-h-48 overflow-auto">
                {filteredTags.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => selectTag(t.name)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-[#1a1a1a] flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: t.color }} />
                    <span className="text-white">{t.name}</span>
                  </button>
                ))}
                {tagInput.trim() && !availableTags.some(t => t.name.toLowerCase() === tagInput.trim().toLowerCase()) && (
                  <button
                    type="button"
                    onClick={() => selectTag(tagInput.trim())}
                    className="w-full text-left px-3 py-2 text-sm text-[#00ff41] hover:bg-[#1a1a1a]"
                  >
                    + Create &ldquo;{tagInput.trim()}&rdquo;
                  </button>
                )}
              </div>
            )}
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {form.tags.map(tag => {
                const meta = availableTags.find(t => t.name === tag)
                return (
                  <span
                    key={tag}
                    className="flex items-center gap-1 bg-[#1a1a1a] border border-[#333] text-xs font-mono px-3 py-1 rounded-full"
                    style={{ color: meta?.color || '#00ff41' }}
                  >
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="text-[#666] hover:text-red-400 ml-1">×</button>
                  </span>
                )
              })}
            </div>
          )}
        </Field>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.published}
            onChange={e => set('published', e.target.checked)}
            className="w-4 h-4 accent-[#00ff41]"
          />
          <span className="text-[#aaa] text-sm">Published (visible on public site)</span>
        </label>
      </div>

      {/* Section 2 — Vulnerability Details */}
      <div className="border border-[#222] bg-[#0d0d0d] rounded-lg p-6 mb-6">
        <h2 className="text-[#00ff41] font-mono text-xs tracking-widest mb-4">{'// VULNERABILITY DETAILS'}</h2>
        <Field label="OVERVIEW *" hint="Brief description of what this vulnerability is">
          <textarea
            rows={4}
            value={form.overview}
            onChange={e => set('overview', e.target.value)}
            className={inputCls}
            placeholder="Describe the vulnerability — what it is, where it exists, and why it matters."
            required
          />
        </Field>

        <div className="mb-6">
          <label className="block text-[#aaa] text-xs font-mono tracking-widest mb-3">IMPACT ASSESSMENT</label>
          <div className="grid grid-cols-3 gap-4">
            {[
              ['impact_confidentiality', 'Confidentiality'],
              ['impact_integrity', 'Integrity'],
              ['impact_availability', 'Availability'],
            ].map(([field, label]) => (
              <div key={field}>
                <p className="text-[#666] text-xs mb-1">{label}</p>
                <select
                  value={form[field]}
                  onChange={e => set(field, e.target.value)}
                  className={selectCls}
                  style={{ borderColor: form[field] !== 'None' ? impactColor(form[field]) : undefined }}
                >
                  {IMPACT_LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Field label="CVSS SCORE" hint="Base score 0.0–10.0">
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={form.cvss_score}
              onChange={e => set('cvss_score', e.target.value)}
              className={inputCls}
              placeholder="e.g. 9.8"
            />
          </Field>
        </div>

        <Field label="ATTACK VECTOR / ENTRY POINT *" hint="How was the vulnerability accessed or triggered?">
          <textarea
            rows={3}
            value={form.attack_vector}
            onChange={e => set('attack_vector', e.target.value)}
            className={inputCls}
            placeholder="Unauthenticated HTTP endpoint, malicious file upload, SQL injection in login form..."
            required
          />
        </Field>
      </div>

      {/* Section 3 — Lab Walkthrough */}
      <div className="border border-[#222] bg-[#0d0d0d] rounded-lg p-6 mb-6">
        <h2 className="text-[#00ff41] font-mono text-xs tracking-widest mb-4">{'// LAB WALKTHROUGH'}</h2>
        <Field label="EXPLOITATION WALKTHROUGH *" hint="Step-by-step: what did you do, what happened, what was the result?">
          <textarea
            rows={10}
            value={form.exploitation_walkthrough}
            onChange={e => set('exploitation_walkthrough', e.target.value)}
            className={`${inputCls} font-mono text-xs`}
            placeholder={`Step 1: Discovered the endpoint using Nmap scan...\nStep 2: Sent a crafted payload...\nStep 3: Received a reverse shell...`}
            required
          />
        </Field>
        <Field label="MITIGATION APPLIED *" hint="How did you fix or defend against this vulnerability?">
          <textarea
            rows={6}
            value={form.mitigation}
            onChange={e => set('mitigation', e.target.value)}
            className={inputCls}
            placeholder="Applied patch version X.Y.Z, added input validation, configured firewall rule..."
            required
          />
        </Field>
        <Field label="KEY TAKEAWAYS" hint="What did you learn? What would you do differently?">
          <textarea
            rows={4}
            value={form.key_takeaways}
            onChange={e => set('key_takeaways', e.target.value)}
            className={inputCls}
            placeholder="Always validate input server-side. Never trust user-supplied filenames..."
          />
        </Field>
      </div>

      {/* Section 4 — Tools & Evidence */}
      <div className="border border-[#222] bg-[#0d0d0d] rounded-lg p-6 mb-6">
        <h2 className="text-[#00ff41] font-mono text-xs tracking-widest mb-4">{'// TOOLS & EVIDENCE'}</h2>

        <Field label="TOOLS USED" hint="Type a tool name and press Enter to add">
          <input
            type="text"
            value={toolInput}
            onChange={e => setToolInput(e.target.value)}
            onKeyDown={addTool}
            className={inputCls}
            placeholder="e.g. Burp Suite, Nmap, Metasploit, Wireshark..."
          />
          {form.tools_used.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {form.tools_used.map(tool => (
                <span key={tool} className="flex items-center gap-1 bg-[#1a1a1a] border border-[#333] text-[#ccc] text-xs font-mono px-3 py-1 rounded-full">
                  {tool}
                  <button type="button" onClick={() => removeTool(tool)} className="text-[#666] hover:text-red-400 ml-1">×</button>
                </span>
              ))}
            </div>
          )}
        </Field>

        <Field label="SCREENSHOTS / EVIDENCE" hint="Upload screenshots — add a description to each one after uploading">
          <label className="flex items-center gap-3 cursor-pointer border border-dashed border-[#333] rounded px-4 py-3 hover:border-[#00ff41] transition-colors">
            <span className="text-[#00ff41] text-lg">+</span>
            <span className="text-[#aaa] text-sm">Choose screenshots to upload</span>
            <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
          </label>

          {uploading.length > 0 && (
            <div className="mt-3 space-y-1">
              {uploading.map(u => (
                <div key={u.id} className="flex items-center gap-2 text-[#888] text-xs font-mono">
                  <span className="animate-spin inline-block">⟳</span> Uploading {u.name}…
                </div>
              ))}
            </div>
          )}

          {form.screenshots.length > 0 && (
            <div className="mt-4 space-y-4">
              {form.screenshots.map((shot, idx) => (
                <div key={idx} className="border border-[#222] rounded-lg overflow-hidden">
                  <div className="relative group">
                    <img src={shot.url} alt={shot.description || `Screenshot ${idx + 1}`} className="w-full max-h-48 object-cover" />
                    <button
                      type="button"
                      onClick={() => removeScreenshot(idx)}
                      className="absolute top-2 right-2 bg-black/80 text-red-400 rounded-full w-6 h-6 text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                  <div className="p-2 bg-[#111]">
                    <input
                      type="text"
                      value={shot.description}
                      onChange={e => updateScreenshotDesc(idx, e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-[#333] text-[#aaa] text-xs py-1 focus:outline-none focus:border-[#00ff41] transition-colors"
                      placeholder={`Description for screenshot ${idx + 1} (optional)`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Field>
      </div>

      {/* Section 5 — References */}
      <div className="border border-[#222] bg-[#0d0d0d] rounded-lg p-6 mb-6">
        <h2 className="text-[#00ff41] font-mono text-xs tracking-widest mb-4">{'// REFERENCES'}</h2>
        <div className="space-y-3 mb-4">
          {form.refs.map((ref, i) => (
            <div key={i} className="flex gap-3 items-start">
              <input
                type="text"
                value={ref.label}
                onChange={e => updateRef(i, 'label', e.target.value)}
                className={`${inputCls} flex-shrink-0 w-40`}
                placeholder="Label (e.g. CVE-2024-XXXX)"
              />
              <input
                type="url"
                value={ref.url}
                onChange={e => updateRef(i, 'url', e.target.value)}
                className={`${inputCls} flex-1`}
                placeholder="https://..."
              />
              <button type="button" onClick={() => removeRef(i)} className="text-[#666] hover:text-red-400 text-lg transition-colors mt-1">×</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addRef} className="text-[#00ff41] text-sm font-mono hover:underline">
          + Add Reference
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded p-3 mb-4">
          <p className="text-red-400 text-sm font-mono">[ERROR] {error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || uploading.length > 0}
        className="w-full bg-[#00ff41] text-black font-bold py-3 rounded text-sm hover:bg-[#00cc33] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  )
}
