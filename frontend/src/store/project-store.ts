import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

import { collectDescendants } from '@/lib/item-tree-utils'
import type { CameraMode, Item, Material, Project, Room, UIState, ValidationIssue } from '@/types/project'

const MAX_HISTORY = 50

interface ProjectSnapshot {
  items: Item[]
  room: Room
  materials: Material[]
}

export interface ProjectStore {
  // Project
  project: Project | null
  setProject: (project: Project) => void
  updateRoom: (partial: Partial<Room>) => void
  setProjectName: (name: string) => void
  addItems: (items: Item[]) => void
  addMaterials: (materials: Material[]) => void
  updateItem: (id: string, partial: Partial<Item>) => void
  updateItemsBatch: (updates: Array<{ id: string; partial: Partial<Item> }>) => void
  deleteItems: (ids: string[]) => void

  // Selection
  selectedItemIds: string[]
  setSelection: (ids: string[]) => void
  clearSelection: () => void

  // Validation
  validationIssues: ValidationIssue[]
  setValidationIssues: (issues: ValidationIssue[]) => void

  // UI
  leftPanelOpen: boolean
  rightPanelOpen: boolean
  activeTab: string
  cameraMode: CameraMode
  toggleLeftPanel: () => void
  toggleRightPanel: () => void
  setActiveTab: (tab: string) => void
  setCameraMode: (mode: CameraMode) => void

  // History
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void

  // Persistence
  lastSavedAt: string | null
  isDirty: boolean
  persistenceAvailable: boolean
  setPersistenceAvailable: (v: boolean) => void
  markDirty: () => void
  markClean: () => void
  setLastSavedAt: (ts: string) => void

  // Helper
  getUIState: () => UIState
}

// Internal history state (not exposed on store interface)
let _past: ProjectSnapshot[] = []
let _future: ProjectSnapshot[] = []

function takeSnapshot(project: Project): ProjectSnapshot {
  return structuredClone({ items: project.items, room: project.room, materials: project.materials })
}

function pushSnapshot(project: Project | null, set: (s: Partial<ProjectStore>) => void) {
  if (!project) return
  _past.push(takeSnapshot(project))
  if (_past.length > MAX_HISTORY) _past.shift()
  _future = []
  set({ canUndo: _past.length > 0, canRedo: false })
}

function now() {
  return new Date().toISOString()
}

export const useProjectStore = create<ProjectStore>()(
  subscribeWithSelector((set, get) => ({
    // Project
    project: null,
    setProject: (project) => {
      pushSnapshot(get().project, set)
      set({ project, isDirty: true })
    },
    updateRoom: (partial) => {
      const p = get().project
      if (!p) return
      pushSnapshot(p, set)
      set({
        project: { ...p, room: { ...p.room, ...partial }, metadata: { ...p.metadata, updatedAt: now() } },
        isDirty: true,
      })
    },
    setProjectName: (name) => {
      const p = get().project
      if (!p) return
      pushSnapshot(p, set)
      set({
        project: { ...p, name, metadata: { ...p.metadata, updatedAt: now() } },
        isDirty: true,
      })
    },
    addItems: (newItems) => {
      const p = get().project
      if (!p) return
      pushSnapshot(p, set)
      set({
        project: { ...p, items: [...p.items, ...newItems], metadata: { ...p.metadata, updatedAt: now() } },
        isDirty: true,
      })
    },
    addMaterials: (newMaterials) => {
      const p = get().project
      if (!p) return
      const existingIds = new Set(p.materials.map((m) => m.id))
      const toAdd = newMaterials.filter((m) => !existingIds.has(m.id))
      if (toAdd.length === 0) return
      pushSnapshot(p, set)
      set({
        project: { ...p, materials: [...p.materials, ...toAdd], metadata: { ...p.metadata, updatedAt: now() } },
        isDirty: true,
      })
    },
    updateItem: (id, partial) => {
      const p = get().project
      if (!p) return
      pushSnapshot(p, set)
      set({
        project: {
          ...p,
          items: p.items.map((item) => (item.id === id ? { ...item, ...partial } : item)),
          metadata: { ...p.metadata, updatedAt: now() },
        },
        isDirty: true,
      })
    },
    updateItemsBatch: (updates) => {
      const p = get().project
      if (!p) return
      pushSnapshot(p, set)
      const updateMap = new Map(updates.map((u) => [u.id, u.partial]))
      set({
        project: {
          ...p,
          items: p.items.map((item) => {
            const part = updateMap.get(item.id)
            return part ? { ...item, ...part } : item
          }),
          metadata: { ...p.metadata, updatedAt: now() },
        },
        isDirty: true,
      })
    },
    deleteItems: (ids) => {
      const p = get().project
      if (!p) return
      pushSnapshot(p, set)
      const toDelete = new Set(collectDescendants(ids, p.items))
      set({
        project: { ...p, items: p.items.filter((item) => !toDelete.has(item.id)), metadata: { ...p.metadata, updatedAt: now() } },
        selectedItemIds: [],
        isDirty: true,
      })
    },

    // Selection
    selectedItemIds: [],
    setSelection: (ids) => set({ selectedItemIds: ids }),
    clearSelection: () => set({ selectedItemIds: [] }),

    // Validation
    validationIssues: [],
    setValidationIssues: (issues) => set({ validationIssues: issues }),

    // UI
    leftPanelOpen: true,
    rightPanelOpen: true,
    activeTab: 'templates',
    cameraMode: 'perspective',
    toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
    toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
    setActiveTab: (tab) => set({ activeTab: tab }),
    setCameraMode: (mode) => set({ cameraMode: mode }),

    // History
    canUndo: false,
    canRedo: false,
    undo: () => {
      const p = get().project
      if (!p || _past.length === 0) return
      _future.push(takeSnapshot(p))
      const snapshot = _past.pop()!
      set({
        project: { ...p, items: snapshot.items, room: snapshot.room, materials: snapshot.materials, metadata: { ...p.metadata, updatedAt: now() } },
        selectedItemIds: [],
        canUndo: _past.length > 0,
        canRedo: _future.length > 0,
        isDirty: true,
      })
    },
    redo: () => {
      const p = get().project
      if (!p || _future.length === 0) return
      _past.push(takeSnapshot(p))
      const snapshot = _future.pop()!
      set({
        project: { ...p, items: snapshot.items, room: snapshot.room, materials: snapshot.materials, metadata: { ...p.metadata, updatedAt: now() } },
        selectedItemIds: [],
        canUndo: _past.length > 0,
        canRedo: _future.length > 0,
        isDirty: true,
      })
    },

    // Persistence
    lastSavedAt: null,
    isDirty: false,
    persistenceAvailable: true,
    setPersistenceAvailable: (v) => set({ persistenceAvailable: v }),
    markDirty: () => set({ isDirty: true }),
    markClean: () => set({ isDirty: false }),
    setLastSavedAt: (ts) => set({ lastSavedAt: ts }),

    // Helper
    getUIState: () => {
      const s = get()
      return {
        leftPanelOpen: s.leftPanelOpen,
        rightPanelOpen: s.rightPanelOpen,
        activeTab: s.activeTab,
        cameraMode: s.cameraMode,
      }
    },
  })),
)

/** Reset history (for testing) */
export function resetHistory() {
  _past = []
  _future = []
  useProjectStore.setState({ canUndo: false, canRedo: false })
}
