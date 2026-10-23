import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import Head from 'next/head'
import Link from 'next/link'

export default function Privacy() {
  const updated = '2024-01-01'

  return (
    <>
      <Head>
        <title>Privacy Policy — Security Research Portfolio</title>
      </Head>

      <div className="reading-surface min-h-screen bg-[var(--background)] text-white">
        <SiteHeader />

        <main id="main-content" tabIndex={-1} className="max-w-3xl mx-auto px-6 py-12">
          <div className="mb-10">
            <p className="text-[var(--accent)] font-mono text-xs tracking-widest mb-2">{'// LEGAL'}</p>
            <h1 className="text-white text-3xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-[var(--muted)] text-xs font-mono">Last updated: {updated}</p>
          </div>

          <div className="space-y-10 text-[var(--secondary)] leading-relaxed">
            <section>
              <h2 className="text-white text-lg font-semibold mb-3">1. Who We Are</h2>
              <p>
                This is a personal portfolio website operated by a cybersecurity student (NEON). This Privacy Policy explains how personal data is collected and processed when you use this site.
              </p>
            </section>

            <section>
              <h2 className="text-white text-lg font-semibold mb-3">2. Data We Collect</h2>
              <p className="mb-3">We collect personal data only when you actively submit the contact form:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Name</strong> — to address you in a reply</li>
                <li><strong className="text-white">Email address</strong> — to send you a reply</li>
                <li><strong className="text-white">Message content</strong> — the message you wrote</li>
              </ul>
              <p className="mt-3">We do <strong className="text-white">not</strong> collect any tracking data, browsing history, or analytics. We do not use advertising cookies or third-party trackers.</p>
            </section>

            <section>
              <h2 className="text-white text-lg font-semibold mb-3">3. How We Use Your Data</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To read and respond to your message</li>
                <li>We do not sell, rent, or share your data with third parties</li>
                <li>We do not use your email for marketing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-lg font-semibold mb-3">4. Legal Basis (GDPR)</h2>
              <p>
                Under the General Data Protection Regulation (GDPR), we process your data based on your <strong className="text-white">explicit consent</strong> (Article 6(1)(a)) provided when you tick the consent checkbox and submit the contact form.
              </p>
            </section>

            <section>
              <h2 className="text-white text-lg font-semibold mb-3">5. Data Storage & Security</h2>
              <p>
                Contact messages are stored in a PostgreSQL database hosted on <a href="https://neon.tech" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">Neon</a> (EU/US regions). The database is password-protected and not publicly accessible. The website is hosted on <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">Vercel</a>.
              </p>
            </section>

            <section>
              <h2 className="text-white text-lg font-semibold mb-3">6. Cookies</h2>
              <p className="mb-3">This site uses one functional cookie:</p>
              <div className="border border-[var(--border)] rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                      <th className="text-left text-[var(--muted)] text-xs font-mono px-4 py-3">Name</th>
                      <th className="text-left text-[var(--muted)] text-xs font-mono px-4 py-3">Purpose</th>
                      <th className="text-left text-[var(--muted)] text-xs font-mono px-4 py-3">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[var(--border)]">
                      <td className="px-4 py-3 font-mono text-[var(--foreground)] text-xs">admin_session</td>
                      <td className="px-4 py-3 text-[var(--secondary)] text-xs">Admin authentication only — not set for regular visitors</td>
                      <td className="px-4 py-3 text-[var(--secondary)] text-xs">1 day</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-[var(--foreground)] text-xs">cookie_consent</td>
                      <td className="px-4 py-3 text-[var(--secondary)] text-xs">Remembers your cookie consent choice</td>
                      <td className="px-4 py-3 text-[var(--secondary)] text-xs">Persistent (localStorage)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-white text-lg font-semibold mb-3">7. Your Rights (GDPR)</h2>
              <p className="mb-3">If you are in the EU/UK, you have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Access</strong> — request a copy of your personal data</li>
                <li><strong className="text-white">Erasure</strong> — request deletion of your data (&quot;right to be forgotten&quot;)</li>
                <li><strong className="text-white">Rectification</strong> — request correction of inaccurate data</li>
                <li><strong className="text-white">Withdraw consent</strong> — at any time; this does not affect prior processing</li>
                <li><strong className="text-white">Portability</strong> — receive your data in a machine-readable format</li>
                <li><strong className="text-white">Lodge a complaint</strong> — with your national data protection authority</li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, use the contact form on the home page and reference &quot;GDPR request&quot; in your message.
              </p>
            </section>

            <section>
              <h2 className="text-white text-lg font-semibold mb-3">8. Data Retention</h2>
              <p>
                Contact messages are retained until manually deleted by the site administrator, or upon a deletion request from you.
              </p>
            </section>

            <section>
              <h2 className="text-white text-lg font-semibold mb-3">9. Changes to This Policy</h2>
              <p>
                We may update this policy. The &ldquo;Last updated&rdquo; date at the top will reflect any changes. Continued use of this site after changes means you accept the updated policy.
              </p>
            </section>
          </div>
        </main>

        <SiteFooter />
      </div>
    </>
  )
}
