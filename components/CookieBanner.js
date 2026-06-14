import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookie_consent')) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('cookie_consent', 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem('cookie_consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#111] border-t border-[#222] px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between shadow-2xl">
      <p className="text-[#aaa] text-xs leading-relaxed max-w-xl">
        This site uses a session cookie for admin authentication and stores your name and email only if you submit the contact form.
        No tracking or third-party analytics. Read our{' '}
        <Link href="/privacy" className="text-[#00ff41] hover:underline">Privacy Policy</Link>.
      </p>
      <div className="flex gap-3 flex-shrink-0">
        <button
          onClick={decline}
          className="border border-[#333] text-[#666] text-xs font-mono px-4 py-2 rounded hover:border-[#555] hover:text-[#aaa] transition-colors"
        >
          Decline
        </button>
        <button
          onClick={accept}
          className="bg-[#00ff41] text-black text-xs font-mono font-bold px-4 py-2 rounded hover:bg-[#00cc33] transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  )
}
