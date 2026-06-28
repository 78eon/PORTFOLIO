import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import db from '@/lib/db'

const CAT_STYLES = {
  Networking: { bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500/20',    dot: 'bg-blue-400' },
  Tool:       { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  Algorithm:  { bg: 'bg-violet-500/10',  text: 'text-violet-400',  border: 'border-violet-500/20',  dot: 'bg-violet-400' },
  Protocol:   { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/20',   dot: 'bg-amber-400' },
  Security:   { bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/20',     dot: 'bg-red-400' },
  OS:         { bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    border: 'border-cyan-500/20',    dot: 'bg-cyan-400' },
  Other:      { bg: 'bg-slate-500/10',   text: 'text-slate-400',   border: 'border-slate-500/20',   dot: 'bg-slate-400' },
}

const CATS = ['All', 'Networking', 'Tool', 'Algorithm', 'Protocol', 'Security', 'OS', 'Other']

function NoteBadge({ category }) {
  const s = CAT_STYLES[category] || CAT_STYLES.Other
  return (
    <span className={`inline-flex items-center gap-1.5 border text-xs font-mono px-2.5 py-1 rounded-full ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {category}
    </span>
  )
}

export async function getStaticProps() {
  const { rows } = await db.query(
    'SELECT id, title, slug, note_date, category, summary FROM notes WHERE published = true ORDER BY note_date DESC'
  )
  return {
    props: { notes: rows.map(r => ({ ...r, note_date: r.note_date.toISOString().split('T')[0] })) },
    revalidate: 60,
  }
}

export default function NotesIndex({ notes }) {
  const [filter, setFilter] = useState('All')
  const visible = filter === 'All' ? notes : notes.filter(n => n.category === filter)

  return (
    <>
      <Head>
        <title>Learning Notes — Security Research</title>
        <meta name="description" content="Cybersecurity learning notes: tools, protocols, algorithms, and concepts." />
      </Head>
      <div className="min-h-screen bg-[#030712] text-white">

        {/* Nav */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#0f172a] bg-[#030712]/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="font-mono text-[#475569] text-sm hover:text-white transition-colors">← Home</Link>
            <span className="font-mono text-[#1e293b] text-xs">~/learning-notes</span>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto px-6 pt-24 pb-24">

          {/* Header */}
          <div className="relative mb-14 pt-10">
            <div className="absolute -top-8 left-0 w-64 h-64 bg-[#818cf8]/4 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative">
              <span className="text-[#00ff9d] font-mono text-xs tracking-widest">// LEARNING JOURNAL</span>
              <h1 className="text-4xl md:text-5xl font-black mt-3 mb-4 leading-tight">
                Notes &<br /><span className="gradient-text">Learning</span>
              </h1>
              <p className="text-[#475569] text-base max-w-lg">
                Deep dives into tools, protocols, algorithms, and security concepts documented while learning.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CATS.map(c => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`text-xs font-mono px-4 py-2 rounded-lg border transition-all ${
                  filter === c
                    ? 'bg-[#00ff9d] text-black border-[#00ff9d] font-bold shadow-[0_0_20px_rgba(0,255,157,0.2)]'
                    : 'border-[#1a1a30] text-[#475569] bg-[#0a0a16] hover:border-[#2a2a50] hover:text-[#94a3b8]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Grid */}
          {visible.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-[#1a1a30] rounded-xl">
              <p className="text-[#334155] font-mono text-sm">
                {notes.length === 0 ? 'No notes yet. Check back soon.' : `No ${filter} notes yet.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {visible.map(note => {
                const date = new Date(note.note_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                return (
                  <Link key={note.id} href={`/notes/${note.slug}`} className="group block">
                    <article className="relative h-full bg-[#0a0a16] rounded-xl border border-[#1a1a30] card-glow hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col p-5">
                      <div className="flex items-center justify-between mb-4">
                        <NoteBadge category={note.category} />
                        <time className="text-[#334155] text-xs font-mono">{date}</time>
                      </div>
                      <h2 className="text-[#e2e8f0] font-bold text-base leading-snug mb-3 group-hover:text-white transition-colors line-clamp-2">
                        {note.title}
                      </h2>
                      <p className="text-[#64748b] text-sm leading-relaxed line-clamp-3 flex-1">{note.summary}</p>
                      <div className="mt-4 pt-4 border-t border-[#1a1a30] flex items-center justify-between">
                        <span className="text-[#00ff9d] text-xs font-mono group-hover:text-white transition-colors">Read note →</span>
                      </div>
                    </article>
                  </Link>
                )
              })}
            </div>
          )}
        </main>

        <footer className="border-t border-[#0f172a] px-6 py-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <Link href="/" className="text-[#334155] text-xs font-mono hover:text-[#475569] transition-colors">← Back to portfolio</Link>
            <Link href="/privacy" className="text-[#334155] text-xs font-mono hover:text-[#475569] transition-colors">Privacy Policy</Link>
          </div>
        </footer>
      </div>
    </>
  )
}
