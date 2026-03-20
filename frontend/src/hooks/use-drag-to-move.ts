import { useCallback, useRef, useState } from 'react'
import * as THREE from 'three'

import { computeWorldAABB } from '@/lib/geometry/bounds'
import { findSnapCandidates, resolveSnap } from '@/lib/geometry/snap'
import { resolveWorldTransform, rotateXZ } from '@/lib/geometry/transforms'
import type { SnapCandidate } from '@/lib/geometry/types'
import { getOrbitControls } from '@/lib/orbit-controls-ref'
import { useProjectStore } from '@/store/project-store'
import type { CameraMode, Item, Room } from '@/types/project'

interface UseDragToMoveArgs {
  item: Item
  allItems: readonly Item[]
  room: Room
  cameraMode: CameraMode
  isSelected: boolean
}

interface DragState {
  plane: THREE.Plane
  startIntersection: THREE.Vector3
  originalLocalX: number
  originalLocalY: number
  originalLocalZ: number
  worldX: number
  worldY: number
  worldZ: number
  parentRotation: 0 | 90 | 180 | 270
}

function getDragPlane(cameraMode: CameraMode, worldPos: { x: number; y: number; z: number }): THREE.Plane {
  switch (cameraMode) {
    case 'front':
      return new THREE.Plane(new THREE.Vector3(0, 0, 1), -worldPos.z)
    case 'left':
    case 'right':
      return new THREE.Plane(new THREE.Vector3(1, 0, 0), -worldPos.x)
    default: // perspective, top
      return new THREE.Plane(new THREE.Vector3(0, 1, 0), -worldPos.y)
  }
}

function inverseRotateXZ(x: number, z: number, rot: 0 | 90 | 180 | 270) {
  const inv = ((360 - rot) % 360) as 0 | 90 | 180 | 270
  return rotateXZ(x, z, inv)
}

export function useDragToMove({ item, allItems, room, cameraMode, isSelected }: UseDragToMoveArgs) {
  const dragRef = useRef<DragState | null>(null)
  const [dragWorldPos, setDragWorldPos] = useState<{ xMm: number; yMm: number; zMm: number } | null>(null)
  const [appliedSnaps, setAppliedSnaps] = useState<SnapCandidate[]>([])

  const onPointerDown = useCallback(
    (e: THREE.Event & { ray: THREE.Ray; stopPropagation: () => void; pointerId?: number; target?: { setPointerCapture?: (id: number) => void } }) => {
      if (!isSelected || item.locked) return

      e.stopPropagation()

      try {
        const wt = resolveWorldTransform(item.id, allItems)
        const plane = getDragPlane(cameraMode, { x: wt.xMm, y: wt.yMm, z: wt.zMm })
        const intersection = new THREE.Vector3()
        if (!e.ray.intersectPlane(plane, intersection)) return

        // Get parent rotation for local→world conversion
        let parentRotation: 0 | 90 | 180 | 270 = 0
        if (item.parentId) {
          try {
            const pwt = resolveWorldTransform(item.parentId, allItems)
            parentRotation = pwt.rotationYDeg
          } catch { /* root */ }
        }

        dragRef.current = {
          plane,
          startIntersection: intersection.clone(),
          originalLocalX: item.transform.xMm,
          originalLocalY: item.transform.yMm,
          originalLocalZ: item.transform.zMm,
          worldX: wt.xMm,
          worldY: wt.yMm,
          worldZ: wt.zMm,
          parentRotation,
        }

        // Capture pointer and disable orbit
        if (e.pointerId != null && e.target?.setPointerCapture) {
          e.target.setPointerCapture(e.pointerId)
        }
        const oc = getOrbitControls()
        if (oc) oc.enabled = false
      } catch { /* ignore */ }
    },
    [item, allItems, cameraMode, isSelected],
  )

  const onPointerMove = useCallback(
    (e: THREE.Event & { ray: THREE.Ray; stopPropagation: () => void }) => {
      const drag = dragRef.current
      if (!drag) return
      e.stopPropagation()

      const intersection = new THREE.Vector3()
      if (!e.ray.intersectPlane(drag.plane, intersection)) return

      const dx = intersection.x - drag.startIntersection.x
      const dy = intersection.y - drag.startIntersection.y
      const dz = intersection.z - drag.startIntersection.z

      const newWorldX = drag.worldX + dx
      const newWorldY = drag.worldY + dy
      const newWorldZ = drag.worldZ + dz

      // Snap
      const aabb = computeWorldAABB(item.dimensions, {
        xMm: newWorldX, yMm: newWorldY, zMm: newWorldZ, rotationYDeg: item.transform.rotationYDeg,
      })
      const neighborAABBs = new Map<string, ReturnType<typeof computeWorldAABB>>()
      for (const other of allItems) {
        if (other.id === item.id) continue
        try {
          const owt = resolveWorldTransform(other.id, allItems)
          neighborAABBs.set(other.id, computeWorldAABB(other.dimensions, owt))
        } catch { /* skip */ }
      }
      const candidates = findSnapCandidates(aabb, room, neighborAABBs)
      const snapped = resolveSnap({ xMm: newWorldX, yMm: newWorldY, zMm: newWorldZ }, candidates)

      setDragWorldPos({ xMm: snapped.xMm, yMm: snapped.yMm, zMm: snapped.zMm })
      setAppliedSnaps(snapped.appliedSnaps)
    },
    [item, allItems, room],
  )

  const onPointerUp = useCallback(
    (e: THREE.Event & { stopPropagation: () => void }) => {
      const drag = dragRef.current
      if (!drag) return
      e.stopPropagation()

      // Re-enable orbit
      const oc = getOrbitControls()
      if (oc) oc.enabled = true

      if (dragWorldPos) {
        // Convert world delta to local delta
        const worldDx = dragWorldPos.xMm - drag.worldX
        const worldDz = dragWorldPos.zMm - drag.worldZ
        const worldDy = dragWorldPos.yMm - drag.worldY

        const { x: localDx, z: localDz } = inverseRotateXZ(worldDx, worldDz, drag.parentRotation)

        const newX = drag.originalLocalX + localDx
        const newY = drag.originalLocalY + worldDy
        const newZ = drag.originalLocalZ + localDz

        // Only commit if actually moved
        if (Math.abs(worldDx) > 0.1 || Math.abs(worldDy) > 0.1 || Math.abs(worldDz) > 0.1) {
          useProjectStore.getState().updateItem(item.id, {
            transform: { ...item.transform, xMm: newX, yMm: newY, zMm: newZ },
          })
        }
      }

      dragRef.current = null
      setDragWorldPos(null)
      setAppliedSnaps([])
    },
    [item, dragWorldPos],
  )

  return { dragWorldPos, appliedSnaps, onPointerDown, onPointerMove, onPointerUp }
}
