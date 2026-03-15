import { useMemo } from 'react'
import * as THREE from 'three'

import { useProjectStore } from '@/store/project-store'

export function RoomMesh() {
  const room = useProjectStore((s) => s.project?.room)
  if (!room) return null

  const w = room.widthMm
  const h = room.heightMm
  const d = room.lengthMm
  const ox = room.origin.xMm
  const oy = room.origin.yMm
  const oz = room.origin.zMm

  return (
    <group position={[ox, oy, oz]}>
      {/* Floor plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[w / 2, 0, d / 2]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial
          color="#e5e7eb"
          opacity={0.15}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Room wireframe outline */}
      <RoomEdges width={w} height={h} depth={d} />
    </group>
  )
}

function RoomEdges({ width, height, depth }: { width: number; height: number; depth: number }) {
  const geometry = useMemo(() => {
    const box = new THREE.BoxGeometry(width, height, depth)
    const edges = new THREE.EdgesGeometry(box)
    box.dispose()
    return edges
  }, [width, height, depth])

  return (
    <lineSegments geometry={geometry} position={[width / 2, height / 2, depth / 2]}>
      <lineBasicMaterial color="#4b5563" opacity={0.5} transparent />
    </lineSegments>
  )
}
