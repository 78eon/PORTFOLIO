import { useState, useEffect } from 'react'

export default function ImageLightbox({ images }) {
  const [open, setOpen] = useState(null)

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight' && open) {
        const i = images.indexOf(open)
        if (i < images.length - 1) setOpen(images[i + 1])
      }
      if (e.key === 'ArrowLeft' && open) {
        const i = images.indexOf(open)
        if (i > 0) setOpen(images[i - 1])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, images])

  if (!images?.length) return null

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((url, i) => (
          <button
            key={i}
            onClick={() => setOpen(url)}
            className="group relative overflow-hidden rounded border border-[#333] hover:border-[#00ff41] transition-colors"
          >
            <img
              src={url}
              alt={`Screenshot ${i + 1}`}
              className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="text-white text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                Click to expand
              </span>
            </div>
          </button>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
          onClick={() => setOpen(null)}
        >
          <img
            src={open}
            alt="Screenshot"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setOpen(null)}
            className="absolute top-4 right-4 text-white/60 hover:text-white text-3xl leading-none"
          >
            ×
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs font-mono">
            {images.indexOf(open) + 1} / {images.length} — press Esc to close, ← → to navigate
          </div>
        </div>
      )}
    </>
  )
}
