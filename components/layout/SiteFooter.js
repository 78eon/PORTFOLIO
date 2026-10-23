import Link from 'next/link'
import Icon from '@/components/Icon'
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <Link className="brand" href="/">
          NEON<span className="brand-period">.</span>
        </Link>
        <p>Documenting the process. Sharing the findings.</p>
        <nav aria-label="Footer">
          <a
            href="https://github.com/78eon"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub <Icon name="diagonal" size={13} />
          </a>
          <Link href="/notes">Notes</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
        <small>© {new Date().getFullYear()} NEON</small>
      </div>
    </footer>
  )
}
