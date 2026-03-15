import { useProjectStore } from '@/store/project-store'
import type { Template } from '@/types/api'
import type { Item, Material } from '@/types/project'

import { expandItemTree } from './expand-item-tree'

function computeRoomCenter(
  room: { widthMm: number; lengthMm: number; origin: { xMm: number; zMm: number } },
  dims: { widthMm: number; depthMm: number },
) {
  return {
    xMm: room.origin.xMm + room.widthMm / 2 - dims.widthMm / 2,
    yMm: 0,
    zMm: room.origin.zMm + room.lengthMm / 2 - dims.depthMm / 2,
  }
}

/**
 * Insert a template/module into the project.
 * Validation runs reactively via useValidationEffect.
 */
export function insertFromTemplate(
  template: Template,
  catalogMaterials: Material[],
): void {
  const store = useProjectStore.getState()
  const project = store.project
  if (!project) return

  const pos = computeRoomCenter(project.room, template.defaultDimensions)
  const newItems = expandItemTree(template.rootItemTreeDto, template.id, pos)

  const materialIds = new Set(
    newItems.map((i) => i.materialId).filter(Boolean) as string[],
  )
  const neededMaterials = catalogMaterials.filter((m) => materialIds.has(m.id))

  store.addItems(newItems)
  store.addMaterials(neededMaterials)

  if (newItems.length > 0) {
    store.setSelection([newItems[0]!.id])
  }
}

/**
 * Insert a custom panel item into the project.
 */
export function insertCustomPanel(
  item: Item,
  material: Material | null,
): void {
  const store = useProjectStore.getState()
  if (!store.project) return

  store.addItems([item])
  if (material) store.addMaterials([material])
  store.setSelection([item.id])
}
