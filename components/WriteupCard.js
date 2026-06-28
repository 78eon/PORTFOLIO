import Link from 'next/link'
import CategoryBadge from './CategoryBadge'

const ACCENT = {
  Web: '#3b82f6', Network: '#10b981', Malware: '#ef4444',
  Forensics: '#f59e0b', CTF: '#8b5cf6', Other: '#64748b',
}

export default function WriteupCard({ writeup }) {
  const date = new Date(writeup.lab_date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
  const excerpt = writeup.overview?.slice(0, 110) + (writeup.overview?.length > 110 ? '…' : '')
  const accent = ACCENT[writeup.category] || ACCENT.Other

  return (
    <Link href={`/writeups/${writeup.slug}`} className="group block h-full">
      <article className="relative h-full bg-[#0a0a16] rounded-xl border border-[#1a1a30] card-glow hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
        {/* Top accent line */}
        <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${accent}60, transparent)` }} />

        {/* Left glow accent */}
        <div className="absolute left-0 top-8 bottom-8 w-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(180deg, transparent, ${accent}, transparent)` }} />

        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-4">
            <CategoryBadge category={writeup.category} />
            <time className="text-[#475569] text-xs font-mono">{date}</time>
          </div>

          <h3 className="text-[#e2e8f0] font-bold text-base leading-snug mb-3 group-hover:text-white transition-colors line-clamp-2 flex-shrink-0">
            {writeup.title}
          </h3>

          <p className="text-[#64748b] text-sm leading-relaxed line-clamp-3 flex-1">
            {excerpt}
          </p>

          <div className="mt-4 pt-4 border-t border-[#1a1a30] flex items-center justify-between">
            <span className="text-[#00ff9d] text-xs font-mono group-hover:text-white transition-colors">
              Read writeup →
            </span>
            <div className="w-5 h-5 rounded-full border border-[#2a2a50] group-hover:border-[#00ff9d] transition-colors flex items-center justify-center">
              <span className="text-[#00ff9d] text-[10px]">↗</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
