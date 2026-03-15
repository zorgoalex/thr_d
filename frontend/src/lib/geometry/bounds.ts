import type { Dimensions, Room } from '@/types/project'

import { EPSILON } from './constants'
import type { AABB, WorldTransform } from './types'

/** Compute local AABB at origin (no transform applied). */
export function computeLocalAABB(dimensions: Dimensions): AABB {
  return {
    minX: 0,
    maxX: dimensions.widthMm,
    minY: 0,
    maxY: dimensions.heightMm,
    minZ: 0,
    maxZ: dimensions.depthMm,
  }
}

/**
 * Compute world AABB. For 90°/270° rotation, width and depth swap.
 * The AABB extends from world position by effective dimensions.
 */
export function computeWorldAABB(
  dimensions: Dimensions,
  wt: WorldTransform,
): AABB {
  const isSwapped = wt.rotationYDeg === 90 || wt.rotationYDeg === 270
  const effectiveW = isSwapped ? dimensions.depthMm : dimensions.widthMm
  const effectiveD = isSwapped ? dimensions.widthMm : dimensions.depthMm

  return {
    minX: wt.xMm,
    maxX: wt.xMm + effectiveW,
    minY: wt.yMm,
    maxY: wt.yMm + dimensions.heightMm,
    minZ: wt.zMm,
    maxZ: wt.zMm + effectiveD,
  }
}

/**
 * Compute penetration depth between two AABBs.
 * Returns the minimum overlap across all axes.
 * Negative or zero = no intersection.
 */
export function computeAABBOverlap(a: AABB, b: AABB): number {
  const overlapX = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX)
  const overlapY = Math.min(a.maxY, b.maxY) - Math.max(a.minY, b.minY)
  const overlapZ = Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ)
  if (overlapX <= 0 || overlapY <= 0 || overlapZ <= 0) return 0
  return Math.min(overlapX, overlapY, overlapZ)
}

/** Check if AABB is fully inside room bounds. */
export function isInsideRoom(aabb: AABB, room: Room): boolean {
  const ox = room.origin.xMm
  const oy = room.origin.yMm
  const oz = room.origin.zMm
  return (
    aabb.minX >= ox - EPSILON &&
    aabb.maxX <= ox + room.widthMm + EPSILON &&
    aabb.minY >= oy - EPSILON &&
    aabb.maxY <= oy + room.heightMm + EPSILON &&
    aabb.minZ >= oz - EPSILON &&
    aabb.maxZ <= oz + room.lengthMm + EPSILON
  )
}

/** Check if AABB extends below floor. */
export function isBelowFloor(aabb: AABB): boolean {
  return aabb.minY < -EPSILON
}
