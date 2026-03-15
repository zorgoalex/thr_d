import { beforeEach, describe, expect, it } from 'vitest'

import { createEmptyProject } from '@/lib/project-factory'
import {
  deleteProject,
  hasAutosave,
  loadProject,
  resetDBInstance,
  saveProject,
} from '@/lib/persistence'

const DEFAULT_ROOM = { widthMm: 3000, lengthMm: 3000, heightMm: 2700 }
const DEFAULT_UI = { leftPanelOpen: true, rightPanelOpen: true, activeTab: 'templates', cameraMode: 'perspective' as const }

describe('persistence', () => {
  beforeEach(() => {
    resetDBInstance()
  })

  it('saves and loads a project', async () => {
    const project = createEmptyProject(DEFAULT_ROOM)
    await saveProject(project, DEFAULT_UI)

    const result = await loadProject(project.id)
    expect(result).not.toBeNull()
    expect(result!.project.id).toBe(project.id)
    expect(result!.project.room.widthMm).toBe(3000)
    expect(result!.uiState.leftPanelOpen).toBe(true)
  })

  it('hasAutosave returns true after save', async () => {
    const project = createEmptyProject(DEFAULT_ROOM)
    await saveProject(project, DEFAULT_UI)
    expect(await hasAutosave()).toBe(true)
  })

  it('hasAutosave returns false after delete', async () => {
    const project = createEmptyProject(DEFAULT_ROOM)
    await saveProject(project, DEFAULT_UI)
    await deleteProject(project.id)

    // hasAutosave checks by lastProjectId which still points to deleted project
    expect(await hasAutosave()).toBe(false)
  })

  it('loadProject returns null for missing id', async () => {
    const result = await loadProject('nonexistent')
    expect(result).toBeNull()
  })
})
