import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

import { collectDescendants } from '@/lib/item-tree-utils'
import type { CameraMode, Item, Material, Project, Room, UIState, ValidationIssue } from '@/types/project'

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

  // History (structure only — logic in Etap 10)
  canUndo: boolean
  canRedo: boolean

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

export const useProjectStore = create<ProjectStore>()(
  subscribeWithSelector((set, get) => ({
    // Project
    project: null,
    setProject: (project) =>
      set({ project, isDirty: true }),
    updateRoom: (partial) => {
      const p = get().project
      if (!p) return
      set({
        project: {
          ...p,
          room: { ...p.room, ...partial },
          metadata: { ...p.metadata, updatedAt: new Date().toISOString() },
        },
        isDirty: true,
      })
    },
    setProjectName: (name) => {
      const p = get().project
      if (!p) return
      set({
        project: {
          ...p,
          name,
          metadata: { ...p.metadata, updatedAt: new Date().toISOString() },
        },
        isDirty: true,
      })
    },

    addItems: (newItems) => {
      const p = get().project
      if (!p) return
      set({
        project: {
          ...p,
          items: [...p.items, ...newItems],
          metadata: { ...p.metadata, updatedAt: new Date().toISOString() },
        },
        isDirty: true,
      })
    },
    addMaterials: (newMaterials) => {
      const p = get().project
      if (!p) return
      const existingIds = new Set(p.materials.map((m) => m.id))
      const toAdd = newMaterials.filter((m) => !existingIds.has(m.id))
      if (toAdd.length === 0) return
      set({
        project: {
          ...p,
          materials: [...p.materials, ...toAdd],
          metadata: { ...p.metadata, updatedAt: new Date().toISOString() },
        },
        isDirty: true,
      })
    },
    updateItem: (id, partial) => {
      const p = get().project
      if (!p) return
      set({
        project: {
          ...p,
          items: p.items.map((item) =>
            item.id === id ? { ...item, ...partial } : item,
          ),
          metadata: { ...p.metadata, updatedAt: new Date().toISOString() },
        },
        isDirty: true,
      })
    },
    updateItemsBatch: (updates) => {
      const p = get().project
      if (!p) return
      const updateMap = new Map(updates.map((u) => [u.id, u.partial]))
      set({
        project: {
          ...p,
          items: p.items.map((item) => {
            const partial = updateMap.get(item.id)
            return partial ? { ...item, ...partial } : item
          }),
          metadata: { ...p.metadata, updatedAt: new Date().toISOString() },
        },
        isDirty: true,
      })
    },
    deleteItems: (ids) => {
      const p = get().project
      if (!p) return
      const toDelete = new Set(collectDescendants(ids, p.items))
      set({
        project: {
          ...p,
          items: p.items.filter((item) => !toDelete.has(item.id)),
          metadata: { ...p.metadata, updatedAt: new Date().toISOString() },
        },
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
