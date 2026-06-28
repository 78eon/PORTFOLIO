import Head from 'next/head'
import Link from 'next/link'
import CategoryBadge from '@/components/CategoryBadge'
import ImageLightbox from '@/components/ImageLightbox'
import db from '@/lib/db'

const IMPACT_COLOR = {
  None:     'text-[#334155]',
  Low:      'text-blue-400',
  Medium:   'text-yellow-400',
  High:     'text-orange-400',
  Critical: 'text-red-400',
}

const IMPACT_BG = {
  None:     '',
  Low:      'bg-blue-900/10',
  Medium:   'bg-yellow-900/10',
  High:     'bg-orange-900/10',
  Critical: 'bg-red-900/20',
}

const IMPACT_BORDER = {
  None:     'border-[#1a1a30]',
  Low:      'border-blue-500/20',
  Medium:   'border-yellow-500/20',
  High:     'border-orange-500/20',
  Critical: 'border-red-500/20',
}

function cvssColor(score) {
  if (score === null || score === undefined) return 'text-[#475569]'
  if (score >= 9.0) return 'text-red-400'
  if (score >= 7.0) return 'text-orange-400'
  if (score >= 4.0) return 'text-yellow-400'
  return 'text-blue-400'
}

function cvssLabel(score) {
  if (score === null || score === undefined) return null
  if (score >= 9.0) return 'Critical'
  if (score >= 7.0) return 'High'
  if (score >= 4.0) return 'Medium'
  if (score >= 0.1) return 'Low'
  return 'None'
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
  const { rows } = await db.query('SELECT slug FROM writeups WHERE published = true')
  return { paths: rows.map(r => ({ params: { slug: r.slug } })), fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  const { rows } = await db.query(
    'SELECT * FROM writeups WHERE slug = $1 AND published = true',
    [params.slug]
  )
  if (!rows.length) return { notFound: true }
  const w = rows[0]

  let screenshots = w.screenshots || []
  if (!screenshots.length && w.screenshot_urls?.length) {
    screenshots = w.screenshot_urls.map(url => ({ url, description: '' }))
  }

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
        screenshots,
        cvss_score: w.cvss_score ?? null,
        difficulty: w.difficulty || null,
        lab_environment: w.lab_environment || null,
        key_takeaways: w.key_takeaways || null,
      },
    },
    revalidate: 60,
  }
}

