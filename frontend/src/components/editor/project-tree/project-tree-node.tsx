import type { TreeNode } from '@/lib/build-project-tree'
import { useProjectStore } from '@/store/project-store'

interface ProjectTreeNodeProps {
  node: TreeNode
  depth: number
  expandedIds: Set<string>
  onToggle: (id: string) => void
}

export function ProjectTreeNode({ node, depth, expandedIds, onToggle }: ProjectTreeNodeProps) {
  const selectedIds = useProjectStore((s) => s.selectedItemIds)
  const setSelection = useProjectStore((s) => s.setSelection)
  const deleteItems = useProjectStore((s) => s.deleteItems)

  const { item, children } = node
  const hasChildren = children.length > 0
  const isExpanded = expandedIds.has(item.id)
  const isSelected = selectedIds.includes(item.id)

  return (
    <div>
      <div
        className={`flex items-center gap-1 rounded px-1 py-0.5 text-xs cursor-pointer hover:bg-muted ${
          isSelected ? 'bg-primary/20 text-primary' : ''
        }`}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
        onClick={() => setSelection([item.id])}
      >
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(item.id) }}
            className="w-3 text-[10px] text-muted-foreground"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        ) : (
          <span className="w-3" />
        )}
        <span className="truncate flex-1">{item.name}</span>
        <span className="text-[9px] text-muted-foreground">{item.type}</span>
        <button
          onClick={(e) => { e.stopPropagation(); deleteItems([item.id]) }}
          className="text-[10px] text-destructive opacity-0 group-hover:opacity-100 hover:opacity-100"
          title="Delete"
        >
          ×
        </button>
      </div>
      {hasChildren && isExpanded && children.map((child) => (
        <ProjectTreeNode
          key={child.item.id}
          node={child}
          depth={depth + 1}
          expandedIds={expandedIds}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
}
