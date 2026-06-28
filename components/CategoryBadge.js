const STYLES = {
  Web:       { bg: 'bg-blue-500/10',   text: 'text-blue-400',   border: 'border-blue-500/20',   dot: 'bg-blue-400' },
  Network:   { bg: 'bg-emerald-500/10',text: 'text-emerald-400',border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  Malware:   { bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/20',    dot: 'bg-red-400' },
  Forensics: { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/20',  dot: 'bg-amber-400' },
  CTF:       { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', dot: 'bg-violet-400' },
  Other:     { bg: 'bg-slate-500/10',  text: 'text-slate-400',  border: 'border-slate-500/20',  dot: 'bg-slate-400' },
}

export default function CategoryBadge({ category }) {
  const s = STYLES[category] || STYLES.Other
  return (
    <span className={`inline-flex items-center gap-1.5 border text-xs font-mono px-2.5 py-1 rounded-full ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {category}
    </span>
  )
}
