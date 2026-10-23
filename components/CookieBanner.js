import { useSyncExternalStore } from 'react'
import Link from 'next/link'

const subscribe = (callback) => {
  window.addEventListener('storage', callback)
  window.addEventListener('neon-consent', callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener('neon-consent', callback)
  }
}
let dismissed = false
function snapshot() {
  try {
    return dismissed || Boolean(localStorage.getItem('cookie_consent'))
  } catch {
    return dismissed
  }
}
export default function CookieBanner() {
  const hidden = useSyncExternalStore(subscribe, snapshot, () => true)
  function choose(value) {
    dismissed = true
    try {
      localStorage.setItem('cookie_consent', value)
    } catch {
      /* Preference still applies for this visit. */
    }
    window.dispatchEvent(new Event('neon-consent'))
  }
  if (hidden) return null
  return (
    <aside
      aria-label="Cookie preferences"
      className="cookie-banner fixed bottom-0 left-0 right-0 z-50 bg-[var(--surface)] border-t border-[var(--border)] px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between"
    >
      <p className="text-[var(--secondary)] text-xs leading-relaxed max-w-xl">
        This site uses a session cookie for admin authentication and stores your
        name and email only if you submit the contact form. No tracking or
        third-party analytics. Read our{' '}
        <Link className="text-[var(--accent)] underline" href="/privacy">
          privacy policy
        </Link>
        .
      </p>
      <div className="flex gap-3 shrink-0">
        <button
          className="button button-outline"
          onClick={() => choose('declined')}
        >
          Decline
        </button>
        <button
          className="button button-primary"
          onClick={() => choose('accepted')}
        >
          Accept
        </button>
      </div>
    </aside>
  )
}
