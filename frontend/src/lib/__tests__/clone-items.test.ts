import { describe, expect, it } from 'vitest'

import type { Item } from '@/types/project'

import { cloneItems } from '../clone-items'

function makeItem(id: string, parentId: string | null = null): Item {
  return {
    id, type: parentId ? 'panel' : 'assembly', subtype: 'test', name: id, parentId, sortIndex: 0,
    dimensions: { widthMm: 600, heightMm: 720, depthMm: 400, thicknessMm: 16 },
    transform: { xMm: 100, yMm: 0, zMm: 200, rotationYDeg: 0 },
    materialId: null, grainDirection: null, visibility: true, locked: false,
    constraints: null, sourceTemplateId: null,
  }
}

describe('cloneItems', () => {
  it('clones single item with new ID and offset', () => {
    const items = [makeItem('a')]
    const cloned = cloneItems(['a'], items)
    expect(cloned).toHaveLength(1)
    expect(cloned[0]!.id).not.toBe('a')
    expect(cloned[0]!.transform.xMm).toBe(100 + 600 + 50) // original + width + 50
  })

  it('clones assembly with descendants', () => {
    const items = [makeItem('parent'), makeItem('child1', 'parent'), makeItem('child2', 'parent')]
    const cloned = cloneItems(['parent'], items)
    expect(cloned).toHaveLength(3)
  })

  it('remaps parentIds in cloned descendants', () => {
    const items = [makeItem('parent'), makeItem('child', 'parent')]
    const cloned = cloneItems(['parent'], items)
    const clonedParent = cloned.find((i) => i.parentId === null)!
    const clonedChild = cloned.find((i) => i.parentId !== null)!
    expect(clonedChild.parentId).toBe(clonedParent.id)
  })

  it('does not mutate originals', () => {
    const items = [makeItem('a')]
    const originalX = items[0]!.transform.xMm
    cloneItems(['a'], items)
    expect(items[0]!.transform.xMm).toBe(originalX)
  })

  it('children keep original local transforms', () => {
    const items = [makeItem('parent'), makeItem('child', 'parent')]
    const cloned = cloneItems(['parent'], items)
    const clonedChild = cloned.find((i) => i.parentId !== null)!
    // Child is not a root, so no offset applied
    expect(clonedChild.transform.xMm).toBe(100)
  })
})
