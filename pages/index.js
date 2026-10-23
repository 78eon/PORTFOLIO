import { dateOnly } from '@/lib/date'
import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import WriteupCard from '@/components/WriteupCard'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import Hero from '@/components/home/Hero'
import CyberExplorer from '@/components/cyber/CyberExplorer'
import ContactForm from '@/components/home/ContactForm'
import Icon from '@/components/Icon'
import db from '@/lib/db'

const CATEGORIES = [
  'All',
  'Web',
  'Network',
  'Malware',
  'Forensics',
  'CTF',
  'Other',
]
const date = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })

function Certification({ cert }) {
  const content = (
    <>
      <div className="cert-badge">
        {cert.badge_url ? (
          <img
            src={cert.badge_url}
            alt=""
            width="64"
            height="64"
            loading="lazy"
          />
        ) : (
          <Icon name="shield" size={32} />
        )}
      </div>
      <div>
        <h3>{cert.name}</h3>
        <p>{cert.issuer}</p>
        <span>
          Issued {date(cert.issue_date)}
          {cert.expiry_date && ` · Expires ${date(cert.expiry_date)}`}
        </span>
        {cert.credential_url && (
          <span className="credential-link">
            Verify credential <Icon name="diagonal" size={13} />
          </span>
        )}
      </div>
    </>
  )
  return cert.credential_url ? (
    <a
      className="certification"
      href={cert.credential_url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {content}
    </a>
  ) : (
    <div className="certification">{content}</div>
  )
}

export async function getStaticProps() {
  const [{ rows: writeups }, { rows: certs }] = await Promise.all([
    db.query(
      'SELECT id, title, slug, category, lab_date, overview FROM writeups WHERE published = true ORDER BY lab_date DESC'
    ),
    db.query(
      'SELECT * FROM certifications ORDER BY sort_order ASC, issue_date DESC'
    ),
  ])
  return {
    props: {
      writeups: writeups.map((r) => ({ ...r, lab_date: dateOnly(r.lab_date) })),
      certifications: certs.map((r) => ({
        ...r,
        created_at: r.created_at?.toISOString() ?? null,
        issue_date: dateOnly(r.issue_date) ?? null,
        expiry_date: dateOnly(r.expiry_date) ?? null,
      })),
    },
    revalidate: 60,
  }
}

export default function Home({ writeups, certifications }) {
  const [filter, setFilter] = useState('All')
  const visible =
    filter === 'All' ? writeups : writeups.filter((w) => w.category === filter)
  const topics = [...new Set(writeups.map((w) => w.category))].filter(
    (c) => CATEGORIES.includes(c) && c !== 'Other' && c !== 'All'
  )
  return (
    <>
      <Head>
        <title>NEON — Security Research & Field Notes</title>
        <meta
          name="description"
          content="Cybersecurity student exploring systems through practical labs, CTF writeups, vulnerability research, and documented investigations."
        />
      </Head>
      <SiteHeader home />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <CyberExplorer writeups={writeups} />
        <section
          id="featured"
          className="shell section featured-section"
          aria-labelledby="featured-heading"
        >
          <div className="section-heading">
            <div>
              <h2 id="featured-heading">Inside the research.</h2>
              <p>
                Practical work. Documented from first question to final finding.
              </p>
            </div>
            <a href="#research" className="text-link">
              All research <Icon name="diagonal" size={16} />
            </a>
          </div>
          {writeups.length ? (
            <div className="featured-grid">
              <WriteupCard writeup={writeups[0]} featured />
              <aside className="research-note">
                <span className="note-mark" aria-hidden="true">
                  “
                </span>
                <p>
                  The most useful part of a lab is understanding <em>why</em> it
                  worked.
                </p>
                <div>
                  <span>THE APPROACH</span>
                  <p>
                    Explore the system.
                    <br />
                    Follow the evidence.
                    <br />
                    Document the learning.
                  </p>
                </div>
                <Link href="/notes" className="text-link">
                  Open the learning notes <Icon />
                </Link>
              </aside>
            </div>
          ) : (
            <div className="empty-state">
              <h3>The notebook is open.</h3>
              <p>
                Research writeups will appear here as they are published. In the
                meantime, explore the learning notes.
              </p>
              <Link href="/notes" className="text-link">
                Read the notes <Icon />
              </Link>
            </div>
          )}
        </section>
        <section
          id="research"
          className="shell section archive-section"
          aria-labelledby="research-heading"
        >
          <div className="section-heading">
            <div>
              <h2 id="research-heading">
                The research archive<span className="heading-dot">.</span>
              </h2>
              <p>Labs, investigations, and lessons worth keeping.</p>
            </div>
            <span className="archive-count">
              {String(writeups.length).padStart(2, '0')} PUBLISHED WRITEUPS
            </span>
          </div>
          <div
            className="filter-bar"
            role="group"
            aria-label="Filter research by category"
          >
            {CATEGORIES.map((category) => (
              <button
                type="button"
                key={category}
                aria-pressed={filter === category}
                onClick={() => setFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            {visible.length} {filter === 'All' ? '' : filter} writeups shown.
          </p>
          {visible.length ? (
            <div className="research-grid">
              {visible.map((w) => (
                <WriteupCard key={w.id} writeup={w} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>
                {writeups.length
                  ? `No ${filter} writeups yet.`
                  : 'Research is in progress.'}
              </h3>
              <p>
                {writeups.length
                  ? 'Try another category to explore the archive.'
                  : 'New investigations will appear here when published.'}
              </p>
              {filter !== 'All' && (
                <button className="text-link" onClick={() => setFilter('All')}>
                  Show all research <Icon />
                </button>
              )}
            </div>
          )}
        </section>
        {topics.length > 0 && (
          <section className="topics-section">
            <div className="shell topics-inner">
              <h2>Areas of exploration</h2>
              <div>
                {topics.map((topic) => (
                  <span key={topic}>{topic}</span>
                ))}
              </div>
              <p>
                Topics from the published research.
                <br />
                Always learning, always questioning.
              </p>
            </div>
          </section>
        )}
        {certifications.length > 0 && (
          <section
            className="shell section"
            aria-labelledby="credentials-heading"
          >
            <div className="section-heading">
              <div>
                <h2 id="credentials-heading">Learning, with evidence.</h2>
                <p>Certifications and credentials along the way.</p>
              </div>
            </div>
            <div className="certifications-grid">
              {certifications.map((cert) => (
                <Certification key={cert.id} cert={cert} />
              ))}
            </div>
          </section>
        )}
        <section
          id="about"
          className="shell section about-section"
          aria-labelledby="about-heading"
        >
          <div>
            <h2 id="about-heading">
              Stay curious.
              <br />
              <span>Go a little deeper.</span>
            </h2>
          </div>
          <div className="about-copy">
            <p>
              I&apos;m a cybersecurity student documenting what I learn by
              doing: practical labs, capture-the-flag challenges, and
              vulnerability research.
            </p>
            <p>
              This is my working notebook. A place to connect the concepts with
              the commands, keep the evidence, and make the lessons useful to
              someone else.
            </p>
            <Link href="/notes" className="text-link">
              More from the notebook <Icon name="diagonal" />
            </Link>
          </div>
        </section>
        <section
          id="contact"
          className="contact-section"
          aria-labelledby="contact-heading"
        >
          <div className="shell contact-inner">
            <div className="contact-intro">
              <h2 id="contact-heading">
                Good questions
                <br />
                start conversations<span className="heading-dot">.</span>
              </h2>
              <p>
                A question about a writeup, a shared research interest, or
                something worth exploring together? Get in touch.
              </p>
              <a
                className="text-link"
                href="https://github.com/78eon"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="github" /> Find me on GitHub{' '}
                <Icon name="diagonal" size={15} />
              </a>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
