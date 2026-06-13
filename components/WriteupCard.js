import Link from 'next/link'
import CategoryBadge from './CategoryBadge'

export default function WriteupCard({ writeup }) {
  const date = new Date(writeup.lab_date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const excerpt = writeup.overview?.slice(0, 120) + (writeup.overview?.length > 120 ? '…' : '')

  return (
    <Link href={`/writeups/${writeup.slug}`} className="group block">
      <article className="h-full border border-[#222] bg-[#111] rounded-lg p-5 hover:border-[#00ff41] hover:bg-[#0f0f0f] transition-all duration-200">
        <div className="flex items-center justify-between mb-3">
          <CategoryBadge category={writeup.category} />
          <time className="text-[#555] text-xs font-mono">{date}</time>
        </div>
        <h3 className="text-white font-bold text-base mb-3 group-hover:text-[#00ff41] transition-colors line-clamp-2">
          {writeup.title}
        </h3>
        <p className="text-[#777] text-sm leading-relaxed mb-4 line-clamp-3">
          {excerpt}
        </p>
        <span className="text-[#00ff41] text-xs font-mono group-hover:underline">
          Read writeup →
        </span>
      </article>
    </Link>
  )
}
