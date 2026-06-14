import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { ADMIN } from '@/lib/adminPath'
import db from '@/lib/db'

export async function getServerSideProps() {
  const { rows } = await db.query('SELECT * FROM certifications ORDER BY sort_order ASC, issue_date DESC')
  return {
    props: {
      initialCerts: rows.map(r => ({
        ...r,
        issue_date: r.issue_date ? r.issue_date.toISOString().split('T')[0] : '',
        expiry_date: r.expiry_date ? r.expiry_date.toISOString().split('T')[0] : '',
      })),
    },
  }
}

const EMPTY_CERT = { name: '', issuer: '', issue_date: '', expiry_date: '', credential_url: '', badge_url: '', sort_order: 0 }
const inputCls = 'w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00ff41] transition-colors'

export default function CertificationsAdmin({ initialCerts }) {
  const [certs, setCerts] = useState(initialCerts)
  const [form, setForm] = useState(EMPTY_CERT)
  const [editId, setEditId] = useState(null)
  const [editData, setEditData] = useState({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function setF(field, value) { setForm(f => ({ ...f, [field]: value })) }
  function setE(field, value) { setEditData(d => ({ ...d, [field]: value })) }

  async function createCert(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/admin/create-cert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, sort_order: parseInt(form.sort_order) || 0 }),
    })
    const json = await res.json()
    setSaving(false)
    if (!res.ok) { setError(json.error || 'Failed'); return }
    const cert = {
      ...json,
      issue_date: json.issue_date ? json.issue_date.split('T')[0] : '',
      expiry_date: json.expiry_date ? json.expiry_date.split('T')[0] : '',
    }
    setCerts(c => [...c, cert].sort((a, b) => (a.sort_order - b.sort_order) || (b.issue_date > a.issue_date ? 1 : -1)))
    setForm(EMPTY_CERT)
  }

  async function saveEdit(id) {
    setSaving(true)
    const res = await fetch(`/api/certifications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editData, sort_order: parseInt(editData.sort_order) || 0 }),
    })
    const json = await res.json()
    setSaving(false)
    if (!res.ok) { setError(json.error || 'Failed'); return }
    const cert = {
      ...json,
      issue_date: json.issue_date ? json.issue_date.split('T')[0] : '',
      expiry_date: json.expiry_date ? json.expiry_date.split('T')[0] : '',
    }
    setCerts(c => c.map(cert2 => cert2.id === id ? cert : cert2).sort((a, b) => (a.sort_order - b.sort_order) || (b.issue_date > a.issue_date ? 1 : -1)))
    setEditId(null)
  }

  async function deleteCert(id, name) {
    if (!confirm(`Delete certification "${name}"?`)) return
    await fetch(`/api/certifications/${id}`, { method: 'DELETE' })
    setCerts(c => c.filter(cert => cert.id !== id))
  }

  function CertForm({ data, setData, onSubmit, label }) {
    return (
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-[#aaa] text-xs font-mono mb-1">CERTIFICATION NAME *</label>
            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className={inputCls} placeholder="e.g. CompTIA Security+" required />
          </div>
          <div>
            <label className="block text-[#aaa] text-xs font-mono mb-1">ISSUER *</label>
            <input type="text" value={data.issuer} onChange={e => setData('issuer', e.target.value)} className={inputCls} placeholder="e.g. CompTIA, SANS, Offensive Security" required />
          </div>
          <div>
            <label className="block text-[#aaa] text-xs font-mono mb-1">ISSUE DATE *</label>
            <input type="date" value={data.issue_date} onChange={e => setData('issue_date', e.target.value)} className={inputCls} required />
          </div>
          <div>
            <label className="block text-[#aaa] text-xs font-mono mb-1">EXPIRY DATE</label>
            <input type="date" value={data.expiry_date} onChange={e => setData('expiry_date', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-[#aaa] text-xs font-mono mb-1">SORT ORDER</label>
            <input type="number" value={data.sort_order} onChange={e => setData('sort_order', e.target.value)} className={inputCls} placeholder="0 = first" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[#aaa] text-xs font-mono mb-1">CREDENTIAL URL</label>
            <input type="url" value={data.credential_url} onChange={e => setData('credential_url', e.target.value)} className={inputCls} placeholder="https://credly.com/badges/..." />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[#aaa] text-xs font-mono mb-1">BADGE IMAGE URL</label>
            <input type="url" value={data.badge_url} onChange={e => setData('badge_url', e.target.value)} className={inputCls} placeholder="https://images.credly.com/..." />
          </div>
        </div>
        {error && <p className="text-red-400 text-xs font-mono mb-3">[ERROR] {error}</p>}
        <button type="submit" disabled={saving} className="bg-[#00ff41] text-black font-bold text-sm px-5 py-2 rounded hover:bg-[#00cc33] disabled:opacity-40 transition-colors">
          {saving ? 'Saving…' : label}
        </button>
      </form>
    )
  }

  return (
    <>
      <Head><title>Certifications — Admin</title></Head>
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <header className="border-b border-[#222] px-6 py-4">
          <Link href={`/${ADMIN}`} className="text-[#00ff41] font-mono text-sm hover:underline">
            ← Back to Dashboard
          </Link>
          <h1 className="text-white text-xl font-bold mt-1">Manage Certifications</h1>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-8">
          <div className="border border-[#222] bg-[#0d0d0d] rounded-lg p-6 mb-8">
            <h2 className="text-[#00ff41] font-mono text-xs tracking-widest mb-4">{'// ADD CERTIFICATION'}</h2>
            <CertForm data={form} setData={setF} onSubmit={createCert} label="+ Add Certification" />
          </div>

          {certs.length === 0 ? (
            <p className="text-[#444] font-mono text-sm text-center py-12">No certifications yet.</p>
          ) : (
            <div className="space-y-4">
              {certs.map(cert => (
                <div key={cert.id} className="border border-[#222] bg-[#0d0d0d] rounded-lg p-5">
                  {editId === cert.id ? (
                    <>
                      <h3 className="text-[#00ff41] font-mono text-xs tracking-widest mb-4">{'// EDITING'}</h3>
                      <CertForm
                        data={editData}
                        setData={setE}
                        onSubmit={e => { e.preventDefault(); saveEdit(cert.id) }}
                        label="Save Changes"
                      />
                      <button onClick={() => setEditId(null)} className="text-[#666] text-xs font-mono mt-3 hover:text-white">Cancel</button>
                    </>
                  ) : (
                    <div className="flex items-start gap-4">
                      {cert.badge_url && (
                        <img src={cert.badge_url} alt={cert.name} className="w-16 h-16 object-contain flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-white font-semibold">{cert.name}</p>
                            <p className="text-[#888] text-sm">{cert.issuer}</p>
                            <p className="text-[#666] text-xs font-mono mt-1">
                              Issued: {cert.issue_date}
                              {cert.expiry_date && ` · Expires: ${cert.expiry_date}`}
                            </p>
                          </div>
                          <div className="flex gap-3 flex-shrink-0">
                            <button
                              onClick={() => { setEditId(cert.id); setEditData({ ...cert }) }}
                              className="text-[#888] text-xs font-mono hover:text-[#00ff41] transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteCert(cert.id, cert.name)}
                              className="text-[#666] text-xs font-mono hover:text-red-400 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        {cert.credential_url && (
                          <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="text-[#00ff41] text-xs font-mono mt-2 inline-block hover:underline">
                            View Credential →
                          </a>
                        )}
                      </div>
                    </div>
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
