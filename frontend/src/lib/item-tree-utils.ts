import type { Item } from '@/types/project'

/**
 * Collect all descendant IDs of given root IDs by traversing parentId chain.
 * Includes the root IDs themselves.
 */
export function collectDescendants(
  rootIds: string[],
  allItems: readonly Item[],
): string[] {
  const result = new Set(rootIds)
  let changed = true
  while (changed) {
    changed = false
    for (const item of allItems) {
      if (item.parentId && result.has(item.parentId) && !result.has(item.id)) {
        result.add(item.id)
        changed = true
      }
    }
  }
  return [...result]
}
