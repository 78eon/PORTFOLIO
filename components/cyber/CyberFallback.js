import { NODE_POSITIONS, NODE_COLORS } from '@/lib/cyberDomains'
import CyberEdges from './CyberEdges'
export default function CyberFallback({ domain, selected }) {
  const points = NODE_POSITIONS.map(([x, y]) => [250 + x * 57, 195 - y * 49])
  return (
    <svg className="cyber-fallback" viewBox="0 0 500 400" aria-hidden="true">
      <ellipse cx="250" cy="195" rx="202" ry="152" className="cyber-orbit" />
      <ellipse cx="250" cy="195" rx="146" ry="180" className="cyber-orbit" />
      <CyberEdges edges={domain.edges} points={points} selected={selected} />
      {domain.nodes.map((node, i) => (
        <g key={node.id}>
          <circle
            cx={points[i][0]}
            cy={points[i][1]}
            r={i === selected ? 18 : 12}
            fill="var(--background)"
            stroke={NODE_COLORS[i]}
            strokeWidth={i === selected ? 2 : 1}
          />
          <circle
            cx={points[i][0]}
            cy={points[i][1]}
            r="4"
            fill={NODE_COLORS[i]}
          />
          <text
            x={points[i][0]}
            y={points[i][1] + 34}
            textAnchor="middle"
            fill={i === selected ? 'var(--foreground)' : 'var(--secondary)'}
          >
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
