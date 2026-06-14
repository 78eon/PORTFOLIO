import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import db from '@/lib/db'
import { checkAuth } from '@/lib/authGuard'

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
        lab_date: r.lab_date.toISOString().split('T')[0],
      })),
      unreadMessages: parseInt(msgRows[0].count, 10),
      adminPath: (process.env.ADMIN_PATH || 'admin').trim(),
    },
  }
}

export default function AdminDashboard({ writeups, unreadMessages, adminPath }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(null)

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
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <header className="border-b border-[#222] px-6 py-4 flex items-center justify-between">
          <div>
            <Link href="/" className="text-[#00ff41] font-mono text-sm hover:underline">← Public Site</Link>
            <h1 className="text-white text-xl font-bold mt-1">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <Link href={`/${adminPath}/tags`} className="border border-[#333] text-[#aaa] text-sm px-4 py-2 rounded hover:border-[#00ff41] hover:text-[#00ff41] transition-colors">
              Tags
            </Link>
            <Link href={`/${adminPath}/certifications`} className="border border-[#333] text-[#aaa] text-sm px-4 py-2 rounded hover:border-[#00ff41] hover:text-[#00ff41] transition-colors">
              Certifications
            </Link>
            <Link href={`/${adminPath}/messages`} className="relative border border-[#333] text-[#aaa] text-sm px-4 py-2 rounded hover:border-[#00ff41] hover:text-[#00ff41] transition-colors">
              Messages
              {unreadMessages > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#00ff41] text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {unreadMessages}
                </span>
              )}
            </Link>
            <Link href={`/${adminPath}/new`} className="bg-[#00ff41] text-black font-bold text-sm px-4 py-2 rounded hover:bg-[#00cc33] transition-colors">
              + New Writeup
            </Link>
            <button onClick={handleLogout} className="border border-[#333] text-[#888] text-sm px-3 py-2 rounded hover:border-red-500 hover:text-red-400 transition-colors">
              Logout
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-8">
          {writeups.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#444] font-mono mb-4">No writeups yet.</p>
              <Link href={`/${adminPath}/new`} className="text-[#00ff41] hover:underline font-mono text-sm">
                + Create your first writeup
              </Link>
            </div>
          ) : (
            <div className="border border-[#222] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#222] bg-[#111]">
                    <th className="text-left text-[#666] text-xs font-mono px-4 py-3 tracking-wider">TITLE</th>
                    <th className="text-left text-[#666] text-xs font-mono px-4 py-3 tracking-wider">CATEGORY</th>
                    <th className="text-left text-[#666] text-xs font-mono px-4 py-3 tracking-wider">DATE</th>
                    <th className="text-left text-[#666] text-xs font-mono px-4 py-3 tracking-wider">STATUS</th>
                    <th className="text-right text-[#666] text-xs font-mono px-4 py-3 tracking-wider">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {writeups.map((w, i) => (
                    <tr key={w.id} className={`border-b border-[#1a1a1a] hover:bg-[#0d0d0d] transition-colors ${i % 2 === 0 ? '' : 'bg-[#0c0c0c]'}`}>
                      <td className="px-4 py-3">
                        <Link href={`/writeups/${w.slug}`} target="_blank" className="text-white text-sm hover:text-[#00ff41] transition-colors">
                          {w.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3"><span className="text-[#888] text-xs font-mono">{w.category}</span></td>
                      <td className="px-4 py-3"><span className="text-[#666] text-xs font-mono">{w.lab_date}</span></td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-mono px-2 py-0.5 rounded ${w.published ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                          {w.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link href={`/${adminPath}/edit/${w.id}`} className="text-[#888] text-xs font-mono hover:text-[#00ff41] transition-colors">Edit</Link>
                          <button
                            onClick={() => handleDelete(w.id, w.title)}
                            disabled={deleting === w.id}
                            className="text-[#666] text-xs font-mono hover:text-red-400 transition-colors disabled:opacity-40"
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
