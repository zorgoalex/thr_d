import type { ApiMaterial } from '@/types/api'

interface MaterialCardProps {
  material: ApiMaterial
}

export function MaterialCard({ material }: MaterialCardProps) {
  return (
    <div className="flex items-center gap-2 rounded border border-border p-2">
      <div
        className="h-6 w-6 shrink-0 rounded border border-border"
        style={{ backgroundColor: material.color }}
      />
      <div className="min-w-0">
        <p className="truncate text-xs font-medium">{material.name}</p>
        <p className="text-[10px] text-muted-foreground">
          {material.thicknessMmDefault}mm · {material.category}
        </p>
      </div>
    </div>
  )
}
