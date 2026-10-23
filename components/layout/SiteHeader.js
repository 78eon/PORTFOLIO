import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Icon from '@/components/Icon'

const links = [
  ['Research', '/#research'],
  ['Notes', '/notes'],
  ['About', '/#about'],
  ['Contact', '/#contact'],
]
export default function SiteHeader({ home = false }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')
  const header = useRef(null)
  const toggle = useRef(null)
  useEffect(() => {
    const onScroll = () =>
      header.current?.classList.toggle('is-scrolled', window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const observer =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) setActive(entry.target.id)
              })
            },
            { rootMargin: '-15% 0px -55% 0px' }
          )
        : null
    document
      .querySelectorAll('main section[id]')
      .forEach((el) => observer?.observe(el))
    return () => {
      window.removeEventListener('scroll', onScroll)
      observer?.disconnect()
    }
  }, [])
  function close() {
    setOpen(false)
  }
  return (
    <header ref={header} className="site-header">
      <div
        className="shell header-inner"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            close()
            toggle.current?.focus()
          }
        }}
      >
        <Link href="/" className="brand" aria-label="NEON home" onClick={close}>
          <span className="brand-symbol" aria-hidden="true">
            N
          </span>{' '}
          NEON<span className="brand-period">.</span>
        </Link>
        <span className="header-caption">Security research & field notes</span>
        <button
          ref={toggle}
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close navigation' : 'Open navigation'}
        >
          <Icon name={open ? 'close' : 'menu'} />
        </button>
        <nav
          id="primary-navigation"
          aria-label="Main navigation"
          className={`site-nav ${open ? 'is-open' : ''}`}
        >
          {links.map(([label, href]) => (
            <Link
              key={label}
              href={home && href.startsWith('/#') ? href.slice(1) : href}
              className={active === href.split('#')[1] ? 'is-active' : ''}
              aria-current={
                active === href.split('#')[1] ? 'location' : undefined
              }
              onClick={close}
            >
              {label}
              {label === 'Contact' && <Icon name="diagonal" size={14} />}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
