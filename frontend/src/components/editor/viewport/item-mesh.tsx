import { Edges } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

import { useDragToMove } from '@/hooks/use-drag-to-move'
import { resolveWorldTransform } from '@/lib/geometry/transforms'
import type { CameraMode, Item, Material, Room } from '@/types/project'

interface ItemMeshProps {
  item: Item
  allItems: readonly Item[]
  materials: readonly Material[]
  room: Room
  cameraMode: CameraMode
  isSelected: boolean
  hasError: boolean
  onSelect: (id: string) => void
}

export function ItemMesh({ item, allItems, materials, room, cameraMode, isSelected, hasError, onSelect }: ItemMeshProps) {
  const wt = useMemo(
    () => {
      try {
        return resolveWorldTransform(item.id, allItems)
      } catch {
        return null
      }
    },
    [item.id, allItems],
  )

  const { dragWorldPos, onPointerDown, onPointerMove, onPointerUp } = useDragToMove({
    item, allItems, room, cameraMode, isSelected,
  })

  if (!wt || !item.visibility) return null

  const mat = materials.find((m) => m.id === item.materialId)
  const color = mat?.color ?? '#9ca3af'

  const { widthMm: w, heightMm: h, depthMm: d } = item.dimensions

  // Use drag position if dragging, otherwise resolved world transform
  const posX = dragWorldPos ? dragWorldPos.xMm + w / 2 : wt.xMm + w / 2
  const posY = dragWorldPos ? dragWorldPos.yMm + h / 2 : wt.yMm + h / 2
  const posZ = dragWorldPos ? dragWorldPos.zMm + d / 2 : wt.zMm + d / 2

  return (
    <group
      position={[posX, posY, posZ]}
      rotation={[0, THREE.MathUtils.degToRad(wt.rotationYDeg), 0]}
    >
      <mesh
        onClick={(e) => { e.stopPropagation(); onSelect(item.id) }}
        onPointerDown={onPointerDown as never}
        onPointerMove={onPointerMove as never}
        onPointerUp={onPointerUp as never}
      >
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} />
        {isSelected && <Edges scale={1.01} color="#3b82f6" />}
        {hasError && !isSelected && <Edges scale={1.02} color="#ef4444" />}
      </mesh>
    </group>
  )
}
