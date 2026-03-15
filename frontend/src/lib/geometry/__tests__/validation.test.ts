import { describe, expect, it } from 'vitest'

import type { Item, Room } from '@/types/project'

import type { AABB } from '../types'
import { validateDimensions, validateIntersections, validateProject, validateRoomBounds, validateRotation, validateWorldRange } from '../validation'

const room: Room = { widthMm: 3000, lengthMm: 3000, heightMm: 2700, origin: { xMm: 0, yMm: 0, zMm: 0 } }

function makeItem(overrides: Partial<Item> & { id: string }): Item {
  return {
    type: 'panel',
    subtype: 'test',
    name: overrides.id,
    parentId: null,
    sortIndex: 0,
    dimensions: { widthMm: 600, heightMm: 720, depthMm: 400, thicknessMm: 16 },
    transform: { xMm: 0, yMm: 0, zMm: 0, rotationYDeg: 0 },
    materialId: null,
    grainDirection: null,
    visibility: true,
    locked: false,
    constraints: null,
    sourceTemplateId: null,
    ...overrides,
  }
}

describe('validateRotation', () => {
  it('valid rotation produces no issues', () => {
    expect(validateRotation(makeItem({ id: 'a' }))).toHaveLength(0)
  })

  it('invalid rotation produces INVALID_ROTATION', () => {
    const item = makeItem({ id: 'a', transform: { xMm: 0, yMm: 0, zMm: 0, rotationYDeg: 45 as never } })
    const issues = validateRotation(item)
    expect(issues).toHaveLength(1)
    expect(issues[0]!.code).toBe('INVALID_ROTATION')
  })
})

describe('validateDimensions', () => {
  it('valid dimensions produce no issues', () => {
    expect(validateDimensions(makeItem({ id: 'a' }))).toHaveLength(0)
  })

  it('zero width produces INVALID_DIMENSIONS', () => {
    const item = makeItem({ id: 'a', dimensions: { widthMm: 0, heightMm: 100, depthMm: 100, thicknessMm: 16 } })
    const issues = validateDimensions(item)
    expect(issues.some((i) => i.code === 'INVALID_DIMENSIONS')).toBe(true)
  })

  it('zero thickness produces INVALID_THICKNESS', () => {
    const item = makeItem({ id: 'a', dimensions: { widthMm: 100, heightMm: 100, depthMm: 100, thicknessMm: 0 } })
    const issues = validateDimensions(item)
    expect(issues.some((i) => i.code === 'INVALID_THICKNESS')).toBe(true)
  })
})

describe('validateRoomBounds', () => {
  it('inside room produces no issues', () => {
    const aabb: AABB = { minX: 0, maxX: 600, minY: 0, maxY: 720, minZ: 0, maxZ: 400 }
    expect(validateRoomBounds(makeItem({ id: 'a' }), aabb, room)).toHaveLength(0)
  })

  it('outside room produces ROOM_BOUNDS_EXCEEDED', () => {
    const aabb: AABB = { minX: 2800, maxX: 3400, minY: 0, maxY: 720, minZ: 0, maxZ: 400 }
    const issues = validateRoomBounds(makeItem({ id: 'a' }), aabb, room)
    expect(issues.some((i) => i.code === 'ROOM_BOUNDS_EXCEEDED')).toBe(true)
  })

  it('below floor produces ITEM_BELOW_FLOOR', () => {
    const aabb: AABB = { minX: 0, maxX: 600, minY: -10, maxY: 710, minZ: 0, maxZ: 400 }
    const issues = validateRoomBounds(makeItem({ id: 'a' }), aabb, room)
    expect(issues.some((i) => i.code === 'ITEM_BELOW_FLOOR')).toBe(true)
  })
})

describe('validateIntersections', () => {
  it('no overlap produces no issues', () => {
    const items = [makeItem({ id: 'a' }), makeItem({ id: 'b' })]
    const aabbs = new Map<string, AABB>([
      ['a', { minX: 0, maxX: 100, minY: 0, maxY: 100, minZ: 0, maxZ: 100 }],
      ['b', { minX: 200, maxX: 300, minY: 0, maxY: 100, minZ: 0, maxZ: 100 }],
    ])
    expect(validateIntersections(items, aabbs)).toHaveLength(0)
  })

  it('overlap > 0.5mm produces ITEM_INTERSECTION', () => {
    const items = [makeItem({ id: 'a' }), makeItem({ id: 'b' })]
    const aabbs = new Map<string, AABB>([
      ['a', { minX: 0, maxX: 100, minY: 0, maxY: 100, minZ: 0, maxZ: 100 }],
      ['b', { minX: 95, maxX: 200, minY: 0, maxY: 100, minZ: 0, maxZ: 100 }],
    ])
    const issues = validateIntersections(items, aabbs)
    expect(issues.some((i) => i.code === 'ITEM_INTERSECTION')).toBe(true)
  })

  it('overlap <= 0.5mm is OK (assembly contact)', () => {
    const items = [makeItem({ id: 'a' }), makeItem({ id: 'b' })]
    const aabbs = new Map<string, AABB>([
      ['a', { minX: 0, maxX: 100, minY: 0, maxY: 100, minZ: 0, maxZ: 100 }],
      ['b', { minX: 99.7, maxX: 200, minY: 0, maxY: 100, minZ: 0, maxZ: 100 }],
    ])
    expect(validateIntersections(items, aabbs)).toHaveLength(0)
  })
})

describe('validateWorldRange', () => {
  it('normal coords produce no issues', () => {
    const aabb: AABB = { minX: 0, maxX: 600, minY: 0, maxY: 720, minZ: 0, maxZ: 400 }
    expect(validateWorldRange(makeItem({ id: 'a' }), aabb)).toHaveLength(0)
  })

  it('extreme coords produce OUT_OF_ALLOWED_WORLD_RANGE', () => {
    const aabb: AABB = { minX: 0, maxX: 200000, minY: 0, maxY: 720, minZ: 0, maxZ: 400 }
    const issues = validateWorldRange(makeItem({ id: 'a' }), aabb)
    expect(issues.some((i) => i.code === 'OUT_OF_ALLOWED_WORLD_RANGE')).toBe(true)
  })
})

describe('validateProject', () => {
  it('empty project has no issues', () => {
    expect(validateProject([], room)).toHaveLength(0)
  })

  it('valid items produce no issues', () => {
    const items = [
      makeItem({ id: 'a', transform: { xMm: 0, yMm: 0, zMm: 0, rotationYDeg: 0 } }),
      makeItem({ id: 'b', transform: { xMm: 1000, yMm: 0, zMm: 0, rotationYDeg: 0 } }),
    ]
    expect(validateProject(items, room)).toHaveLength(0)
  })
})
