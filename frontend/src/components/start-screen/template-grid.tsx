import { useTemplates } from '@/hooks/use-templates'

import { TemplateCard } from './template-card'

interface TemplateGridProps {
  onSelect: (templateId: string) => void
}

export function TemplateGrid({ onSelect }: TemplateGridProps) {
  const { data: templates, isLoading, error } = useTemplates()

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading templates…</p>
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Failed to load templates: {error.message}
      </p>
    )
  }

  if (!templates || templates.length === 0) {
    return <p className="text-sm text-muted-foreground">No templates available.</p>
  }

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold">Starter templates</h2>
      <div className="grid grid-cols-2 gap-3">
        {templates.map((t) => (
          <TemplateCard key={t.id} template={t} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}
