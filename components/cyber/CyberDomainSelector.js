import { CYBER_DOMAINS } from '@/lib/cyberDomains'
export default function CyberDomainSelector({ activeId, onSelect }) {
  return (
    <div
      className="cyber-domains"
      role="group"
      aria-label="Cybersecurity domains"
    >
      {CYBER_DOMAINS.map((domain) => (
        <button
          type="button"
          key={domain.id}
          aria-pressed={activeId === domain.id}
          onClick={() => onSelect(domain.id)}
        >
          <span>{domain.short}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 10h12m-5-5 5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.4"
            />
          </svg>
        </button>
      ))}
    </div>
  )
}
