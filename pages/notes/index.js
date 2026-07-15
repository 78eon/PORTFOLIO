import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import db from '@/lib/db'
import { readingTime } from '@/lib/md'

const CAT_STYLES = {
  Networking: { text: 'text-blue-400',    border: 'border-blue-500/30',    bg: 'bg-blue-500/10',    dot: 'bg-blue-400' },
  Tool:       { text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400' },
  Algorithm:  { text: 'text-violet-400',  border: 'border-violet-500/30',  bg: 'bg-violet-500/10',  dot: 'bg-violet-400' },
  Protocol:   { text: 'text-amber-400',   border: 'border-amber-500/30',   bg: 'bg-amber-500/10',   dot: 'bg-amber-400' },
  Security:   { text: 'text-red-400',     border: 'border-red-500/30',     bg: 'bg-red-500/10',     dot: 'bg-red-400' },
  OS:         { text: 'text-cyan-400',    border: 'border-cyan-500/30',    bg: 'bg-cyan-500/10',    dot: 'bg-cyan-400' },
  Other:      { text: 'text-slate-400',   border: 'border-slate-500/30',   bg: 'bg-slate-500/10',   dot: 'bg-slate-400' },
}
const S = c => CAT_STYLES[c] || CAT_STYLES.Other

function Badge({ category, lg }) {
  const s = S(category)
  return (
    <span className={`inline-flex items-center gap-1.5 border font-mono rounded-full ${s.text} ${s.border} ${s.bg} ${lg ? 'text-xs px-3 py-1' : 'text-[10px] px-2.5 py-0.5'}`}>
      <span className={`rounded-full flex-shrink-0 ${s.dot} ${lg ? 'w-1.5 h-1.5' : 'w-1 h-1'}`} />
      {category}
    </span>
  )
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const CATS = ['All', 'Networking', 'Tool', 'Algorithm', 'Protocol', 'Security', 'OS', 'Other']

export async function getStaticProps() {
  const { rows } = await db.query(
    'SELECT id, title, slug, note_date, category, summary, content FROM notes WHERE published = true ORDER BY note_date DESC'
  )
  return {
    props: {
      notes: rows.map(r => ({
        ...r,
        note_date: r.note_date.toISOString().split('T')[0],
        readMins: readingTime((r.content || '') + ' ' + (r.summary || '')),
      })),
    },
    revalidate: 60,
  }
}

export default function NotesIndex({ notes }) {
  const [filter, setFilter] = useState('All')
  const visible = filter === 'All' ? notes : notes.filter(n => n.category === filter)
  const [featured, ...rest] = visible

  return (
    <>
      <Head>
        <title>Learning Notes — Security Research</title>
        <meta name="description" content="Deep dives into tools, protocols, algorithms, and cybersecurity concepts." />
      </Head>

      <div className="min-h-screen bg-[#030712] text-white">

        {/* Nav */}
        <nav className="sticky top-0 z-50 border-b border-[#0f172a] bg-[#030712]/90 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="font-mono text-[#475569] text-sm hover:text-white transition-colors">← Portfolio</Link>
            <span className="font-mono text-[#00ff9d] text-sm tracking-wider">~/learning-notes</span>
            <span className="font-mono text-[#334155] text-xs">{notes.length} articles</span>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-12">

          {/* Page header */}
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-black mb-3">
              Learning <span className="gradient-text">Notes</span>
            </h1>
            <p className="text-[#475569] text-base max-w-lg">
              Deep dives into cybersecurity tools, network protocols, algorithms, and concepts — documented while learning.
            </p>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-10 pb-10 border-b border-[#0f172a]">
            {CATS.map(c => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`text-xs font-mono px-4 py-2 rounded-lg border transition-all ${
                  filter === c
                    ? 'bg-[#00ff9d] text-black border-[#00ff9d] font-bold'
                    : 'border-[#1a1a30] text-[#475569] bg-[#0a0a16] hover:border-[#2a2a50] hover:text-[#94a3b8]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {visible.length === 0 && (
            <div className="text-center py-24 border border-dashed border-[#1a1a30] rounded-xl">
              <p className="text-[#334155] font-mono text-sm">
                {notes.length === 0 ? 'No notes published yet.' : `No ${filter} notes yet.`}
              </p>
            </div>
          )}

          {featured && (
            <>
              {/* Featured / top article */}
              <Link href={`/notes/${featured.slug}`} className="group block mb-10">
                <article className="relative rounded-2xl border border-[#1a1a30] bg-[#0a0a16] overflow-hidden hover:border-[#2a2a50] card-glow transition-all duration-300">
                  {/* Gradient accent header */}
                  <div className={`h-1 w-full bg-gradient-to-r from-transparent via-current to-transparent ${S(featured.category).text}`} style={{ opacity: 0.4 }} />

                  <div className="p-8 md:p-10 grid md:grid-cols-3 gap-8 items-start">
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-3 mb-4">
                        <Badge category={featured.category} lg />
                        <span className="text-[#334155] text-xs font-mono uppercase tracking-widest">Latest</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight group-hover:text-[#00ff9d] transition-colors">
                        {featured.title}
                      </h2>
                      <p className="text-[#64748b] text-base leading-relaxed mb-6 line-clamp-3">{featured.summary}</p>
                      <span className="inline-flex items-center gap-2 text-[#00ff9d] text-sm font-mono group-hover:gap-3 transition-all">
                        Read article <span>→</span>
                      </span>
                    </div>
                    <div className="flex flex-col gap-4 md:border-l md:border-[#1a1a30] md:pl-8">
                      <div>
                        <p className="text-[#334155] text-[10px] font-mono tracking-widest mb-1">DATE</p>
                        <p className="text-[#94a3b8] text-sm font-mono">{fmtDate(featured.note_date)}</p>
                      </div>
                      <div>
                        <p className="text-[#334155] text-[10px] font-mono tracking-widest mb-1">READING TIME</p>
                        <p className="text-[#94a3b8] text-sm font-mono">{featured.readMins} min read</p>
                      </div>
                      <div>
                        <p className="text-[#334155] text-[10px] font-mono tracking-widest mb-1">CATEGORY</p>
                        <p className={`text-sm font-mono ${S(featured.category).text}`}>{featured.category}</p>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>

              {/* Grid of remaining articles */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {rest.map(note => (
                    <Link key={note.id} href={`/notes/${note.slug}`} className="group block">
                      <article className="h-full bg-[#0a0a16] rounded-xl border border-[#1a1a30] hover:border-[#2a2a50] card-glow transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col">
                        <div className={`h-0.5 w-full opacity-40 ${S(note.category).text}`}
                          style={{ background: `currentColor` }} />
                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <Badge category={note.category} />
                            <span className="text-[#334155] text-[10px] font-mono">{note.readMins}m</span>
                          </div>
                          <h3 className="text-[#e2e8f0] font-bold text-base leading-snug mb-3 group-hover:text-white transition-colors line-clamp-2 flex-shrink-0">
                            {note.title}
                          </h3>
                          <p className="text-[#64748b] text-sm leading-relaxed line-clamp-3 flex-1">{note.summary}</p>
                          <div className="mt-4 pt-3 border-t border-[#0f172a] flex items-center justify-between">
                            <time className="text-[#334155] text-[10px] font-mono">{fmtDate(note.note_date)}</time>
                            <span className="text-[#00ff9d] text-xs font-mono group-hover:text-white transition-colors">Read →</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        <footer className="border-t border-[#0f172a] px-6 py-6 mt-16">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <Link href="/" className="text-[#334155] text-xs font-mono hover:text-[#475569] transition-colors">← Back to portfolio</Link>
            <Link href="/privacy" className="text-[#334155] text-xs font-mono hover:text-[#475569] transition-colors">Privacy Policy</Link>
          </div>
        </footer>
      </div>
    </>
  )
}
