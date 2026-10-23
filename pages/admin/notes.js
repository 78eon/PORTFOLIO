import { dateOnly } from '@/lib/date'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import db from '@/lib/db'
import { checkAuth } from '@/lib/authGuard'

const CAT_COLORS = {
  Networking: 'text-blue-400',
  Tool:       'text-emerald-400',
  Algorithm:  'text-violet-400',
  Protocol:   'text-amber-400',
  Security:   'text-red-400',
  OS:         'text-cyan-400',
  Other:      'text-slate-400',
}

export async function getServerSideProps({ req }) {
  if (!checkAuth(req)) return { redirect: { destination: '/login', permanent: false } }
  const { rows } = await db.query(
    'SELECT id, title, slug, note_date, category, published FROM notes ORDER BY note_date DESC'
  )
  return {
    props: {
      notes: rows.map(r => ({ ...r, note_date: dateOnly(r.note_date) })),
      adminPath: (process.env.ADMIN_PATH || 'admin').trim(),
    },
  }
}

export default function AdminNotes({ notes, adminPath }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(null)

  async function handleDelete(id, title) {
    if (!confirm(`Delete note "${title}"? This cannot be undone.`)) return
    setDeleting(id)
    await fetch(`/api/notes/${id}`, { method: 'DELETE' })
    setDeleting(null)
    router.replace(router.asPath)
  }

  return (
    <>
      <Head><title>Notes — Admin</title></Head>
      <div className="admin-surface min-h-screen bg-[var(--background)] text-white">
        <header className="border-b border-[var(--surface-secondary)] px-6 py-4 flex items-center justify-between bg-[var(--background)]">
          <div className="flex items-center gap-4">
            <Link href={`/${adminPath}`} className="text-[var(--muted)] font-mono text-sm hover:text-white transition-colors">← Dashboard</Link>
            <h1 className="text-white font-bold text-lg">Notes / Learning Journal</h1>
          </div>
          <Link href={`/${adminPath}/notes/new`} className="bg-[var(--accent)] text-black font-bold text-sm px-4 py-2 rounded-lg hover:bg-white transition-colors">
            + New Note
          </Link>
        </header>

        <main id="main-content" tabIndex={-1} className="max-w-5xl mx-auto px-6 py-8">
          {notes.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-[var(--border)] rounded-xl">
              <p className="text-[var(--muted)] font-mono text-sm mb-4">No notes yet.</p>
              <Link href={`/${adminPath}/notes/new`} className="text-[var(--accent)] font-mono text-sm hover:underline">
                + Create your first note →
              </Link>
            </div>
          ) : (
            <div className="border border-[var(--border)] rounded-xl overflow-hidden">
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
                  {notes.map((n, i) => (
                    <tr key={n.id} className={`border-b border-[var(--surface-secondary)] hover:bg-[var(--surface)] transition-colors ${i % 2 === 0 ? '' : 'bg-[#050510]'}`}>
                      <td className="px-4 py-3">
                        <Link href={`/notes/${n.slug}`} target="_blank" className="text-white text-sm hover:text-[var(--accent)] transition-colors">
                          {n.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-mono ${CAT_COLORS[n.category] || 'text-[var(--muted)]'}`}>{n.category}</span>
                      </td>
                      <td className="px-4 py-3"><span className="text-[var(--muted)] text-xs font-mono">{n.note_date}</span></td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${n.published ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'bg-[var(--border)] text-[var(--muted)]'}`}>
                          {n.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link href={`/${adminPath}/notes/edit/${n.id}`} className="text-[var(--muted)] text-xs font-mono hover:text-[var(--accent)] transition-colors">Edit</Link>
                          <button
                            onClick={() => handleDelete(n.id, n.title)}
                            disabled={deleting === n.id}
                            className="text-[var(--muted)] text-xs font-mono hover:text-red-400 transition-colors disabled:opacity-40"
                          >
                            {deleting === n.id ? 'Deleting…' : 'Delete'}
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
