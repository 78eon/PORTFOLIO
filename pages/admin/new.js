import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import WriteupForm from '@/components/WriteupForm'

import { checkAuth } from '@/lib/authGuard'

export async function getServerSideProps({ req }) {
  if (!checkAuth(req)) return { redirect: { destination: '/login', permanent: false } }
  return { props: { adminPath: (process.env.ADMIN_PATH || 'admin').trim() } }
}

export default function NewWriteup({ adminPath }) {
  const router = useRouter()

  async function handleSubmit(data) {
    const res = await fetch('/api/admin/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Failed to create writeup')
    router.push(`/${adminPath}`)
  }

  return (
    <>
      <Head><title>New Writeup — Admin</title></Head>
      <div className="admin-surface min-h-screen bg-[var(--background)] text-white">
        <header className="border-b border-[var(--border)] px-6 py-4">
          <Link href={`/${adminPath}`} className="text-[var(--accent)] font-mono text-sm hover:underline">
            ← Back to Dashboard
          </Link>
          <h1 className="text-white text-xl font-bold mt-1">New Writeup</h1>
        </header>
        <main id="main-content" tabIndex={-1} className="max-w-3xl mx-auto px-6 py-8">
          <WriteupForm onSubmit={handleSubmit} submitLabel="Publish Writeup" />
        </main>
      </div>
    </>
  )
}
