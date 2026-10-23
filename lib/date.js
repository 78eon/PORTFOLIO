// PostgreSQL DATE is parsed in the server's local timezone. Preserve its calendar
// components instead of shifting the date through UTC during serialization.
export function dateOnly(value) {
  if (!value) return null
  if (typeof value === 'string') return value.slice(0, 10)
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}
