import { describe, expect, it } from 'vitest'

import { computeAABBOverlap, computeLocalAABB, computeWorldAABB, isBelowFloor, isInsideRoom } from '../bounds'

const dims = { widthMm: 600, heightMm: 720, depthMm: 400, thicknessMm: 16 }
const room = { widthMm: 3000, lengthMm: 3000, heightMm: 2700, origin: { xMm: 0, yMm: 0, zMm: 0 } }

describe('computeLocalAABB', () => {
  it('returns box from origin to dimensions', () => {
    const aabb = computeLocalAABB(dims)
    expect(aabb).toEqual({ minX: 0, maxX: 600, minY: 0, maxY: 720, minZ: 0, maxZ: 400 })
  })
})

describe('computeWorldAABB', () => {
  it('at rotation 0 offsets by world position', () => {
    const aabb = computeWorldAABB(dims, { xMm: 100, yMm: 0, zMm: 200, rotationYDeg: 0 })
    expect(aabb.minX).toBe(100)
    expect(aabb.maxX).toBe(700)
    expect(aabb.maxZ).toBe(600)
  })

  it('at rotation 90 swaps width and depth', () => {
    const aabb = computeWorldAABB(dims, { xMm: 0, yMm: 0, zMm: 0, rotationYDeg: 90 })
    expect(aabb.maxX).toBe(400) // depth became width
    expect(aabb.maxZ).toBe(600) // width became depth
  })

  it('at rotation 180 has same size as 0', () => {
    const a0 = computeWorldAABB(dims, { xMm: 0, yMm: 0, zMm: 0, rotationYDeg: 0 })
    const a180 = computeWorldAABB(dims, { xMm: 0, yMm: 0, zMm: 0, rotationYDeg: 180 })
    expect(a180.maxX - a180.minX).toBe(a0.maxX - a0.minX)
    expect(a180.maxZ - a180.minZ).toBe(a0.maxZ - a0.minZ)
  })
})

describe('computeAABBOverlap', () => {
  it('non-overlapping returns 0', () => {
    const a = { minX: 0, maxX: 100, minY: 0, maxY: 100, minZ: 0, maxZ: 100 }
    const b = { minX: 200, maxX: 300, minY: 0, maxY: 100, minZ: 0, maxZ: 100 }
    expect(computeAABBOverlap(a, b)).toBe(0)
  })

  it('touching boxes return 0', () => {
    const a = { minX: 0, maxX: 100, minY: 0, maxY: 100, minZ: 0, maxZ: 100 }
    const b = { minX: 100, maxX: 200, minY: 0, maxY: 100, minZ: 0, maxZ: 100 }
    expect(computeAABBOverlap(a, b)).toBe(0)
  })

  it('slight overlap 0.3mm', () => {
    const a = { minX: 0, maxX: 100, minY: 0, maxY: 100, minZ: 0, maxZ: 100 }
    const b = { minX: 99.7, maxX: 200, minY: 0, maxY: 100, minZ: 0, maxZ: 100 }
    expect(computeAABBOverlap(a, b)).toBeCloseTo(0.3, 1)
  })

  it('clear intersection 5mm', () => {
    const a = { minX: 0, maxX: 100, minY: 0, maxY: 100, minZ: 0, maxZ: 100 }
    const b = { minX: 95, maxX: 200, minY: 0, maxY: 100, minZ: 0, maxZ: 100 }
    expect(computeAABBOverlap(a, b)).toBe(5)
  })
})

describe('isInsideRoom', () => {
  it('item fully inside', () => {
    const aabb = { minX: 100, maxX: 700, minY: 0, maxY: 720, minZ: 100, maxZ: 500 }
    expect(isInsideRoom(aabb, room)).toBe(true)
  })

  it('item extending outside', () => {
    const aabb = { minX: 2800, maxX: 3400, minY: 0, maxY: 720, minZ: 0, maxZ: 400 }
    expect(isInsideRoom(aabb, room)).toBe(false)
  })
})

describe('isBelowFloor', () => {
  it('at y=0 returns false', () => {
    expect(isBelowFloor({ minX: 0, maxX: 100, minY: 0, maxY: 100, minZ: 0, maxZ: 100 })).toBe(false)
  })

  it('at y=-1 returns true', () => {
    expect(isBelowFloor({ minX: 0, maxX: 100, minY: -1, maxY: 100, minZ: 0, maxZ: 100 })).toBe(true)
  })
})
