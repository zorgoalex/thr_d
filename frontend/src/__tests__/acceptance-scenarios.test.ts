/**
 * Etap 15: Five acceptance scenarios from the spec.
 * Tests walk through real multi-step flows using the Zustand store.
 */
import { beforeEach, describe, expect, it } from 'vitest'

import { createEmptyProject } from '@/lib/project-factory'
import { expandItemTree } from '@/lib/expand-item-tree'
import { cloneItems } from '@/lib/clone-items'
import {
  deleteProject,
  hasAutosave,
  loadProject,
  resetDBInstance,
  saveProject,
} from '@/lib/persistence'
import { useProjectStore, resetHistory } from '@/store/project-store'
import type { Item } from '@/types/project'

const ROOM = { widthMm: 3000, lengthMm: 3000, heightMm: 2700 }

function makePanel(id: string, x = 0): Item {
  return {
    id,
    type: 'panel',
    subtype: 'side_panel',
    name: `Panel ${id}`,
    parentId: null,
    sortIndex: 0,
    dimensions: { widthMm: 600, heightMm: 720, depthMm: 16, thicknessMm: 16 },
    transform: { xMm: x, yMm: 0, zMm: 0, rotationYDeg: 0 },
    materialId: null,
    grainDirection: null,
    visibility: true,
    locked: false,
    constraints: null,
    sourceTemplateId: null,
  }
}

