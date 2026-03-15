import { applyMaterialCascade } from '@/lib/material-cascade'
import { useProjectStore } from '@/store/project-store'

import { NumericField } from './numeric-field'

export function PropertyPanel() {
  const project = useProjectStore((s) => s.project)
  const selectedIds = useProjectStore((s) => s.selectedItemIds)
  const updateItem = useProjectStore((s) => s.updateItem)
  const updateItemsBatch = useProjectStore((s) => s.updateItemsBatch)
  const deleteItems = useProjectStore((s) => s.deleteItems)

  const selectedId = selectedIds[0]
  const item = project?.items.find((i) => i.id === selectedId)

  if (!item || !project) {
    return (
      <div className="p-4 text-xs text-muted-foreground">
        Select an object to edit its properties
      </div>
    )
  }

  return <PropertyFields item={item} project={project} updateItem={updateItem} updateItemsBatch={updateItemsBatch} deleteItems={deleteItems} />
}

function PropertyFields({
  item,
  project,
  updateItem,
  updateItemsBatch,
  deleteItems,
}: {
  item: import('@/types/project').Item
  project: import('@/types/project').Project
  updateItem: (id: string, partial: Partial<import('@/types/project').Item>) => void
  updateItemsBatch: (updates: Array<{ id: string; partial: Partial<import('@/types/project').Item> }>) => void
  deleteItems: (ids: string[]) => void
}) {
  const isAssembly = item.type === 'assembly'
  const constraints = item.constraints
  const canResize = constraints?.resizable === true
  const editableFields = constraints?.editableFields ?? []

  function handleMaterialChange(materialId: string) {
    if (isAssembly) {
      const updates = applyMaterialCascade(item.id, materialId, project.items)
      updateItemsBatch(updates)
    } else {
      updateItem(item.id, { materialId })
    }
  }

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-xs font-semibold">{item.type}: {item.name}</h3>

      {/* Name */}
      <label className="flex flex-col gap-0.5">
        <span className="text-[10px] text-muted-foreground">Name</span>
        <input
          type="text"
          value={item.name}
          onChange={(e) => updateItem(item.id, { name: e.target.value })}
          className="rounded border border-input bg-background px-2 py-1 text-xs"
        />
      </label>

      {/* Position */}
      <fieldset className="space-y-1">
        <legend className="text-[10px] font-medium text-muted-foreground">Position (mm)</legend>
        <div className="grid grid-cols-3 gap-1">
          <NumericField label="X" value={item.transform.xMm}
            onChange={(v) => updateItem(item.id, { transform: { ...item.transform, xMm: v } })} />
          <NumericField label="Y" value={item.transform.yMm}
            onChange={(v) => updateItem(item.id, { transform: { ...item.transform, yMm: v } })} />
          <NumericField label="Z" value={item.transform.zMm}
            onChange={(v) => updateItem(item.id, { transform: { ...item.transform, zMm: v } })} />
        </div>
      </fieldset>

      {/* Rotation */}
      <label className="flex flex-col gap-0.5">
        <span className="text-[10px] text-muted-foreground">Rotation Y (deg)</span>
        <select
          value={item.transform.rotationYDeg}
          onChange={(e) => updateItem(item.id, {
            transform: { ...item.transform, rotationYDeg: Number(e.target.value) as 0 | 90 | 180 | 270 },
          })}
          className="rounded border border-input bg-background px-2 py-1 text-xs"
        >
          <option value={0}>0°</option>
          <option value={90}>90°</option>
          <option value={180}>180°</option>
          <option value={270}>270°</option>
        </select>
      </label>

      {/* Dimensions */}
      {!isAssembly && (
        <fieldset className="space-y-1">
          <legend className="text-[10px] font-medium text-muted-foreground">Dimensions (mm)</legend>
          <div className="grid grid-cols-2 gap-1">
            <NumericField label="Width" value={item.dimensions.widthMm} min={1}
              disabled={!canResize || !editableFields.includes('widthMm')}
              onChange={(v) => updateItem(item.id, { dimensions: { ...item.dimensions, widthMm: v } })} />
            <NumericField label="Height" value={item.dimensions.heightMm} min={1}
              disabled={!canResize || !editableFields.includes('heightMm')}
              onChange={(v) => updateItem(item.id, { dimensions: { ...item.dimensions, heightMm: v } })} />
            <NumericField label="Depth" value={item.dimensions.depthMm} min={1}
              disabled={!canResize || !editableFields.includes('depthMm')}
              onChange={(v) => updateItem(item.id, { dimensions: { ...item.dimensions, depthMm: v } })} />
            <NumericField label="Thickness" value={item.dimensions.thicknessMm} min={1}
              disabled={!canResize || !editableFields.includes('thicknessMm')}
              onChange={(v) => updateItem(item.id, { dimensions: { ...item.dimensions, thicknessMm: v } })} />
          </div>
        </fieldset>
      )}

      {/* Material */}
      <label className="flex flex-col gap-0.5">
        <span className="text-[10px] text-muted-foreground">Material</span>
        <select
          value={item.materialId ?? ''}
          onChange={(e) => handleMaterialChange(e.target.value)}
          className="rounded border border-input bg-background px-2 py-1 text-xs"
        >
          <option value="">None</option>
          {project.materials.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </label>

      {/* Delete */}
      <button
        onClick={() => deleteItems([item.id])}
        className="w-full rounded bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:opacity-90"
      >
        Delete {isAssembly ? '(+ children)' : ''}
      </button>
    </div>
  )
}
