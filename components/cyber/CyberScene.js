import { useEffect, useRef } from 'react'
import {
  AmbientLight,
  MathUtils,
  PerspectiveCamera,
  PointLight,
  Raycaster,
  Scene,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { createBackdrop, createGraph, disposeGraph } from './sceneObjects'

// This browser-only component owns all GPU resources. React owns the controls
// and educational content; no database or API code enters the rendering layer.
export default function CyberScene({
  domain,
  selected,
  active,
  animate,
  command,
  onSelect,
  onReady,
  onFailure,
}) {
  const host = useRef(null),
    canvasSlot = useRef(null),
    runtime = useRef(null)
  const selectRef = useRef(onSelect)
  useEffect(() => {
    selectRef.current = onSelect
  }, [onSelect])

  useEffect(() => {
    const element = host.current
    // Each effect owns a fresh canvas, including React Strict Mode replays.
    // A released WebGL context must never be reused by the next renderer.
    const surface = document.createElement('canvas')
    surface.setAttribute('aria-hidden', 'true')
    surface.tabIndex = -1
    canvasSlot.current.appendChild(surface)
    let renderer,
      context,
      controls,
      observer,
      graph,
      backdrop,
      frame = 0
    let mounted = true,
      alive = true,
      visible = !document.hidden,
      inView = false,
      ambient = true
    let last = 0,
      lastInteraction = 0,
      dragging = false,
      width = 1,
      height = 1
    let updating = false
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const compact = window.matchMedia(
      '(max-width: 640px), (pointer: coarse)'
    ).matches
    const scene = new Scene(),
      camera = new PerspectiveCamera(38, 1, 0.1, 60)
    const raycaster = new Raycaster(),
      pointer = new Vector2(),
      projected = new Vector3()
    camera.position.set(0, 0.3, 11.8)
    const labels = () => element.querySelectorAll('[data-scene-label]')
    const running = () => alive && visible && inView
    const animated = () => ambient && !reduced.matches

    function select(index) {
      if (!graph) return
      graph.nodes.forEach((mesh, i) => {
        mesh.scale.setScalar(i === index ? 1.55 : 1)
        mesh.material.emissiveIntensity = i === index ? 0.65 : 0.22
        graph.rings[i].scale.setScalar(i === index ? 1.25 : 1)
        graph.rings[i].material.opacity = i === index ? 0.9 : 0.35
      })
      graph.links.forEach((line) => {
        const e = line.userData.edge
        line.material.opacity = e.from === index || e.to === index ? 0.85 : 0.3
      })
    }
    function render() {
      if (!running() || !renderer || !graph) return
      try {
        renderer.render(scene, camera)
      } catch {
        visible = false
        cancelAnimationFrame(frame)
        frame = 0
        onFailure(
          'The 3D view stopped rendering. The concept map remains available.'
        )
        return
      }
      labels().forEach((label, i) => {
        projected
          .copy(graph.positions[i])
          .applyMatrix4(graph.group.matrixWorld)
          .project(camera)
        label.style.transform = `translate(-50%, -50%) translate3d(${(projected.x * 0.5 + 0.5) * width}px,${(-projected.y * 0.5 + 0.5) * height + 30}px,0)`
        label.style.opacity =
          projected.z < 1 &&
          Math.abs(projected.x) < 0.95 &&
          Math.abs(projected.y) < 0.9
            ? '1'
            : '0'
      })
    }
    function tick(now) {
      frame = 0
      if (!running()) return
      if (now - last >= (compact ? 48 : 32)) {
        const delta = Math.min((now - last) / 1000, 0.06)
        last = now
        controls.autoRotate = animated() && !dragging
        controls.enableDamping = !reduced.matches
        updating = true
        controls.update(delta)
        updating = false
        if (animated() && graph)
          graph.pulses.forEach(({ dot, from, to, offset }) =>
            dot.position.lerpVectors(from, to, (now * 0.00007 + offset) % 1)
          )
        render()
      }
      if (
        !frame &&
        (animated() ||
          dragging ||
          (!reduced.matches && now - lastInteraction < 650))
      )
        frame = requestAnimationFrame(tick)
    }
    function invalidate() {
      if (!running() || !renderer) return
      render()
      if (
        !frame &&
        (animated() ||
          dragging ||
          (!reduced.matches && performance.now() - lastInteraction < 650))
      )
        frame = requestAnimationFrame(tick)
    }
    function sync() {
      cancelAnimationFrame(frame)
      frame = 0
      if (controls) {
        controls.enableDamping = !reduced.matches
        controls.autoRotate = animated()
      }
      last = performance.now()
      invalidate()
    }
    function resize() {
      if (!alive || !renderer) return
      const box = element.getBoundingClientRect()
      width = Math.max(1, box.width)
      height = Math.max(1, box.height)
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, compact ? 1.25 : 1.5)
      )
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      invalidate()
    }
    function changed() {
      if (!updating && !frame) invalidate()
    }
    function start() {
      dragging = true
      lastInteraction = performance.now()
      invalidate()
    }
    function end() {
      dragging = false
      lastInteraction = performance.now()
      invalidate()
    }
    let down = null
    function pointerDown(event) {
      down = { x: event.clientX, y: event.clientY }
    }
    function pointerUp(event) {
      if (
        !down ||
        Math.hypot(event.clientX - down.x, event.clientY - down.y) > 6
      ) {
        down = null
        return
      }
      down = null
      const box = surface.getBoundingClientRect()
      pointer.set(
        ((event.clientX - box.left) / box.width) * 2 - 1,
        (-(event.clientY - box.top) / box.height) * 2 + 1
      )
      raycaster.setFromCamera(pointer, camera)
      const hit = graph && raycaster.intersectObjects(graph.nodes, false)[0]
      if (hit) selectRef.current(hit.object.userData.nodeIndex)
    }
    function lost(event) {
      event.preventDefault()
      visible = false
      cancelAnimationFrame(frame)
      frame = 0
      if (alive)
        onFailure('The 3D context was lost. The concept map remains available.')
    }
    function visibility() {
      visible = !document.hidden
      sync()
    }
    function cameraCommand(type) {
      const offset = camera.position.clone().sub(controls.target)
      if (type === 'left' || type === 'right')
        offset.applyAxisAngle(
          new Vector3(0, 1, 0),
          type === 'left' ? 0.18 : -0.18
        )
      if (type === 'up' || type === 'down') {
        const right = new Vector3()
          .crossVectors(offset, new Vector3(0, 1, 0))
          .normalize()
        const proposed = offset
          .clone()
          .applyAxisAngle(right, type === 'up' ? 0.12 : -0.12)
        const polar = proposed.angleTo(new Vector3(0, 1, 0))
        if (polar > 0.45 && polar < Math.PI - 0.45) offset.copy(proposed)
      }
      if (type === 'in' || type === 'out')
        offset.setLength(
          MathUtils.clamp(
            offset.length() * (type === 'in' ? 0.88 : 1.12),
            7,
            17
          )
        )
      if (type === 'reset') {
        camera.position.set(0, 0.3, 11.8)
        controls.target.set(0, 0, 0)
      } else camera.position.copy(controls.target).add(offset)
      lastInteraction = performance.now()
      controls.update()
      invalidate()
    }
    function destroy() {
      if (!alive) return
      alive = false
      cancelAnimationFrame(frame)
      frame = 0
      observer?.disconnect()
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', visibility)
      reduced.removeEventListener('change', sync)
      surface.removeEventListener('pointerdown', pointerDown)
      surface.removeEventListener('pointerup', pointerUp)
      surface.removeEventListener('webglcontextlost', lost)
      if (controls) {
        controls.removeEventListener('change', changed)
        controls.removeEventListener('start', start)
        controls.removeEventListener('end', end)
        controls.dispose()
      }
      disposeGraph(scene)
      renderer?.renderLists.dispose()
      renderer?.dispose()
      renderer?.forceContextLoss()
      if (!renderer) context?.getExtension('WEBGL_lose_context')?.loseContext()
      surface.remove()
      runtime.current = null
    }
    try {
      // Three.js uses WebGL2. Acquire the actual rendering context once; a null
      // context is capability failure, handled without losing HTML interaction.
      context = surface.getContext('webgl2', {
        alpha: true,
        antialias: !compact,
        powerPreference: 'low-power',
        failIfMajorPerformanceCaveat: true,
      })
      if (!context) throw new Error('WebGL2 unavailable')
      renderer = new WebGLRenderer({
        canvas: surface,
        context,
        alpha: true,
        antialias: !compact,
      })
      renderer.outputColorSpace = SRGBColorSpace
      controls = new OrbitControls(camera, surface)
      controls.enablePan = false
      controls.minDistance = 7
      controls.maxDistance = 17
      controls.minPolarAngle = 0.45
      controls.maxPolarAngle = Math.PI - 0.45
      controls.autoRotateSpeed = 0.23
      controls.dampingFactor = 0.07
      controls.enableDamping = !reduced.matches
      controls.addEventListener('change', changed)
      controls.addEventListener('start', start)
      controls.addEventListener('end', end)
      scene.add(new AmbientLight('#e6f7f0', 1.3))
      const light = new PointLight('#a4f4c4', 35, 30)
      light.position.set(1, 4, 7)
      scene.add(light)
      backdrop = createBackdrop(compact)
      scene.add(backdrop)
      runtime.current = {
        update(nextDomain, index, nextActive, nextAnimate) {
          inView = nextActive
          ambient = nextAnimate
          if (!graph || graph.domainId !== nextDomain.id) {
            if (graph) {
              scene.remove(graph.group)
              disposeGraph(graph.group)
            }
            graph = createGraph(nextDomain, compact)
            graph.domainId = nextDomain.id
            scene.add(graph.group)
          }
          select(index)
          sync()
        },
        command: cameraCommand,
      }
      observer =
        typeof ResizeObserver !== 'undefined'
          ? new ResizeObserver(resize)
          : null
      observer?.observe(element)
      if (!observer) window.addEventListener('resize', resize)
      document.addEventListener('visibilitychange', visibility)
      reduced.addEventListener('change', sync)
      surface.addEventListener('pointerdown', pointerDown)
      surface.addEventListener('pointerup', pointerUp)
      surface.addEventListener('webglcontextlost', lost)
      resize()
      queueMicrotask(() => {
        if (alive) onReady()
      })
    } catch {
      destroy()
      queueMicrotask(() => {
        if (mounted)
          onFailure(
            '3D is unavailable in this browser. The concept map remains fully interactive.'
          )
      })
    }
    return () => {
      mounted = false
      destroy()
    }
  }, [onReady, onFailure])

  useEffect(() => {
    runtime.current?.update(domain, selected, active, animate)
  }, [domain, selected, active, animate])
  useEffect(() => {
    if (command) runtime.current?.command(command.type)
  }, [command])
  return (
    <div ref={host} className="cyber-scene">
      <div ref={canvasSlot} className="cyber-canvas-slot" aria-hidden="true" />
      <div className="cyber-scene-labels" aria-hidden="true">
        {domain.nodes.map((node, i) => (
          <span
            data-scene-label
            key={node.id}
            className={selected === i ? 'is-selected' : ''}
          >
            {node.label}
          </span>
        ))}
      </div>
    </div>
  )
}
