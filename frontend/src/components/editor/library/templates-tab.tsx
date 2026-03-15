import { useTemplates } from '@/hooks/use-templates'
import { useCatalogMaterials } from '@/hooks/use-materials'
import { insertFromTemplate } from '@/lib/insert-from-template'
import type { Template } from '@/types/api'
import type { Material } from '@/types/project'

import { LibraryCard } from './library-card'

export function TemplatesTab() {
  const { data: templates, isLoading } = useTemplates()
  const { data: materials } = useCatalogMaterials()

  const handleInsert = (template: Template) => {
    const mats = (materials ?? []) as unknown as Material[]
    insertFromTemplate(template, mats)
  }

  if (isLoading) return <p className="text-xs text-muted-foreground">Loading…</p>
  if (!templates?.length) return <p className="text-xs text-muted-foreground">No templates</p>

  return (
    <div className="space-y-1">
      {templates.map((t) => (
        <LibraryCard key={t.id} template={t} onInsert={handleInsert} />
      ))}
    </div>
  )
}
