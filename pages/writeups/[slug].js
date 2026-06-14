import Head from 'next/head'
import Link from 'next/link'
import CategoryBadge from '@/components/CategoryBadge'
import ImageLightbox from '@/components/ImageLightbox'
import db from '@/lib/db'

const IMPACT_COLOR = {
  None: 'text-[#555]',
  Low: 'text-blue-400',
  Medium: 'text-yellow-400',
  High: 'text-orange-400',
  Critical: 'text-red-400',
}

const IMPACT_BG = {
  None: '',
  Low: 'bg-blue-900/10',
  Medium: 'bg-yellow-900/10',
  High: 'bg-orange-900/10',
  Critical: 'bg-red-900/20',
}

const CVSS_COLOR = score => {
  if (score === null || score === undefined) return 'text-[#666]'
  if (score >= 9.0) return 'text-red-400'
  if (score >= 7.0) return 'text-orange-400'
  if (score >= 4.0) return 'text-yellow-400'
  return 'text-blue-400'
}

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="text-[#00ff41] font-mono text-xs tracking-widest mb-4 flex items-center gap-3">
        <span>{title}</span>
        <span className="flex-1 border-t border-[#1a1a1a]" />
      </h2>
      {children}
    </div>
  )
}

export async function getStaticPaths() {
  const { rows } = await db.query('SELECT slug FROM writeups WHERE published = true')
  return {
    paths: rows.map(r => ({ params: { slug: r.slug } })),
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  const { rows } = await db.query(
    'SELECT * FROM writeups WHERE slug = $1 AND published = true',
    [params.slug]
  )
  if (!rows.length) return { notFound: true }
  const w = rows[0]

  // Normalise screenshots: prefer new JSONB column, fall back to old TEXT[] column
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

      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <header className="border-b border-[#1a1a1a] px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-[#00ff41] font-mono text-sm hover:underline">
              ← All Writeups
            </Link>
            <span className="font-mono text-[#333] text-xs">~/security-research</span>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-12">
          {/* Title block */}
          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <CategoryBadge category={writeup.category} />
              {writeup.difficulty && (
                <span className="text-[#666] text-xs font-mono border border-[#333] px-2 py-0.5 rounded">
                  {writeup.difficulty}
                </span>
              )}
              <time className="text-[#555] text-xs font-mono">Lab Date: {date}</time>
            </div>
            <h1 className="text-white text-2xl md:text-3xl font-bold leading-tight mb-4">
              {writeup.title}
            </h1>
            {/* Tags */}
            {writeup.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {writeup.tags.map(tag => (
                  <span key={tag} className="text-[#00ff41] text-xs font-mono border border-[#00ff41]/30 bg-[#00ff41]/5 px-2 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Meta bar: CVSS + lab env */}
          {(writeup.cvss_score !== null || writeup.lab_environment) && (
            <div className="flex flex-wrap gap-6 mb-10 border border-[#1a1a1a] bg-[#0d0d0d] rounded-lg px-5 py-4">
              {writeup.cvss_score !== null && (
                <div>
                  <p className="text-[#555] text-xs font-mono mb-1">CVSS SCORE</p>
                  <p className={`font-bold font-mono text-lg ${CVSS_COLOR(writeup.cvss_score)}`}>
                    {parseFloat(writeup.cvss_score).toFixed(1)}
                  </p>
                </div>
              )}
              {writeup.lab_environment && (
                <div>
                  <p className="text-[#555] text-xs font-mono mb-1">LAB ENVIRONMENT</p>
                  <p className="text-white text-sm">{writeup.lab_environment}</p>
                </div>
              )}
            </div>
          )}

          {/* Overview */}
          <Section title="// VULNERABILITY OVERVIEW">
            <p className="text-[#bbb] leading-relaxed">{writeup.overview}</p>
          </Section>

          {/* Impact */}
          <Section title="// IMPACT ASSESSMENT">
            <div className="border border-[#1a1a1a] bg-[#0d0d0d] rounded-lg overflow-hidden">
              {[
                ['Confidentiality', writeup.impact_confidentiality],
                ['Integrity', writeup.impact_integrity],
                ['Availability', writeup.impact_availability],
              ].map(([label, level]) => (
                <div
                  key={label}
                  className={`flex items-center border-b border-[#1a1a1a] last:border-b-0 px-5 py-3 ${IMPACT_BG[level] || ''}`}
                >
                  <span className="text-[#666] text-sm w-40 font-mono">{label}</span>
                  <span className={`font-bold text-sm font-mono ${IMPACT_COLOR[level] || IMPACT_COLOR.None}`}>
                    {level || 'None'}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          {/* Attack vector */}
          <Section title="// ATTACK VECTOR / ENTRY POINT">
            <p className="text-[#bbb] leading-relaxed">{writeup.attack_vector}</p>
          </Section>

          {/* Exploitation */}
          <Section title="// EXPLOITATION WALKTHROUGH">
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg p-5">
              <pre className="text-[#ccc] text-sm font-mono whitespace-pre-wrap leading-relaxed">
                {writeup.exploitation_walkthrough}
              </pre>
            </div>
          </Section>

          {/* Mitigation */}
          <Section title="// MITIGATION APPLIED">
            <div className="border-l-2 border-[#00ff41] pl-5">
              <p className="text-[#bbb] leading-relaxed">{writeup.mitigation}</p>
            </div>
          </Section>

          {/* Key takeaways */}
          {writeup.key_takeaways && (
            <Section title="// KEY TAKEAWAYS">
              <div className="border border-[#00ff41]/20 bg-[#00ff41]/5 rounded-lg p-5">
                <p className="text-[#ccc] leading-relaxed">{writeup.key_takeaways}</p>
              </div>
            </Section>
          )}

          {/* Tools */}
          {writeup.tools_used?.length > 0 && (
            <Section title="// TOOLS USED">
              <div className="flex flex-wrap gap-2">
                {writeup.tools_used.map(tool => (
                  <span key={tool} className="bg-[#111] border border-[#333] text-[#ccc] text-xs font-mono px-3 py-1 rounded-full">
                    {tool}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Screenshots */}
          {writeup.screenshots?.length > 0 && (
            <Section title="// SCREENSHOTS / EVIDENCE">
              <ImageLightbox images={writeup.screenshots} />
            </Section>
          )}

          {/* References */}
          {writeup.refs?.length > 0 && (
            <Section title="// REFERENCES">
              <ul className="space-y-2">
                {writeup.refs.map((ref, i) => (
                  <li key={i}>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-[#888] hover:text-[#00ff41] transition-colors text-sm font-mono group"
                    >
                      <span className="text-[#00ff41]">→</span>
                      <span className="group-hover:underline">{ref.label || ref.url}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <div className="border-t border-[#1a1a1a] pt-8 mt-8">
            <Link href="/" className="text-[#00ff41] text-sm font-mono hover:underline">
              ← Back to all writeups
            </Link>
          </div>
        </main>
      </div>
    </>
  )
}
