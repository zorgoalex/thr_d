import type { Item } from '@/types/project'

import { collectDescendants } from './item-tree-utils'

/**
 * Compute batch updates to cascade material change on an assembly.
 * Applies to assembly itself and all non-locked descendants.
 */
export function applyMaterialCascade(
  assemblyId: string,
  newMaterialId: string,
  items: readonly Item[],
): Array<{ id: string; partial: Partial<Item> }> {
  const descendantIds = collectDescendants([assemblyId], items)
  return descendantIds
    .map((id) => items.find((i) => i.id === id)!)
    .filter((item) => item.id === assemblyId || !item.locked)
    .map((item) => ({ id: item.id, partial: { materialId: newMaterialId } }))
}
