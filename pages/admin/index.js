import { dateOnly } from '@/lib/date'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import db from '@/lib/db'
import { checkAuth } from '@/lib/authGuard'

const CATEGORIES = ['Web', 'Network', 'Malware', 'Forensics', 'CTF', 'Other']

export async function getServerSideProps({ req }) {
  if (!checkAuth(req)) return { redirect: { destination: '/login', permanent: false } }
  const [{ rows: writeups }, { rows: msgRows }] = await Promise.all([
    db.query('SELECT id, title, category, lab_date, published, slug FROM writeups ORDER BY lab_date DESC'),
    db.query('SELECT COUNT(*) FROM contacts WHERE read = false'),
  ])
  return {
    props: {
      writeups: writeups.map(r => ({
        ...r,
        lab_date: dateOnly(r.lab_date),
      })),
      unreadMessages: parseInt(msgRows[0].count, 10),
      adminPath: (process.env.ADMIN_PATH || 'admin').trim(),
    },
  }
}

export default function AdminDashboard({ writeups, unreadMessages, adminPath }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(null)
  const [editingCat, setEditingCat] = useState(null)

  async function handleCategoryChange(id, category) {
    setEditingCat(id)
    await fetch(`/api/writeups/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category }),
    })
    setEditingCat(null)
    router.replace(router.asPath)
  }

  async function handleDelete(id, title) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeleting(id)
    await fetch(`/api/writeups/${id}`, { method: 'DELETE' })
    setDeleting(null)
    router.replace(router.asPath)
  }

  async function handleLogout() {
    document.cookie = 'admin_session=; Max-Age=0; Path=/'
    router.push('/login')
  }

  return (
    <>
      <Head><title>Admin — Portfolio</title></Head>
      <div className="admin-surface min-h-screen bg-[var(--background)] text-white">
        <header className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
          <div>
            <Link href="/" className="text-[var(--accent)] font-mono text-sm hover:underline">← Public Site</Link>
            <h1 className="text-white text-xl font-bold mt-1">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <Link href={`/${adminPath}/tags`} className="border border-[var(--border)] text-[var(--secondary)] text-sm px-4 py-2 rounded hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors">
              Tags
            </Link>
            <Link href={`/${adminPath}/certifications`} className="border border-[var(--border)] text-[var(--secondary)] text-sm px-4 py-2 rounded hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors">
              Certifications
            </Link>
            <Link href={`/${adminPath}/messages`} className="relative border border-[var(--border)] text-[var(--secondary)] text-sm px-4 py-2 rounded hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors">
              Messages
              {unreadMessages > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[var(--accent)] text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {unreadMessages}
                </span>
              )}
            </Link>
            <Link href={`/${adminPath}/notes`} className="border border-[var(--border)] text-[var(--secondary)] text-sm px-4 py-2 rounded hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors">
              Notes
            </Link>
            <Link href={`/${adminPath}/new`} className="bg-[var(--accent)] text-black font-bold text-sm px-4 py-2 rounded hover:bg-[var(--accent-hover)] transition-colors">
              + New Writeup
            </Link>
            <button onClick={handleLogout} className="border border-[var(--border)] text-[var(--secondary)] text-sm px-3 py-2 rounded hover:border-red-500 hover:text-red-400 transition-colors">
              Logout
            </button>
          </div>
        </header>

        <main id="main-content" tabIndex={-1} className="max-w-6xl mx-auto px-6 py-8">
          {writeups.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[var(--muted)] font-mono mb-4">No writeups yet.</p>
              <Link href={`/${adminPath}/new`} className="text-[var(--accent)] hover:underline font-mono text-sm">
                + Create your first writeup
              </Link>
            </div>
          ) : (
            <div className="border border-[var(--border)] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                    <th className="text-left text-[var(--muted)] text-xs font-mono px-4 py-3 tracking-wider">TITLE</th>
                    <th className="text-left text-[var(--muted)] text-xs font-mono px-4 py-3 tracking-wider">CATEGORY</th>
                    <th className="text-left text-[var(--muted)] text-xs font-mono px-4 py-3 tracking-wider">DATE</th>
                    <th className="text-left text-[var(--muted)] text-xs font-mono px-4 py-3 tracking-wider">STATUS</th>
                    <th className="text-right text-[var(--muted)] text-xs font-mono px-4 py-3 tracking-wider">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {writeups.map((w, i) => (
                    <tr key={w.id} className={`border-b border-[var(--border)] hover:bg-[var(--surface)] transition-colors ${i % 2 === 0 ? '' : 'bg-[#0c0c0c]'}`}>
                      <td className="px-4 py-3">
                        <Link href={`/writeups/${w.slug}`} target="_blank" className="text-white text-sm hover:text-[var(--accent)] transition-colors">
                          {w.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={w.category}
                          disabled={editingCat === w.id}
                          onChange={e => handleCategoryChange(w.id, e.target.value)}
                          className="bg-transparent text-[var(--secondary)] text-xs font-mono border border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] rounded px-1 py-0.5 cursor-pointer transition-colors disabled:opacity-40"
                        >
                          {CATEGORIES.map(c => <option key={c} value={c} className="bg-[var(--surface)]">{c}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3"><span className="text-[var(--muted)] text-xs font-mono">{w.lab_date}</span></td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-mono px-2 py-0.5 rounded ${w.published ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                          {w.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link href={`/${adminPath}/edit/${w.id}`} className="text-[var(--secondary)] text-xs font-mono hover:text-[var(--accent)] transition-colors">Edit</Link>
                          <button
                            onClick={() => handleDelete(w.id, w.title)}
                            disabled={deleting === w.id}
                            className="text-[var(--muted)] text-xs font-mono hover:text-red-400 transition-colors disabled:opacity-40"
                          >
                            {deleting === w.id ? 'Deleting…' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
