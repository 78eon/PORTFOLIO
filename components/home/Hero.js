import dynamic from 'next/dynamic'
import Icon from '@/components/Icon'
const NetworkBackground = dynamic(
  () => import('@/components/visuals/NetworkBackground'),
  { ssr: false }
)
export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-art" aria-hidden="true">
        <div className="orbital orbital-one" />
        <div className="orbital orbital-two" />
        <div className="orbital orbital-three" />
        <div className="orbital-center">
          <Icon name="shield" size={64} />
        </div>
        <NetworkBackground />
        <span className="diagram-caption">
          CONNECTIONS / EXPLORATION / UNDERSTANDING
        </span>
      </div>
      <div className="shell hero-inner">
        <p className="hero-status">
          <span /> CYBERSECURITY STUDENT & RESEARCHER
        </p>
        <h1 id="hero-heading">
          <span>Breaking</span>
          <span>assumptions.</span>
          <span className="hero-accent">Building resilience.</span>
        </h1>
        <p className="hero-description">
          A closer look at how systems break.
          <br />
          Practical labs, CTF writeups, and vulnerability research—documented
          along the way. Explore how security disciplines connect below.
        </p>
        <div className="hero-actions">
          <a className="button button-primary" href="#cyber-explorer">
            Explore security domains <Icon name="down" size={17} />
          </a>
          <a
            className="button button-quiet"
            href="https://github.com/78eon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="github" size={17} /> View GitHub{' '}
            <Icon name="diagonal" size={15} />
          </a>
        </div>
        <div className="hero-bottom">
          <span>Curiosity. Evidence. Understanding.</span>
          <a href="#featured">
            Explore the field notes <Icon name="down" size={14} />
          </a>
        </div>
      </div>
    </section>
  )
}
