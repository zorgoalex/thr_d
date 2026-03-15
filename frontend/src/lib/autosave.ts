import type { useProjectStore } from '@/store/project-store'

import { saveProject } from './persistence'

const AUTOSAVE_DELAY = 1500

export function setupAutosave(
  store: typeof useProjectStore,
): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null

  const unsubscribe = store.subscribe(
    (s) => ({ project: s.project, isDirty: s.isDirty }),
    (curr) => {
      if (!curr.project || !curr.isDirty) return

      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        const state = store.getState()
        const project = state.project
        if (!project) return

        saveProject(project, state.getUIState())
          .then(() => {
            state.markClean()
            state.setLastSavedAt(new Date().toISOString())
          })
          .catch((err) => {
            console.error('Autosave failed:', err)
          })
      }, AUTOSAVE_DELAY)
    },
    { equalityFn: (a, b) => a.project === b.project && a.isDirty === b.isDirty },
  )

  return () => {
    if (timer) clearTimeout(timer)
    unsubscribe()
  }
}
