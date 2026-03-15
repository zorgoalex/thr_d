import type { Room } from '@/types/project'

import { SNAP_DISTANCE_THRESHOLD } from './constants'
import type { AABB, SnapCandidate, SnapResult } from './types'

function candidate(
  level: 1 | 2 | 3,
  axis: 'x' | 'y' | 'z',
  targetMm: number,
  distanceMm: number,
  label: string,
): SnapCandidate | null {
  if (distanceMm > SNAP_DISTANCE_THRESHOLD) return null
  return { level, axis, targetMm, distanceMm, label }
}

/**
 * Find snap candidates for an item being placed/moved.
 * Level 1: walls/floor. Level 2: neighbor faces. Level 3: grid.
 */
export function findSnapCandidates(
  movingAABB: AABB,
  room: Room,
  neighborAABBs: ReadonlyMap<string, AABB>,
  gridSpacingMm = 0,
): SnapCandidate[] {
  const result: SnapCandidate[] = []
  const ox = room.origin.xMm
  const oz = room.origin.zMm

  // Level 1: walls and floor
  const wallCandidates: Array<SnapCandidate | null> = [
    candidate(1, 'x', ox - movingAABB.minX, Math.abs(movingAABB.minX - ox), 'wall-left'),
    candidate(1, 'x', ox + room.widthMm - movingAABB.maxX, Math.abs(movingAABB.maxX - (ox + room.widthMm)), 'wall-right'),
    candidate(1, 'z', oz - movingAABB.minZ, Math.abs(movingAABB.minZ - oz), 'wall-front'),
    candidate(1, 'z', oz + room.lengthMm - movingAABB.maxZ, Math.abs(movingAABB.maxZ - (oz + room.lengthMm)), 'wall-back'),
    candidate(1, 'y', -movingAABB.minY, Math.abs(movingAABB.minY), 'floor'),
  ]
  for (const c of wallCandidates) {
    if (c) result.push(c)
  }

  // Level 2: neighbor faces
  for (const [, nb] of neighborAABBs) {
    const neighborCandidates: Array<SnapCandidate | null> = [
      // Moving item's left face → neighbor's right face
      candidate(2, 'x', nb.maxX - movingAABB.minX, Math.abs(movingAABB.minX - nb.maxX), 'neighbor-right'),
      // Moving item's right face → neighbor's left face
      candidate(2, 'x', nb.minX - movingAABB.maxX, Math.abs(movingAABB.maxX - nb.minX), 'neighbor-left'),
      // Y axis
      candidate(2, 'y', nb.maxY - movingAABB.minY, Math.abs(movingAABB.minY - nb.maxY), 'neighbor-top'),
      candidate(2, 'y', nb.minY - movingAABB.maxY, Math.abs(movingAABB.maxY - nb.minY), 'neighbor-bottom'),
      // Z axis
      candidate(2, 'z', nb.maxZ - movingAABB.minZ, Math.abs(movingAABB.minZ - nb.maxZ), 'neighbor-back'),
      candidate(2, 'z', nb.minZ - movingAABB.maxZ, Math.abs(movingAABB.maxZ - nb.minZ), 'neighbor-front'),
    ]
    for (const c of neighborCandidates) {
      if (c) result.push(c)
    }
  }

  // Level 3: grid
  if (gridSpacingMm > 0) {
    for (const axis of ['x', 'y', 'z'] as const) {
      const minKey = axis === 'x' ? 'minX' : axis === 'y' ? 'minY' : 'minZ'
      const val = movingAABB[minKey]
      const nearest = Math.round(val / gridSpacingMm) * gridSpacingMm
      const dist = Math.abs(val - nearest)
      const c = candidate(3, axis, nearest - val, dist, `grid-${axis}`)
      if (c) result.push(c)
    }
  }

  return result
}

/**
 * Resolve final snapped position by picking best candidate per axis
 * (lowest level, then shortest distance).
 */
export function resolveSnap(
  originalPosition: { xMm: number; yMm: number; zMm: number },
  candidates: SnapCandidate[],
): SnapResult {
  const bestPerAxis = new Map<'x' | 'y' | 'z', SnapCandidate>()

  for (const c of candidates) {
    const existing = bestPerAxis.get(c.axis)
    if (
      !existing ||
      c.level < existing.level ||
      (c.level === existing.level && c.distanceMm < existing.distanceMm)
    ) {
      bestPerAxis.set(c.axis, c)
    }
  }

  let xMm = originalPosition.xMm
  let yMm = originalPosition.yMm
  let zMm = originalPosition.zMm
  const appliedSnaps: SnapCandidate[] = []

  const snapX = bestPerAxis.get('x')
  if (snapX) {
    xMm += snapX.targetMm
    appliedSnaps.push(snapX)
  }
  const snapY = bestPerAxis.get('y')
  if (snapY) {
    yMm += snapY.targetMm
    appliedSnaps.push(snapY)
  }
  const snapZ = bestPerAxis.get('z')
  if (snapZ) {
    zMm += snapZ.targetMm
    appliedSnaps.push(snapZ)
  }

  return { xMm, yMm, zMm, appliedSnaps }
}
