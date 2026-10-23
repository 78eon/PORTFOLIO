import {
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Points,
  PointsMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from 'three'
import { NODE_POSITIONS, NODE_COLORS } from '@/lib/cyberDomains'

export function disposeGraph(object) {
  const geometries = new Set(),
    materials = new Set(),
    textures = new Set()
  object.traverse((child) => {
    if (child.geometry) geometries.add(child.geometry)
    if (child.material)
      (Array.isArray(child.material)
        ? child.material
        : [child.material]
      ).forEach((m) => {
        materials.add(m)
        Object.values(m).forEach((value) => {
          if (value?.isTexture) textures.add(value)
        })
      })
  })
  textures.forEach((t) => t.dispose())
  materials.forEach((m) => m.dispose())
  geometries.forEach((g) => g.dispose())
  object.clear()
}

export function createGraph(domain, compact) {
  const group = new Group(),
    nodes = [],
    rings = [],
    links = [],
    pulses = []
  const positions = NODE_POSITIONS.map((p) => new Vector3(...p))
  const sphere = new SphereGeometry(0.15, compact ? 12 : 20, compact ? 8 : 14)
  const ring = new TorusGeometry(0.28, 0.009, 4, compact ? 24 : 44)
  const pulse = new SphereGeometry(0.028, 6, 4)
  positions.forEach((p, i) => {
    const color = NODE_COLORS[i]
    const core = new Mesh(
      sphere,
      new MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.3,
        roughness: 0.4,
        metalness: 0.15,
      })
    )
    core.position.copy(p)
    core.userData.nodeIndex = i
    group.add(core)
    nodes.push(core)
    const orbit = new Mesh(
      ring,
      new MeshBasicMaterial({ color, transparent: true, opacity: 0.45 })
    )
    orbit.position.copy(p)
    group.add(orbit)
    rings.push(orbit)
  })
  domain.edges.forEach((edge, i) => {
    const line = new Line(
      new BufferGeometry().setFromPoints([
        positions[edge.from],
        positions[edge.to],
      ]),
      new LineBasicMaterial({
        color: '#567f83',
        transparent: true,
        opacity: 0.45,
      })
    )
    line.userData.edge = edge
    group.add(line)
    links.push(line)
    if (!compact || i % 2 === 0) {
      const dot = new Mesh(pulse, new MeshBasicMaterial({ color: '#c8f9df' }))
      dot.position.copy(positions[edge.from])
      group.add(dot)
      pulses.push({
        dot,
        from: positions[edge.from],
        to: positions[edge.to],
        offset: i / domain.edges.length,
      })
    }
  })
  return { group, nodes, rings, links, pulses, positions }
}

export function createBackdrop(compact) {
  const group = new Group(),
    positions = []
  let seed = 78
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
  for (let i = 0; i < (compact ? 30 : 65); i++)
    positions.push(
      (random() - 0.5) * 16,
      (random() - 0.5) * 12,
      -3 - random() * 3
    )
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  group.add(
    new Points(
      geometry,
      new PointsMaterial({
        color: '#79d9e8',
        size: 0.018,
        transparent: true,
        opacity: 0.35,
      })
    )
  )
  for (const radius of [3.65, 4.25]) {
    const points = Array.from(
      { length: 81 },
      (_, i) =>
        new Vector3(
          Math.cos((i / 80) * Math.PI * 2) * radius,
          Math.sin((i / 80) * Math.PI * 2) * radius * 0.72,
          -1.5
        )
    )
    group.add(
      new Line(
        new BufferGeometry().setFromPoints(points),
        new LineBasicMaterial({
          color: '#a4f4c4',
          transparent: true,
          opacity: 0.09,
        })
      )
    )
  }
  return group
}
