import { describe, expect, it } from 'vitest'

import type { Item } from '@/types/project'

import { resolveWorldTransform, rotateXZ } from '../transforms'

function makeItem(overrides: Partial<Item> & { id: string }): Item {
  return {
    type: 'panel',
    subtype: 'test',
    name: overrides.id,
    parentId: null,
    sortIndex: 0,
    dimensions: { widthMm: 100, heightMm: 200, depthMm: 50, thicknessMm: 16 },
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

describe('rotateXZ', () => {
  it('0° returns unchanged', () => {
    expect(rotateXZ(10, 20, 0)).toEqual({ x: 10, z: 20 })
  })
  it('90° rotates +X to -Z', () => {
    expect(rotateXZ(10, 20, 90)).toEqual({ x: -20, z: 10 })
  })
  it('180° negates both', () => {
    expect(rotateXZ(10, 20, 180)).toEqual({ x: -10, z: -20 })
  })
  it('270° rotates +X to +Z', () => {
    expect(rotateXZ(10, 20, 270)).toEqual({ x: 20, z: -10 })
  })
})

describe('resolveWorldTransform', () => {
  it('root item returns its own transform', () => {
    const items = [makeItem({ id: 'a', transform: { xMm: 100, yMm: 50, zMm: 200, rotationYDeg: 90 } })]
    const wt = resolveWorldTransform('a', items)
    expect(wt).toEqual({ xMm: 100, yMm: 50, zMm: 200, rotationYDeg: 90 })
  })

  it('child offset added to parent position', () => {
    const items = [
      makeItem({ id: 'parent', transform: { xMm: 100, yMm: 0, zMm: 100, rotationYDeg: 0 } }),
      makeItem({ id: 'child', parentId: 'parent', transform: { xMm: 50, yMm: 10, zMm: 20, rotationYDeg: 0 } }),
    ]
    const wt = resolveWorldTransform('child', items)
    expect(wt).toEqual({ xMm: 150, yMm: 10, zMm: 120, rotationYDeg: 0 })
  })

  it('parent rotated 90° swaps child X/Z', () => {
    const items = [
      makeItem({ id: 'parent', transform: { xMm: 0, yMm: 0, zMm: 0, rotationYDeg: 90 } }),
      makeItem({ id: 'child', parentId: 'parent', transform: { xMm: 100, yMm: 0, zMm: 0, rotationYDeg: 0 } }),
    ]
    const wt = resolveWorldTransform('child', items)
    // Parent at origin with 90° rotation, child local (100, 0)
    // After parent rotation: child world = (0,0,0) + rotateXZ(100, 0, 90) = (0, 0) + (0, 100) = (0, 0, 100)
    expect(wt.xMm).toBe(0)
    expect(wt.zMm).toBe(100)
    expect(wt.rotationYDeg).toBe(90)
  })

  it('deep chain with cumulative rotation', () => {
    const items = [
      makeItem({ id: 'root', transform: { xMm: 0, yMm: 0, zMm: 0, rotationYDeg: 90 } }),
      makeItem({ id: 'mid', parentId: 'root', transform: { xMm: 100, yMm: 0, zMm: 0, rotationYDeg: 90 } }),
      makeItem({ id: 'leaf', parentId: 'mid', transform: { xMm: 50, yMm: 0, zMm: 0, rotationYDeg: 0 } }),
    ]
    const wt = resolveWorldTransform('leaf', items)
    // root: (0,0,0) rot=90
    // mid local (100,0) rotated by 90: (-0, 100) -> world (0, 0, 100), cumRot=180
    // leaf local (50,0) rotated by 180: (-50, 0) -> world (0-50, 0, 100) = (-50, 0, 100)
    expect(wt.xMm).toBe(-50)
    expect(wt.zMm).toBe(100)
    expect(wt.rotationYDeg).toBe(180)
  })

  it('throws on circular parentId chain', () => {
    const items = [
      makeItem({ id: 'a', parentId: 'b' }),
      makeItem({ id: 'b', parentId: 'a' }),
    ]
    expect(() => resolveWorldTransform('a', items)).toThrow('Circular')
  })

  it('throws on missing item', () => {
    expect(() => resolveWorldTransform('missing', [])).toThrow('not found')
  })
})
