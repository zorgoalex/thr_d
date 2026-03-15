import { useEffect } from 'react'

import { cloneItems } from '@/lib/clone-items'
import { useProjectStore } from '@/store/project-store'

export function useEditorHotkeys() {
  const clearSelection = useProjectStore((s) => s.clearSelection)
  const deleteItems = useProjectStore((s) => s.deleteItems)
  const undo = useProjectStore((s) => s.undo)
  const redo = useProjectStore((s) => s.redo)

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      const ctrl = e.ctrlKey || e.metaKey

      if (e.key === 'Escape') {
        clearSelection()
        return
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selected = useProjectStore.getState().selectedItemIds
        if (selected.length > 0) {
          e.preventDefault()
          deleteItems(selected)
        }
        return
      }

      // Ctrl+Z — undo
      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }

      // Ctrl+Y or Ctrl+Shift+Z — redo
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey) || (e.key === 'Z' && e.shiftKey))) {
        e.preventDefault()
        redo()
        return
      }

      // Ctrl+D — clone selected
      if (ctrl && e.key === 'd') {
        e.preventDefault()
        const store = useProjectStore.getState()
        const selected = store.selectedItemIds
        const project = store.project
        if (selected.length > 0 && project) {
          const cloned = cloneItems(selected, project.items)
          store.addItems(cloned)
          store.setSelection([cloned[0]!.id])
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [clearSelection, deleteItems, undo, redo])
}
