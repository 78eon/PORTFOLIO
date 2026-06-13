const COLORS = {
  Web:       'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Network:   'bg-green-500/15 text-green-400 border-green-500/30',
  Malware:   'bg-red-500/15 text-red-400 border-red-500/30',
  Forensics: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  CTF:       'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  Other:     'bg-gray-500/15 text-gray-400 border-gray-500/30',
}

export default function CategoryBadge({ category }) {
  const cls = COLORS[category] || COLORS.Other
  return (
    <span className={`inline-flex items-center border text-xs font-mono px-2 py-0.5 rounded ${cls}`}>
      {category}
    </span>
  )
}
