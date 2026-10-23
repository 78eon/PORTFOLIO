import { dateOnly } from '@/lib/date'
import Head from 'next/head'
import Link from 'next/link'
import NoteForm from '@/components/NoteForm'
import db from '@/lib/db'
import { checkAuth } from '@/lib/authGuard'

export async function getServerSideProps({ req, params }) {
  if (!checkAuth(req)) return { redirect: { destination: '/login', permanent: false } }
  const { rows } = await db.query('SELECT * FROM notes WHERE id = $1', [params.id])
  if (!rows.length) return { notFound: true }
  const n = rows[0]
  return {
    props: {
      note: {
        ...n,
        note_date: dateOnly(n.note_date),
        created_at: n.created_at.toISOString(),
        updated_at: n.updated_at.toISOString(),
        refs: n.refs || [],
        tools_used: n.tools_used || [],
        examples: n.examples || '',
      },
      adminPath: (process.env.ADMIN_PATH || 'admin').trim(),
    },
  }
}

export default function EditNote({ note, adminPath }) {
  return (
    <>
      <Head><title>Edit Note — Admin</title></Head>
      <div className="admin-surface min-h-screen bg-[var(--background)] text-white">
        <header className="border-b border-[var(--surface-secondary)] px-6 py-4 flex items-center gap-4 bg-[var(--background)]">
          <Link href={`/${adminPath}/notes`} className="text-[var(--muted)] font-mono text-sm hover:text-white transition-colors">← Notes</Link>
          <h1 className="text-white font-bold text-lg">Edit Note</h1>
        </header>
        <main id="main-content" tabIndex={-1} className="max-w-4xl mx-auto px-6 py-10">
          <NoteForm initial={note} adminPath={adminPath} />
        </main>
      </div>
    </>
  )
}
