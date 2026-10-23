import { Component, useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { CYBER_DOMAINS } from '@/lib/cyberDomains'
import CyberDomainSelector from './CyberDomainSelector'
import CyberNode from './CyberNode'
import CyberFallback from './CyberFallback'
import CyberInfoPanel from './CyberInfoPanel'

function SceneUnavailable({ onFailure }) {
  useEffect(() => {
    onFailure(
      'The 3D view could not load. Continue with the concept map, or reload to retry.',
      true
    )
  }, [onFailure])
  return null
}
const CyberScene = dynamic(
  () => import('./CyberScene').catch(() => ({ default: SceneUnavailable })),
  { ssr: false, loading: () => null }
)
class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onFailure(
      'The 3D view could not load. You can continue with the concept map.'
    )
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}
const CAMERA_ACTIONS = [
  ['left', 'Orbit left'],
  ['right', 'Orbit right'],
  ['up', 'Orbit up'],
  ['down', 'Orbit down'],
  ['in', 'Zoom in'],
  ['out', 'Zoom out'],
  ['reset', 'Reset view'],
]

export default function CyberExplorer({ writeups = [] }) {
  const [domainId, setDomainId] = useState('intel'),
    [selected, setSelected] = useState(0)
  const [requested, setRequested] = useState(false),
    [status, setStatus] = useState('static'),
    [error, setError] = useState(''),
    [needsReload, setNeedsReload] = useState(false)
  const [inView, setInView] = useState(false),
    [animate, setAnimate] = useState(true),
    [command, setCommand] = useState(null),
    [attempt, setAttempt] = useState(0)
  const viewport = useRef(null),
    commandId = useRef(0),
    autoAttempted = useRef(false)
  const domain = CYBER_DOMAINS.find((d) => d.id === domainId)
  const ready = useCallback(() => setStatus('ready'), [])
  const failed = useCallback((message, reload = false) => {
    setNeedsReload(reload)
    setError(message)
    setStatus('failed')
    setRequested(false)
  }, [])
  const selectNode = useCallback((index) => setSelected(index), [])
  useEffect(() => {
    const el = viewport.current
    const observer =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              const visible = entries[0].isIntersecting
              setInView(visible)
              const preferStatic =
                window.matchMedia(
                  '(prefers-reduced-motion: reduce), (pointer: coarse), (max-width: 640px)'
                ).matches || navigator.connection?.saveData
              if (visible && !autoAttempted.current) {
                autoAttempted.current = true
                if (!preferStatic) {
                  setStatus('loading')
                  setRequested(true)
                }
              }
            },
            { threshold: 0.15 }
          )
        : null
    observer?.observe(el)
    return () => observer?.disconnect()
  }, [])
  function chooseDomain(id) {
    setDomainId(id)
    setSelected(0)
  }
  function camera(type) {
    setCommand({ type, id: ++commandId.current })
  }
  function enable() {
    if (needsReload) {
      window.location.reload()
      return
    }
    setError('')
    setStatus('loading')
    setAttempt((n) => n + 1)
    setRequested(true)
  }
  function staticView() {
    setRequested(false)
    setStatus('static')
  }
  const show3D = requested && status !== 'failed'
  return (
    <section
      id="cyber-explorer"
      className="cyber-explorer"
      aria-labelledby="cyber-heading"
    >
      <div className="shell">
        <div className="cyber-heading">
          <div>
            <h2 id="cyber-heading">Security is connected.</h2>
            <p>
              Explore the ideas behind the investigations. Choose a domain.
              Follow a connection.
            </p>
          </div>
          <span className="cyber-illustrative">
            <span aria-hidden="true" />
            Illustrative concepts · not live telemetry
          </span>
        </div>
        <div className="cyber-workspace">
          <div className="cyber-domain-rail">
            <h3>Explore a domain</h3>
            <CyberDomainSelector activeId={domainId} onSelect={chooseDomain} />
            <p>
              Seven perspectives.
              <br />
              One interconnected discipline.
            </p>
          </div>
          <div className="cyber-map-column">
            <figure className="cyber-figure">
              <div className="cyber-map-header">
                <span>{domain.theme}</span>
                <span className="cyber-map-mode">
                  {status === 'ready' && requested
                    ? 'Interactive 3D'
                    : 'Concept map'}
                </span>
              </div>
              <div
                ref={viewport}
                className={`cyber-viewport ${status === 'ready' && requested ? 'is-ready' : ''}`}
                tabIndex={show3D ? 0 : -1}
                role="group"
                aria-label={`${domain.name} concept map${show3D ? '. Arrow keys orbit, plus and minus zoom, Home resets the view.' : ''}`}
                aria-describedby="cyber-map-caption"
                onKeyDown={(event) => {
                  if (!show3D) return
                  const keys = {
                    ArrowLeft: 'left',
                    ArrowRight: 'right',
                    ArrowUp: 'up',
                    ArrowDown: 'down',
                    '+': 'in',
                    '=': 'in',
                    '-': 'out',
                    Home: 'reset',
                  }
                  if (keys[event.key]) {
                    event.preventDefault()
                    camera(keys[event.key])
                  }
                }}
              >
                <CyberFallback domain={domain} selected={selected} />
                {show3D && (
                  <SceneBoundary key={attempt} onFailure={failed}>
                    <CyberScene
                      domain={domain}
                      selected={selected}
                      active={inView}
                      animate={animate}
                      command={command}
                      onSelect={selectNode}
                      onReady={ready}
                      onFailure={failed}
                    />
                  </SceneBoundary>
                )}
              </div>
              <figcaption id="cyber-map-caption">
                Illustrative relationships, not measured activity.{' '}
                {show3D
                  ? 'Drag to orbit; scroll or pinch to zoom. Select a node or use the concept buttons below.'
                  : 'Select a concept below to read its role and connections.'}
              </figcaption>
            </figure>
            <div className="cyber-view-options">
              <button
                type="button"
                className="cyber-mode-button"
                onClick={requested ? staticView : enable}
              >
                {requested
                  ? 'Use static map'
                  : needsReload
                    ? 'Reload to retry 3D'
                    : status === 'failed'
                      ? 'Retry 3D view'
                      : 'Explore in 3D'}
              </button>
              {requested && (
                <button
                  type="button"
                  className="cyber-mode-button cyber-ambient-toggle"
                  aria-pressed={!animate}
                  onClick={() => setAnimate((v) => !v)}
                >
                  {animate ? 'Pause ambient motion' : 'Resume ambient motion'}
                </button>
              )}
              <span className="cyber-view-status" role="status">
                {error ||
                  (status === 'loading' &&
                    'Loading 3D. The concept controls are ready.') ||
                  ''}
              </span>
            </div>
            {show3D && (
              <div
                className="cyber-camera"
                role="group"
                aria-label="Camera controls"
              >
                {CAMERA_ACTIONS.map(([type, label]) => (
                  <button type="button" key={type} onClick={() => camera(type)}>
                    {label}
                  </button>
                ))}
              </div>
            )}
            <div
              className="cyber-node-list"
              role="group"
              aria-label={`${domain.name} concepts`}
            >
              {domain.nodes.map((node, index) => (
                <CyberNode
                  key={node.id}
                  node={node}
                  index={index}
                  selected={index === selected}
                  onSelect={selectNode}
                />
              ))}
            </div>
            <noscript>
              <p className="cyber-no-script">
                This static map shows Threat Intelligence concepts. JavaScript
                enables domain switching and optional 3D; research links and the
                portfolio remain readable.
              </p>
            </noscript>
          </div>
          <CyberInfoPanel
            domain={domain}
            selected={selected}
            writeups={writeups}
          />
        </div>
      </div>
    </section>
  )
}
