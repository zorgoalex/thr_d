import type { Item } from '@/types/project'

import { collectDescendants } from './item-tree-utils'

let cloneCounter = 0

/**
 * Clone items (with descendants for assemblies).
 * Returns new items with unique IDs, remapped parentIds, and offset position.
 */
export function cloneItems(
  rootIds: string[],
  allItems: readonly Item[],
): Item[] {
  const idsToClone = collectDescendants(rootIds, allItems)
  const itemsToClone = allItems.filter((i) => idsToClone.includes(i.id))

  cloneCounter += 1
  const prefix = `clone-${Date.now()}-${cloneCounter}`
  const oldToNew = new Map<string, string>()

  // Generate new IDs
  for (const item of itemsToClone) {
    oldToNew.set(item.id, `${prefix}-${item.id}`)
  }

  const isRoot = new Set(rootIds)

  return itemsToClone.map((item) => {
    const newId = oldToNew.get(item.id)!
    const newParentId = item.parentId
      ? oldToNew.get(item.parentId) ?? item.parentId
      : null

    // Offset root clones by widthMm + 50 on X
    const xOffset = isRoot.has(item.id) ? item.dimensions.widthMm + 50 : 0

    return {
      ...item,
      id: newId,
      parentId: newParentId,
      transform: {
        ...item.transform,
        xMm: item.transform.xMm + xOffset,
      },
    }
  })
}
