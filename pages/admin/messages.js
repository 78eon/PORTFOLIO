import Head from 'next/head'
import Link from 'next/link'
import db from '@/lib/db'
import { checkAuth } from '@/lib/authGuard'

export async function getServerSideProps({ req }) {
  const adminPath = (process.env.ADMIN_PATH || 'admin').trim()
  if (!checkAuth(req)) {
    return { redirect: { destination: `/login?from=/${adminPath}/messages`, permanent: false } }
  }
  const { rows } = await db.query('SELECT * FROM contacts ORDER BY created_at DESC')
  return {
    props: {
      adminPath,
      messages: rows.map(r => ({ ...r, created_at: r.created_at.toISOString() })),
    },
  }
}

export default function Messages({ messages, adminPath }) {
  const unread = messages.filter(m => !m.read).length

  return (
    <>
      <Head><title>Messages — Admin</title></Head>
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <header className="border-b border-[#222] px-6 py-4">
          <Link href={`/${adminPath}`} className="text-[#00ff41] font-mono text-sm hover:underline">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-white text-xl font-bold">Messages</h1>
            {unread > 0 && (
              <span className="bg-[#00ff41] text-black text-xs font-bold px-2 py-0.5 rounded-full">{unread} new</span>
            )}
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8">
          {messages.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#444] font-mono text-sm">No messages yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`border rounded-lg p-5 ${msg.read ? 'border-[#1a1a1a] bg-[#0c0c0c]' : 'border-[#00ff41]/20 bg-[#0d0d0d]'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-white font-semibold text-sm">{msg.name}</span>
                      <a href={`mailto:${msg.email}`} className="text-[#00ff41] text-xs font-mono ml-2 hover:underline">{msg.email}</a>
                    </div>
                    <div className="flex items-center gap-3">
                      {!msg.read && <span className="text-[#00ff41] text-xs font-mono">● new</span>}
                      <time className="text-[#555] text-xs font-mono">{new Date(msg.created_at).toLocaleString()}</time>
                    </div>
                  </div>
                  <p className="text-[#bbb] text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  <div className="mt-3">
                    <a href={`mailto:${msg.email}?subject=Re: your message`} className="text-[#00ff41] text-xs font-mono hover:underline">Reply via email →</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  )
}
