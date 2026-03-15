import type { Item, Room, ValidationIssue } from '@/types/project'

import { computeAABBOverlap, computeWorldAABB, isBelowFloor, isInsideRoom } from './bounds'
import { ALLOWED_ROTATIONS, EPSILON, PENETRATION_THRESHOLD, WORLD_RANGE_LIMIT } from './constants'
import { resolveWorldTransform } from './transforms'
import type { AABB } from './types'
import { ValidationCode } from './types'

let issueCounter = 0

function createIssue(
  code: string,
  severity: 'warning' | 'error',
  message: string,
  itemIds: string[],
  details?: Record<string, unknown>,
): ValidationIssue {
  issueCounter += 1
  return {
    id: `${code}-${issueCounter}`,
    severity,
    code,
    message,
    itemIds,
    details: details ?? null,
  }
}

export function validateRotation(item: Item): ValidationIssue[] {
  const r = item.transform.rotationYDeg as number
  if (!ALLOWED_ROTATIONS.includes(r as 0 | 90 | 180 | 270)) {
    return [
      createIssue(
        ValidationCode.INVALID_ROTATION,
        'error',
        `Item "${item.name}" has invalid rotation ${r}°. Allowed: 0, 90, 180, 270.`,
        [item.id],
        { rotationYDeg: r },
      ),
    ]
  }
  return []
}

export function validateDimensions(item: Item): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const d = item.dimensions

  if (d.widthMm <= EPSILON || d.heightMm <= EPSILON || d.depthMm <= EPSILON) {
    issues.push(
      createIssue(
        ValidationCode.INVALID_DIMENSIONS,
        'error',
        `Item "${item.name}" has zero or negative dimensions.`,
        [item.id],
        { widthMm: d.widthMm, heightMm: d.heightMm, depthMm: d.depthMm },
      ),
    )
  }

  if (d.thicknessMm <= EPSILON) {
    issues.push(
      createIssue(
        ValidationCode.INVALID_THICKNESS,
        'error',
        `Item "${item.name}" has zero or negative thickness.`,
        [item.id],
        { thicknessMm: d.thicknessMm },
      ),
    )
  }

  return issues
}

export function validateRoomBounds(
  item: Item,
  aabb: AABB,
  room: Room,
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  if (!isInsideRoom(aabb, room)) {
    issues.push(
      createIssue(
        ValidationCode.ROOM_BOUNDS_EXCEEDED,
        'error',
        `Item "${item.name}" extends outside room bounds.`,
        [item.id],
      ),
    )
  }

  if (isBelowFloor(aabb)) {
    issues.push(
      createIssue(
        ValidationCode.ITEM_BELOW_FLOOR,
        'error',
        `Item "${item.name}" extends below floor.`,
        [item.id],
      ),
    )
  }

  return issues
}

export function validateIntersections(
  items: readonly Item[],
  aabbs: ReadonlyMap<string, AABB>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const checked = new Set<string>()

  for (let i = 0; i < items.length; i++) {
    const a = items[i]!
    const aabbA = aabbs.get(a.id)
    if (!aabbA) continue

    for (let j = i + 1; j < items.length; j++) {
      const b = items[j]!

      // Skip parent-child pairs (assembly contacts)
      if (a.parentId === b.id || b.parentId === a.id) continue

      const aabbB = aabbs.get(b.id)
      if (!aabbB) continue

      const pairKey = `${a.id}:${b.id}`
      if (checked.has(pairKey)) continue
      checked.add(pairKey)

      const overlap = computeAABBOverlap(aabbA, aabbB)
      if (overlap > PENETRATION_THRESHOLD + EPSILON) {
        issues.push(
          createIssue(
            ValidationCode.ITEM_INTERSECTION,
            'error',
            `Items "${a.name}" and "${b.name}" intersect (${overlap.toFixed(1)}mm overlap).`,
            [a.id, b.id],
            { overlapMm: overlap },
          ),
        )
      }
    }
  }

  return issues
}

export function validateWorldRange(
  item: Item,
  aabb: AABB,
): ValidationIssue[] {
  const coords = [aabb.minX, aabb.maxX, aabb.minY, aabb.maxY, aabb.minZ, aabb.maxZ]
  if (coords.some((c) => Math.abs(c) > WORLD_RANGE_LIMIT)) {
    return [
      createIssue(
        ValidationCode.OUT_OF_ALLOWED_WORLD_RANGE,
        'error',
        `Item "${item.name}" has coordinates exceeding world range limit.`,
        [item.id],
      ),
    ]
  }
  return []
}

/**
 * Run all validations on the full project.
 * Pure function: resolves transforms, computes AABBs, runs all checks.
 */
export function validateProject(
  items: readonly Item[],
  room: Room,
): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const aabbs = new Map<string, AABB>()

  for (const item of items) {
    // Per-item structural validation
    issues.push(...validateRotation(item))
    issues.push(...validateDimensions(item))

    // Compute world AABB
    try {
      const wt = resolveWorldTransform(item.id, items)
      const aabb = computeWorldAABB(item.dimensions, wt)
      aabbs.set(item.id, aabb)

      issues.push(...validateRoomBounds(item, aabb, room))
      issues.push(...validateWorldRange(item, aabb))
    } catch {
      // If transform resolution fails (circular chain, missing parent),
      // skip spatial validation for this item
    }
  }

  // Pairwise intersection check
  issues.push(...validateIntersections(items, aabbs))

  return issues
}
