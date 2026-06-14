import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import WriteupForm from '@/components/WriteupForm'
import db from '@/lib/db'
import { ADMIN } from '@/lib/adminPath'

export async function getServerSideProps({ params }) {
  const { rows } = await db.query('SELECT * FROM writeups WHERE id = $1', [params.id])
  if (!rows.length) return { notFound: true }
  const w = rows[0]
  return {
    props: {
      writeup: {
        ...w,
        lab_date: w.lab_date.toISOString().split('T')[0],
        created_at: w.created_at.toISOString(),
        updated_at: w.updated_at.toISOString(),
        refs: w.refs || [],
        tools_used: w.tools_used || [],
        tags: w.tags || [],
        screenshots: w.screenshots || [],
        screenshot_urls: w.screenshot_urls || [],
        cvss_score: w.cvss_score ?? '',
        difficulty: w.difficulty || '',
        lab_environment: w.lab_environment || '',
        key_takeaways: w.key_takeaways || '',
      },
    },
  }
}

export default function EditWriteup({ writeup }) {
  const router = useRouter()

  async function handleSubmit(data) {
    const res = await fetch(`/api/writeups/${writeup.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Failed to update writeup')
    router.push(`/${ADMIN}`)
  }

  return (
    <>
      <Head><title>Edit: {writeup.title} — Admin</title></Head>
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <header className="border-b border-[#222] px-6 py-4">
          <Link href={`/${ADMIN}`} className="text-[#00ff41] font-mono text-sm hover:underline">
            ← Back to Dashboard
          </Link>
          <h1 className="text-white text-xl font-bold mt-1">Edit Writeup</h1>
          <p className="text-[#666] text-xs font-mono mt-0.5">{writeup.title}</p>
        </header>
        <main className="max-w-3xl mx-auto px-6 py-8">
          <WriteupForm
            initialData={writeup}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
          />
        </main>
      </div>
    </>
  )
}
