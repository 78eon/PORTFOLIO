import Link from 'next/link'
import { relatedResearch } from '@/lib/cyberDomains'
export default function CyberInfoPanel({ domain, selected, writeups }) {
  const node = domain.nodes[selected]
  const related = relatedResearch(domain, writeups)
  return (
    <aside className="cyber-info" aria-label="Domain and selected concept">
      <div key={domain.id} className="cyber-domain-brief">
        <h3>{domain.name}</h3>
        <p>{domain.description}</p>
      </div>
      <div
        className="cyber-selection"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="cyber-concept-kind">{node.kind} · illustrative</span>
        <h4>{node.label}</h4>
        <p>{node.detail}</p>
      </div>
      {domain.id === 'grc' && node.id === 'risk' && (
        <div className="cyber-risk">
          <p>Example matrix · likelihood × impact</p>
          <table>
            <caption className="sr-only">
              Illustrative qualitative risk matrix. Columns show impact, rows
              show likelihood.
            </caption>
            <thead>
              <tr>
                <th scope="col">Likelihood / impact</th>
                <th scope="col">Low</th>
                <th scope="col">Medium</th>
                <th scope="col">High</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['High', 'Moderate', 'High', 'High'],
                ['Medium', 'Low', 'Moderate', 'High'],
                ['Low', 'Low', 'Low', 'Moderate'],
              ].map((row) => (
                <tr key={row[0]}>
                  <th scope="row">{row[0]}</th>
                  {row.slice(1).map((v, i) => (
                    <td key={i}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="cyber-relationships">
        <h4>Connections to this concept</h4>
        <ul>
          {domain.edges
            .filter((e) => e.from === selected || e.to === selected)
            .map((e) => (
              <li key={`${e.from}-${e.to}`}>
                <span>{domain.nodes[e.from].label}</span>
                <em>{e.label}</em>
                <span>{domain.nodes[e.to].label}</span>
              </li>
            ))}
        </ul>
      </div>
      {domain.reference && (
        <a
          className="cyber-reference"
          href={domain.reference.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          Reference: {domain.reference.label}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}
      <div className="cyber-related">
        <h4>Related published research</h4>
        {related.length ? (
          <>
            <p>Matched by topic or category.</p>
            <ul>
              {related.map((w) => (
                <li key={w.id}>
                  <Link href={`/writeups/${w.slug}`}>{w.title}</Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>
            No matching writeups published yet.{' '}
            <Link href="/notes">Explore learning notes</Link>.
          </p>
        )}
      </div>
    </aside>
  )
}
