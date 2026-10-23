import { dateOnly } from '@/lib/date'
import Head from 'next/head'
import Link from 'next/link'
import { useId, useState } from 'react'
import db from '@/lib/db'
import { checkAuth } from '@/lib/authGuard'

export async function getServerSideProps({ req }) {
  if (!checkAuth(req)) return { redirect: { destination: '/login', permanent: false } }
  const { rows } = await db.query('SELECT * FROM certifications ORDER BY sort_order ASC, issue_date DESC')
  return {
    props: {
      adminPath: (process.env.ADMIN_PATH || 'admin').trim(),
      initialCerts: rows.map(r => ({
        ...r,
        created_at: r.created_at?.toISOString() ?? null,
        issue_date: r.issue_date ? dateOnly(r.issue_date) : '',
        expiry_date: r.expiry_date ? dateOnly(r.expiry_date) : '',
      })),
    },
  }
}

const EMPTY_CERT = { name: '', issuer: '', issue_date: '', expiry_date: '', credential_url: '', badge_url: '', sort_order: 0 }
const inputCls = 'w-full bg-[var(--background)] border border-[var(--border)] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--accent)] transition-colors'

  function CertForm({ data, setData, onSubmit, label, error, saving }) {
    const formId = useId()
    return (
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2">
            <label htmlFor={`${formId}-name`} className="block text-[var(--secondary)] text-xs font-mono mb-1">CERTIFICATION NAME *</label>
            <input type="text" id={`${formId}-name`} value={data.name} onChange={e => setData('name', e.target.value)} className={inputCls} placeholder="e.g. CompTIA Security+" required />
          </div>
          <div>
            <label htmlFor={`${formId}-issuer`} className="block text-[var(--secondary)] text-xs font-mono mb-1">ISSUER *</label>
            <input type="text" id={`${formId}-issuer`} value={data.issuer} onChange={e => setData('issuer', e.target.value)} className={inputCls} placeholder="e.g. CompTIA, SANS, Offensive Security" required />
          </div>
          <div>
            <label htmlFor={`${formId}-issue_date`} className="block text-[var(--secondary)] text-xs font-mono mb-1">ISSUE DATE *</label>
            <input type="date" id={`${formId}-issue_date`} value={data.issue_date} onChange={e => setData('issue_date', e.target.value)} className={inputCls} required />
          </div>
          <div>
            <label htmlFor={`${formId}-expiry_date`} className="block text-[var(--secondary)] text-xs font-mono mb-1">EXPIRY DATE</label>
            <input type="date" id={`${formId}-expiry_date`} value={data.expiry_date} onChange={e => setData('expiry_date', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor={`${formId}-sort_order`} className="block text-[var(--secondary)] text-xs font-mono mb-1">SORT ORDER</label>
            <input type="number" id={`${formId}-sort_order`} value={data.sort_order} onChange={e => setData('sort_order', e.target.value)} className={inputCls} placeholder="0 = first" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor={`${formId}-credential_url`} className="block text-[var(--secondary)] text-xs font-mono mb-1">CREDENTIAL URL</label>
            <input type="url" id={`${formId}-credential_url`} value={data.credential_url} onChange={e => setData('credential_url', e.target.value)} className={inputCls} placeholder="https://credly.com/badges/..." />
          </div>
          <div className="md:col-span-2">
            <label htmlFor={`${formId}-badge_url`} className="block text-[var(--secondary)] text-xs font-mono mb-1">BADGE IMAGE URL</label>
            <input type="url" id={`${formId}-badge_url`} value={data.badge_url} onChange={e => setData('badge_url', e.target.value)} className={inputCls} placeholder="https://images.credly.com/..." />
          </div>
        </div>
        {error && <p className="text-red-400 text-xs font-mono mb-3">[ERROR] {error}</p>}
        <button type="submit" disabled={saving} className="bg-[var(--accent)] text-black font-bold text-sm px-5 py-2 rounded hover:bg-[var(--accent-hover)] disabled:opacity-40 transition-colors">
          {saving ? 'Saving…' : label}
        </button>
      </form>
    )
  }


export default function CertificationsAdmin({ initialCerts, adminPath }) {
  const [certs, setCerts] = useState(initialCerts)
  const [form, setForm] = useState(EMPTY_CERT)
  const [editId, setEditId] = useState(null)
  const [editData, setEditData] = useState({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function setF(field, value) { setForm(f => ({ ...f, [field]: value })) }
  function setE(field, value) { setEditData(d => ({ ...d, [field]: value })) }

  function normCert(json) {
    return {
      ...json,
      issue_date: json.issue_date ? json.issue_date.split('T')[0] : '',
      expiry_date: json.expiry_date ? json.expiry_date.split('T')[0] : '',
    }
  }

  async function createCert(e) {
    e.preventDefault()
    setSaving(true); setError('')
    const res = await fetch('/api/admin/create-cert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, sort_order: parseInt(form.sort_order) || 0 }),
    })
    const json = await res.json()
    setSaving(false)
    if (!res.ok) { setError(json.error || 'Failed'); return }
    setCerts(c => [...c, normCert(json)].sort((a, b) => (a.sort_order - b.sort_order) || (b.issue_date > a.issue_date ? 1 : -1)))
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
    setCerts(c => c.map(cert => cert.id === id ? normCert(json) : cert).sort((a, b) => (a.sort_order - b.sort_order) || (b.issue_date > a.issue_date ? 1 : -1)))
    setEditId(null)
  }

  async function deleteCert(id, name) {
    if (!confirm(`Delete "${name}"?`)) return
    await fetch(`/api/certifications/${id}`, { method: 'DELETE' })
    setCerts(c => c.filter(cert => cert.id !== id))
  }


  return (
    <>
      <Head><title>Certifications — Admin</title></Head>
      <div className="admin-surface min-h-screen bg-[var(--background)] text-white">
        <header className="border-b border-[var(--border)] px-6 py-4">
          <Link href={`/${adminPath}`} className="text-[var(--accent)] font-mono text-sm hover:underline">← Back to Dashboard</Link>
          <h1 className="text-white text-xl font-bold mt-1">Manage Certifications</h1>
        </header>

        <main id="main-content" tabIndex={-1} className="max-w-3xl mx-auto px-6 py-8">
          <div className="border border-[var(--border)] bg-[var(--surface)] rounded-lg p-6 mb-8">
            <h2 className="text-[var(--accent)] font-mono text-xs tracking-widest mb-4">{'// ADD CERTIFICATION'}</h2>
            <CertForm error={error} saving={saving} data={form} setData={setF} onSubmit={createCert} label="+ Add Certification" />
          </div>

          {certs.length === 0 ? (
            <p className="text-[var(--muted)] font-mono text-sm text-center py-12">No certifications yet.</p>
          ) : (
            <div className="space-y-4">
              {certs.map(cert => (
                <div key={cert.id} className="border border-[var(--border)] bg-[var(--surface)] rounded-lg p-5">
                  {editId === cert.id ? (
                    <>
                      <h3 className="text-[var(--accent)] font-mono text-xs tracking-widest mb-4">{'// EDITING'}</h3>
                      <CertForm error={error} saving={saving} data={editData} setData={setE} onSubmit={e => { e.preventDefault(); saveEdit(cert.id) }} label="Save Changes" />
                      <button onClick={() => setEditId(null)} className="text-[var(--muted)] text-xs font-mono mt-3 hover:text-white">Cancel</button>
                    </>
                  ) : (
                    <div className="flex items-start gap-4">
                      {cert.badge_url && <img src={cert.badge_url} alt={cert.name} className="w-16 h-16 object-contain flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-white font-semibold">{cert.name}</p>
                            <p className="text-[var(--secondary)] text-sm">{cert.issuer}</p>
                            <p className="text-[var(--muted)] text-xs font-mono mt-1">
                              Issued: {cert.issue_date}{cert.expiry_date && ` · Expires: ${cert.expiry_date}`}
                            </p>
                          </div>
                          <div className="flex gap-3 flex-shrink-0">
                            <button onClick={() => { setEditId(cert.id); setEditData({ ...cert }) }} className="text-[var(--secondary)] text-xs font-mono hover:text-[var(--accent)] transition-colors">Edit</button>
                            <button onClick={() => deleteCert(cert.id, cert.name)} className="text-[var(--muted)] text-xs font-mono hover:text-red-400 transition-colors">Delete</button>
                          </div>
                        </div>
                        {cert.credential_url && (
                          <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] text-xs font-mono mt-2 inline-block hover:underline">View Credential →</a>
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
