import { beforeEach, describe, expect, it } from 'vitest'

import { createEmptyProject } from '@/lib/project-factory'
import { useProjectStore } from '@/store/project-store'

const DEFAULT_ROOM = { widthMm: 3000, lengthMm: 3000, heightMm: 2700 }

describe('ProjectStore', () => {
  beforeEach(() => {
    useProjectStore.setState({
      project: null,
      selectedItemIds: [],
      validationIssues: [],
      isDirty: false,
      lastSavedAt: null,
      leftPanelOpen: true,
      rightPanelOpen: true,
      activeTab: 'templates',
    })
  })

  it('initializes with null project', () => {
    expect(useProjectStore.getState().project).toBeNull()
  })

  it('setProject sets project and marks dirty', () => {
    const p = createEmptyProject(DEFAULT_ROOM)
    useProjectStore.getState().setProject(p)

    expect(useProjectStore.getState().project?.id).toBe(p.id)
    expect(useProjectStore.getState().isDirty).toBe(true)
  })

  it('updateRoom updates room dimensions', () => {
    const p = createEmptyProject(DEFAULT_ROOM)
    useProjectStore.getState().setProject(p)
    useProjectStore.getState().updateRoom({ widthMm: 5000 })

    expect(useProjectStore.getState().project?.room.widthMm).toBe(5000)
    expect(useProjectStore.getState().project?.room.lengthMm).toBe(3000)
  })

  it('setProjectName updates name', () => {
    const p = createEmptyProject(DEFAULT_ROOM)
    useProjectStore.getState().setProject(p)
    useProjectStore.getState().setProjectName('My Kitchen')

    expect(useProjectStore.getState().project?.name).toBe('My Kitchen')
  })

  it('selection actions work', () => {
    useProjectStore.getState().setSelection(['item-1', 'item-2'])
    expect(useProjectStore.getState().selectedItemIds).toEqual(['item-1', 'item-2'])

    useProjectStore.getState().clearSelection()
    expect(useProjectStore.getState().selectedItemIds).toEqual([])
  })

  it('markDirty and markClean toggle isDirty', () => {
    useProjectStore.getState().markDirty()
    expect(useProjectStore.getState().isDirty).toBe(true)

    useProjectStore.getState().markClean()
    expect(useProjectStore.getState().isDirty).toBe(false)
  })

  it('UI toggle actions work', () => {
    useProjectStore.getState().toggleLeftPanel()
    expect(useProjectStore.getState().leftPanelOpen).toBe(false)

    useProjectStore.getState().toggleRightPanel()
    expect(useProjectStore.getState().rightPanelOpen).toBe(false)

    useProjectStore.getState().setActiveTab('materials')
    expect(useProjectStore.getState().activeTab).toBe('materials')
  })
})
