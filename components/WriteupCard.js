import Link from 'next/link'
import CategoryBadge from './CategoryBadge'
import Icon from './Icon'
export default function WriteupCard({ writeup, featured = false }) {
  const date = new Date(writeup.lab_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
  return (
    <Link
      href={`/writeups/${writeup.slug}`}
      className={`research-card ${featured ? 'research-card-featured' : ''}`}
    >
      <article>
        <div className="card-meta">
          <CategoryBadge category={writeup.category} />
          <time dateTime={writeup.lab_date}>{date}</time>
        </div>
        <h3>{writeup.title}</h3>
        <p>
          {writeup.overview ||
            'Read the investigation, methodology, and findings.'}
        </p>
        <div className="card-bottom">
          <span>{featured ? 'Explore the investigation' : 'Read writeup'}</span>
          <Icon name="diagonal" size={20} />
        </div>
      </article>
    </Link>
  )
}