export default function WriteupDetail({ writeup }) {
  const date = new Date(writeup.lab_date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <>
      <Head>
        <title>{writeup.title} — Security Research</title>
        <meta name="description" content={writeup.overview?.slice(0, 160)} />
      </Head>

      <div className="min-h-screen bg-[#030712] text-white">

        {/* Nav */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#0f172a] bg-[#030712]/80 backdrop-blur-md">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-[#475569] text-sm font-mono hover:text-white transition-colors">
              ← Back
            </Link>
            <span className="font-mono text-[#1e293b] text-xs">~/security-research</span>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-6 pt-24 pb-24">

          {/* Header */}
          <div className="mb-12 relative">
            {/* Glow accent */}
            <div className="absolute -top-8 -left-8 w-64 h-64 bg-[#00ff9d]/3 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <CategoryBadge category={writeup.category} />
                {writeup.difficulty && (
                  <span className="text-[#475569] text-xs font-mono border border-[#1a1a30] bg-[#0a0a16] px-3 py-1 rounded-full">
                    {writeup.difficulty}
                  </span>
                )}
                <time className="text-[#334155] text-xs font-mono">{date}</time>
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-5 tracking-tight">
                {writeup.title}
              </h1>

              {writeup.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {writeup.tags.map(tag => (
                    <span key={tag} className="text-[#00ff9d] text-xs font-mono border border-[#00ff9d]/20 bg-[#00ff9d]/5 px-2.5 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Meta bar */}
          {(writeup.cvss_score !== null || writeup.lab_environment) && (
            <div className="flex flex-wrap gap-6 mb-10 border border-[#1a1a30] bg-[#0a0a16] rounded-xl px-6 py-5">
              {writeup.cvss_score !== null && (
                <div>
                  <p className="text-[#334155] text-xs font-mono tracking-widest mb-1.5">CVSS SCORE</p>
                  <div className="flex items-baseline gap-2">
                    <span className={`font-black font-mono text-2xl ${cvssColor(writeup.cvss_score)}`}>
                      {parseFloat(writeup.cvss_score).toFixed(1)}
                    </span>
                    <span className={`text-xs font-mono ${cvssColor(writeup.cvss_score)}`}>
                      {cvssLabel(writeup.cvss_score)}
                    </span>
                  </div>
                </div>
              )}
              {writeup.lab_environment && (
                <div>
                  <p className="text-[#334155] text-xs font-mono tracking-widest mb-1.5">LAB ENVIRONMENT</p>
                  <p className="text-[#94a3b8] text-sm font-mono">{writeup.lab_environment}</p>
                </div>
              )}
            </div>
          )}

          {/* Overview */}
          <Section label="// VULNERABILITY OVERVIEW">
            <p className="text-[#94a3b8] leading-relaxed text-[15px]">{writeup.overview}</p>
          </Section>

          {/* Impact */}
          <Section label="// IMPACT ASSESSMENT">
            <div className="border border-[#1a1a30] bg-[#0a0a16] rounded-xl overflow-hidden">
              {[
                ['Confidentiality', writeup.impact_confidentiality],
                ['Integrity',       writeup.impact_integrity],
                ['Availability',    writeup.impact_availability],
              ].map(([label, level]) => (
                <div
                  key={label}
                  className={`flex items-center justify-between border-b border-[#1a1a30] last:border-b-0 px-5 py-4 ${IMPACT_BG[level] || ''}`}
                >
                  <span className="text-[#475569] text-sm font-mono w-36">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      level === 'Critical' ? 'bg-red-400' :
                      level === 'High' ? 'bg-orange-400' :
                      level === 'Medium' ? 'bg-yellow-400' :
                      level === 'Low' ? 'bg-blue-400' : 'bg-[#1e293b]'
                    }`} />
                    <span className={`font-bold text-sm font-mono ${IMPACT_COLOR[level] || IMPACT_COLOR.None}`}>
                      {level || 'None'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Attack vector */}
          <Section label="// ATTACK VECTOR / ENTRY POINT">
            <p className="text-[#94a3b8] leading-relaxed text-[15px]">{writeup.attack_vector}</p>
          </Section>

          {/* Exploitation */}
          <Section label="// EXPLOITATION WALKTHROUGH">
            <div className="relative bg-[#020615] border border-[#1a1a30] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-[#1a1a30] bg-[#0a0a16]">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                <span className="ml-2 text-[#334155] text-xs font-mono">walkthrough.sh</span>
              </div>
              <pre className="text-[#94a3b8] text-sm font-mono whitespace-pre-wrap leading-relaxed p-5 overflow-x-auto">
                {writeup.exploitation_walkthrough}
              </pre>
            </div>
          </Section>

          {/* Mitigation */}
          <Section label="// MITIGATION APPLIED">
            <div className="relative border border-[#00ff9d]/20 bg-[#00ff9d]/5 rounded-xl p-5 overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-[#00ff9d] to-transparent" />
              <p className="text-[#94a3b8] leading-relaxed text-[15px] pl-4">{writeup.mitigation}</p>
            </div>
          </Section>

          {/* Key takeaways */}
          {writeup.key_takeaways && (
            <Section label="// KEY TAKEAWAYS">
              <div className="border border-[#818cf8]/20 bg-[#818cf8]/5 rounded-xl p-5">
                <p className="text-[#94a3b8] leading-relaxed text-[15px]">{writeup.key_takeaways}</p>
              </div>
            </Section>
          )}

          {/* Tools */}
          {writeup.tools_used?.length > 0 && (
            <Section label="// TOOLS USED">
              <div className="flex flex-wrap gap-2">
                {writeup.tools_used.map(tool => (
                  <span key={tool} className="bg-[#0a0a16] border border-[#1a1a30] text-[#94a3b8] text-xs font-mono px-3 py-1.5 rounded-full hover:border-[#2a2a50] hover:text-white transition-all">
                    {tool}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Screenshots */}
          {writeup.screenshots?.length > 0 && (
            <Section label="// SCREENSHOTS / EVIDENCE">
              <ImageLightbox images={writeup.screenshots} />
            </Section>
          )}

          {/* References */}
          {writeup.refs?.length > 0 && (
            <Section label="// REFERENCES">
              <ul className="space-y-2">
                {writeup.refs.map((ref, i) => (
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
            <Link href="/" className="flex items-center gap-2 text-[#475569] text-sm font-mono hover:text-[#00ff9d] transition-colors group">
              <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
              All writeups
            </Link>
            <span className="text-[#1e293b] text-xs font-mono">
              {new Date(writeup.updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </main>
      </div>
    </>
  )
}
