import { useCatalogMaterials } from '@/hooks/use-materials'

import { MaterialCard } from './material-card'

export function MaterialsTab() {
  const { data: materials, isLoading } = useCatalogMaterials()

  if (isLoading) return <p className="text-xs text-muted-foreground">Loading…</p>
  if (!materials?.length) return <p className="text-xs text-muted-foreground">No materials</p>

  return (
    <div className="space-y-1">
      {materials.map((m) => (
        <MaterialCard key={m.id} material={m} />
      ))}
    </div>
  )
}
