export default function CyberEdges({ edges, points, selected }) {
  return (
    <g>
      {edges.map(({ from, to, label }) => (
        <line
          key={`${from}-${to}`}
          x1={points[from][0]}
          y1={points[from][1]}
          x2={points[to][0]}
          y2={points[to][1]}
          className={from === selected || to === selected ? 'is-connected' : ''}
        >
          <title>{label}</title>
        </line>
      ))}
    </g>
  )
}
