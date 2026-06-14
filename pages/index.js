import { useState, useEffect } from 'react'
import Head from 'next/head'
import WriteupCard from '@/components/WriteupCard'
import db from '@/lib/db'

const CATEGORIES = ['All', 'Web', 'Network', 'Malware', 'Forensics', 'CTF', 'Other']

// Replace the empty strings below with your actual profile usernames/URLs
const SOCIAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com/78eon' },
  { label: 'LinkedIn', href: '' },
  { label: 'TryHackMe', href: '' },
  { label: 'HackTheBox', href: '' },
].filter(l => {
  try { return new URL(l.href).pathname.length > 1 } catch { return false }
})

const TYPING_LINES = [
  '> whoami',
  '> Cybersecurity Student & Researcher',
  '> Documenting labs, CTFs & vulnerability research',
]

function TypeWriter() {
  const [state, setState] = useState({ line: 0, char: 0, done: false })

  useEffect(() => {
    if (state.done) return
    const current = TYPING_LINES[state.line]
    if (state.char < current.length) {
      const t = setTimeout(() => setState(s => ({ ...s, char: s.char + 1 })), 38)
      return () => clearTimeout(t)
    }
    if (state.line < TYPING_LINES.length - 1) {
      const t = setTimeout(() => setState(s => ({ line: s.line + 1, char: 0, done: false })), 350)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setState(s => ({ ...s, done: true })), 0)
    return () => clearTimeout(t)
  }, [state])

  return (
    <div className="font-mono text-sm text-[#ccc] space-y-1">
      {TYPING_LINES.slice(0, state.line).map((l, i) => (
        <div key={i} className={i === 0 ? 'text-[#00ff41]' : ''}>{l}</div>
      ))}
      <div className={state.line === 0 ? 'text-[#00ff41]' : ''}>
        {TYPING_LINES[state.line]?.slice(0, state.char)}
        <span className="animate-pulse text-[#00ff41]">▋</span>
      </div>
    </div>
  )
}

const inputCls = 'w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00ff41] transition-colors'

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState(null) // null | 'sending' | 'ok' | 'error'
  const [errorMsg, setErrorMsg] = useState('')

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const json = await res.json()
    if (res.ok) {
      setStatus('ok')
      setForm({ name: '', email: '', message: '' })
    } else {
      setStatus('error')
      setErrorMsg(json.error || 'Something went wrong. Try again.')
    }
  }

  if (status === 'ok') {
    return (
      <div className="border border-[#00ff41]/30 bg-[#00ff41]/5 rounded-lg p-8 text-center">
        <p className="text-[#00ff41] font-mono text-sm mb-1">[SUCCESS]</p>
        <p className="text-white font-semibold mb-2">Message received!</p>
        <p className="text-[#777] text-sm">I&apos;ll get back to you soon.</p>
        <button
          onClick={() => setStatus(null)}
          className="mt-4 text-[#00ff41] text-xs font-mono hover:underline"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[#888] text-xs font-mono tracking-widest mb-1">NAME *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            className={inputCls}
            placeholder="Your name"
            required
          />
        </div>
        <div>
          <label className="block text-[#888] text-xs font-mono tracking-widest mb-1">EMAIL *</label>
          <input
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            className={inputCls}
            placeholder="your@email.com"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-[#888] text-xs font-mono tracking-widest mb-1">MESSAGE *</label>
        <textarea
          rows={5}
          value={form.message}
          onChange={e => set('message', e.target.value)}
          className={inputCls}
          placeholder="Your message, question, or collaboration idea..."
          required
        />
      </div>
      {status === 'error' && (
        <p className="text-red-400 text-xs font-mono">[ERROR] {errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full md:w-auto bg-[#00ff41] text-black font-bold text-sm px-8 py-2.5 rounded hover:bg-[#00cc33] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'sending' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}

export async function getStaticProps() {
  const { rows } = await db.query(
    'SELECT id, title, slug, category, lab_date, overview FROM writeups WHERE published = true ORDER BY lab_date DESC'
  )
  return {
    props: {
      writeups: rows.map(r => ({
        ...r,
        lab_date: r.lab_date.toISOString().split('T')[0],
      })),
    },
    revalidate: 60,
  }
}

export default function Home({ writeups }) {
  const [filter, setFilter] = useState('All')
  const visible = filter === 'All' ? writeups : writeups.filter(w => w.category === filter)

  return (
    <>
      <Head>
        <title>Security Research Portfolio</title>
        <meta name="description" content="Cybersecurity student documenting labs, CTF writeups, and vulnerability research." />
      </Head>

      <div className="min-h-screen bg-[#0a0a0a] text-white">
        {/* Header */}
        <header className="border-b border-[#1a1a1a] px-6 py-4">
          <div className="max-w-6xl mx-auto">
            <span className="font-mono text-[#00ff41] text-sm tracking-wider">~/security-research</span>
          </div>
        </header>

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="border border-[#1a1a1a] bg-[#0d0d0d] rounded-lg p-8 md:p-12 mb-8">
            <div className="mb-6">
              <TypeWriter />
            </div>
            <h1 className="text-white text-3xl md:text-4xl font-bold mb-3">
              Security Research Portfolio
            </h1>
            <p className="text-[#777] text-base max-w-xl mb-8">
              A cybersecurity student documenting practical lab work, CTF writeups, and vulnerability research. Every post is a real exercise with real evidence.
            </p>
            <div className="flex flex-wrap gap-3">
              {SOCIAL_LINKS.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-[#333] text-[#aaa] text-xs font-mono px-3 py-1.5 rounded hover:border-[#00ff41] hover:text-[#00ff41] transition-colors"
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Writeups grid */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-lg font-bold">
              Writeups
              <span className="text-[#444] font-normal text-sm ml-2 font-mono">({visible.length})</span>
            </h2>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`text-xs font-mono px-3 py-1.5 rounded border transition-colors ${
                  filter === cat
                    ? 'bg-[#00ff41] text-black border-[#00ff41] font-bold'
                    : 'border-[#333] text-[#888] hover:border-[#555] hover:text-[#ccc]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#444] font-mono text-sm">
                {writeups.length === 0 ? 'No writeups yet. Check back soon.' : `No ${filter} writeups yet.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {visible.map(w => <WriteupCard key={w.id} writeup={w} />)}
            </div>
          )}
        </section>

        {/* Contact */}
        <section id="contact" className="max-w-3xl mx-auto px-6 pb-20">
          <div className="border border-[#1a1a1a] bg-[#0d0d0d] rounded-lg p-8 md:p-10">
            <div className="mb-8">
              <p className="text-[#00ff41] font-mono text-xs tracking-widest mb-2">{'// CONTACT'}</p>
              <h2 className="text-white text-2xl font-bold mb-2">Get in touch</h2>
              <p className="text-[#666] text-sm">
                Have a question, want to collaborate, or just want to talk security? Drop me a message.
              </p>
            </div>
            <ContactForm />
          </div>
        </section>

        <footer className="border-t border-[#1a1a1a] px-6 py-6 text-center">
          <p className="text-[#444] text-xs font-mono">
            Built with Next.js · {new Date().getFullYear()} · NEON
          </p>
        </footer>
      </div>
    </>
  )
}
