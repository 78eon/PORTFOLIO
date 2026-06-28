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

function NoteBadge({ category }) {
  const s = CAT_STYLES[category] || CAT_STYLES.Other
  return (
    <span className={`inline-flex items-center gap-1.5 border text-xs font-mono px-2.5 py-1 rounded-full ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {category}
    </span>
  )
}

function Section({ label, children }) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-[#00ff9d] font-mono text-xs tracking-widest whitespace-nowrap">{label}</span>
        <div className="flex-1 h-px bg-gradient-to-r from-[#1a1a30] to-transparent" />
      </div>
      {children}
    </section>
  )
}

export async function getStaticPaths() {
  const { rows } = await db.query('SELECT slug FROM notes WHERE published = true')
  return { paths: rows.map(r => ({ params: { slug: r.slug } })), fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  const { rows } = await db.query('SELECT * FROM notes WHERE slug = $1 AND published = true', [params.slug])
  if (!rows.length) return { notFound: true }
  const n = rows[0]
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
    },
    revalidate: 60,
  }
}

export default function NoteDetail({ note }) {
  const date = new Date(note.note_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <>
      <Head>
        <title>{note.title} — Learning Notes</title>
        <meta name="description" content={note.summary?.slice(0, 160)} />
      </Head>
      <div className="min-h-screen bg-[#030712] text-white">

        {/* Nav */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#0f172a] bg-[#030712]/80 backdrop-blur-md">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/notes" className="flex items-center gap-2 text-[#475569] text-sm font-mono hover:text-white transition-colors">← Notes</Link>
            <span className="font-mono text-[#1e293b] text-xs">~/learning-notes</span>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-6 pt-24 pb-24">

          {/* Header */}
          <div className="mb-12 relative">
            <div className="absolute -top-8 -left-8 w-64 h-64 bg-[#818cf8]/4 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <NoteBadge category={note.category} />
                <time className="text-[#334155] text-xs font-mono">{date}</time>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">{note.title}</h1>
              <p className="text-[#64748b] text-base leading-relaxed max-w-2xl">{note.summary}</p>
            </div>
          </div>

          {/* Content */}
          {note.content && (
            <Section label="// HOW IT WORKS / DETAILS">
              <div className="text-[#94a3b8] leading-relaxed text-[15px] whitespace-pre-wrap">{note.content}</div>
            </Section>
          )}

          {/* Examples */}
          {note.examples && (
            <Section label="// PRACTICAL EXAMPLES / COMMANDS">
              <div className="relative bg-[#020615] border border-[#1a1a30] rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-[#1a1a30] bg-[#0a0a16]">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  <span className="ml-2 text-[#334155] text-xs font-mono">examples.sh</span>
                </div>
                <pre className="text-[#94a3b8] text-sm font-mono whitespace-pre-wrap leading-relaxed p-5 overflow-x-auto">
                  {note.examples}
                </pre>
              </div>
            </Section>
          )}

          {/* Related tools */}
          {note.tools_used?.length > 0 && (
            <Section label="// RELATED TOOLS / TECHNOLOGIES">
              <div className="flex flex-wrap gap-2">
                {note.tools_used.map(t => (
                  <span key={t} className="bg-[#0a0a16] border border-[#1a1a30] text-[#94a3b8] text-xs font-mono px-3 py-1.5 rounded-full hover:border-[#2a2a50] hover:text-white transition-all">
                    {t}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* References */}
          {note.refs?.length > 0 && (
            <Section label="// REFERENCES">
              <ul className="space-y-2">
                {note.refs.map((ref, i) => (
                  <li key={i}>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-[#475569] hover:text-[#00ff9d] transition-colors text-sm font-mono group py-1"
                    >
                      <span className="text-[#00ff9d] group-hover:translate-x-0.5 transition-transform">→</span>
                      <span className="group-hover:underline underline-offset-2">{ref.label || ref.url}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Footer nav */}
          <div className="border-t border-[#0f172a] pt-8 mt-8 flex items-center justify-between">
            <Link href="/notes" className="flex items-center gap-2 text-[#475569] text-sm font-mono hover:text-[#00ff9d] transition-colors group">
              <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
              All notes
            </Link>
            <span className="text-[#1e293b] text-xs font-mono">
              {new Date(note.updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </main>
      </div>
    </>
  )
}
