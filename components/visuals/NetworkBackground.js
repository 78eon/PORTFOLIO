import { useEffect, useRef } from 'react'

// An abstract illustration of connected ideas, never operational telemetry.
export default function NetworkBackground() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fine = window.matchMedia('(pointer: fine)')
    let width = 0,
      height = 0,
      frame = 0,
      last = 0,
      time = 0,
      visible = true
    let nodes = []
    const pointer = { x: -1000, y: -1000 }
    function draw() {
      ctx.clearRect(0, 0, width, height)
      const positions = nodes.map((n, i) => ({
        x: n.x + Math.sin(time * 0.12 + i) * 13,
        y: n.y + Math.cos(time * 0.1 + i * 2) * 13,
      }))
      positions.forEach((p, i) => {
        for (let j = i + 1; j < positions.length; j++) {
          const q = positions[j],
            distance = Math.hypot(p.x - q.x, p.y - q.y)
          if (distance > 145) continue
          ctx.strokeStyle = `rgba(164,244,196,${(1 - distance / 145) * 0.24})`
          ctx.lineWidth = 0.7
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(q.x, q.y)
          ctx.stroke()
        }
        const near =
          fine.matches && Math.hypot(p.x - pointer.x, p.y - pointer.y) < 95
        ctx.fillStyle = i % 5 === 0 ? '#79d9e8' : '#a4f4c4'
        ctx.globalAlpha = near
          ? 0.9
          : 0.25 + (Math.sin(time * 0.6 + i) + 1) * 0.15
        ctx.beginPath()
        ctx.arc(p.x, p.y, near ? 2.6 : 1.8, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      })
    }
    function tick(now) {
      if (now - last >= 32) {
        time += Math.min((now - last) / 1000, 0.05)
        last = now
        draw()
      }
      frame = requestAnimationFrame(tick)
    }
    function sync() {
      cancelAnimationFrame(frame)
      draw()
      if (!motion.matches && !document.hidden && visible) {
        last = performance.now()
        frame = requestAnimationFrame(tick)
      }
    }
    function resize() {
      const box = canvas.getBoundingClientRect()
      width = box.width
      height = box.height
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = width < 600 ? 16 : 44
      let seed = 78
      const random = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0
        return seed / 4294967296
      }
      nodes = Array.from({ length: count }, () => ({
        x: random() * width,
        y: random() * height,
      }))
      sync()
    }
    function move(event) {
      const r = canvas.getBoundingClientRect()
      pointer.x = event.clientX - r.left
      pointer.y = event.clientY - r.top
    }
    function leave() {
      pointer.x = -1000
      pointer.y = -1000
    }
    const parent = canvas.closest('.hero') || canvas.parentElement
    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null
    const intersection =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver((entries) => {
            visible = entries[0].isIntersecting
            sync()
          })
        : null
    observer?.observe(canvas)
    intersection?.observe(canvas)
    if (!observer) window.addEventListener('resize', resize)
    parent.addEventListener('pointermove', move, { passive: true })
    parent.addEventListener('pointerleave', leave)
    document.addEventListener('visibilitychange', sync)
    motion.addEventListener('change', sync)
    resize()
    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
      intersection?.disconnect()
      window.removeEventListener('resize', resize)
      parent.removeEventListener('pointermove', move)
      parent.removeEventListener('pointerleave', leave)
      document.removeEventListener('visibilitychange', sync)
      motion.removeEventListener('change', sync)
    }
  }, [])
  return <canvas ref={ref} className="network-canvas" aria-hidden="true" />
}
