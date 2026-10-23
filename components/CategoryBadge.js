const COLORS = {
  Web: '#8DD9FA',
  Network: '#83D3C3',
  Malware: '#E5A0AD',
  Forensics: '#E6C080',
  CTF: '#BDA9EC',
  Other: '#AAB8CB',
}

export default function CategoryBadge({ category }) {
  return (
    <span
      className="category-badge font-sans"
      style={{ '--category-color': COLORS[category] || COLORS.Other }}
    >
      <span className="category-badge-dot" aria-hidden="true" />
      {category}
    </span>
  )
}
