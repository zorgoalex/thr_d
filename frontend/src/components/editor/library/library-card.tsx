import type { Template } from '@/types/api'

interface LibraryCardProps {
  template: Template
  onInsert: (template: Template) => void
}

export function LibraryCard({ template, onInsert }: LibraryCardProps) {
  const d = template.defaultDimensions
  return (
    <div
      className="flex items-center justify-between rounded border border-border p-2 hover:border-primary"
      onDoubleClick={() => onInsert(template)}
    >
      <div className="min-w-0">
        <p className="truncate text-xs font-medium">{template.name}</p>
        <p className="text-[10px] text-muted-foreground">
          {d.widthMm}×{d.heightMm}×{d.depthMm}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onInsert(template)
        }}
        className="shrink-0 rounded bg-primary px-2 py-0.5 text-[10px] text-primary-foreground hover:opacity-90"
      >
        Add
      </button>
    </div>
  )
}
