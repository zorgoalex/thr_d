import { useEffect } from 'react'

import { validateProject } from '@/lib/geometry/validation'
import { useProjectStore } from '@/store/project-store'

/**
 * Reactive validation: re-validates on every project change with debounce.
 * Replaces explicit validateProject calls in insertion/clone/delete flows.
 */
export function useValidationEffect() {
  const project = useProjectStore((s) => s.project)
  const setValidationIssues = useProjectStore((s) => s.setValidationIssues)

  useEffect(() => {
    if (!project) {
      setValidationIssues([])
      return
    }

    const timer = setTimeout(() => {
      const issues = validateProject(project.items, project.room)
      setValidationIssues(issues)
    }, 150)

    return () => clearTimeout(timer)
  }, [project, setValidationIssues])
}
