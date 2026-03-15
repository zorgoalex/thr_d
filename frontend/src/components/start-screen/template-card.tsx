import type { Template } from '@/types/api'

interface TemplateCardProps {
  template: Template
  onSelect: (id: string) => void
}

export function TemplateCard({ template, onSelect }: TemplateCardProps) {
  const d = template.defaultDimensions
  return (
    <button
      onClick={() => onSelect(template.id)}
      className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary"
    >
      <h3 className="text-sm font-semibold text-card-foreground">
        {template.name}
      </h3>
      <p className="text-xs text-muted-foreground">
        {d.widthMm} × {d.heightMm} × {d.depthMm} mm
      </p>
      {template.tags.length > 0 && (
        <div className="flex gap-1">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}
