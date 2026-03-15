import { useEffect } from 'react'

import { useProjectStore } from '@/store/project-store'

export function useEditorHotkeys() {
  const clearSelection = useProjectStore((s) => s.clearSelection)
  const deleteItems = useProjectStore((s) => s.deleteItems)

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.key === 'Escape') {
        clearSelection()
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selected = useProjectStore.getState().selectedItemIds
        if (selected.length > 0) {
          e.preventDefault()
          deleteItems(selected)
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [clearSelection, deleteItems])
}
