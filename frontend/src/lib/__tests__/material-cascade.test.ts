import { describe, expect, it } from 'vitest'

import type { Item } from '@/types/project'

import { applyMaterialCascade } from '../material-cascade'

function makeItem(id: string, parentId: string | null = null, locked = false): Item {
  return {
    id,
    type: parentId ? 'panel' : 'assembly',
    subtype: 'test',
    name: id,
    parentId,
    sortIndex: 0,
    dimensions: { widthMm: 100, heightMm: 100, depthMm: 100, thicknessMm: 16 },
    transform: { xMm: 0, yMm: 0, zMm: 0, rotationYDeg: 0 },
    materialId: 'old-mat',
    grainDirection: null,
    visibility: true,
    locked,
    constraints: null,
    sourceTemplateId: null,
  }
}

describe('applyMaterialCascade', () => {
  it('updates assembly and non-locked children', () => {
    const items = [
      makeItem('assembly'),
      makeItem('child1', 'assembly'),
      makeItem('child2', 'assembly'),
    ]
    const updates = applyMaterialCascade('assembly', 'new-mat', items)
    expect(updates).toHaveLength(3)
    expect(updates.every((u) => u.partial.materialId === 'new-mat')).toBe(true)
  })

  it('skips locked children', () => {
    const items = [
      makeItem('assembly'),
      makeItem('child1', 'assembly'),
      makeItem('child2', 'assembly', true), // locked
    ]
    const updates = applyMaterialCascade('assembly', 'new-mat', items)
    expect(updates).toHaveLength(2) // assembly + child1, not child2
    expect(updates.map((u) => u.id).sort()).toEqual(['assembly', 'child1'])
  })

  it('works on single item (no children)', () => {
    const items = [makeItem('single')]
    const updates = applyMaterialCascade('single', 'new-mat', items)
    expect(updates).toHaveLength(1)
  })
})
