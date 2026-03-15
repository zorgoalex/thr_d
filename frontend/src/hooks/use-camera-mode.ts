import { useEffect } from 'react'

import { useProjectStore } from '@/store/project-store'
import type { CameraMode } from '@/types/project'

const HOTKEY_MAP: Record<string, CameraMode> = {
  '1': 'perspective',
  '2': 'front',
  '3': 'left',
  '4': 'right',
  '5': 'top',
}

export function useCameraMode() {
  const setCameraMode = useProjectStore((s) => s.setCameraMode)

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Skip when typing in input fields
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      const mode = HOTKEY_MAP[e.key]
      if (mode) {
        e.preventDefault()
        setCameraMode(mode)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setCameraMode])
}
