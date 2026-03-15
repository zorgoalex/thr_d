import { useEffect, useState } from 'react'

import { createEmptyProject } from '@/lib/project-factory'
import { useProjectStore } from '@/store/project-store'
import type { RoomSize } from '@/types/api'

export function useInitProject(
  room: RoomSize,
  templateId: string | null,
): { isReady: boolean } {
  const project = useProjectStore((s) => s.project)
  const setProject = useProjectStore((s) => s.setProject)
  const [isReady, setIsReady] = useState(project != null)

  useEffect(() => {
    if (project) {
      setIsReady(true)
      return
    }
    const newProject = createEmptyProject(room, templateId ?? undefined)
    setProject(newProject)
    setIsReady(true)
  }, [project, room, templateId, setProject])

  return { isReady }
}