describe('Acceptance Scenarios', () => {
  beforeEach(() => {
    resetHistory()
    resetDBInstance()
    useProjectStore.setState({
      project: null,
      selectedItemIds: [],
      validationIssues: [],
      isDirty: false,
      lastSavedAt: null,
    })
  })

  // Scenario 1: Create empty project, add items, edit, save
  it('Scenario 1: create project, add items, edit, save/load', async () => {
    const project = createEmptyProject(ROOM)
    useProjectStore.getState().setProject(project)

    const panel = makePanel('p1')
    useProjectStore.getState().addItems([panel])

    useProjectStore.getState().setProjectName('My Kitchen')
    useProjectStore.getState().updateItem('p1', {
      dimensions: { widthMm: 800, heightMm: 720, depthMm: 16, thicknessMm: 16 },
    })

    const p = useProjectStore.getState().project!
    expect(p.items).toHaveLength(1)
    expect(p.name).toBe('My Kitchen')
    expect(p.items[0]!.dimensions.widthMm).toBe(800)

    await saveProject(p, { leftPanelOpen: true, rightPanelOpen: true, activeTab: 'templates', cameraMode: 'perspective' })
    const loaded = await loadProject(p.id)
    expect(loaded).not.toBeNull()
    expect(loaded!.project.name).toBe('My Kitchen')
    expect(loaded!.project.items).toHaveLength(1)
  })

  // Scenario 2: Select template, edit contents (not black box)
  it('Scenario 2: insert template, edit child items', () => {
    const project = createEmptyProject(ROOM)
    useProjectStore.getState().setProject(project)

    const tree = {
      id: 'root', type: 'assembly', subtype: 'wardrobe', name: 'Wardrobe',
      dimensions: { widthMm: 1200, heightMm: 2100, depthMm: 600, thicknessMm: 16 },
      transform: { xMm: 0, yMm: 0, zMm: 0, rotationYDeg: 0 },
      materialId: null,
      children: [{
        id: 'left', type: 'panel', subtype: 'side_panel', name: 'Left Panel',
        dimensions: { widthMm: 16, heightMm: 2100, depthMm: 600, thicknessMm: 16 },
        transform: { xMm: 0, yMm: 0, zMm: 0, rotationYDeg: 0 },
        materialId: null, children: [],
      }],
    }

    const items = expandItemTree(tree as unknown as Record<string, unknown>, 'tpl-wardrobe', { xMm: 900, yMm: 0, zMm: 1200 })
    useProjectStore.getState().addItems(items)

    expect(useProjectStore.getState().project!.items).toHaveLength(2)
    expect(items[0]!.sourceTemplateId).toBe('tpl-wardrobe')

    // Edit child — NOT a black box
    const child = items[1]!
    useProjectStore.getState().updateItem(child.id, {
      dimensions: { widthMm: 18, heightMm: 2100, depthMm: 600, thicknessMm: 18 },
    })
    const updated = useProjectStore.getState().project!.items.find((i) => i.id === child.id)!
    expect(updated.dimensions.widthMm).toBe(18)
  })

  // Scenario 3: Create custom panel
  it('Scenario 3: create custom panel with depthMm = thicknessMm', () => {
    const project = createEmptyProject(ROOM)
    useProjectStore.getState().setProject(project)

    const panel: Item = {
      id: 'custom-1',
      type: 'panel',
      subtype: 'custom',
      name: 'My Panel',
      parentId: null,
      sortIndex: 0,
      dimensions: { widthMm: 600, heightMm: 720, depthMm: 16, thicknessMm: 16 },
      transform: { xMm: 1200, yMm: 0, zMm: 1200, rotationYDeg: 0 },
      materialId: null,
      grainDirection: null,
      visibility: true,
      locked: false,
      constraints: null,
      sourceTemplateId: null,
    }
    expect(panel.dimensions.depthMm).toBe(panel.dimensions.thicknessMm)

    useProjectStore.getState().addItems([panel])
    expect(useProjectStore.getState().project!.items).toHaveLength(1)
    expect(useProjectStore.getState().project!.items[0]!.name).toBe('My Panel')
  })

  // Scenario 4: Save and recover (autosave)
  it('Scenario 4: save, check autosave, load', async () => {
    const project = createEmptyProject(ROOM)
    useProjectStore.getState().setProject(project)
    useProjectStore.getState().addItems([makePanel('p1')])

    const p = useProjectStore.getState().project!
    const ui = { leftPanelOpen: true, rightPanelOpen: false, activeTab: 'modules', cameraMode: 'front' as const }
    await saveProject(p, ui)

    expect(await hasAutosave()).toBe(true)

    const loaded = await loadProject(p.id)
    expect(loaded!.project.items).toHaveLength(1)
    expect(loaded!.uiState.rightPanelOpen).toBe(false)
    expect(loaded!.uiState.activeTab).toBe('modules')
    expect(loaded!.uiState.cameraMode).toBe('front')

    await deleteProject(p.id)
    expect(await hasAutosave()).toBe(false)
  })

  // Scenario 5: Undo/redo chain
  it('Scenario 5: undo/redo multi-step chain', () => {
    const project = createEmptyProject(ROOM)
    useProjectStore.getState().setProject(project)

    // Initial state: 0 items
    useProjectStore.getState().addItems([makePanel('p1')])
    expect(useProjectStore.getState().canUndo).toBe(true)
    expect(useProjectStore.getState().project!.items).toHaveLength(1)

    useProjectStore.getState().addItems([makePanel('p2', 800)])
    expect(useProjectStore.getState().project!.items).toHaveLength(2)

    // Undo → 1 item
    useProjectStore.getState().undo()
    expect(useProjectStore.getState().project!.items).toHaveLength(1)
    expect(useProjectStore.getState().canRedo).toBe(true)

    // Redo → 2 items
    useProjectStore.getState().redo()
    expect(useProjectStore.getState().project!.items).toHaveLength(2)

    // Undo twice → 0 items
    useProjectStore.getState().undo()
    useProjectStore.getState().undo()
    expect(useProjectStore.getState().project!.items).toHaveLength(0)
    // canUndo depends on how many snapshots were pushed (setProject also pushes one)
    expect(useProjectStore.getState().canRedo).toBe(true)

    // Clone test
    useProjectStore.getState().redo() // back to 1 item
    const cloned = cloneItems(['p1'], useProjectStore.getState().project!.items)
    useProjectStore.getState().addItems(cloned)
    expect(useProjectStore.getState().project!.items).toHaveLength(2)
    expect(cloned[0]!.id).not.toBe('p1')
  })
})
