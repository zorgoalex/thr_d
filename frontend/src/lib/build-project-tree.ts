import type { Item } from '@/types/project'

export interface TreeNode {
  item: Item
  children: TreeNode[]
}

/**
 * Build a hierarchical tree from a flat items array using parentId.
 * Returns root nodes (parentId === null), sorted by sortIndex.
 */
export function buildProjectTree(items: readonly Item[]): TreeNode[] {
  const childrenMap = new Map<string | null, Item[]>()

  for (const item of items) {
    const key = item.parentId
    const list = childrenMap.get(key)
    if (list) {
      list.push(item)
    } else {
      childrenMap.set(key, [item])
    }
  }

  function buildNodes(parentId: string | null): TreeNode[] {
    const children = childrenMap.get(parentId) ?? []
    return children
      .slice()
      .sort((a, b) => a.sortIndex - b.sortIndex)
      .map((item) => ({
        item,
        children: buildNodes(item.id),
      }))
  }

  return buildNodes(null)
}
