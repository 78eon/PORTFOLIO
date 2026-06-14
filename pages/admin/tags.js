import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import db from '@/lib/db'
import { checkAuth } from '@/lib/authGuard'

export async function getServerSideProps({ req }) {
  if (!checkAuth(req)) return { redirect: { destination: '/login', permanent: false } }
  const { rows } = await db.query('SELECT * FROM tags ORDER BY name ASC')
  return { props: { initialTags: rows, adminPath: (process.env.ADMIN_PATH || 'admin').trim() } }
}

export default function TagsAdmin({ initialTags, adminPath }) {
  const [tags, setTags] = useState(initialTags)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#00ff41')
  const [editId, setEditId] = useState(null)
  const [editData, setEditData] = useState({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function createTag(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true); setError('')
    const res = await fetch('/api/admin/create-tag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), color }),
    })
    const json = await res.json()
    setSaving(false)
    if (!res.ok) { setError(json.error || 'Failed'); return }
    setTags(t => [...t, json].sort((a, b) => a.name.localeCompare(b.name)))
    setName(''); setColor('#00ff41')
  }

  async function saveEdit(id) {
    setSaving(true)
    const res = await fetch(`/api/tags/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    })
    const json = await res.json()
    setSaving(false)
    if (!res.ok) { setError(json.error || 'Failed'); return }
    setTags(t => t.map(tag => tag.id === id ? json : tag).sort((a, b) => a.name.localeCompare(b.name)))
    setEditId(null)
  }

  async function deleteTag(id, tagName) {
    if (!confirm(`Delete tag "${tagName}"?`)) return
    await fetch(`/api/tags/${id}`, { method: 'DELETE' })
    setTags(t => t.filter(tag => tag.id !== id))
  }

  return (
    <>
      <Head><title>Tags — Admin</title></Head>
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <header className="border-b border-[#222] px-6 py-4">
          <Link href={`/${adminPath}`} className="text-[#00ff41] font-mono text-sm hover:underline">← Back to Dashboard</Link>
          <h1 className="text-white text-xl font-bold mt-1">Manage Tags</h1>
        </header>

        <main className="max-w-2xl mx-auto px-6 py-8">
          <div className="border border-[#222] bg-[#0d0d0d] rounded-lg p-6 mb-8">
            <h2 className="text-[#00ff41] font-mono text-xs tracking-widest mb-4">{'// CREATE TAG'}</h2>
            <form onSubmit={createTag} className="flex gap-3 items-end flex-wrap">
              <div className="flex-1 min-w-40">
                <label className="block text-[#aaa] text-xs font-mono mb-1">TAG NAME *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00ff41] transition-colors" placeholder="e.g. SQLi, XSS, OWASP..." required />
              </div>
              <div>
                <label className="block text-[#aaa] text-xs font-mono mb-1">COLOR</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-[#333] bg-transparent" />
                  <span className="text-[#666] text-xs font-mono">{color}</span>
                </div>
              </div>
              <button type="submit" disabled={saving} className="bg-[#00ff41] text-black font-bold text-sm px-5 py-2 rounded hover:bg-[#00cc33] disabled:opacity-40 transition-colors">
                {saving ? 'Adding…' : '+ Add Tag'}
              </button>
            </form>
            {error && <p className="text-red-400 text-xs font-mono mt-3">[ERROR] {error}</p>}
          </div>

          {tags.length === 0 ? (
            <p className="text-[#444] font-mono text-sm text-center py-12">No tags yet.</p>
          ) : (
            <div className="space-y-2">
              {tags.map(tag => (
                <div key={tag.id} className="border border-[#222] bg-[#0d0d0d] rounded-lg px-4 py-3 flex items-center gap-4">
                  {editId === tag.id ? (
                    <>
                      <input type="color" value={editData.color} onChange={e => setEditData(d => ({ ...d, color: e.target.value }))} className="w-8 h-8 rounded cursor-pointer border border-[#333] bg-transparent flex-shrink-0" />
                      <input type="text" value={editData.name} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} className="flex-1 bg-[#0a0a0a] border border-[#333] rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#00ff41]" />
                      <button onClick={() => saveEdit(tag.id)} disabled={saving} className="text-[#00ff41] text-xs font-mono hover:underline">Save</button>
                      <button onClick={() => setEditId(null)} className="text-[#666] text-xs font-mono hover:text-white">Cancel</button>
                    </>
                  ) : (
                    <>
                      <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: tag.color }} />
                      <span className="flex-1 text-white text-sm font-mono">{tag.name}</span>
                      <button onClick={() => { setEditId(tag.id); setEditData({ name: tag.name, color: tag.color }) }} className="text-[#888] text-xs font-mono hover:text-[#00ff41] transition-colors">Edit</button>
                      <button onClick={() => deleteTag(tag.id, tag.name)} className="text-[#666] text-xs font-mono hover:text-red-400 transition-colors">Delete</button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  )
}
