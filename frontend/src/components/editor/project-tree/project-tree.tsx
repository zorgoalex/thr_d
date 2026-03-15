import { useMemo, useState } from 'react'

import { buildProjectTree } from '@/lib/build-project-tree'
import { useProjectStore } from '@/store/project-store'

import { ProjectTreeNode } from './project-tree-node'

export function ProjectTree() {
  const items = useProjectStore((s) => s.project?.items ?? [])
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const roots = useMemo(() => buildProjectTree(items), [items])

  const handleToggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  if (roots.length === 0) {
    return <p className="text-xs text-muted-foreground">No items in project</p>
  }

  return (
    <div className="space-y-0.5">
      {roots.map((node) => (
        <ProjectTreeNode
          key={node.item.id}
          node={node}
          depth={0}
          expandedIds={expandedIds}
          onToggle={handleToggle}
        />
      ))}
    </div>
  )
}
