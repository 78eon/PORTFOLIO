import { useState, useEffect, useRef } from 'react'
import Icon from './Icon'

export default function ImageLightbox({ images }) {
  const [openIdx, setOpenIdx] = useState(null)
  const dialog = useRef(null)
  const shots = (images || []).map((item) =>
    typeof item === 'string' ? { url: item, description: '' } : item
  )
  const isOpen = openIdx !== null
  useEffect(() => {
    if (!isOpen) return
    const previous = document.activeElement
    const el = dialog.current
    el.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      el.close()
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [isOpen])
  const active = shots[openIdx]
  if (!shots.length) return null
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {shots.map((shot, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Expand ${shot.description || `screenshot ${i + 1}`}`}
            onClick={() => setOpenIdx(i)}
            className="group overflow-hidden rounded-lg border border-[var(--border)] hover:border-[var(--accent)] text-left"
          >
            <img
              src={shot.url}
              alt={shot.description || `Screenshot ${i + 1}`}
              loading="lazy"
              className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-200"
            />
            {shot.description && (
              <p className="px-3 py-2 text-[var(--secondary)] text-xs">
                {shot.description}
              </p>
            )}
          </button>
        ))}
      </div>
      <dialog
        ref={dialog}
        aria-label="Research evidence viewer"
        className="lightbox"
        onCancel={() => setOpenIdx(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpenIdx(null)
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight')
            setOpenIdx((i) => Math.min(i + 1, shots.length - 1))
          if (e.key === 'ArrowLeft') setOpenIdx((i) => Math.max(i - 1, 0))
        }}
      >
        {active && (
          <div className="lightbox-content">
            <button
              type="button"
              className="button button-outline lightbox-close"
              onClick={() => setOpenIdx(null)}
              aria-label="Close image viewer"
            >
              <Icon name="close" />
            </button>
            <img
              src={active.url}
              alt={active.description || 'Research screenshot'}
            />
            <p>{active.description}</p>
            <div className="lightbox-controls">
              <button
                className="button button-outline"
                disabled={openIdx === 0}
                onClick={() => setOpenIdx((i) => i - 1)}
              >
                Previous
              </button>
              <span aria-live="polite">
                {openIdx + 1} / {shots.length}
              </span>
              <button
                className="button button-outline"
                disabled={openIdx === shots.length - 1}
                onClick={() => setOpenIdx((i) => i + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  )
}
