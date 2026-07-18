/**
 * Appends a pending free-text tech name to a chip list.
 * Used so Save/blur can commit typed input that was never confirmed with Enter.
 */
export function commitTechChip(current: string[], pending: string): string[] {
  const trimmed = pending.trim()
  if (!trimmed) return current

  const exists = current.some((item) => item.toLowerCase() === trimmed.toLowerCase())
  if (exists) return current

  return [...current, trimmed]
}
