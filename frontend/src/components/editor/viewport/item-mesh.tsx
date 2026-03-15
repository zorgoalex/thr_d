import { Edges } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

import { resolveWorldTransform } from '@/lib/geometry/transforms'
import type { Item, Material } from '@/types/project'

interface ItemMeshProps {
  item: Item
  allItems: readonly Item[]
  materials: readonly Material[]
  isSelected: boolean
  hasError: boolean
}

export function ItemMesh({ item, allItems, materials, isSelected, hasError }: ItemMeshProps) {
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

  if (!wt || !item.visibility) return null

  const mat = materials.find((m) => m.id === item.materialId)
  const color = mat?.color ?? '#9ca3af'

  const { widthMm: w, heightMm: h, depthMm: d } = item.dimensions

  return (
    <group
      position={[wt.xMm + w / 2, wt.yMm + h / 2, wt.zMm + d / 2]}
      rotation={[0, THREE.MathUtils.degToRad(wt.rotationYDeg), 0]}
    >
      <mesh>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} />
        {isSelected && <Edges scale={1.01} color="#3b82f6" />}
        {hasError && !isSelected && <Edges scale={1.02} color="#ef4444" />}
      </mesh>
    </group>
  )
}
