import Head from 'next/head'
import Link from 'next/link'
import NoteForm from '@/components/NoteForm'
import { checkAuth } from '@/lib/authGuard'

export async function getServerSideProps({ req }) {
  if (!checkAuth(req)) return { redirect: { destination: '/login', permanent: false } }
  return { props: { adminPath: (process.env.ADMIN_PATH || 'admin').trim() } }
}

export default function NewNote({ adminPath }) {
  return (
    <>
      <Head><title>New Note — Admin</title></Head>
      <div className="min-h-screen bg-[#030712] text-white">
        <header className="border-b border-[#0f172a] px-6 py-4 flex items-center gap-4 bg-[#030712]">
          <Link href={`/${adminPath}/notes`} className="text-[#475569] font-mono text-sm hover:text-white transition-colors">← Notes</Link>
          <h1 className="text-white font-bold text-lg">New Note</h1>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-10">
          <NoteForm adminPath={adminPath} />
        </main>
      </div>
    </>
  )
}
