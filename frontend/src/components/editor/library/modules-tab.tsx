import { useCatalogMaterials } from '@/hooks/use-materials'
import { useModules } from '@/hooks/use-modules'
import { insertFromTemplate } from '@/lib/insert-from-template'
import type { Template } from '@/types/api'
import type { Material } from '@/types/project'

import { LibraryCard } from './library-card'

export function ModulesTab() {
  const { data: modules, isLoading } = useModules()
  const { data: materials } = useCatalogMaterials()

  const handleInsert = (template: Template) => {
    const mats = (materials ?? []) as unknown as Material[]
    insertFromTemplate(template, mats)
  }

  if (isLoading) return <p className="text-xs text-muted-foreground">Loading…</p>
  if (!modules?.length) return <p className="text-xs text-muted-foreground">No modules</p>

  return (
    <div className="space-y-1">
      {modules.map((m) => (
        <LibraryCard key={m.id} template={m} onInsert={handleInsert} />
      ))}
    </div>
  )
}
