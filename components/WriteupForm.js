import { useState } from 'react'

const CATEGORIES = ['Web', 'Network', 'Malware', 'Forensics', 'CTF', 'Other']
const IMPACT_LEVELS = ['None', 'Low', 'High']

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
  tools_used: [],
  refs: [],
  screenshot_urls: [],
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

export default function WriteupForm({ initialData, onSubmit, submitLabel = 'Save Writeup' }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    ...(initialData || {}),
    tools_used: initialData?.tools_used || [],
    refs: initialData?.refs || [],
    screenshot_urls: initialData?.screenshot_urls || [],
  }))
  const [toolInput, setToolInput] = useState('')
  const [uploading, setUploading] = useState([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function addTool(e) {
    if (e.key === 'Enter' && toolInput.trim()) {
      e.preventDefault()
      if (!form.tools_used.includes(toolInput.trim())) {
        set('tools_used', [...form.tools_used, toolInput.trim()])
      }
      setToolInput('')
    }
  }

  function removeTool(tool) {
    set('tools_used', form.tools_used.filter(t => t !== tool))
  }

  function addRef() {
    set('refs', [...form.refs, { label: '', url: '' }])
  }

  function updateRef(i, field, value) {
    const updated = form.refs.map((r, idx) => idx === i ? { ...r, [field]: value } : r)
    set('refs', updated)
  }

  function removeRef(i) {
    set('refs', form.refs.filter((_, idx) => idx !== i))
  }

  function removeScreenshot(url) {
    set('screenshot_urls', form.screenshot_urls.filter(u => u !== url))
  }

  async function handleFiles(e) {
    const files = Array.from(e.target.files)
    e.target.value = ''
    for (const file of files) {
      const id = `${Date.now()}-${Math.random()}`
      setUploading(u => [...u, { id, name: file.name }])
      try {
        const url = await uploadImage(file)
        setForm(f => ({ ...f, screenshot_urls: [...f.screenshot_urls, url] }))
      } catch (err) {
        setError(`Failed to upload ${file.name}: ${err.message}`)
      } finally {
        setUploading(u => u.filter(item => item.id !== id))
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await onSubmit(form)
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
        </div>
        <label className="flex items-center gap-3 cursor-pointer mt-2">
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

        <div className="mb-4">
          <label className="block text-[#aaa] text-xs font-mono tracking-widest mb-3">IMPACT ASSESSMENT</label>
          <div className="grid grid-cols-3 gap-4">
            {[
              ['impact_confidentiality', 'Confidentiality'],
              ['impact_integrity', 'Integrity'],
              ['impact_availability', 'Availability'],
            ].map(([field, label]) => (
              <div key={field}>
                <p className="text-[#666] text-xs mb-1">{label}</p>
                <select value={form[field]} onChange={e => set(field, e.target.value)} className={selectCls}>
                  {IMPACT_LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        <Field label="ATTACK VECTOR / ENTRY POINT *" hint="How was the vulnerability accessed or triggered?">
          <textarea
            rows={3}
            value={form.attack_vector}
            onChange={e => set('attack_vector', e.target.value)}
            className={inputCls}
            placeholder="Describe the attack surface — unauthenticated HTTP endpoint, malicious file upload, SQL injection in login form, etc."
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
            placeholder="Applied patch version X.Y.Z, added input validation, configured firewall rule, rotated credentials..."
            required
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
                  <button type="button" onClick={() => removeTool(tool)} className="text-[#666] hover:text-red-400 ml-1 transition-colors">×</button>
                </span>
              ))}
            </div>
          )}
        </Field>

        <Field label="SCREENSHOTS / EVIDENCE" hint="Upload screenshots showing your lab work (images upload immediately)">
          <label className="flex items-center gap-3 cursor-pointer border border-dashed border-[#333] rounded px-4 py-3 hover:border-[#00ff41] transition-colors">
            <span className="text-[#00ff41] text-lg">+</span>
            <span className="text-[#aaa] text-sm">Choose screenshots to upload</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              className="hidden"
            />
          </label>

          {uploading.length > 0 && (
            <div className="mt-3 space-y-1">
              {uploading.map(u => (
                <div key={u.id} className="flex items-center gap-2 text-[#888] text-xs font-mono">
                  <span className="animate-spin">⟳</span> Uploading {u.name}…
                </div>
              ))}
            </div>
          )}

          {form.screenshot_urls.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-3">
              {form.screenshot_urls.map(url => (
                <div key={url} className="relative group">
                  <img src={url} alt="Screenshot" className="w-full h-20 object-cover rounded border border-[#333]" />
                  <button
                    type="button"
                    onClick={() => removeScreenshot(url)}
                    className="absolute top-1 right-1 bg-black/80 text-red-400 rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
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
              <button
                type="button"
                onClick={() => removeRef(i)}
                className="text-[#666] hover:text-red-400 text-lg transition-colors mt-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addRef}
          className="text-[#00ff41] text-sm font-mono hover:underline"
        >
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
