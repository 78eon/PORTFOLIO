import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import WriteupCard from '@/components/WriteupCard'
import db from '@/lib/db'

const CATEGORIES = ['All', 'Web', 'Network', 'Malware', 'Forensics', 'CTF', 'Other']

const SOCIAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com/78eon', icon: '⌥' },
  { label: 'LinkedIn', href: '', icon: 'in' },
  { label: 'TryHackMe', href: '', icon: 'THM' },
  { label: 'HackTheBox', href: '', icon: 'HTB' },
].filter(l => { try { return new URL(l.href).pathname.length > 1 } catch { return false } })

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
    <div className="font-mono text-sm space-y-1">
      {TYPING_LINES.slice(0, state.line).map((l, i) => (
        <div key={i} className={i === 0 ? 'text-[#00ff9d]' : 'text-[#94a3b8]'}>{l}</div>
      ))}
      <div className={state.line === 0 ? 'text-[#00ff9d]' : 'text-[#94a3b8]'}>
        {TYPING_LINES[state.line]?.slice(0, state.char)}
        <span className="animate-pulse text-[#00ff9d]">▋</span>
      </div>
    </div>
  )
}

const inputCls = 'w-full bg-[#0a0a16] border border-[#1a1a30] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00ff9d]/50 focus:ring-1 focus:ring-[#00ff9d]/20 transition-all placeholder-[#334155]'

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '', consent: false })
  const [status, setStatus] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  function set(field, value) { setForm(f => ({ ...f, [field]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.consent) return
    setStatus('sending')
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, message: form.message }),
    })
    const json = await res.json()
    if (res.ok) {
      setStatus('ok')
      setForm({ name: '', email: '', message: '', consent: false })
    } else {
      setStatus('error')
      setErrorMsg(json.error || 'Something went wrong.')
    }
  }

  if (status === 'ok') {
    return (
      <div className="border border-[#00ff9d]/20 bg-[#00ff9d]/5 rounded-xl p-10 text-center">
        <div className="w-12 h-12 rounded-full bg-[#00ff9d]/10 border border-[#00ff9d]/30 flex items-center justify-center mx-auto mb-4">
          <span className="text-[#00ff9d] text-xl">✓</span>
        </div>
        <p className="text-white font-semibold text-lg mb-1">Message received!</p>
        <p className="text-[#64748b] text-sm">I&apos;ll get back to you soon.</p>
        <button onClick={() => setStatus(null)} className="mt-5 text-[#00ff9d] text-xs font-mono hover:underline">
          Send another →
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[#64748b] text-xs font-mono tracking-widest mb-2">NAME *</label>
          <input type="text" value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} placeholder="Your name" required />
        </div>
        <div>
          <label className="block text-[#64748b] text-xs font-mono tracking-widest mb-2">EMAIL *</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inputCls} placeholder="your@email.com" required />
        </div>
      </div>
      <div>
        <label className="block text-[#64748b] text-xs font-mono tracking-widest mb-2">MESSAGE *</label>
        <textarea rows={5} value={form.message} onChange={e => set('message', e.target.value)} className={inputCls} placeholder="Your message, question, or collaboration idea..." required />
      </div>
      <label className="flex items-start gap-3 cursor-pointer group">
        <input type="checkbox" checked={form.consent} onChange={e => set('consent', e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#00ff9d] flex-shrink-0" required />
        <span className="text-[#475569] text-xs leading-relaxed group-hover:text-[#64748b] transition-colors">
          I agree my name and email will be stored to allow a reply.{' '}
          <Link href="/privacy" className="text-[#00ff9d]/70 hover:text-[#00ff9d] underline transition-colors">Privacy Policy</Link>.
        </span>
      </label>
      {status === 'error' && (
        <p className="text-red-400 text-xs font-mono bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={status === 'sending' || !form.consent}
        className="w-full md:w-auto relative overflow-hidden bg-[#00ff9d] text-black font-bold text-sm px-8 py-3 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 group"
      >
        <span className="relative z-10">{status === 'sending' ? 'Sending…' : 'Send Message'}</span>
      </button>
    </form>
  )
}

function CertCard({ cert }) {
  const inner = (
    <div className="flex flex-col items-center text-center p-5 bg-[#0a0a16] rounded-xl border border-[#1a1a30] hover:border-[#2a2a50] card-glow transition-all duration-300 h-full">
      {cert.badge_url ? (
        <img src={cert.badge_url} alt={cert.name} className="w-16 h-16 object-contain mb-3" />
      ) : (
        <div className="w-16 h-16 rounded-full border border-[#2a2a50] bg-[#0f0f20] flex items-center justify-center mb-3">
          <span className="text-[#00ff9d] text-xl">✓</span>
        </div>
      )}
      <p className="text-white text-sm font-semibold leading-tight mb-1">{cert.name}</p>
      <p className="text-[#475569] text-xs">{cert.issuer}</p>
      <p className="text-[#334155] text-xs font-mono mt-2">
        {new Date(cert.issue_date).getFullYear()}
        {cert.expiry_date && ` – ${new Date(cert.expiry_date).getFullYear()}`}
      </p>
    </div>
  )
  return cert.credential_url
    ? <a href={cert.credential_url} target="_blank" rel="noopener noreferrer">{inner}</a>
    : inner
}

export async function getStaticProps() {
  const [{ rows: writeups }, { rows: certs }] = await Promise.all([
    db.query('SELECT id, title, slug, category, lab_date, overview FROM writeups WHERE published = true ORDER BY lab_date DESC'),
    db.query('SELECT * FROM certifications ORDER BY sort_order ASC, issue_date DESC'),
  ])
  return {
    props: {
      writeups: writeups.map(r => ({ ...r, lab_date: r.lab_date.toISOString().split('T')[0] })),
      certifications: certs.map(r => ({
        ...r,
        issue_date: r.issue_date?.toISOString().split('T')[0] ?? null,
        expiry_date: r.expiry_date?.toISOString().split('T')[0] ?? null,
      })),
    },
    revalidate: 60,
  }
}

export default function Home({ writeups, certifications }) {
  const [filter, setFilter] = useState('All')
  const visible = filter === 'All' ? writeups : writeups.filter(w => w.category === filter)

  return (
    <>
      <Head>
        <title>Security Research Portfolio</title>
        <meta name="description" content="Cybersecurity student documenting labs, CTF writeups, and vulnerability research." />
      </Head>

      <div className="min-h-screen bg-[#030712] text-white">

        {/* Nav */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#0f172a] bg-[#030712]/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <span className="font-mono text-[#00ff9d] text-sm tracking-wider">~/security-research</span>
            <div className="flex items-center gap-6">
              <a href="#research" className="text-[#475569] text-xs font-mono hover:text-white transition-colors">Research</a>
              <Link href="/notes" className="text-[#475569] text-xs font-mono hover:text-white transition-colors">Notes</Link>
              <a href="#contact" className="text-[#475569] text-xs font-mono hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 dot-grid opacity-40" />
          <div className="glow-orb w-[600px] h-[600px] top-[-100px] left-1/2 -translate-x-1/2 bg-[#00ff9d]/5" />
          <div className="glow-orb w-[400px] h-[400px] top-[200px] right-[-100px] bg-[#818cf8]/5" />

          <div className="relative max-w-6xl mx-auto px-6 py-24 w-full">
            <div className="max-w-3xl">
              <div className="mb-8">
                <TypeWriter />
              </div>

              <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
                Security<br />
                <span className="gradient-text">Research</span><br />
                Portfolio
              </h1>

              <p className="text-[#64748b] text-lg max-w-xl mb-10 leading-relaxed">
                A cybersecurity student documenting practical lab work, CTF writeups, and vulnerability research. Every post is a real exercise with real evidence.
              </p>

              <div className="flex flex-wrap gap-3 mb-12">
                {SOCIAL_LINKS.map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 border border-[#1e1e3f] bg-[#0a0a16] text-[#94a3b8] text-xs font-mono px-4 py-2.5 rounded-lg hover:border-[#00ff9d]/30 hover:text-white hover:bg-[#0f0f20] transition-all duration-200"
                  >
                    {link.label} ↗
                  </a>
                ))}
                <a
                  href="#research"
                  className="flex items-center gap-2 bg-[#00ff9d] text-black font-bold text-xs px-5 py-2.5 rounded-lg hover:bg-white transition-colors"
                >
                  View Research ↓
                </a>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8">
                {[
                  { n: writeups.length, label: 'Writeups' },
                  { n: certifications.length, label: 'Certifications' },
                ].filter(s => s.n > 0).map(s => (
                  <div key={s.label}>
                    <p className="text-3xl font-black text-white">{s.n}</p>
                    <p className="text-[#475569] text-xs font-mono mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Certifications */}
        {certifications.length > 0 && (
          <section className="max-w-6xl mx-auto px-6 py-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-[#00ff9d]/30 to-transparent" />
              <span className="text-[#00ff9d] font-mono text-xs tracking-widest">// CREDENTIALS</span>
              <div className="h-px flex-1 bg-gradient-to-l from-[#818cf8]/30 to-transparent" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {certifications.map(cert => <CertCard key={cert.id} cert={cert} />)}
            </div>
          </section>
        )}

        {/* Writeups */}
        <section id="research" className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-[#00ff9d]/30 to-transparent" />
            <span className="text-[#00ff9d] font-mono text-xs tracking-widest">// RESEARCH</span>
            <div className="h-px flex-1 bg-gradient-to-l from-[#818cf8]/30 to-transparent" />
          </div>

          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="text-2xl font-bold text-white">
              Writeups
              <span className="text-[#334155] text-base font-normal ml-2 font-mono">({visible.length})</span>
            </h2>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`text-xs font-mono px-4 py-2 rounded-lg border transition-all duration-200 ${
                  filter === cat
                    ? 'bg-[#00ff9d] text-black border-[#00ff9d] font-bold shadow-[0_0_20px_rgba(0,255,157,0.2)]'
                    : 'border-[#1a1a30] text-[#475569] bg-[#0a0a16] hover:border-[#2a2a50] hover:text-[#94a3b8]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-[#1a1a30] rounded-xl">
              <p className="text-[#334155] font-mono text-sm">
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
        <section id="contact" className="max-w-4xl mx-auto px-6 py-20">
          <div className="relative rounded-2xl border border-[#1a1a30] bg-[#0a0a16] overflow-hidden">
            {/* Background glow */}
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#00ff9d]/3 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute top-0 left-0 w-60 h-60 bg-[#818cf8]/3 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative p-8 md:p-12">
              <div className="mb-8">
                <span className="text-[#00ff9d] font-mono text-xs tracking-widest">// CONTACT</span>
                <h2 className="text-3xl font-black text-white mt-2 mb-2">Get in touch</h2>
                <p className="text-[#475569] text-sm">
                  Have a question, want to collaborate, or just want to talk security?
                </p>
              </div>
              <ContactForm />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#0f172a] px-6 py-8">
          <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <span className="font-mono text-[#334155] text-xs">© {new Date().getFullYear()} NEON</span>
            <div className="flex items-center gap-5">
              <Link href="/notes" className="text-[#334155] text-xs font-mono hover:text-[#475569] transition-colors">Notes</Link>
              <Link href="/privacy" className="text-[#334155] text-xs font-mono hover:text-[#475569] transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
