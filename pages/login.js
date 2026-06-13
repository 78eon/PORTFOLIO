import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    setLoading(false)
    if (res.ok) {
      router.push(router.query.from || '/admin')
    } else {
      setError('Wrong password. Try again.')
    }
  }

  return (
    <>
      <Head><title>Admin Login</title></Head>
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="border border-[#333] bg-[#111] rounded-lg p-8">
            <p className="font-mono text-[#00ff41] text-xs mb-6 tracking-wider">
              $ sudo access --admin
            </p>
            <h1 className="text-white text-xl font-bold mb-6">Admin Login</h1>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-[#888] text-xs font-mono mb-2 tracking-widest">
                  PASSWORD
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#00ff41] transition-colors"
                  placeholder="Enter admin password"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-red-400 text-xs font-mono mb-4">
                  [ERROR] {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading || !password}
                className="w-full bg-[#00ff41] text-black font-bold py-2 rounded text-sm hover:bg-[#00cc33] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Authenticating...' : 'Access Admin'}
              </button>
            </form>
          </div>
          <p className="text-center text-[#444] text-xs font-mono mt-4">
            Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </>
  )
}
