import { NODE_COLORS } from '@/lib/cyberDomains'
export default function CyberNode({ node, index, selected, onSelect }) {
  return (
    <button
      type="button"
      className="cyber-node-button"
      aria-pressed={selected}
      onClick={() => onSelect(index)}
    >
      <span
        className="cyber-node-dot"
        style={{ backgroundColor: NODE_COLORS[index] }}
        aria-hidden="true"
      />
      {node.label}
      <span className="sr-only"> — {node.kind}</span>
    </button>
  )
}
