import { useCatalogMaterials } from '@/hooks/use-materials'
import { useParts } from '@/hooks/use-modules'
import { insertFromTemplate } from '@/lib/insert-from-template'
import type { Template } from '@/types/api'
import type { Material } from '@/types/project'

import { LibraryCard } from './library-card'

export function PartsTab() {
  const { data: parts, isLoading } = useParts()
  const { data: materials } = useCatalogMaterials()

  const handleInsert = (template: Template) => {
    const mats = (materials ?? []) as unknown as Material[]
    insertFromTemplate(template, mats)
  }

  if (isLoading) return <p className="text-xs text-muted-foreground">Loading…</p>
  if (!parts?.length) return <p className="text-xs text-muted-foreground">No parts</p>

  return (
    <div className="space-y-1">
      {parts.map((p) => (
        <LibraryCard key={p.id} template={p} onInsert={handleInsert} />
      ))}
    </div>
  )
}
