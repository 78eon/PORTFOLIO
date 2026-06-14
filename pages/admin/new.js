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
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <header className="border-b border-[#222] px-6 py-4">
          <Link href={`/${adminPath}`} className="text-[#00ff41] font-mono text-sm hover:underline">
            ← Back to Dashboard
          </Link>
          <h1 className="text-white text-xl font-bold mt-1">New Writeup</h1>
        </header>
        <main className="max-w-3xl mx-auto px-6 py-8">
          <WriteupForm onSubmit={handleSubmit} submitLabel="Publish Writeup" />
        </main>
      </div>
    </>
  )
}
