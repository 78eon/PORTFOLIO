import '@/styles/globals.css'
import CookieBanner from '@/components/CookieBanner'

export default function App({ Component, pageProps }) {
  return (
    <>
      <noscript><style>{`@media(max-width:640px){.site-header{position:relative}.header-inner{flex-wrap:wrap;padding-bottom:12px}.menu-toggle{display:none}.site-nav{position:static;display:flex;flex-wrap:wrap;flex-direction:row;width:100%;padding:0;background:transparent;border:0;gap:20px}}`}</style></noscript>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Component {...pageProps} />
      <CookieBanner />
    </>
  )
}
