import { useState, useEffect } from 'react'

// Accepts screenshots as [{url, description}] objects OR plain string URLs for backwards compat
export default function ImageLightbox({ images }) {
  const [openIdx, setOpenIdx] = useState(null)

  const shots = (images || []).map(item =>
    typeof item === 'string' ? { url: item, description: '' } : item
  )

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setOpenIdx(null)
      if (e.key === 'ArrowRight' && openIdx !== null && openIdx < shots.length - 1) setOpenIdx(i => i + 1)
      if (e.key === 'ArrowLeft' && openIdx !== null && openIdx > 0) setOpenIdx(i => i - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openIdx, shots.length])

  if (!shots.length) return null

  const active = openIdx !== null ? shots[openIdx] : null

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {shots.map((shot, i) => (
          <button
            key={i}
            onClick={() => setOpenIdx(i)}
            className="group relative overflow-hidden rounded border border-[#333] hover:border-[#00ff41] transition-colors text-left"
          >
            <img
              src={shot.url}
              alt={shot.description || `Screenshot ${i + 1}`}
              className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="text-white text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                Click to expand
              </span>
            </div>
            {shot.description && (
              <div className="px-2 py-1.5 bg-[#0d0d0d] border-t border-[#222]">
                <p className="text-[#888] text-xs truncate">{shot.description}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-50 p-4"
          onClick={() => setOpenIdx(null)}
        >
          <img
            src={active.url}
            alt={active.description || 'Screenshot'}
            className="max-h-[80vh] max-w-[90vw] object-contain rounded shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          {active.description && (
            <p
              className="text-white/70 text-sm font-mono mt-4 max-w-xl text-center"
              onClick={e => e.stopPropagation()}
            >
              {active.description}
            </p>
          )}
          <button
            onClick={() => setOpenIdx(null)}
            className="absolute top-4 right-4 text-white/60 hover:text-white text-3xl leading-none"
          >
            ×
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs font-mono">
            {openIdx + 1} / {shots.length} — press Esc to close, ← → to navigate
          </div>
        </div>
      )}
    </>
  )
}
