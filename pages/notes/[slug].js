import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import db from '@/lib/db'
import { renderMarkdown, extractHeadings, readingTime } from '@/lib/md'

const CAT_STYLES = {
  Networking: { text: 'text-blue-400',    border: 'border-blue-500/30',    bg: 'bg-blue-500/10',    bar: 'bg-blue-400' },
  Tool:       { text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', bar: 'bg-emerald-400' },
  Algorithm:  { text: 'text-violet-400',  border: 'border-violet-500/30',  bg: 'bg-violet-500/10',  bar: 'bg-violet-400' },
  Protocol:   { text: 'text-amber-400',   border: 'border-amber-500/30',   bg: 'bg-amber-500/10',   bar: 'bg-amber-400' },
  Security:   { text: 'text-red-400',     border: 'border-red-500/30',     bg: 'bg-red-500/10',     bar: 'bg-red-400' },
  OS:         { text: 'text-cyan-400',    border: 'border-cyan-500/30',    bg: 'bg-cyan-500/10',    bar: 'bg-cyan-400' },
  Other:      { text: 'text-slate-400',   border: 'border-slate-500/30',   bg: 'bg-slate-500/10',   bar: 'bg-slate-400' },
}
const S = c => CAT_STYLES[c] || CAT_STYLES.Other

function ReadingProgress() {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    function onScroll() {
      const el = document.documentElement
      const scrolled = el.scrollTop
      const total = el.scrollHeight - el.clientHeight
      setPct(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-[#0f172a]">
      <div className="h-full bg-gradient-to-r from-[#00ff9d] to-[#818cf8] transition-all duration-100"
        style={{ width: `${pct}%` }} />
    </div>
  )
}

function TableOfContents({ headings, activeId }) {
  if (!headings.length) return null
  return (
    <nav className="space-y-1">
      <p className="text-[#334155] text-[10px] font-mono tracking-widest mb-3">IN THIS ARTICLE</p>
      {headings.map(h => (
        <a
          key={h.id}
          href={`#${h.id}`}
          className={`block text-xs font-mono py-1 transition-colors hover:text-[#00ff9d] leading-relaxed
            ${h.level === 3 ? 'pl-4' : 'pl-0'}
            ${activeId === h.id ? 'text-[#00ff9d]' : 'text-[#475569]'}`}
        >
          {h.level === 3 && <span className="text-[#1e293b] mr-1">└</span>}
          {h.text}
        </a>
      ))}
    </nav>
  )
}

function useActiveHeading(headings) {
  const [active, setActive] = useState('')
  useEffect(() => {
    if (!headings.length) return
    const obs = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length) setActive(visible[0].target.id)
      },
      { rootMargin: '-20% 0% -70% 0%' }
    )
    headings.forEach(h => {
      const el = document.getElementById(h.id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [headings])
  return active
}

export async function getStaticPaths() {
  const { rows } = await db.query('SELECT slug FROM notes WHERE published = true')
  return { paths: rows.map(r => ({ params: { slug: r.slug } })), fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  const { rows } = await db.query('SELECT * FROM notes WHERE slug = $1 AND published = true', [params.slug])
  if (!rows.length) return { notFound: true }
  const n = rows[0]

  const contentHtml = renderMarkdown(n.content || '')
  const examplesHtml = renderMarkdown(n.examples || '')
  const headings = extractHeadings(n.content || '')
  const mins = readingTime((n.content || '') + ' ' + (n.summary || ''))

  return {
    props: {
      note: {
        ...n,
        note_date: n.note_date.toISOString().split('T')[0],
        created_at: n.created_at.toISOString(),
        updated_at: n.updated_at.toISOString(),
        refs: n.refs || [],
        tools_used: n.tools_used || [],
        examples: n.examples || null,
      },
      contentHtml,
      examplesHtml,
      headings,
      mins,
    },
    revalidate: 60,
  }
}

export default function NoteDetail({ note, contentHtml, examplesHtml, headings, mins }) {
  const activeId = useActiveHeading(headings)
  const s = S(note.category)

  const date = new Date(note.note_date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <>
      <Head>
        <title>{note.title} — Learning Notes</title>
        <meta name="description" content={note.summary?.slice(0, 160)} />
      </Head>

      <ReadingProgress />

      <div className="min-h-screen bg-[#030712] text-white">

        {/* Nav */}
        <nav className="sticky top-0 z-50 border-b border-[#0f172a] bg-[#030712]/90 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/notes" className="flex items-center gap-2 text-[#475569] text-sm font-mono hover:text-white transition-colors group">
              <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Notes
            </Link>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono px-2.5 py-1 rounded-full border ${s.text} ${s.border} ${s.bg}`}>
                {note.category}
              </span>
              <span className="text-[#334155] text-xs font-mono">{mins} min read</span>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <header className="relative border-b border-[#0f172a] overflow-hidden">
          <div className="absolute inset-0 dot-grid opacity-20" />
          <div className={`absolute top-0 left-0 right-0 h-px opacity-60 ${s.bar}`}
            style={{ background: `linear-gradient(90deg, transparent, currentColor, transparent)` }} />

          <div className="relative max-w-4xl mx-auto px-6 py-16 md:py-20">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className={`inline-flex items-center gap-1.5 border text-xs font-mono px-3 py-1 rounded-full ${s.text} ${s.border} ${s.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${s.bar}`} />
                {note.category}
              </span>
              <span className="text-[#334155] text-xs font-mono">·</span>
              <time className="text-[#475569] text-xs font-mono">{date}</time>
              <span className="text-[#334155] text-xs font-mono">·</span>
              <span className="text-[#475569] text-xs font-mono">{mins} min read</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6 tracking-tight">
              {note.title}
            </h1>

            <p className="text-[#64748b] text-lg leading-relaxed max-w-2xl">{note.summary}</p>

            {note.tools_used?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {note.tools_used.map(t => (
                  <span key={t} className="bg-[#0a0a16] border border-[#1a1a30] text-[#64748b] text-xs font-mono px-3 py-1 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Body — 2 col: article + sidebar */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex gap-12 items-start">

            {/* Article */}
            <article className="flex-1 min-w-0">

              {contentHtml && (
                <div className="prose-note mb-10" dangerouslySetInnerHTML={{ __html: contentHtml }} />
              )}

              {examplesHtml && (
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-[#00ff9d] font-mono text-xs tracking-widest">// PRACTICAL EXAMPLES</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#1a1a30] to-transparent" />
                  </div>
                  <div className="prose-note" dangerouslySetInnerHTML={{ __html: examplesHtml }} />
                </div>
              )}

              {note.refs?.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-[#00ff9d] font-mono text-xs tracking-widest">// REFERENCES</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#1a1a30] to-transparent" />
                  </div>
                  <ul className="space-y-2">
                    {note.refs.map((ref, i) => (
                      <li key={i}>
                        <a href={ref.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 text-[#475569] hover:text-[#00ff9d] transition-colors text-sm font-mono group py-1">
                          <span className="text-[#00ff9d] group-hover:translate-x-0.5 transition-transform">→</span>
                          <span className="group-hover:underline underline-offset-2">{ref.label || ref.url}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Article footer */}
              <div className="border-t border-[#0f172a] pt-8 mt-8 flex items-center justify-between">
                <Link href="/notes" className="flex items-center gap-2 text-[#475569] text-sm font-mono hover:text-[#00ff9d] transition-colors group">
                  <span className="group-hover:-translate-x-0.5 transition-transform">←</span> All notes
                </Link>
                <span className="text-[#1e293b] text-xs font-mono">
                  Updated {new Date(note.updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </article>

            {/* Sidebar — sticky ToC */}
            {headings.length > 0 && (
              <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-24">
                <TableOfContents headings={headings} activeId={activeId} />
              </aside>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
