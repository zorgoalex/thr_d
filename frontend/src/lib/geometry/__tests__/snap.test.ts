import { describe, expect, it } from 'vitest'

import type { Room } from '@/types/project'

import type { AABB } from '../types'
import { findSnapCandidates, resolveSnap } from '../snap'

const room: Room = { widthMm: 3000, lengthMm: 3000, heightMm: 2700, origin: { xMm: 0, yMm: 0, zMm: 0 } }
const emptyNeighbors = new Map<string, AABB>()

describe('findSnapCandidates', () => {
  it('item near left wall snaps (level 1)', () => {
    const aabb: AABB = { minX: 3, maxX: 603, minY: 0, maxY: 720, minZ: 100, maxZ: 500 }
    const candidates = findSnapCandidates(aabb, room, emptyNeighbors)
    const wallSnap = candidates.find((c) => c.label === 'wall-left')
    expect(wallSnap).toBeDefined()
    expect(wallSnap!.level).toBe(1)
    expect(wallSnap!.distanceMm).toBe(3)
  })

  it('item near floor snaps (level 1)', () => {
    const aabb: AABB = { minX: 100, maxX: 700, minY: 5, maxY: 725, minZ: 100, maxZ: 500 }
    const candidates = findSnapCandidates(aabb, room, emptyNeighbors)
    const floorSnap = candidates.find((c) => c.label === 'floor')
    expect(floorSnap).toBeDefined()
    expect(floorSnap!.distanceMm).toBe(5)
  })

  it('item near neighbor snaps (level 2)', () => {
    const aabb: AABB = { minX: 605, maxX: 1205, minY: 0, maxY: 720, minZ: 0, maxZ: 400 }
    const neighbors = new Map<string, AABB>([
      ['other', { minX: 0, maxX: 600, minY: 0, maxY: 720, minZ: 0, maxZ: 400 }],
    ])
    const candidates = findSnapCandidates(aabb, room, neighbors)
    const neighborSnap = candidates.find((c) => c.level === 2 && c.axis === 'x')
    expect(neighborSnap).toBeDefined()
    expect(neighborSnap!.distanceMm).toBe(5)
  })

  it('no snap when distance > 10mm', () => {
    const aabb: AABB = { minX: 50, maxX: 650, minY: 0, maxY: 720, minZ: 50, maxZ: 450 }
    const candidates = findSnapCandidates(aabb, room, emptyNeighbors)
    // 50mm from walls — too far for snap
    const wallLeft = candidates.find((c) => c.label === 'wall-left')
    expect(wallLeft).toBeUndefined()
  })
})

describe('resolveSnap', () => {
  it('applies snap offsets per axis', () => {
    const candidates = [
      { level: 1 as const, axis: 'x' as const, targetMm: -3, distanceMm: 3, label: 'wall-left' },
      { level: 1 as const, axis: 'y' as const, targetMm: -5, distanceMm: 5, label: 'floor' },
    ]
    const result = resolveSnap({ xMm: 103, yMm: 5, zMm: 200 }, candidates)
    expect(result.xMm).toBe(100)
    expect(result.yMm).toBe(0)
    expect(result.zMm).toBe(200)
    expect(result.appliedSnaps).toHaveLength(2)
  })

  it('level 1 wins over level 2 on same axis', () => {
    const candidates = [
      { level: 2 as const, axis: 'x' as const, targetMm: -2, distanceMm: 2, label: 'neighbor' },
      { level: 1 as const, axis: 'x' as const, targetMm: -5, distanceMm: 5, label: 'wall-left' },
    ]
    const result = resolveSnap({ xMm: 5, yMm: 0, zMm: 0 }, candidates)
    expect(result.appliedSnaps[0]!.label).toBe('wall-left')
  })
})
