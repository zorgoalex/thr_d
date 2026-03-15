import { describe, expect, it } from 'vitest'

import type { Item } from '@/types/project'

import { collectDescendants } from '../item-tree-utils'

function makeItem(id: string, parentId: string | null = null): Item {
  return {
    id,
    type: 'panel',
    subtype: 'test',
    name: id,
    parentId,
    sortIndex: 0,
    dimensions: { widthMm: 100, heightMm: 100, depthMm: 100, thicknessMm: 16 },
    transform: { xMm: 0, yMm: 0, zMm: 0, rotationYDeg: 0 },
    materialId: null,
    grainDirection: null,
    visibility: true,
    locked: false,
    constraints: null,
    sourceTemplateId: null,
  }
}

describe('collectDescendants', () => {
  it('returns root IDs when no children', () => {
    const items = [makeItem('a'), makeItem('b')]
    expect(collectDescendants(['a'], items)).toEqual(['a'])
  })

  it('collects direct children', () => {
    const items = [makeItem('parent'), makeItem('child1', 'parent'), makeItem('child2', 'parent')]
    const result = collectDescendants(['parent'], items)
    expect(result.sort()).toEqual(['child1', 'child2', 'parent'])
  })

  it('collects deep descendants', () => {
    const items = [
      makeItem('root'),
      makeItem('child', 'root'),
      makeItem('grandchild', 'child'),
    ]
    const result = collectDescendants(['root'], items)
    expect(result.sort()).toEqual(['child', 'grandchild', 'root'])
  })

  it('handles empty items', () => {
    expect(collectDescendants(['a'], [])).toEqual(['a'])
  })
})
