import { describe, expect, it } from 'vitest'

import type { Item } from '@/types/project'

import { buildProjectTree } from '../build-project-tree'

function makeItem(id: string, parentId: string | null = null, sortIndex = 0): Item {
  return {
    id, type: 'panel', subtype: 'test', name: id, parentId, sortIndex,
    dimensions: { widthMm: 100, heightMm: 100, depthMm: 100, thicknessMm: 16 },
    transform: { xMm: 0, yMm: 0, zMm: 0, rotationYDeg: 0 },
    materialId: null, grainDirection: null, visibility: true, locked: false,
    constraints: null, sourceTemplateId: null,
  }
}

describe('buildProjectTree', () => {
  it('returns empty for no items', () => {
    expect(buildProjectTree([])).toEqual([])
  })

  it('returns flat roots for items with no parent', () => {
    const items = [makeItem('a'), makeItem('b')]
    const tree = buildProjectTree(items)
    expect(tree).toHaveLength(2)
    expect(tree[0]!.children).toHaveLength(0)
  })

  it('builds parent-child structure', () => {
    const items = [makeItem('parent'), makeItem('child1', 'parent'), makeItem('child2', 'parent')]
    const tree = buildProjectTree(items)
    expect(tree).toHaveLength(1)
    expect(tree[0]!.item.id).toBe('parent')
    expect(tree[0]!.children).toHaveLength(2)
  })

  it('sorts siblings by sortIndex', () => {
    const items = [makeItem('parent'), makeItem('b', 'parent', 2), makeItem('a', 'parent', 1)]
    const tree = buildProjectTree(items)
    expect(tree[0]!.children[0]!.item.id).toBe('a')
    expect(tree[0]!.children[1]!.item.id).toBe('b')
  })

  it('handles deep nesting', () => {
    const items = [makeItem('root'), makeItem('child', 'root'), makeItem('grandchild', 'child')]
    const tree = buildProjectTree(items)
    expect(tree[0]!.children[0]!.children[0]!.item.id).toBe('grandchild')
  })
})
