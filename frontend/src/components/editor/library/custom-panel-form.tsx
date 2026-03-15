import { useState } from 'react'

import { useCatalogMaterials } from '@/hooks/use-materials'
import { insertCustomPanel } from '@/lib/insert-from-template'
import { useProjectStore } from '@/store/project-store'
import type { Item, Material } from '@/types/project'

export function CustomPanelForm() {
  const { data: catalogMaterials } = useCatalogMaterials()
  const room = useProjectStore((s) => s.project?.room)

  const [name, setName] = useState('Custom Panel')
  const [widthMm, setWidthMm] = useState(600)
  const [heightMm, setHeightMm] = useState(720)
  const [thicknessMm, setThicknessMm] = useState(16)
  const [materialId, setMaterialId] = useState('')
  const [grainDirection, setGrainDirection] = useState('none')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!room) return

    const posX = room.origin.xMm + room.widthMm / 2 - widthMm / 2
    const posZ = room.origin.zMm + room.lengthMm / 2 - thicknessMm / 2

    const item: Item = {
      id: `custom-panel-${Date.now()}`,
      type: 'panel',
      subtype: 'custom',
      name,
      parentId: null,
      sortIndex: 0,
      dimensions: {
        widthMm,
        heightMm,
        depthMm: thicknessMm, // rule: depth = thickness
        thicknessMm,
      },
      transform: { xMm: posX, yMm: 0, zMm: posZ, rotationYDeg: 0 },
      materialId: materialId || null,
      grainDirection: grainDirection === 'none' ? null : grainDirection,
      visibility: true,
      locked: false,
      constraints: null,
      sourceTemplateId: null,
    }

    const mat = catalogMaterials?.find((m) => m.id === materialId)
    const material: Material | null = mat
      ? {
          id: mat.id,
          code: mat.code,
          name: mat.name,
          color: mat.color,
          textureUrl: mat.textureUrl,
          thicknessMmDefault: mat.thicknessMmDefault,
          grainDirection: mat.grainDirection,
          category: mat.category,
        }
      : null

    insertCustomPanel(item, material)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="flex flex-col gap-1">
        <span className="text-[10px] text-muted-foreground">Name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded border border-input bg-background px-2 py-1 text-xs"
        />
      </label>

      <div className="grid grid-cols-3 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground">Width</span>
          <input type="number" min={1} value={widthMm} onChange={(e) => setWidthMm(Number(e.target.value))}
            className="rounded border border-input bg-background px-2 py-1 text-xs" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground">Height</span>
          <input type="number" min={1} value={heightMm} onChange={(e) => setHeightMm(Number(e.target.value))}
            className="rounded border border-input bg-background px-2 py-1 text-xs" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground">Thickness</span>
          <input type="number" min={1} value={thicknessMm} onChange={(e) => setThicknessMm(Number(e.target.value))}
            className="rounded border border-input bg-background px-2 py-1 text-xs" />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] text-muted-foreground">Material</span>
        <select
          value={materialId}
          onChange={(e) => setMaterialId(e.target.value)}
          className="rounded border border-input bg-background px-2 py-1 text-xs"
        >
          <option value="">None</option>
          {catalogMaterials?.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] text-muted-foreground">Grain direction</span>
        <select
          value={grainDirection}
          onChange={(e) => setGrainDirection(e.target.value)}
          className="rounded border border-input bg-background px-2 py-1 text-xs"
        >
          <option value="none">None</option>
          <option value="lengthwise">Lengthwise</option>
          <option value="crosswise">Crosswise</option>
        </select>
      </label>

      <button
        type="submit"
        className="w-full rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
      >
        Create Panel
      </button>
    </form>
  )
}
