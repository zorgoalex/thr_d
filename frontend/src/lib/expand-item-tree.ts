import type { Item, ItemType } from '@/types/project'

let expandCounter = 0

interface TreeNode {
  id: string
  type: string
  subtype: string
  name: string
  dimensions: { widthMm: number; heightMm: number; depthMm: number; thicknessMm: number }
  transform: { xMm: number; yMm: number; zMm: number; rotationYDeg: number }
  materialId?: string | null
  children?: TreeNode[]
}

/**
 * Expand a rootItemTreeDto into a flat Item[] array with unique IDs.
 * Root item gets positionOverride applied to its transform.
 */
export function expandItemTree(
  rootDto: Record<string, unknown>,
  sourceTemplateId: string,
  positionOverride?: { xMm: number; yMm: number; zMm: number },
): Item[] {
  expandCounter += 1
  const prefix = `ins-${Date.now()}-${expandCounter}`
  const root = rootDto as unknown as TreeNode
  const items: Item[] = []

  function walk(node: TreeNode, parentNewId: string | null, sortIndex: number, isRoot: boolean) {
    const newId = `${prefix}-${node.id}`

    const transform = isRoot && positionOverride
      ? {
          xMm: positionOverride.xMm,
          yMm: positionOverride.yMm,
          zMm: positionOverride.zMm,
          rotationYDeg: (node.transform.rotationYDeg ?? 0) as 0 | 90 | 180 | 270,
        }
      : {
          xMm: node.transform.xMm,
          yMm: node.transform.yMm,
          zMm: node.transform.zMm,
          rotationYDeg: (node.transform.rotationYDeg ?? 0) as 0 | 90 | 180 | 270,
        }

    items.push({
      id: newId,
      type: node.type as ItemType,
      subtype: node.subtype,
      name: node.name,
      parentId: parentNewId,
      sortIndex,
      dimensions: { ...node.dimensions },
      transform,
      materialId: node.materialId ?? null,
      grainDirection: null,
      visibility: true,
      locked: false,
      constraints: null,
      sourceTemplateId,
    })

    if (node.children) {
      node.children.forEach((child, idx) => walk(child, newId, idx, false))
    }
  }

  walk(root, null, 0, true)
  return items
}
