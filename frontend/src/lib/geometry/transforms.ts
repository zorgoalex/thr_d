import type { Item } from '@/types/project'

import type { WorldTransform } from './types'

/**
 * Rotate a 2D point (x, z) by a discrete Y-axis rotation.
 * Convention: 90° rotates +X toward -Z (counter-clockwise from above).
 */
export function rotateXZ(
  x: number,
  z: number,
  rotationYDeg: 0 | 90 | 180 | 270,
): { x: number; z: number } {
  switch (rotationYDeg) {
    case 0:
      return { x, z }
    case 90:
      return { x: -z, z: x }
    case 180:
      return { x: -x, z: -z }
    case 270:
      return { x: z, z: -x }
  }
}

/**
 * Resolve the world transform for an item by walking its parent chain.
 *
 * Collects the chain from item to root, then processes root-to-leaf,
 * accumulating rotation and applying it to each child's local offset.
 *
 * @throws if item not found, parent not found, or circular chain detected
 */
export function resolveWorldTransform(
  itemId: string,
  items: readonly Item[],
): WorldTransform {
  const map = new Map<string, Item>()
  for (const item of items) {
    map.set(item.id, item)
  }

  // Build chain from item to root
  const chain: Item[] = []
  const visited = new Set<string>()
  let currentId: string | null = itemId

  while (currentId != null) {
    if (visited.has(currentId)) {
      throw new Error(`Circular parentId chain detected at item "${currentId}".`)
    }
    const item = map.get(currentId)
    if (!item) {
      throw new Error(`Item "${currentId}" not found.`)
    }
    visited.add(currentId)
    chain.push(item)
    currentId = item.parentId
  }

  // Process root-to-leaf (reverse the chain)
  chain.reverse()

  let worldX = 0
  let worldY = 0
  let worldZ = 0
  let cumulativeRotation: 0 | 90 | 180 | 270 = 0

  for (const item of chain) {
    const { x: rotX, z: rotZ } = rotateXZ(
      item.transform.xMm,
      item.transform.zMm,
      cumulativeRotation,
    )
    worldX += rotX
    worldY += item.transform.yMm
    worldZ += rotZ
    cumulativeRotation = ((cumulativeRotation + item.transform.rotationYDeg) % 360) as 0 | 90 | 180 | 270
  }

  return {
    xMm: worldX,
    yMm: worldY,
    zMm: worldZ,
    rotationYDeg: cumulativeRotation,
  }
}
