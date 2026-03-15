import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

import type { CameraMode, Project, Room, UIState, ValidationIssue } from '@/types/project'

export interface ProjectStore {
  // Project
  project: Project | null
  setProject: (project: Project) => void
  updateRoom: (partial: Partial<Room>) => void
  setProjectName: (name: string) => void

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
