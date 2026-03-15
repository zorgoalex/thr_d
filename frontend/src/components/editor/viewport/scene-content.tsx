import { useMemo } from 'react'

import { useProjectStore } from '@/store/project-store'

import { CameraController } from './camera-controller'
import { ItemMesh } from './item-mesh'
import { RoomMesh } from './room-mesh'

export function SceneContent() {
  const items = useProjectStore((s) => s.project?.items ?? [])
  const materials = useProjectStore((s) => s.project?.materials ?? [])
  const selectedIds = useProjectStore((s) => s.selectedItemIds)
  const validationIssues = useProjectStore((s) => s.validationIssues)

  const errorItemIds = useMemo(() => {
    const ids = new Set<string>()
    for (const issue of validationIssues) {
      if (issue.severity === 'error') {
        for (const id of issue.itemIds) ids.add(id)
      }
    }
    return ids
  }, [validationIssues])

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  return (
    <>
      <CameraController />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5000, 8000, 5000]} intensity={0.8} />

      {/* Scene scale: mm coordinates, no conversion needed for camera presets in mm */}
      <RoomMesh />
      {items.map((item) => (
        <ItemMesh
          key={item.id}
          item={item}
          allItems={items}
          materials={materials}
          isSelected={selectedSet.has(item.id)}
          hasError={errorItemIds.has(item.id)}
        />
      ))}
    </>
  )
}
