import { describe, expect, it } from 'vitest'

import { expandItemTree } from '../expand-item-tree'

const TREE = {
  id: 'root',
  type: 'assembly',
  subtype: 'wardrobe',
  name: 'Шкаф',
  dimensions: { widthMm: 1200, heightMm: 2100, depthMm: 600, thicknessMm: 16 },
  transform: { xMm: 0, yMm: 0, zMm: 0, rotationYDeg: 0 },
  materialId: null,
  children: [
    {
      id: 'left',
      type: 'panel',
      subtype: 'side_panel',
      name: 'Left',
      dimensions: { widthMm: 16, heightMm: 2100, depthMm: 600, thicknessMm: 16 },
      transform: { xMm: 0, yMm: 0, zMm: 0, rotationYDeg: 0 },
      materialId: 'mat-1',
      children: [],
    },
    {
      id: 'right',
      type: 'panel',
      subtype: 'side_panel',
      name: 'Right',
      dimensions: { widthMm: 16, heightMm: 2100, depthMm: 600, thicknessMm: 16 },
      transform: { xMm: 1184, yMm: 0, zMm: 0, rotationYDeg: 0 },
      materialId: 'mat-1',
      children: [],
    },
  ],
}

describe('expandItemTree', () => {
  it('expands tree into flat items', () => {
    const items = expandItemTree(TREE as unknown as Record<string, unknown>, 'tpl-1')
    expect(items).toHaveLength(3) // root + 2 children
  })

  it('generates unique IDs different from source', () => {
    const items = expandItemTree(TREE as unknown as Record<string, unknown>, 'tpl-1')
    const ids = items.map((i) => i.id)
    expect(new Set(ids).size).toBe(3)
    expect(ids.every((id) => id !== 'root' && id !== 'left' && id !== 'right')).toBe(true)
  })

  it('sets correct parentId references', () => {
    const items = expandItemTree(TREE as unknown as Record<string, unknown>, 'tpl-1')
    const root = items[0]!
    expect(root.parentId).toBeNull()

    const children = items.filter((i) => i.parentId === root.id)
    expect(children).toHaveLength(2)
  })

  it('applies position override to root only', () => {
    const pos = { xMm: 500, yMm: 0, zMm: 300 }
    const items = expandItemTree(TREE as unknown as Record<string, unknown>, 'tpl-1', pos)

    expect(items[0]!.transform.xMm).toBe(500)
    expect(items[0]!.transform.zMm).toBe(300)

    // Children keep local transforms
    expect(items[1]!.transform.xMm).toBe(0)
    expect(items[2]!.transform.xMm).toBe(1184)
  })

  it('sets sourceTemplateId on all items', () => {
    const items = expandItemTree(TREE as unknown as Record<string, unknown>, 'tpl-1')
    expect(items.every((i) => i.sourceTemplateId === 'tpl-1')).toBe(true)
  })

  it('enforces depthMm = thicknessMm for single-node tree', () => {
    const singleNode = {
      id: 'panel',
      type: 'panel',
      subtype: 'custom',
      name: 'Panel',
      dimensions: { widthMm: 600, heightMm: 720, depthMm: 16, thicknessMm: 16 },
      transform: { xMm: 0, yMm: 0, zMm: 0, rotationYDeg: 0 },
      materialId: null,
      children: [],
    }
    const items = expandItemTree(singleNode as unknown as Record<string, unknown>, 'custom')
    expect(items).toHaveLength(1)
    expect(items[0]!.dimensions.depthMm).toBe(16)
    expect(items[0]!.dimensions.thicknessMm).toBe(16)
  })
})
